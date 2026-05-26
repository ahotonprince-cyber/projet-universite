const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class UserModel {
    static async create(userData) {
        const { 
            nom, 
            prenom, 
            email, 
            telephone, 
            password, 
            role, 
            adresse, 
            profession, 
            dateNaissance 
        } = userData;
        
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // ✅ statut en_attente pour les clients, actif pour admin/agent
        const statut = role === 'client' ? 'en_attente' : 'actif';
        
        const result = await query(
            `INSERT INTO utilisateurs 
            (nom, prenom, email, telephone, password_hash, role, statut, adresse, profession, date_naissance) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nom || null, 
                prenom || null, 
                email || null, 
                telephone || null, 
                hashedPassword, 
                role || 'client',
                statut,           // ← ajouté
                adresse || null, 
                profession || null, 
                dateNaissance || null
            ]
        );
        
        if (role === 'client') {
            await this.createDefaultAccounts(result.insertId);
        }
        
        await query(`INSERT INTO preferences (utilisateur_id) VALUES (?)`, [result.insertId]);
        
        return result.insertId;
    }
    
    static async createDefaultAccounts(userId) {
        const types = await query('SELECT id FROM type_compte WHERE actif = 1');
        for (const type of types) {
            const numeroCompte = `CPT${String(userId).padStart(8, '0')}${String(type.id).padStart(2, '0')}`;
            await query(
                `INSERT INTO compte_bancaire (utilisateur_id, type_compte_id, numero_compte, solde) 
                 VALUES (?, ?, ?, 0)`,
                [userId, type.id, numeroCompte]
            );
        }
    }
    
    static async findByEmail(email) {
        const rows = await query('SELECT * FROM utilisateurs WHERE email = ?', [email]);
        return rows[0];
    }
    
    static async findByTelephone(telephone) {
        const rows = await query('SELECT * FROM utilisateurs WHERE telephone = ?', [telephone]);
        return rows[0];
    }
    
    static async findById(id) {
        const rows = await query(
            `SELECT id, nom, prenom, email, telephone, role, statut, avatar, 
                    adresse, profession, date_naissance, score_credit, date_creation 
             FROM utilisateurs WHERE id = ?`,
            [id]
        );
        return rows[0];
    }
    
    static async findAll(filters = {}) {
        let sql = `SELECT id, nom, prenom, email, telephone, role, statut, avatar, 
                          adresse, profession, score_credit, date_creation 
                   FROM utilisateurs WHERE 1=1`;
        const params = [];
        
        if (filters.role) { sql += ' AND role = ?'; params.push(filters.role); }
        if (filters.statut) { sql += ' AND statut = ?'; params.push(filters.statut); }
        if (filters.search) {
            sql += ' AND (nom LIKE ? OR prenom LIKE ? OR email LIKE ? OR telephone LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }
        
        sql += ' ORDER BY date_creation DESC';
        if (filters.limit) { sql += ' LIMIT ?'; params.push(filters.limit); }
        
        return await query(sql, params);
    }
    
    static async update(id, data) {
        const allowedFields = ['nom', 'prenom', 'email', 'telephone', 'adresse', 'profession', 'date_naissance', 'avatar'];
        const updates = []; 
        const values = [];
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(data[field]);
            }
        }
        if (updates.length === 0) return false;
        values.push(id);
        const result = await query(`UPDATE utilisateurs SET ${updates.join(', ')} WHERE id = ?`, values);
        return result.affectedRows > 0;
    }
    
    static async updatePassword(id, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        const result = await query('UPDATE utilisateurs SET password_hash = ? WHERE id = ?', [hashedPassword, id]);
        return result.affectedRows > 0;
    }
    
    static async updateStatut(id, statut) {
        const result = await query('UPDATE utilisateurs SET statut = ? WHERE id = ?', [statut, id]);
        return result.affectedRows > 0;
    }
    
    static async updateRole(id, role) {
        const result = await query('UPDATE utilisateurs SET role = ? WHERE id = ?', [role, id]);
        return result.affectedRows > 0;
    }
    
    static async updateScoreCredit(id, score) {
        const result = await query('UPDATE utilisateurs SET score_credit = ? WHERE id = ?', [score, id]);
        return result.affectedRows > 0;
    }
    
    static async updateLastConnexion(id) {
        const result = await query(
            'UPDATE utilisateurs SET date_derniere_connexion = NOW() WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
    
    static async delete(id) {
        await query('DELETE FROM session WHERE utilisateur_id = ?', [id]);
        await query('DELETE FROM preferences WHERE utilisateur_id = ?', [id]);
        await query('DELETE FROM notification WHERE utilisateur_id = ?', [id]);
        await query('DELETE FROM document WHERE utilisateur_id = ?', [id]);
        await query('DELETE FROM tontine_membre WHERE utilisateur_id = ?', [id]);
        await query('DELETE FROM demande_retrait WHERE utilisateur_id = ?', [id]);
        await query('DELETE FROM operation WHERE compte_id IN (SELECT id FROM compte_bancaire WHERE utilisateur_id = ?)', [id]);
        await query('DELETE FROM compte_bancaire WHERE utilisateur_id = ?', [id]);
        await query('DELETE FROM echeance WHERE credit_id IN (SELECT id FROM credit WHERE utilisateur_id = ?)', [id]);
        await query('DELETE FROM credit WHERE utilisateur_id = ?', [id]);
        const result = await query('DELETE FROM utilisateurs WHERE id = ?', [id]);
        console.log(`✅ Utilisateur ${id} supprimé avec toutes ses dépendances`);
        return result.affectedRows > 0;
    }
    
    static async verifyPassword(user, password) {
        return await bcrypt.compare(password, user.password_hash);
    }

    static async incrementTentatives(id) {
        await query(
            'UPDATE utilisateurs SET tentatives_connexion = tentatives_connexion + 1 WHERE id = ?',
            [id]
        );
        const rows = await query('SELECT tentatives_connexion FROM utilisateurs WHERE id = ?', [id]);
        return rows[0]?.tentatives_connexion ?? 0;
    }

    static async resetTentatives(id) {
        await query(
            'UPDATE utilisateurs SET tentatives_connexion = 0, date_blocage = NULL WHERE id = ?',
            [id]
        );
    }

    static async bloquerCompte(id) {
        // Sauvegarder le statut actuel avant de bloquer
        await query(
            "UPDATE utilisateurs SET statut_avant_blocage = statut, statut = 'bloque', date_blocage = NOW(), tentatives_connexion = 0 WHERE id = ?",
            [id]
        );
    }

    static async setDeblocageToken(id, token) {
        const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
        await query(
            'UPDATE utilisateurs SET deblocage_token = ?, deblocage_token_expiry = ? WHERE id = ?',
            [token, expiry, id]
        );
    }

    static async findByDeblocageToken(token) {
        const rows = await query(
            "SELECT * FROM utilisateurs WHERE deblocage_token = ? AND deblocage_token_expiry > UTC_TIMESTAMP() AND statut = 'bloque'",
            [token]
        );
        return rows[0];
    }

    static async debloquerCompte(id) {
        // Restaurer le statut d'avant le blocage (en_attente, actif, etc.)
        // Si statut_avant_blocage est NULL (anciens comptes), on met 'actif' par défaut
        await query(
            `UPDATE utilisateurs
             SET statut = COALESCE(statut_avant_blocage, 'actif'),
                 statut_avant_blocage = NULL,
                 date_blocage = NULL,
                 deblocage_token = NULL,
                 deblocage_token_expiry = NULL,
                 tentatives_connexion = 0
             WHERE id = ?`,
            [id]
        );
    }
    
    static async setEmailToken(id, token) {
        const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
        await query(
            'UPDATE utilisateurs SET email_token = ?, email_token_expiry = ? WHERE id = ?',
            [token, expiry, id]
        );
    }

    static async findByEmailToken(token) {
        const rows = await query(
            'SELECT * FROM utilisateurs WHERE email_token = ? AND email_token_expiry > UTC_TIMESTAMP()',
            [token]
        );
        return rows[0];
    }

    static async markEmailVerified(id) {
        await query(
            'UPDATE utilisateurs SET email_verifie = 1, email_token = NULL, email_token_expiry = NULL WHERE id = ?',
            [id]
        );
    }

    static async setResetToken(email, token, expiry) {
        await query('UPDATE utilisateurs SET reset_token = ?, reset_token_expiry = ? WHERE email = ?', [token, expiry, email]);
    }
    
    static async findByResetToken(token) {
        const rows = await query('SELECT * FROM utilisateurs WHERE reset_token = ? AND reset_token_expiry > UTC_TIMESTAMP()', [token]);
        return rows[0];
    }
    
    static async clearResetToken(id) {
        await query('UPDATE utilisateurs SET reset_token = NULL, reset_token_expiry = NULL WHERE id = ?', [id]);
    }
}

module.exports = UserModel;