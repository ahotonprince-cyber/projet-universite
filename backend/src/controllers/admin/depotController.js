const { query } = require('../../config/database');

const depotController = {

    getAll: async (req, res) => {
        try {
            const { operateur, limit } = req.query;
            let sql = `
                SELECT o.id, o.montant, o.description, o.date_operation, o.reference_externe,
                       u.nom, u.prenom, u.telephone,
                       c.numero_compte
                FROM operation o
                JOIN compte_bancaire c ON o.compte_id = c.id
                JOIN utilisateurs u ON c.utilisateur_id = u.id
                WHERE o.type_operation IN ('depot', 'depot_mobile')
            `;
            const params = [];
            if (operateur) { sql += ' AND o.description LIKE ?'; params.push(`%${operateur}%`); }
            sql += ' ORDER BY o.date_operation DESC';
            if (limit) { sql += ' LIMIT ?'; params.push(parseInt(limit)); }

            const depots = await query(sql, params);
            res.json({ depots });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur chargement dépôts' });
        }
    },

    getStats: async (req, res) => {
        try {
            const rows = await query(`
                SELECT
                    COUNT(*)                                                        AS total,
                    COALESCE(SUM(o.montant), 0)                                    AS montant_total,
                    COUNT(CASE WHEN DATE(o.date_operation) = CURDATE() THEN 1 END) AS today_count,
                    COALESCE(SUM(CASE WHEN DATE(o.date_operation) = CURDATE() THEN o.montant ELSE 0 END), 0) AS today_amount
                FROM operation o
                WHERE o.type_operation IN ('depot', 'depot_mobile')
            `);
            res.json({ stats: rows[0] });
        } catch (error) {
            res.status(500).json({ error: 'Erreur statistiques dépôts' });
        }
    }
};

module.exports = depotController;
