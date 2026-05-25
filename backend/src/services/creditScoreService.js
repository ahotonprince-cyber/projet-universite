const CreditModel = require('../models/CreditModel');
const EcheanceModel = require('../models/EcheanceModel');

class CreditScoreService {
    static async calculateScore(userId) {
        let score = 100;
        
        // Récupérer l'historique des crédits
        const credits = await CreditModel.findByUser(userId);
        
        if (credits.length === 0) return 60;
        
        // Facteur 1: Remboursements à temps (max -20 points)
        const echeances = await EcheanceModel.findByUser(userId);
        const totalEcheances = echeances.length;
        const echeancesRetard = echeances.filter(e => e.statut === 'en_retard').length;
        if (totalEcheances > 0) {
            const retardRatio = echeancesRetard / totalEcheances;
            score -= retardRatio * 20;
        }
        
        // Facteur 2: Crédits remboursés (max +10 points)
        const creditsTermines = credits.filter(c => c.statut === 'solde').length;
        score += Math.min(creditsTermines * 2, 10);
        
        // Facteur 3: Crédits actifs (max -15 points)
        const creditsActifs = credits.filter(c => c.statut === 'actif').length;
        if (creditsActifs > 1) score -= (creditsActifs - 1) * 5;
        
        // Facteur 4: Montant total emprunté (max -10 points)
        const totalEmprunte = credits.reduce((sum, c) => sum + c.montant_accorde, 0);
        if (totalEmprunte > 5000000) score -= 10;
        else if (totalEmprunte > 2000000) score -= 5;
        
        return Math.max(0, Math.min(100, Math.round(score)));
    }
    
    static async updateUserScore(userId) {
        const score = await this.calculateScore(userId);
        const UserModel = require('../models/UserModel');
        await UserModel.updateScoreCredit(userId, score);
        return score;
    }
}

module.exports = CreditScoreService;