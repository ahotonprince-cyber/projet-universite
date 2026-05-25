const NotificationModel = require('../../models/NotificationModel');

const notificationController = {
    getNotifications: async (req, res) => {
        try {
            const unreadOnly = req.query.unread === 'true';

            const notifications = await NotificationModel.findByUser(
                req.user.id,
                { unread: unreadOnly }
            );

            // ✅ sécurisation
            const notificationsSafe = notifications || [];

            res.json({
                notifications: notificationsSafe,
                count: notificationsSafe.length
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur chargement notifications' });
        }
    },

    markAsRead: async (req, res) => {
        try {
            await NotificationModel.markAsRead(req.params.id, req.user.id);
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur lors du marquage' });
        }
    },

    markAllAsRead: async (req, res) => {
        try {
            await NotificationModel.markAllAsRead(req.user.id);
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur lors du marquage' });
        }
    },

    deleteNotification: async (req, res) => {
        try {
            await NotificationModel.delete(req.params.id, req.user.id);
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur lors de la suppression' });
        }
    }
};

module.exports = notificationController;