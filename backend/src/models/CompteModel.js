const { query } = require('../config/database');

class CompteModel {
    static async findByUser(userId) {
        return await query(
            `SELECT c.*, tc.nom as type_nom, tc.code as type_code 
             FROM compte_bancaire c
             JOIN type_compte tc ON c.type_compte_id = tc.id
             WHERE c.utilisateur_id = ? AND c.statut = 'actif'`,
            [userId]
        );
    }
    
    static async findByClient(clientId) {
        return await query(
            `SELECT c.*, tc.nom as type_nom, tc.code as type_code, u.nom, u.prenom
             FROM compte_bancaire c
             JOIN type_compte tc ON c.type_compte_id = tc.id
             JOIN utilisateurs u ON c.utilisateur_id = u.id
             WHERE c.utilisateur_id = ?`,
            [clientId]
        );
    }
    
    static async create(userId, typeCompteId, numeroCompte) {
        const result = await query(
            `INSERT INTO compte_bancaire (utilisateur_id, type_compte_id, numero_compte, solde)
             VALUES (?, ?, ?, 0)`,
            [userId, typeCompteId, numeroCompte]
        );
        return result.insertId;
    }
    
    static async updateSolde(compteId, montant, operation) {
        if (operation === 'retrait') {
            const rows = await query(
                `SELECT solde FROM compte_bancaire WHERE id = ?`,
                [compteId]
            );
            const solde = parseFloat(rows[0]?.solde || 0);
            if (solde <= 0 || solde < montant) {
                const err = new Error('Solde insuffisant');
                err.code = 'SOLDE_INSUFFISANT';
                throw err;
            }
        }
        const sign = operation === 'depot' ? '+' : '-';
        const result = await query(
            `UPDATE compte_bancaire SET solde = solde ${sign} ?, date_derniere_operation = NOW() WHERE id = ?`,
            [montant, compteId]
        );
        return result.affectedRows > 0;
    }
    
    static async updateStatut(compteId, statut) {
        const result = await query(
            `UPDATE compte_bancaire SET statut = ? WHERE id = ?`,
            [statut, compteId]
        );
        return result.affectedRows > 0;
    }
    
    static async getSoldeClient(userId) {
        const rows = await query(
            `SELECT 
                SUM(CASE WHEN tc.code = 'EPARGNE' THEN c.solde ELSE 0 END) AS solde_epargne,
                SUM(CASE WHEN tc.code = 'COURANT' THEN c.solde ELSE 0 END) AS solde_courant,
                SUM(CASE WHEN tc.code = 'TONTINE' THEN c.solde ELSE 0 END) AS solde_tontine
             FROM compte_bancaire c
             JOIN type_compte tc ON c.type_compte_id = tc.id
             WHERE c.utilisateur_id = ? AND c.statut = 'actif'`,
            [userId]
        );
        return rows[0] || { solde_epargne: 0, solde_courant: 0, solde_tontine: 0 };
    }
    
    static async findById(compteId) {
        const rows = await query(
            `SELECT c.*, tc.nom as type_nom, tc.code as type_code,
                    u.nom as client_nom, u.prenom as client_prenom, u.email as client_email
             FROM compte_bancaire c
             JOIN type_compte tc ON c.type_compte_id = tc.id
             JOIN utilisateurs u ON c.utilisateur_id = u.id
             WHERE c.id = ?`,
            [compteId]
        );
        return rows[0] || null;
    }

    // ✅ NOUVELLE MÉTHODE : Récupérer les opérations d'un compte
    static async getOperations(compteId, limit = 50) {
        return await query(
            `SELECT * FROM operation 
             WHERE compte_id = ? 
             ORDER BY date_operation DESC 
             LIMIT ?`,
            [compteId, limit]
        );
    }
}

module.exports = CompteModel;