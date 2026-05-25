module.exports = {
    ROLES: {
        ADMIN: 'admin',
        AGENT: 'agent',
        CLIENT: 'client'
    },
    
    STATUT_UTILISATEUR: {
        ACTIF: 'actif',
        INACTIF: 'inactif',
        BLOQUE: 'bloque'
    },
    
    STATUT_CREDIT: {
        EN_ATTENTE: 'en_attente',
        VALIDE: 'valide',
        REJETE: 'rejete',
        ACTIF: 'actif',
        SOLDE: 'solde'
    },

    STATUT_ECHEANCE: {
        A_VENIR: 'a_venir',
        PAYE: 'paye',
        EN_RETARD: 'en_retard'
    },
    
    TYPE_OPERATION: {
        DEPOT: 'depot',
        RETRAIT: 'retrait',
        PAIEMENT: 'paiement',
        TRANSFERT: 'transfert'
    },
    
    TYPE_NOTIFICATION: {
        RETARD: 'retard',
        VALIDATION: 'validation',
        PAIEMENT: 'paiement',
        INFO: 'info',
        RAPPEL: 'rappel',
        ALERTE: 'alerte'
    },
    
    STATUT_DOCUMENT: {
        EN_ATTENTE: 'en_attente',
        VALIDE: 'valide',
        REJETE: 'rejete'
    },
    
    PERIODICITE_TONTINE: {
        HEBDOMADAIRE: 'hebdo',
        MENSUEL: 'mensuel'
    }
};