const SupportModel = require('../../models/SupportModel');
const NotificationModel = require('../../models/NotificationModel');

const supportController = {

    getAll: async (req, res) => {
        try {
            const { statut, type } = req.query;
            const tickets = await SupportModel.findAll({ statut, type });
            const counts = await SupportModel.countByStatut();
            res.json({ tickets, counts });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur chargement tickets' });
        }
    },

    getById: async (req, res) => {
        try {
            const ticket = await SupportModel.findById(req.params.id);
            if (!ticket) return res.status(404).json({ error: 'Ticket non trouvé' });
            res.json({ ticket });
        } catch (error) {
            res.status(500).json({ error: 'Erreur chargement ticket' });
        }
    },

    repondre: async (req, res) => {
        try {
            const { reponse } = req.body;
            if (!reponse?.trim()) return res.status(400).json({ error: 'Réponse requise' });

            const ticket = await SupportModel.findById(req.params.id);
            if (!ticket) return res.status(404).json({ error: 'Ticket non trouvé' });

            await SupportModel.repondre(req.params.id, reponse.trim(), req.user.id);

            await NotificationModel.sendToUser(
                ticket.utilisateur_id,
                'Réponse à votre demande de support',
                `Votre demande "${ticket.sujet}" a reçu une réponse. Consultez votre espace support.`,
                'info'
            );

            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur envoi réponse' });
        }
    },

    updateStatut: async (req, res) => {
        try {
            const { statut } = req.body;
            const valid = ['ouvert', 'en_cours', 'resolu', 'ferme'];
            if (!valid.includes(statut)) return res.status(400).json({ error: 'Statut invalide' });
            await SupportModel.updateStatut(req.params.id, statut);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Erreur mise à jour statut' });
        }
    }
};

module.exports = supportController;
