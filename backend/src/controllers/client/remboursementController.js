const EcheanceModel = require('../../models/EcheanceModel');
const CreditModel = require('../../models/CreditModel');
const OperationModel = require('../../models/OperationModel');
const CompteModel = require('../../models/CompteModel');
const NotificationModel = require('../../models/NotificationModel');

const remboursementController = {

    getMesRemboursements: async (req, res) => {
        try {
            const echeances = await EcheanceModel.findByUser(req.user.id);

            res.json({
                remboursements: echeances || [] // ✅ sécurisé
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur chargement remboursements' });
        }
    },

    payerEcheance: async (req, res) => {
        try {
            const { remboursement_id, montant, date_paiement } = req.body;

            const echeances = (await EcheanceModel.findByUser(req.user.id)) || [];
            const echeance = echeances.find(e => e.id === remboursement_id);

            if (!echeance) {
                return res.status(404).json({ error: 'Échéance non trouvée' });
            }

            if (echeance.statut === 'paye') {
                return res.status(400).json({ error: 'Cette échéance a déjà été payée' });
            }

            const comptes = (await CompteModel.findByUser(req.user.id)) || [];
            const compte = comptes.find(c => c.type_code === 'COURANT');

            if (!compte) {
                return res.status(400).json({ error: 'Compte courant introuvable' });
            }

            await CompteModel.updateSolde(compte.id, montant, 'retrait');
            await EcheanceModel.payer(remboursement_id, montant, date_paiement);

            // Enregistrer l'opération dans l'historique
            await OperationModel.create(
                compte.id,
                'remboursement',
                montant,
                `Remboursement échéance #${echeance.numero_echeance} — crédit ${echeance.numero_credit || echeance.credit_id}`,
                `ECH-${remboursement_id}`
            );

            // Archiver le crédit si toutes les échéances sont payées
            const estSolde = await EcheanceModel.toutesPayees(echeance.credit_id);
            if (estSolde) {
                await CreditModel.updateStatut(echeance.credit_id, 'solde');
                await NotificationModel.sendToUser(
                    req.user.id,
                    'Crédit soldé',
                    'Félicitations ! Votre crédit a été entièrement remboursé.',
                    'credit'
                );
            } else {
                await NotificationModel.sendToUser(
                    req.user.id,
                    'Paiement reçu',
                    `Votre paiement de ${Number(montant).toLocaleString()} FCFA a été enregistré`,
                    'paiement'
                );
            }

            res.json({ success: true, credit_solde: estSolde });

        } catch (error) {
            console.error(error);
            if (error.code === 'SOLDE_INSUFFISANT' || error.message === 'Solde insuffisant') {
                return res.status(400).json({ error: 'Solde insuffisant pour effectuer ce paiement' });
            }
            if (error.message === 'Cette échéance a déjà été payée') {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: 'Erreur lors du paiement' });
        }
    },

    simulerRemboursement: async (req, res) => {
        try {
            const montant = Number(req.query.montant) || 0;
            const duree = Number(req.query.duree) || 1;
            const taux = Number(req.query.taux) || 0;

            const total = montant * (1 + taux / 100);
            const mensualite = Math.round(total / duree);

            res.json({
                mensualite,
                total_interets: total - montant,
                total_a_rembourser: total
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur simulation' });
        }
    },

    getEcheances: async (req, res) => {
        try {
            const echeances = (await EcheanceModel.findByUser(req.user.id)) || [];

            res.json({ echeances });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur chargement échéances' });
        }
    },

    effectuerPaiement: async (req, res) => {
        try {
            const { echeance_id, montant, mode_paiement } = req.body;

            const echeances = (await EcheanceModel.findByUser(req.user.id)) || [];
            const echeance = echeances.find(e => e.id === echeance_id);

            if (!echeance) {
                return res.status(404).json({ error: 'Échéance non trouvée' });
            }

            if (echeance.statut === 'paye') {
                return res.status(400).json({ error: 'Cette échéance a déjà été payée' });
            }

            const comptes = (await CompteModel.findByUser(req.user.id)) || [];
            const compte = comptes.find(c => c.type_code === 'COURANT');

            if (!compte) {
                return res.status(400).json({ error: 'Compte courant introuvable' });
            }

            await CompteModel.updateSolde(compte.id, montant, 'retrait');
            await EcheanceModel.payer(echeance_id, montant, new Date());

            // Enregistrer l'opération dans l'historique
            await OperationModel.create(
                compte.id,
                'remboursement',
                montant,
                `Remboursement échéance #${echeance.numero_echeance} — crédit ${echeance.numero_credit || echeance.credit_id}`,
                `ECH-${echeance_id}`
            );

            // Archiver le crédit si toutes les échéances sont payées
            const estSolde = await EcheanceModel.toutesPayees(echeance.credit_id);
            if (estSolde) {
                await CreditModel.updateStatut(echeance.credit_id, 'solde');
                await NotificationModel.sendToUser(
                    req.user.id,
                    'Crédit soldé',
                    'Félicitations ! Votre crédit a été entièrement remboursé.',
                    'credit'
                );
            } else {
                await NotificationModel.sendToUser(
                    req.user.id,
                    'Paiement reçu',
                    `Paiement de ${Number(montant).toLocaleString()} FCFA validé`,
                    'paiement'
                );
            }

            res.json({ success: true, credit_solde: estSolde, message: 'Paiement effectué avec succès' });

        } catch (error) {
            console.error(error);
            if (error.code === 'SOLDE_INSUFFISANT' || error.message === 'Solde insuffisant') {
                return res.status(400).json({ error: 'Solde insuffisant pour effectuer ce paiement' });
            }
            if (error.message === 'Cette échéance a déjà été payée') {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: 'Erreur lors du paiement' });
        }
    }
};

module.exports = remboursementController;