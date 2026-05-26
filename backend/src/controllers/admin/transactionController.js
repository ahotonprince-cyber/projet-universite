// /backend/src/controllers/admin/transactionController.js
const { query } = require('../../config/database');

const transactionController = {
    getAll: async (req, res) => {
        try {
            const { limit = 100, offset = 0, type, search } = req.query;

            let sql = `
                SELECT o.*, u.nom as client_nom, u.prenom as client_prenom, tc.nom as compte_type
                FROM operation o
                JOIN compte_bancaire c ON o.compte_id = c.id
                JOIN utilisateurs u ON c.utilisateur_id = u.id
                JOIN type_compte tc ON c.type_compte_id = tc.id
                WHERE 1=1
            `;
            const params = [];

            if (type && type !== 'all') {
                sql += ' AND o.type_operation = ?';
                params.push(type);
            }

            if (search) {
                sql += ' AND (u.nom LIKE ? OR u.prenom LIKE ? OR u.email LIKE ?)';
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            const safeLimit  = parseInt(limit)  || 50;
            const safeOffset = parseInt(offset) || 0;
            sql += ` ORDER BY o.date_operation DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;

            const transactions = await query(sql, params);
            res.json({ transactions: transactions || [] });
        } catch (error) {
            console.error('❌ getAll transactions error:', error);
            res.status(500).json({ error: 'Erreur chargement transactions' });
        }
    }
};

module.exports = transactionController;