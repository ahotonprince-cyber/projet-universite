// /backend/src/controllers/admin/logController.js
const { query } = require('../../config/database');

const logController = {
    getAll: async (req, res) => {
        try {
            const { limit = 100, offset = 0, action, search } = req.query;

            let sql = `
                SELECT l.*, u.nom as utilisateur_nom, u.prenom as utilisateur_prenom, u.role as utilisateur_role
                FROM logs_audit l
                JOIN utilisateurs u ON l.utilisateur_id = u.id
                WHERE 1=1
            `;
            const params = [];

            if (action && action !== 'all') {
                sql += ' AND l.action = ?';
                params.push(action);
            }

            if (search) {
                sql += ' AND (u.nom LIKE ? OR u.prenom LIKE ? OR l.action LIKE ?)';
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            sql += ' ORDER BY l.date_action DESC LIMIT ? OFFSET ?';
            params.push(parseInt(limit), parseInt(offset));

            const logs = await query(sql, params);
            res.json({ logs: logs || [] });
        } catch (error) {
            console.error('❌ getAll logs error:', error);
            res.status(500).json({ error: 'Erreur chargement logs' });
        }
    }
};

module.exports = logController;