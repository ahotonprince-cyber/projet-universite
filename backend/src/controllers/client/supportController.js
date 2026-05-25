const SupportModel = require('../../models/SupportModel');

const clientSupportController = {

    create: async (req, res) => {
        try {
            const { type, sujet, message } = req.body;
            if (!sujet?.trim() || !message?.trim()) {
                return res.status(400).json({ error: 'Sujet et message requis' });
            }
            const id = await SupportModel.create({
                utilisateur_id: req.user.id,
                type: type || 'question',
                sujet: sujet.trim(),
                message: message.trim()
            });
            res.status(201).json({ success: true, id });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur envoi ticket' });
        }
    },

    getMesTickets: async (req, res) => {
        try {
            const tickets = await SupportModel.findByUser(req.user.id);
            res.json({ tickets: tickets || [] });
        } catch (error) {
            res.status(500).json({ error: 'Erreur chargement tickets' });
        }
    }
};

module.exports = clientSupportController;
