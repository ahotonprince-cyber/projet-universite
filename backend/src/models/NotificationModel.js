const { query } = require('../config/database');

class NotificationModel {
    static async create(data, connection = null) {
        let result;

        if (connection) {
            const [rows] = await connection.execute(
                `INSERT INTO notification 
                (utilisateur_id, titre, message, type, reference_id, reference_type) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    data.utilisateur_id,
                    data.titre,
                    data.message,
                    data.type,
                    data.reference_id ?? null,
                    data.reference_type ?? null
                ]
            );
            result = rows;
        } else {
            result = await query(
                `INSERT INTO notification 
                (utilisateur_id, titre, message, type, reference_id, reference_type) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    data.utilisateur_id,
                    data.titre,
                    data.message,
                    data.type,
                    data.reference_id ?? null,
                    data.reference_type ?? null
                ]
            );
        }

        return result.insertId;
    }

    static async findByUser(userId, filters = {}) {
        let sql = `SELECT * FROM notification WHERE utilisateur_id = ?`;
        const params = [userId];

        if (filters.unread === true) {
            sql += ` AND lu = 0`;
        }
        if (filters.type) {
            sql += ` AND type = ?`;
            params.push(filters.type);
        }

        sql += ` ORDER BY date_creation DESC`;
        if (filters.limit) {
            sql += ` LIMIT ?`;
            params.push(filters.limit);
        }

        return await query(sql, params);
    }

    static async markAsRead(notificationId, userId) {
        const result = await query(
            `UPDATE notification SET lu = 1 WHERE id = ? AND utilisateur_id = ?`,
            [notificationId, userId]
        );
        return result.affectedRows > 0;
    }

    static async markAllAsRead(userId) {
        const result = await query(
            `UPDATE notification SET lu = 1 WHERE utilisateur_id = ? AND lu = 0`,
            [userId]
        );
        return result.affectedRows;
    }

    static async delete(notificationId, userId) {
        const result = await query(
            `DELETE FROM notification WHERE id = ? AND utilisateur_id = ?`,
            [notificationId, userId]
        );
        return result.affectedRows > 0;
    }

    static async sendToUser(userId, titre, message, type, referenceId = null) {
        return this.create({
            utilisateur_id: userId,
            titre,
            message,
            type,
            reference_id: referenceId ?? null
        });
    }

    static async sendToAdmins(titre, message, type, referenceId = null) {
        const admins = await query(`SELECT id FROM utilisateurs WHERE role = 'admin'`);
        for (const admin of admins) {
            await this.create({
                utilisateur_id: admin.id,
                titre,
                message,
                type,
                reference_id: referenceId ?? null
            });
        }
        return true;
    }
}

module.exports = NotificationModel;