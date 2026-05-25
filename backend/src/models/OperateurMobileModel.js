const { query } = require('../config/database');

class OperateurMobileModel {
    static async findAll() {
        return await query('SELECT * FROM operateur_mobile ORDER BY id');
    }
    
    static async findById(id) {
        const rows = await query('SELECT * FROM operateur_mobile WHERE id = ?', [id]);
        return rows[0];
    }
    
    static async create(data) {
        const { nom, code, frais_transaction } = data;
        const result = await query(
            `INSERT INTO operateur_mobile (nom, code, frais_transaction)
             VALUES (?, ?, ?)`,
            [nom || null, code || null, frais_transaction || 0]
        );
        return result.insertId;
    }
    
    static async update(id, data) {
        // 🔧 Gérer les valeurs undefined
        const nom = data.nom !== undefined ? data.nom : null;
        const code = data.code !== undefined ? data.code : null;
        const frais_transaction = data.frais_transaction !== undefined ? data.frais_transaction : 0;
        const actif = data.actif !== undefined ? data.actif : true;
        
        const result = await query(
            `UPDATE operateur_mobile 
             SET nom = ?, code = ?, frais_transaction = ?, actif = ?
             WHERE id = ?`,
            [nom, code, frais_transaction, actif, id]
        );
        return result.affectedRows > 0;
    }
    
    static async delete(id) {
        const result = await query('DELETE FROM operateur_mobile WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
    
    static async toggleActif(id, actif) {
        const result = await query('UPDATE operateur_mobile SET actif = ? WHERE id = ?', [actif, id]);
        return result.affectedRows > 0;
    }
}

module.exports = OperateurMobileModel;