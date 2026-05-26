const { query } = require('../config/database');

class LogsAuditModel {
    static async enregistrerAction(data) {
        const utilisateur_id = data.utilisateur_id ?? null;
        const action         = data.action         ?? '';
        const entity_type    = data.entity_type    ?? null;
        const entity_id      = data.entity_id      ?? null;
        const ip_adress      = data.ip_adress      ?? null;

        const result = await query(
            `INSERT INTO logs_audit (utilisateur_id, action, entity_type, entity_id, ip_adress)
             VALUES (?, ?, ?, ?, ?)`,
            [utilisateur_id, action, entity_type, entity_id, ip_adress]
        );
        return result.insertId;
    }

    static async consulterLogs(filters = {}) {
        let sql = `
            SELECT l.*, u.nom, u.prenom, u.email
            FROM logs_audit l
            LEFT JOIN utilisateurs u ON l.utilisateur_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.utilisateur_id) { sql += ' AND l.utilisateur_id = ?'; params.push(filters.utilisateur_id); }
        if (filters.entity_type)    { sql += ' AND l.entity_type = ?';    params.push(filters.entity_type); }
        if (filters.entity_id)      { sql += ' AND l.entity_id = ?';      params.push(filters.entity_id); }
        if (filters.date_debut)     { sql += ' AND l.date_action >= ?';   params.push(filters.date_debut); }
        if (filters.date_fin)       { sql += ' AND l.date_action <= ?';   params.push(filters.date_fin); }

        sql += ' ORDER BY l.date_action DESC';
        if (filters.limit) { sql += ` LIMIT ${parseInt(filters.limit) || 50}`; }

        return await query(sql, params);
    }

    static async filtrerLogs(action, entity_type = null) {
        let sql = `
            SELECT l.*, u.nom, u.prenom
            FROM logs_audit l
            LEFT JOIN utilisateurs u ON l.utilisateur_id = u.id
            WHERE l.action LIKE ?
        `;
        const params = [`%${action}%`];

        if (entity_type) { sql += ' AND l.entity_type = ?'; params.push(entity_type); }
        sql += ' ORDER BY l.date_action DESC';

        return await query(sql, params);
    }
}

module.exports = LogsAuditModel;
