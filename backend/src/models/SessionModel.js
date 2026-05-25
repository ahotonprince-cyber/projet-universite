const { query } = require('../config/database');

class SessionModel {
    static async create(userId, token, ipAddress = null, userAgent = null) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        
        const result = await query(
            `INSERT INTO session (utilisateur_id, token, ip_address, user_agent, date_expiration)
             VALUES (?, ?, ?, ?, ?)`,
            [userId, token, ipAddress, userAgent, expiresAt]
        );
        return result.insertId;
    }
    
    static async findByToken(token) {
        const rows = await query(
            `SELECT * FROM session WHERE token = ? AND date_expiration > NOW()`,
            [token]
        );
        return rows[0];
    }
    
    static async deleteByToken(token) {
        const result = await query(`DELETE FROM session WHERE token = ?`, [token]);
        return result.affectedRows > 0;
    }
    
    static async deleteByUserExcept(userId, tokenToKeep) {
        const result = await query(
            `DELETE FROM session WHERE utilisateur_id = ? AND token != ?`,
            [userId, tokenToKeep]
        );
        return result.affectedRows;
    }
    
    static async deleteByUser(userId) {
        const result = await query(`DELETE FROM session WHERE utilisateur_id = ?`, [userId]);
        return result.affectedRows;
    }
    
    static async cleanExpired() {
        const result = await query(`DELETE FROM session WHERE date_expiration < NOW()`);
        return result.affectedRows;
    }
}

module.exports = SessionModel;