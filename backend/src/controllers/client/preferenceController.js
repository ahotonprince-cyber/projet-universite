const PreferenceModel = require('../../models/PreferenceModel');

exports.getPreferences = async (req, res) => {
    try {
        let prefs = await PreferenceModel.findByUserId(req.user.id);

        if (!prefs) {
            await PreferenceModel.updateOrCreate(req.user.id, {});
            prefs = await PreferenceModel.findByUserId(req.user.id);
        }

        res.json({ preferences: prefs });
    } catch (error) {
        console.error('❌ getPreferences error:', error);
        res.status(500).json({ error: 'Erreur chargement préférences' });
    }
};

exports.updatePreferences = async (req, res) => {
    try {
        const { notification_email, notification_sms, notification_push, langue, theme } = req.body;

        await PreferenceModel.updateOrCreate(req.user.id, {
            notification_email,
            notification_sms,
            notification_push,
            langue,
            theme,
        });

        res.json({ success: true, message: 'Préférences mises à jour' });
    } catch (error) {
        console.error('❌ updatePreferences error:', error);
        res.status(500).json({ error: 'Erreur mise à jour préférences' });
    }
};
