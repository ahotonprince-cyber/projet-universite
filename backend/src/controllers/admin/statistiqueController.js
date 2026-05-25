const { query } = require('../../config/database');

const statistiqueController = {
    getKPI: async (req, res) => {
        try {
            const [totalClients] = await query('SELECT COUNT(*) as total FROM utilisateurs WHERE role = "client"');
            const [totalCredits] = await query('SELECT COUNT(*) as total, SUM(montant_accorde) as montant_total FROM credit');
            const [creditsActifs] = await query('SELECT COUNT(*) as total FROM credit WHERE statut = "actif"');
            const [creditsEnAttente] = await query('SELECT COUNT(*) as total FROM credit WHERE statut = "en_attente"');
            const [remboursements] = await query('SELECT SUM(montant_rembourse) as total FROM credit');
            const [alertesRetard] = await query('SELECT COUNT(*) as total FROM echeance WHERE statut = "en_retard"');
            
            res.json({
                total_clients: totalClients.total,
                total_credits: totalCredits.total,
                total_decaissements: totalCredits.montant_total || 0,
                credits_actifs: creditsActifs.total,
                credits_en_attente: creditsEnAttente.total,
                total_rembourse: remboursements.total || 0,
                alertes_retard: alertesRetard.total
            });
        } catch (error) {
            res.status(500).json({ error: 'Erreur chargement KPI' });
        }
    },
    
    getEvolution: async (req, res) => {
        try {
            const evolution = await query(`
                SELECT DATE_FORMAT(date_demande, '%Y-%m') as mois, 
                       COUNT(*) as nombre, 
                       SUM(montant_accorde) as montant
                FROM credit 
                WHERE date_demande >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                GROUP BY DATE_FORMAT(date_demande, '%Y-%m')
                ORDER BY mois ASC
            `);
            res.json({ evolution });
        } catch (error) {
            res.status(500).json({ error: 'Erreur chargement évolution' });
        }
    },
    
    getTopClients: async (req, res) => {
        try {
            const topClients = await query(`
                SELECT u.id, u.nom, u.prenom, u.score_credit,
                       SUM(c.montant_accorde) as total_emprunte,
                       COUNT(c.id) as nombre_credits
                FROM utilisateurs u
                JOIN credit c ON u.id = c.utilisateur_id
                WHERE u.role = 'client'
                GROUP BY u.id
                ORDER BY total_emprunte DESC
                LIMIT 10
            `);
            res.json({ top_clients: topClients });
        } catch (error) {
            res.status(500).json({ error: 'Erreur chargement top clients' });
        }
    },
    
    getCreditsByStatut: async (req, res) => {
        try {
            const stats = await query(`
                SELECT statut, COUNT(*) as total, SUM(montant_accorde) as montant
                FROM credit
                GROUP BY statut
            `);
            res.json({ stats });
        } catch (error) {
            res.status(500).json({ error: 'Erreur chargement statistiques crédits' });
        }
    },
    
    getRemboursementsMensuels: async (req, res) => {
        try {
            const remboursements = await query(`
                SELECT DATE_FORMAT(date_paiement, '%Y-%m') as mois,
                       SUM(montant_paye) as total
                FROM echeance
                WHERE date_paiement IS NOT NULL
                GROUP BY DATE_FORMAT(date_paiement, '%Y-%m')
                ORDER BY mois ASC
                LIMIT 12
            `);
            res.json({ remboursements });
        } catch (error) {
            res.status(500).json({ error: 'Erreur chargement remboursements mensuels' });
        }
    }
};

module.exports = statistiqueController;