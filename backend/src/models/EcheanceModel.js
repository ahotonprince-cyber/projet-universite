const { query } = require('../config/database');

class EcheanceModel {
    static async generateForCredit(creditId, montant, dureeMois, tauxAnnuel, dateDebut, connection = null) {
        const db = connection || { query };
        
        const totalAvecInterets = montant * (1 + tauxAnnuel / 100);
        const montantEcheance = Math.round(totalAvecInterets / dureeMois);
        
        for (let i = 1; i <= dureeMois; i++) {
            const dateEcheance = new Date(dateDebut);
            dateEcheance.setMonth(dateEcheance.getMonth() + i);
            
            await db.query(
                `INSERT INTO echeance (credit_id, numero_echeance, montant_echeance, date_echeance, statut)
                 VALUES (?, ?, ?, ?, 'a_venir')`,
                [creditId, i, montantEcheance, dateEcheance]
            );
        }
        
        return true;
    }
    
    static async findByCredit(creditId) {
        return await query(
            `SELECT * FROM echeance WHERE credit_id = ? ORDER BY numero_echeance ASC`,
            [creditId]
        );
    }
    
    static async findByUser(userId) {
        return await query(
            `SELECT e.*, c.numero_credit, c.objet as credit_objet, u.nom, u.prenom
             FROM echeance e
             JOIN credit c ON e.credit_id = c.id
             JOIN utilisateurs u ON c.utilisateur_id = u.id
             WHERE c.utilisateur_id = ?
             ORDER BY e.date_echeance ASC`,
            [userId]
        );
    }
    
    static async getProchainesEcheances(userId, limit = 5) {
        return await query(
            `SELECT e.*, c.numero_credit, c.objet
             FROM echeance e
             JOIN credit c ON e.credit_id = c.id
             WHERE c.utilisateur_id = ? AND e.statut IN ('a_venir', 'en_retard')
             ORDER BY e.date_echeance ASC
             LIMIT ${parseInt(limit) || 5}`,
            [parseInt(userId)]
        );
    }
    
    static async payer(echeanceId, montant, datePaiement, connection = null) {
        const db = connection || { query };

        const echeance = await db.query(`SELECT * FROM echeance WHERE id = ?`, [echeanceId]);
        if (!echeance[0]) throw new Error('Échéance non trouvée');

        if (echeance[0].statut === 'paye') {
            throw new Error('Cette échéance a déjà été payée');
        }

        const montantPaye = parseFloat(echeance[0].montant_echeance);

        await db.query(
            `UPDATE echeance
             SET montant_paye = ?, statut = 'paye', date_paiement = ?
             WHERE id = ?`,
            [montantPaye, datePaiement, echeanceId]
        );

        await db.query(
            `UPDATE credit
             SET montant_rembourse = montant_rembourse + ?
             WHERE id = ?`,
            [montantPaye, echeance[0].credit_id]
        );

        return true;
    }
    
    static async updateStatuts() {
        await query(
            `UPDATE echeance
             SET statut = 'en_retard'
             WHERE date_echeance < NOW() AND statut = 'a_venir'`
        );
        return true;
    }

    static async toutesPayees(creditId) {
        const rows = await query(
            `SELECT COUNT(*) as restantes FROM echeance
             WHERE credit_id = ? AND statut NOT IN ('paye')`,
            [creditId]
        );
        return parseInt(rows[0].restantes) === 0;
    }

    static async appliquerPenalite(echeanceId, tauxPenalite) {
        const rows = await query(`SELECT * FROM echeance WHERE id = ?`, [echeanceId]);
        if (!rows[0]) throw new Error('Échéance non trouvée');

        const echeance = rows[0];
        const joursRetard = Math.max(0, Math.floor((Date.now() - new Date(echeance.date_echeance)) / 86400000));
        const penalite = Math.round(echeance.montant_echeance * (tauxPenalite / 100) * joursRetard);

        await query(
            `UPDATE echeance SET penalite = ? WHERE id = ?`,
            [penalite, echeanceId]
        );
        return penalite;
    }

    static async verifierRetard(echeanceId) {
        const rows = await query(`SELECT * FROM echeance WHERE id = ?`, [echeanceId]);
        if (!rows[0]) return false;
        return rows[0].statut === 'en_retard';
    }
}

module.exports = EcheanceModel;