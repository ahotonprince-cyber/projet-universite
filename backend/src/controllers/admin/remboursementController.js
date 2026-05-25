const EcheanceModel = require('../../models/EcheanceModel');
const CreditModel = require('../../models/CreditModel');
const NotificationModel = require('../../models/NotificationModel');

const remboursementController = {
    getAll: async (req, res) => {
        try {
            const echeances = await EcheanceModel.findByUser(null);
            res.json({ remboursements: echeances });
        } catch (error) {
            res.status(500).json({ error: 'Erreur chargement remboursements' });
        }
    },
    
    getById: async (req, res) => {
        try {
            const echeances = await EcheanceModel.findByUser(null);
            const echeance = echeances.find(e => e.id === parseInt(req.params.id));
            if (!echeance) return res.status(404).json({ error: 'Remboursement non trouvé' });
            res.json({ remboursement: echeance });
        } catch (error) {
            res.status(500).json({ error: 'Erreur chargement remboursement' });
        }
    },
    
    enregistrerPaiement: async (req, res) => {
        try {
            const { remboursement_id, montant, date_paiement } = req.body;
            await EcheanceModel.payer(remboursement_id, montant, date_paiement);
            
            const echeances = await EcheanceModel.findByUser(null);
            const echeance = echeances.find(e => e.id === remboursement_id);
            if (echeance) {
                await NotificationModel.sendToUser(echeance.utilisateur_id, 'Paiement enregistré', `Paiement de ${montant.toLocaleString()} FCFA enregistré`, 'paiement');
            }
            
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Erreur enregistrement paiement' });
        }
    },
    
    update: async (req, res) => {
        try {
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Erreur mise à jour' });
        }
    }
};

module.exports = remboursementController;