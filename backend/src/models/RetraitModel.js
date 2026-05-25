const { query } = require('../config/database');

class RetraitModel {
    static async createDemande(data) {
        const result = await query(
            `INSERT INTO demande_retrait (utilisateur_id, montant, telephone, operateur, statut)
             VALUES (?, ?, ?, ?, 'en_attente')`,
            [data.utilisateur_id, data.montant, data.telephone, data.operateur]
        );
        return result.insertId;
    }
    
    static async findAllDemandes(filters = {}) {
        let sql = `
            SELECT dr.*, u.nom, u.prenom, u.email
            FROM demande_retrait dr
            JOIN utilisateurs u ON dr.utilisateur_id = u.id
            WHERE 1=1
        `;
        const params = [];
        
        if (filters.statut) { sql += ` AND dr.statut = ?`; params.push(filters.statut); }
        
        sql += ` ORDER BY dr.date_demande DESC`;
        return await query(sql, params);
    }
    
    static async findById(id) {
        const rows = await query(
            `SELECT dr.*, u.nom, u.prenom, u.email, u.telephone
             FROM demande_retrait dr
             JOIN utilisateurs u ON dr.utilisateur_id = u.id
             WHERE dr.id = ?`,
            [id]
        );
        return rows[0];
    }
    
    static async findByUser(utilisateurId) {
        return await query(
            `SELECT * FROM demande_retrait WHERE utilisateur_id = ? ORDER BY date_demande DESC`,
            [utilisateurId]
        );
    }
    
    static async valider(id, accepte, traitePar, motifRejet = null) {
        const statut = accepte ? 'valide' : 'rejete';
        const result = await query(
            `UPDATE demande_retrait 
             SET statut = ?, date_traitement = NOW(), traite_par = ?, motif_rejet = ?
             WHERE id = ?`,
            [statut, traitePar, motifRejet, id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = RetraitModel;