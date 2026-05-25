const { query } = require('../config/database');

class TontineModel {
    static async createGroupe(data) {
        const result = await query(
            `INSERT INTO tontine_groupe (nom, montant_part, periodicite, nombre_membres, statut)
             VALUES (?, ?, ?, 0, 'actif')`,
            [data.nom, data.montant_part, data.periodicite]
        );
        return result.insertId;
    }
    
    static async findAllGroupes(filters = {}) {
        let sql = `SELECT * FROM tontine_groupe WHERE 1=1`;
        const params = [];
        
        if (filters.statut) { sql += ` AND statut = ?`; params.push(filters.statut); }
        if (filters.periodicite) { sql += ` AND periodicite = ?`; params.push(filters.periodicite); }
        
        sql += ` ORDER BY date_creation DESC`;
        return await query(sql, params);
    }
    
    static async findGroupeById(id) {
        const rows = await query(`SELECT * FROM tontine_groupe WHERE id = ?`, [id]);
        return rows[0];
    }
    
    static async updateGroupe(id, data) {
        const result = await query(
            `UPDATE tontine_groupe SET nom = ?, montant_part = ?, periodicite = ? WHERE id = ?`,
            [data.nom, data.montant_part, data.periodicite, id]
        );
        return result.affectedRows > 0;
    }
    
    static async deleteGroupe(id) {
        const result = await query(`DELETE FROM tontine_groupe WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    }
    
    static async ajouterMembre(groupeId, utilisateurId) {
        const result = await query(
            `INSERT INTO tontine_membre (groupe_id, utilisateur_id, statut) VALUES (?, ?, 'actif')`,
            [groupeId, utilisateurId]
        );
        await query(`UPDATE tontine_groupe SET nombre_membres = nombre_membres + 1 WHERE id = ?`, [groupeId]);
        return result.insertId;
    }
    
    static async getMembres(groupeId) {
        return await query(
            `SELECT tm.*, u.nom, u.prenom, u.email, u.telephone
             FROM tontine_membre tm
             JOIN utilisateurs u ON tm.utilisateur_id = u.id
             WHERE tm.groupe_id = ?`,
            [groupeId]
        );
    }
    
    static async getMesGroupes(utilisateurId) {
        return await query(
            `SELECT tg.*, tm.id as membre_id, tm.date_adhesion, tm.statut as membre_statut,
                    tm.ordre_passage, tm.a_recu, tm.montant_total_paye
             FROM tontine_membre tm
             JOIN tontine_groupe tg ON tm.groupe_id = tg.id
             WHERE tm.utilisateur_id = ?`,
            [utilisateurId]
        );
    }
}

module.exports = TontineModel;