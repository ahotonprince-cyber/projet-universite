const CreditModel = require('../../models/CreditModel');
const EcheanceModel = require('../../models/EcheanceModel');
const NotificationModel = require('../../models/NotificationModel');
const CompteModel = require('../../models/CompteModel');
const OperationModel = require('../../models/OperationModel');
const { generateTransactionReference } = require('../../utils/generateNumber');

// Crédite le compte courant du client et génère les échéances
async function _decaisserCredit(credit) {
    const comptes = await CompteModel.findByUser(credit.utilisateur_id);
    const compteCourant = (comptes || []).find(c => c.type_code === 'COURANT');

    if (!compteCourant) {
        throw new Error(`Compte courant introuvable pour l'utilisateur ${credit.utilisateur_id}`);
    }

    // Verser le montant sur le compte courant
    await CompteModel.updateSolde(compteCourant.id, credit.montant_accorde, 'depot');

    // Enregistrer l'opération de décaissement
    await OperationModel.create(
        compteCourant.id,
        'credit_decaisse',
        credit.montant_accorde,
        `Décaissement crédit ${credit.numero_credit}`,
        generateTransactionReference()
    );

    // Générer le tableau d'amortissement
    await EcheanceModel.generateForCredit(
        credit.id,
        credit.montant_accorde,
        credit.duree_mois,
        credit.taux_annuel,
        new Date()
    );

    // Notifier le client
    await NotificationModel.sendToUser(
        credit.utilisateur_id,
        '💰 Crédit décaissé !',
        `Votre crédit de ${Number(credit.montant_accorde).toLocaleString('fr-FR')} FCFA a été versé sur votre compte courant.`,
        'paiement',
        credit.id
    );
}

const creditController = {

    getAll: async (req, res) => {
        try {
            const { statut, limit } = req.query;
            const credits = await CreditModel.findAll({ 
                statut, 
                limit: limit ? parseInt(limit) : null 
            });

            const creditsMapped = credits.map(c => ({
                ...c,
                client_id:         c.utilisateur_id,
                client_nom:        c.nom,
                client_prenom:     c.prenom,
                montant_accorde:   parseFloat(c.montant_accorde),
                montant_rembourse: parseFloat(c.montant_rembourse) || 0,
                taux_annuel:       parseFloat(c.taux_annuel),
            }));

            res.json({ credits: creditsMapped });
        } catch (error) {
            console.error('❌ getAll error:', error);
            res.status(500).json({ error: 'Erreur chargement crédits' });
        }
    },

    getById: async (req, res) => {
        try {
            const credit = await CreditModel.findById(req.params.id);
            if (!credit) return res.status(404).json({ error: 'Crédit non trouvé' });
            res.json({ credit });
        } catch (error) {
            console.error('❌ getById error:', error);
            res.status(500).json({ error: 'Erreur chargement crédit' });
        }
    },

    create: async (req, res) => {
        try {
            const { client_id, montant, duree_mois, taux_annuel, objet, description } = req.body;

            if (!client_id) return res.status(400).json({ error: 'client_id est requis' });
            if (!montant || montant <= 0) return res.status(400).json({ error: 'Montant invalide' });
            if (!duree_mois || duree_mois <= 0) return res.status(400).json({ error: 'Durée invalide' });
            if (!taux_annuel || taux_annuel <= 0) return res.status(400).json({ error: 'Taux invalide' });

            const numero_credit = `CR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            const creditId = await CreditModel.create({
                utilisateur_id: parseInt(client_id),
                numero_credit,
                montant_accorde: parseFloat(montant),
                duree_mois:      parseInt(duree_mois),
                taux_annuel:     parseFloat(taux_annuel),
                objet:           objet || 'Crédit',
                description:     description || null,
                statut:          'en_attente'
            });

            try {
                await NotificationModel.sendToAdmins(
                    'Nouvelle demande de crédit',
                    `Nouvelle demande de ${Number(montant).toLocaleString()} FCFA`,
                    'validation',
                    creditId
                );
            } catch (e) {
                console.error('⚠️ Erreur notification (non bloquante):', e.message);
            }

            res.status(201).json({ success: true, credit_id: creditId, numero_credit });
        } catch (error) {
            console.error('❌ create credit error:', error.message);
            res.status(500).json({ error: 'Erreur création crédit: ' + error.message });
        }
    },

    update: async (req, res) => {
        try {
            const { montant, duree_mois, taux_annuel, objet, description } = req.body;

            const credit = await CreditModel.findById(req.params.id);
            if (!credit) return res.status(404).json({ error: 'Crédit non trouvé' });

            if (credit.statut !== 'en_attente') {
                return res.status(400).json({ error: 'Impossible de modifier un crédit déjà traité' });
            }

            await CreditModel.update(req.params.id, {
                montant_accorde: parseFloat(montant),
                duree_mois:      parseInt(duree_mois),
                taux_annuel:     parseFloat(taux_annuel),
                objet:           objet || credit.objet,
                description:     description ?? null,
            });

            res.json({ success: true });
        } catch (error) {
            console.error('❌ update error:', error);
            res.status(500).json({ error: 'Erreur modification crédit: ' + error.message });
        }
    },

    updateStatut: async (req, res) => {
        try {
            const { statut, motif_rejet } = req.body;

            if (!statut) return res.status(400).json({ error: 'Statut requis' });

            const validePar = req.user?.id ?? null;

            const result = await CreditModel.updateStatut(req.params.id, statut, validePar, motif_rejet || null);
            if (!result) return res.status(404).json({ error: 'Crédit non trouvé' });

            const credit = await CreditModel.findById(req.params.id);

            if (statut === 'valide') {
                try {
                    await NotificationModel.sendToUser(
                        credit.utilisateur_id, 'Crédit validé',
                        'Votre demande de crédit a été validée', 'validation', credit.id
                    );
                } catch (e) { console.error('Erreur notification:', e.message); }

            } else if (statut === 'rejete') {
                try {
                    await NotificationModel.sendToUser(
                        credit.utilisateur_id, 'Crédit rejeté',
                        motif_rejet || 'Votre demande a été rejetée', 'validation', credit.id
                    );
                } catch (e) { console.error('Erreur notification:', e.message); }

            } else if (statut === 'actif') {
                try {
                    await _decaisserCredit(credit);
                } catch (e) { console.error('Erreur décaissement:', e.message); }
            }

            res.json({ success: true });
        } catch (error) {
            console.error('❌ updateStatut error:', error);
            res.status(500).json({ error: 'Erreur mise à jour statut: ' + error.message });
        }
    },

    decaisser: async (req, res) => {
        try {
            const validePar = req.user?.id ?? null;
            await CreditModel.updateStatut(req.params.id, 'actif', validePar);
            const credit = await CreditModel.findById(req.params.id);
            await _decaisserCredit(credit);
            res.json({ success: true });
        } catch (error) {
            console.error('❌ decaisser error:', error);
            res.status(500).json({ error: 'Erreur décaissement' });
        }
    },

    getRecent: async (req, res) => {
        try {
            const credits = await CreditModel.findAll({ limit: 5 });
            const creditsMapped = credits.map(c => ({
                ...c,
                client_id:         c.utilisateur_id,
                client_nom:        c.nom,
                client_prenom:     c.prenom,
                montant_accorde:   parseFloat(c.montant_accorde),
                montant_rembourse: parseFloat(c.montant_rembourse) || 0,
                taux_annuel:       parseFloat(c.taux_annuel),
            }));
            res.json({ credits: creditsMapped });
        } catch (error) {
            console.error('❌ getRecent error:', error);
            res.status(500).json({ error: 'Erreur chargement crédits récents' });
        }
    },

    getAlertes: async (req, res) => {
        try {
            const alertes = await CreditModel.getAlertesRetard();
            res.json({ alertes });
        } catch (error) {
            console.error('❌ getAlertes error:', error);
            res.status(500).json({ error: 'Erreur chargement alertes' });
        }
    }
};

module.exports = creditController;