const { query } = require('../config/database');

class CreditModel {
    static async create(data, connection = null) {
        const queryFn = async (sql, params) => {
            if (connection) {
                const [rows] = await connection.execute(sql, params);
                return rows;
            } else {
                return await query(sql, params);
            }
        };

        const utilisateur_id    = data.utilisateur_id    ?? null;
        const produit_credit_id = data.produit_credit_id ?? null;
        const numero_credit     = data.numero_credit     ?? null;
        const montant_accorde   = data.montant_accorde   ?? 0;
        const duree_mois        = data.duree_mois        ?? 0;
        const taux_annuel       = data.taux_annuel       ?? 0;
        const objet             = data.objet             ?? null;
        const description       = data.description       ?? null;
        const statut            = data.statut            ?? 'en_attente';

        const sql = `INSERT INTO credit 
            (utilisateur_id, produit_credit_id, numero_credit, montant_accorde, 
             duree_mois, taux_annuel, objet, description, statut) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const params = [
            utilisateur_id, produit_credit_id, numero_credit, montant_accorde,
            duree_mois, taux_annuel, objet, description, statut
        ];

        const result = await queryFn(sql, params);
        console.log('✅ Crédit inséré avec ID:', result.insertId);
        return result.insertId;
    }

    static normalizeStatut(statut) {
        if (!statut || statut === 'termine') return 'solde';
        return statut;
    }

    static async findByUser(utilisateur_id) {
        const rows = await query(
            `SELECT c.*, u.prenom, u.nom
             FROM credit c
             JOIN utilisateurs u ON c.utilisateur_id = u.id
             WHERE c.utilisateur_id = ?
             ORDER BY c.date_demande DESC`,
            [utilisateur_id]
        );

        return rows.map(credit => {
            const principal       = parseFloat(credit.montant_accorde) || 0;
            const taux            = parseFloat(credit.taux_annuel) || 0;
            const duree           = credit.duree_mois || 1;
            const totalARembourser = principal * (1 + taux / 100);
            const montantRembourse = parseFloat(credit.montant_rembourse) || 0;

            return {
                ...credit,
                statut:             CreditModel.normalizeStatut(credit.statut),
                montant_accorde:    principal,
                montant_rembourse:  montantRembourse,
                total_a_rembourser: Math.round(totalARembourser),
                taux_annuel:        taux,
                reste_a_payer: Math.max(0, Math.round(totalARembourser - montantRembourse)),
                mensualite: duree > 0 ? Math.round(totalARembourser / duree) : 0,
                progression: totalARembourser > 0
                    ? Math.min(100, Math.round((montantRembourse / totalARembourser) * 100))
                    : 0,
            };
        });
    }

    static async findById(id) {
        const rows = await query(
            `SELECT c.*, u.nom, u.prenom, u.email, u.telephone
             FROM credit c
             JOIN utilisateurs u ON c.utilisateur_id = u.id
             WHERE c.id = ?`,
            [id]
        );
        if (!rows[0]) return undefined;
        return { ...rows[0], statut: CreditModel.normalizeStatut(rows[0].statut) };
    }

    static async findAll(filters = {}) {
        let sql = `
            SELECT c.*, u.nom, u.prenom, u.email
            FROM credit c
            JOIN utilisateurs u ON c.utilisateur_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.statut)        { sql += ' AND c.statut = ?';        params.push(filters.statut); }
        if (filters.utilisateur_id){ sql += ' AND c.utilisateur_id = ?'; params.push(filters.utilisateur_id); }

        sql += ' ORDER BY c.date_demande DESC';
        if (filters.limit) { sql += ' LIMIT ?'; params.push(filters.limit); }

        const rows = await query(sql, params);
        return rows.map(r => ({ ...r, statut: CreditModel.normalizeStatut(r.statut) }));
    }

    static async update(id, data) {
        const result = await query(
            `UPDATE credit 
             SET montant_accorde = ?, duree_mois = ?, taux_annuel = ?, objet = ?, description = ?
             WHERE id = ?`,
            [
                data.montant_accorde ?? null,
                data.duree_mois      ?? null,
                data.taux_annuel     ?? null,
                data.objet           ?? null,
                data.description     ?? null,
                id
            ]
        );
        return result.affectedRows > 0;
    }

    static async updateStatut(id, statut, valide_par = null, motif = null) {
        const result = await query(
            `UPDATE credit
             SET statut = ?,
                 valide_par = COALESCE(?, valide_par),
                 date_validation = CASE WHEN ? IN ('valide', 'rejete') THEN NOW() ELSE date_validation END,
                 date_debut = CASE WHEN ? = 'actif' AND date_debut IS NULL THEN CURDATE() ELSE date_debut END,
                 date_fin   = CASE WHEN ? = 'actif' AND date_fin   IS NULL THEN DATE_ADD(CURDATE(), INTERVAL duree_mois MONTH) ELSE date_fin END,
                 motif_rejet = ?
             WHERE id = ?`,
            [statut, valide_par, statut, statut, statut, motif, id]
        );
        return result.affectedRows > 0;
    }

    static async getAlertesRetard() {
        return await query(
            `SELECT 
                e.id,
                e.credit_id,
                u.nom  AS client_nom,
                u.prenom AS client_prenom,
                e.montant_echeance,
                DATEDIFF(NOW(), e.date_echeance) as jours_retard
             FROM echeance e
             JOIN credit c ON e.credit_id = c.id
             JOIN utilisateurs u ON c.utilisateur_id = u.id
             WHERE e.statut = 'en_retard' AND e.date_echeance < NOW()
             ORDER BY jours_retard DESC`
        );
    }

    static async hasActiveCredit(utilisateur_id) {
        const rows = await query(
            `SELECT id FROM credit 
             WHERE utilisateur_id = ? AND statut IN ('actif', 'en_attente', 'valide')
             LIMIT 1`,
            [utilisateur_id]
        );
        return rows.length > 0;
    }
}

module.exports = CreditModel;