const { query } = require('../../config/database');

const toCsv = (rows, columns) => {
    const header = columns.join(';');
    const lines = rows.map(row =>
        columns.map(col => {
            const val = row[col] ?? '';
            return String(val).includes(';') ? `"${val}"` : val;
        }).join(';')
    );
    return [header, ...lines].join('\n');
};

const rapportController = {

    // Rapport global des crédits (JSON ou CSV)
    getCredits: async (req, res) => {
        try {
            const { format = 'json', statut, date_debut, date_fin } = req.query;

            let sql = `
                SELECT c.numero_credit, u.nom, u.prenom, u.email, u.telephone,
                       c.montant_accorde, c.montant_rembourse,
                       (c.montant_accorde - c.montant_rembourse) AS reste_a_payer,
                       c.duree_mois, c.taux_annuel, c.statut,
                       c.date_demande, c.date_debut, c.date_fin
                FROM credit c
                JOIN utilisateurs u ON c.utilisateur_id = u.id
                WHERE 1=1
            `;
            const params = [];

            if (statut)      { sql += ' AND c.statut = ?';          params.push(statut); }
            if (date_debut)  { sql += ' AND c.date_demande >= ?';    params.push(date_debut); }
            if (date_fin)    { sql += ' AND c.date_demande <= ?';    params.push(date_fin); }
            sql += ' ORDER BY c.date_demande DESC';

            const rows = await query(sql, params);

            if (format === 'csv') {
                const columns = [
                    'numero_credit','nom','prenom','email','telephone',
                    'montant_accorde','montant_rembourse','reste_a_payer',
                    'duree_mois','taux_annuel','statut','date_demande','date_debut','date_fin'
                ];
                res.setHeader('Content-Type', 'text/csv; charset=utf-8');
                res.setHeader('Content-Disposition', 'attachment; filename="rapport_credits.csv"');
                return res.send('﻿' + toCsv(rows, columns));
            }

            res.json({ total: rows.length, credits: rows });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur génération rapport crédits' });
        }
    },

    // Rapport des transactions (JSON ou CSV)
    getTransactions: async (req, res) => {
        try {
            const { format = 'json', date_debut, date_fin } = req.query;

            let sql = `
                SELECT o.id, u.nom, u.prenom, cb.numero_compte,
                       o.type_operation, o.montant, o.description,
                       o.reference_externe, o.statut, o.date_operation
                FROM operation o
                JOIN compte_bancaire cb ON o.compte_id = cb.id
                JOIN utilisateurs u ON cb.utilisateur_id = u.id
                WHERE 1=1
            `;
            const params = [];

            if (date_debut) { sql += ' AND o.date_operation >= ?'; params.push(date_debut); }
            if (date_fin)   { sql += ' AND o.date_operation <= ?'; params.push(date_fin); }
            sql += ' ORDER BY o.date_operation DESC';

            const rows = await query(sql, params);

            if (format === 'csv') {
                const columns = [
                    'id','nom','prenom','numero_compte',
                    'type_operation','montant','description',
                    'reference_externe','statut','date_operation'
                ];
                res.setHeader('Content-Type', 'text/csv; charset=utf-8');
                res.setHeader('Content-Disposition', 'attachment; filename="rapport_transactions.csv"');
                return res.send('﻿' + toCsv(rows, columns));
            }

            res.json({ total: rows.length, transactions: rows });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur génération rapport transactions' });
        }
    },

    // Rapport des clients (JSON ou CSV)
    getClients: async (req, res) => {
        try {
            const { format = 'json' } = req.query;

            const rows = await query(`
                SELECT u.id, u.nom, u.prenom, u.email, u.telephone,
                       u.profession, u.score_credit, u.statut, u.date_creation,
                       COUNT(DISTINCT c.id)  AS nb_credits,
                       SUM(c.montant_accorde) AS total_emprunte,
                       SUM(c.montant_rembourse) AS total_rembourse
                FROM utilisateurs u
                LEFT JOIN credit c ON u.id = c.utilisateur_id
                WHERE u.role = 'client'
                GROUP BY u.id
                ORDER BY u.date_creation DESC
            `);

            if (format === 'csv') {
                const columns = [
                    'id','nom','prenom','email','telephone','profession',
                    'score_credit','statut','date_creation',
                    'nb_credits','total_emprunte','total_rembourse'
                ];
                res.setHeader('Content-Type', 'text/csv; charset=utf-8');
                res.setHeader('Content-Disposition', 'attachment; filename="rapport_clients.csv"');
                return res.send('﻿' + toCsv(rows, columns));
            }

            res.json({ total: rows.length, clients: rows });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur génération rapport clients' });
        }
    },

    // Rapport des remboursements / échéances en retard
    getRetards: async (req, res) => {
        try {
            const { format = 'json' } = req.query;

            const rows = await query(`
                SELECT e.id, u.nom, u.prenom, u.telephone,
                       c.numero_credit, e.numero_echeance,
                       e.montant_echeance, e.montant_paye, e.penalite,
                       e.date_echeance,
                       DATEDIFF(NOW(), e.date_echeance) AS jours_retard
                FROM echeance e
                JOIN credit c ON e.credit_id = c.id
                JOIN utilisateurs u ON c.utilisateur_id = u.id
                WHERE e.statut = 'en_retard'
                ORDER BY jours_retard DESC
            `);

            if (format === 'csv') {
                const columns = [
                    'id','nom','prenom','telephone','numero_credit','numero_echeance',
                    'montant_echeance','montant_paye','penalite','date_echeance','jours_retard'
                ];
                res.setHeader('Content-Type', 'text/csv; charset=utf-8');
                res.setHeader('Content-Disposition', 'attachment; filename="rapport_retards.csv"');
                return res.send('﻿' + toCsv(rows, columns));
            }

            res.json({ total: rows.length, retards: rows });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur génération rapport retards' });
        }
    }
};

module.exports = rapportController;
