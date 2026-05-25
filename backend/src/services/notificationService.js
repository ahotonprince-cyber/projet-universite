const NotificationModel = require('../models/NotificationModel');

class NotificationService {
    static async sendToUser(userId, titre, message, type, referenceId = null) {
        return NotificationModel.sendToUser(userId, titre, message, type, referenceId);
    }
    
    static async sendToAdmins(titre, message, type, referenceId = null) {
        return NotificationModel.sendToAdmins(titre, message, type, referenceId);
    }
    
    static async notifyCreditDemande(creditId, userId, montant) {
        return this.sendToAdmins('Nouvelle demande de crédit', `Demande de ${montant.toLocaleString()} FCFA`, 'validation', creditId);
    }
    
    static async notifyCreditValide(creditId, userId) {
        return this.sendToUser(userId, 'Crédit validé', 'Votre demande de crédit a été validée', 'validation', creditId);
    }
    
    static async notifyCreditRejete(creditId, userId, motif) {
        return this.sendToUser(userId, 'Crédit rejeté', motif || 'Votre demande a été rejetée', 'validation', creditId);
    }
    
    static async notifyPaiementRecu(userId, montant, creditId) {
        return this.sendToUser(userId, 'Paiement reçu', `Paiement de ${montant.toLocaleString()} FCFA enregistré`, 'paiement', creditId);
    }
    
    static async notifyRetardPaiement(userId, creditId, joursRetard) {
        return this.sendToUser(userId, 'Paiement en retard', `Votre paiement est en retard de ${joursRetard} jours`, 'retard', creditId);
    }
}

module.exports = NotificationService;