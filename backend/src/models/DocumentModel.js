const { query } = require('../config/database');

class DocumentModel {
    static async create(data) {
        const { utilisateur_id, nom, type, url_fichier } = data;
        const result = await query(
            `INSERT INTO document (utilisateur_id, nom, type, url_fichier, statut)
             VALUES (?, ?, ?, ?, 'en_attente')`,
            [utilisateur_id, nom, type, url_fichier]
        );
        return result.insertId;
    }
    
    static async findByUser(utilisateur_id) {
        return await query(
            'SELECT * FROM document WHERE utilisateur_id = ? ORDER BY date_upload DESC',
            [utilisateur_id]
        );
    }
    
    static async findById(id) {
        const rows = await query('SELECT * FROM document WHERE id = ?', [id]);
        return rows[0];
    }
    
    static async updateStatut(id, statut, valide_par = null, motif_rejet = null) {
        const result = await query(
            `UPDATE document 
             SET statut = ?, date_validation = NOW(), valide_par = ?, motif_rejet = ?
             WHERE id = ?`,
            [statut, valide_par, motif_rejet, id]
        );
        return result.affectedRows > 0;
    }
    
    static async delete(id, utilisateur_id) {
        const result = await query(
            'DELETE FROM document WHERE id = ? AND utilisateur_id = ?',
            [id, utilisateur_id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = DocumentModel;