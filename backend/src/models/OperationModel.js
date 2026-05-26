const { query } = require('../config/database');

class OperationModel {
    static async create(compteId, typeOperation, montant, description = null, referenceExterne = null) {
        const result = await query(
            `INSERT INTO operation (compte_id, type_operation, montant, description, reference_externe, statut)
             VALUES (?, ?, ?, ?, ?, 'completed')`,
            [compteId, typeOperation, montant, description, referenceExterne]
        );
        
        await query(`UPDATE compte_bancaire SET date_derniere_operation = NOW() WHERE id = ?`, [compteId]);
        
        return result.insertId;
    }
    
    static async findByCompte(compteId, limit = 50, offset = 0) {
        const safeLimit  = parseInt(limit)  || 50;
        const safeOffset = parseInt(offset) || 0;
        return await query(
            `SELECT * FROM operation WHERE compte_id = ? ORDER BY date_operation DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`,
            [parseInt(compteId)]
        );
    }

    static async findByUser(userId, filters = {}) {
        let sql = `
            SELECT o.*, c.numero_compte, tc.nom as compte_type
            FROM operation o
            JOIN compte_bancaire c ON o.compte_id = c.id
            JOIN type_compte tc ON c.type_compte_id = tc.id
            WHERE c.utilisateur_id = ?
        `;
        const params = [parseInt(userId)];

        if (filters.type) {
            sql += ' AND o.type_operation = ?';
            params.push(filters.type);
        }

        sql += ' ORDER BY o.date_operation DESC';

        if (filters.limit) {
            const safeLimit  = parseInt(filters.limit)  || 20;
            const safeOffset = parseInt(filters.offset) || 0;
            sql += ` LIMIT ${safeLimit} OFFSET ${safeOffset}`;
        }

        return await query(sql, params);
    }
}

module.exports = OperationModel;