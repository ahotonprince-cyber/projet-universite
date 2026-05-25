const { query } = require('../config/database');

class SupportModel {
    static async create(data) {
        const result = await query(
            `INSERT INTO support_ticket (utilisateur_id, type, sujet, message)
             VALUES (?, ?, ?, ?)`,
            [data.utilisateur_id, data.type, data.sujet, data.message]
        );
        return result.insertId;
    }

    static async findAll(filters = {}) {
        let sql = `
            SELECT st.*,
                   u.nom, u.prenom, u.email,
                   ag.nom AS agent_nom, ag.prenom AS agent_prenom
            FROM support_ticket st
            JOIN utilisateurs u ON st.utilisateur_id = u.id
            LEFT JOIN utilisateurs ag ON st.repondu_par = ag.id
            WHERE 1=1
        `;
        const params = [];
        if (filters.statut) { sql += ' AND st.statut = ?'; params.push(filters.statut); }
        if (filters.type)   { sql += ' AND st.type = ?';   params.push(filters.type); }
        sql += ' ORDER BY st.date_creation DESC';
        if (filters.limit)  { sql += ' LIMIT ?'; params.push(filters.limit); }
        return await query(sql, params);
    }

    static async findById(id) {
        const rows = await query(
            `SELECT st.*, u.nom, u.prenom, u.email, u.telephone,
                    ag.nom AS agent_nom, ag.prenom AS agent_prenom
             FROM support_ticket st
             JOIN utilisateurs u ON st.utilisateur_id = u.id
             LEFT JOIN utilisateurs ag ON st.repondu_par = ag.id
             WHERE st.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async findByUser(utilisateur_id) {
        return await query(
            `SELECT * FROM support_ticket WHERE utilisateur_id = ? ORDER BY date_creation DESC`,
            [utilisateur_id]
        );
    }

    static async repondre(id, reponse, agentId) {
        const result = await query(
            `UPDATE support_ticket
             SET reponse = ?, repondu_par = ?, statut = 'resolu', date_reponse = NOW()
             WHERE id = ?`,
            [reponse, agentId, id]
        );
        return result.affectedRows > 0;
    }

    static async updateStatut(id, statut) {
        const result = await query(
            `UPDATE support_ticket SET statut = ? WHERE id = ?`,
            [statut, id]
        );
        return result.affectedRows > 0;
    }

    static async countByStatut() {
        const rows = await query(
            `SELECT statut, COUNT(*) as total FROM support_ticket GROUP BY statut`
        );
        return rows;
    }
}

module.exports = SupportModel;
