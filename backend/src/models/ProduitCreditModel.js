const { query } = require('../config/database');

class ProduitCreditModel {
    static async findAll() {
        return await query('SELECT * FROM produit_credit ORDER BY id');
    }

    static async findById(id) {
        const rows = await query('SELECT * FROM produit_credit WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(data) {
        const result = await query(
            `INSERT INTO produit_credit
             (nom, categorie, description, taux_annuel, type_taux, periodicite_taux,
              taux_penalite, periode_grace, duree_min, duree_max,
              frequence_remboursement, mode_remboursement,
              montant_min, montant_max, frais_dossier)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.nom,
                data.categorie || 'individuel',
                data.description || null,
                data.taux_annuel || 0,
                data.type_taux || 'fixe',
                data.periodicite_taux || 'mensuel',
                data.taux_penalite || 0,
                data.periode_grace || 0,
                data.duree_min || 0,
                data.duree_max || 0,
                data.frequence_remboursement || 'mensuel',
                data.mode_remboursement || 'annuite_constante',
                data.montant_min || 0,
                data.montant_max || 0,
                data.frais_dossier || 0,
            ]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const result = await query(
            `UPDATE produit_credit
             SET nom = ?, categorie = ?, description = ?,
                 taux_annuel = ?, type_taux = ?, periodicite_taux = ?,
                 taux_penalite = ?, periode_grace = ?,
                 duree_min = ?, duree_max = ?,
                 frequence_remboursement = ?, mode_remboursement = ?,
                 montant_min = ?, montant_max = ?, frais_dossier = ?, actif = ?
             WHERE id = ?`,
            [
                data.nom,
                data.categorie || 'individuel',
                data.description || null,
                data.taux_annuel,
                data.type_taux || 'fixe',
                data.periodicite_taux || 'mensuel',
                data.taux_penalite || 0,
                data.periode_grace || 0,
                data.duree_min,
                data.duree_max,
                data.frequence_remboursement || 'mensuel',
                data.mode_remboursement || 'annuite_constante',
                data.montant_min,
                data.montant_max,
                data.frais_dossier || 0,
                data.actif !== undefined ? data.actif : true,
                id,
            ]
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const result = await query('DELETE FROM produit_credit WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async toggleActif(id, actif) {
        const result = await query('UPDATE produit_credit SET actif = ? WHERE id = ?', [actif, id]);
        return result.affectedRows > 0;
    }
}

module.exports = ProduitCreditModel;
