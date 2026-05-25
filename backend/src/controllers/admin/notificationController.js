const NotificationModel = require('../../models/NotificationModel');

const notificationController = {
    getAll: async (req, res) => {
        try {
            const unreadOnly = req.query.unread === 'true';
            const notifications = await NotificationModel.findByUser(req.user.id, { unread: unreadOnly });
            res.json({ notifications, count: notifications.length });
        } catch (error) {
            res.status(500).json({ error: 'Erreur chargement notifications' });
        }
    },
    
    create: async (req, res) => {
        try {
            const { utilisateur_id, titre, message, type } = req.body;
            await NotificationModel.sendToUser(utilisateur_id, titre, message, type);
            res.status(201).json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Erreur création notification' });
        }
    },
    
    update: async (req, res) => {
        try {
            await NotificationModel.markAsRead(req.params.id, req.user.id);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Erreur mise à jour notification' });
        }
    },
    
    delete: async (req, res) => {
        try {
            await NotificationModel.delete(req.params.id, req.user.id);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Erreur suppression notification' });
        }
    },
    
    readAll: async (req, res) => {
        try {
            await NotificationModel.markAllAsRead(req.user.id);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Erreur mise à jour notifications' });
        }
    },

    broadcast: async (req, res) => {
        try {
            const { titre, message, type } = req.body;
            await NotificationModel.sendToAdmins(titre, message, type);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Erreur envoi broadcast' });
        }
    }
};

module.exports = notificationController;