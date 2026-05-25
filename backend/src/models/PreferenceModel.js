const { query } = require('../config/database');

class PreferenceModel {
    static async findByUserId(userId) {
        const rows = await query('SELECT * FROM preferences WHERE utilisateur_id = ?', [userId]);
        return rows[0];
    }
    
    static async updateOrCreate(userId, data) {
        const existing = await this.findByUserId(userId);
        
        if (existing) {
            await query(
                `UPDATE preferences 
                 SET notification_email = COALESCE(?, notification_email),
                     notification_sms = COALESCE(?, notification_sms),
                     notification_push = COALESCE(?, notification_push),
                     langue = COALESCE(?, langue),
                     theme = COALESCE(?, theme),
                     date_mise_a_jour = NOW()
                 WHERE utilisateur_id = ?`,
                [data.notification_email, data.notification_sms, data.notification_push, data.langue, data.theme, userId]
            );
        } else {
            await query(
                `INSERT INTO preferences 
                 (utilisateur_id, notification_email, notification_sms, notification_push, langue, theme)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [userId, data.notification_email ?? true, data.notification_sms ?? true, data.notification_push ?? false, data.langue ?? 'fr', data.theme ?? 'light']
            );
        }
        return true;
    }
}

module.exports = PreferenceModel;