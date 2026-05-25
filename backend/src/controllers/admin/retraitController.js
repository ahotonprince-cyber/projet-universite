const RetraitModel = require('../../models/RetraitModel');
const NotificationModel = require('../../models/NotificationModel');
const CompteModel = require('../../models/CompteModel');
const OperationModel = require('../../models/OperationModel');
const { generateTransactionReference } = require('../../utils/generateNumber');

const retraitController = {
    getAll: async (req, res) => {
        try {
            const { statut } = req.query;
            const demandes = await RetraitModel.findAllDemandes({ statut });
            res.json({ demandes });
        } catch (error) {
            res.status(500).json({ error: 'Erreur chargement demandes' });
        }
    },

    getById: async (req, res) => {
        try {
            const demande = await RetraitModel.findById(req.params.id);
            if (!demande) return res.status(404).json({ error: 'Demande non trouvée' });
            res.json({ demande });
        } catch (error) {
            res.status(500).json({ error: 'Erreur chargement demande' });
        }
    },

    valider: async (req, res) => {
        try {
            const { accepte, motif_rejet } = req.body;

            // Récupérer la demande AVANT de la traiter
            const demande = await RetraitModel.findById(req.params.id);
            if (!demande) return res.status(404).json({ error: 'Demande non trouvée' });

            if (demande.statut !== 'en_attente') {
                return res.status(400).json({ error: 'Cette demande a déjà été traitée' });
            }

            if (accepte) {
                // Vérifier que le client a toujours le solde suffisant
                const comptes = await CompteModel.findByUser(demande.utilisateur_id);
                const compteCourant = (comptes || []).find(c => c.type_code === 'COURANT');

                if (!compteCourant) {
                    return res.status(404).json({ error: 'Compte courant du client introuvable' });
                }

                if ((compteCourant.solde || 0) < demande.montant) {
                    return res.status(400).json({ error: 'Solde client insuffisant pour effectuer ce retrait' });
                }

                // Débiter le compte courant
                await CompteModel.updateSolde(compteCourant.id, demande.montant, 'retrait');

                // Enregistrer l'opération
                await OperationModel.create(
                    compteCourant.id,
                    'retrait_mobile',
                    demande.montant,
                    `Retrait Mobile Money ${demande.operateur} — ${demande.telephone}`,
                    generateTransactionReference()
                );

                // Mettre à jour le statut de la demande
                await RetraitModel.valider(demande.id, true, req.user.id, null);

                await NotificationModel.sendToUser(
                    demande.utilisateur_id,
                    '✅ Retrait effectué',
                    `Votre retrait de ${Number(demande.montant).toLocaleString('fr-FR')} FCFA via ${demande.operateur.toUpperCase()} a été traité avec succès.`,
                    'validation'
                );
            } else {
                // Rejeter sans débiter
                await RetraitModel.valider(demande.id, false, req.user.id, motif_rejet);

                await NotificationModel.sendToUser(
                    demande.utilisateur_id,
                    '❌ Retrait rejeté',
                    motif_rejet || 'Votre demande de retrait a été rejetée.',
                    'validation'
                );
            }

            res.json({ success: true });
        } catch (error) {
            console.error('❌ valider retrait error:', error);
            res.status(500).json({ error: 'Erreur validation demande: ' + error.message });
        }
    },

    delete: async (req, res) => {
        try {
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Erreur suppression demande' });
        }
    }
};

module.exports = retraitController;