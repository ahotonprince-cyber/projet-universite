const OperationModel = require('../../models/OperationModel');
const CompteModel = require('../../models/CompteModel');
const RetraitModel = require('../../models/RetraitModel');
const NotificationModel = require('../../models/NotificationModel');
const { generateTransactionReference } = require('../../utils/generateNumber');

const mobileMoneyController = {

    depotMobile: async (req, res) => {
        try {
            const { operateur, montant, telephone, type_compte } = req.body;

            const comptes = await CompteModel.findByUser(req.user.id);
            const comptesSafe = comptes || [];

            // Utilise le type demandé (COURANT par défaut)
            const codeRecherche = (type_compte || 'COURANT').toUpperCase();
            const compte = comptesSafe.find(c => c.type_code === codeRecherche);

            if (!compte) {
                return res.status(404).json({ error: `Compte ${codeRecherche} non trouvé` });
            }

            await CompteModel.updateSolde(compte.id, montant, 'depot');

            await OperationModel.create(
                compte.id,
                'depot',
                montant,
                `Dépôt Mobile Money ${operateur} — ${compte.type_nom}`,
                generateTransactionReference()
            );

            res.json({ success: true, message: `Dépôt effectué sur votre compte ${compte.type_nom}` });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur lors du dépôt' });
        }
    },

    retraitMobile: async (req, res) => {
        try {
            const { operateur, montant, telephone } = req.body;

            const comptes = await CompteModel.findByUser(req.user.id);
            const comptesSafe = comptes || [];

            // Vérifie le solde courant avant d'accepter la demande
            const compteCourant = comptesSafe.find(c => c.type_code === 'COURANT');
            if (!compteCourant) {
                return res.status(404).json({ error: 'Compte courant non trouvé' });
            }

            if ((compteCourant.solde || 0) < montant) {
                return res.status(400).json({ error: 'Solde insuffisant' });
            }

            // Crée la demande de retrait — l'admin valide avant déduction
            await RetraitModel.createDemande({
                utilisateur_id: req.user.id,
                montant,
                telephone,
                operateur,
            });

            // Notifie les admins
            try {
                await NotificationModel.sendToAdmins(
                    '💸 Nouvelle demande de retrait',
                    `Un client a soumis une demande de retrait de ${montant.toLocaleString()} FCFA via ${operateur.toUpperCase()}.`,
                    'retrait'
                );
            } catch (_) {}

            res.json({
                success: true,
                message: 'Demande de retrait envoyée. Elle sera traitée par un administrateur.',
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur lors de la demande de retrait' });
        }
    }
};

module.exports = mobileMoneyController;