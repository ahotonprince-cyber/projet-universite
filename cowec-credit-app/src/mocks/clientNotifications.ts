export type NotifClientType = 'paiement' | 'validation' | 'rappel' | 'info' | 'alerte';

export interface NotifClient {
  id: string;
  type: NotifClientType;
  titre: string;
  message: string;
  date: string;
  lu: boolean;
}

export const clientNotifications: NotifClient[] = [
  {
    id: 'NC001',
    type: 'rappel',
    titre: 'Rappel d\'échéance',
    message: 'Votre prochaine échéance de 46 667 FCFA est prévue le 10 mai 2024. Assurez-vous d\'avoir les fonds disponibles.',
    date: '2024-04-10',
    lu: false,
  },
  {
    id: 'NC002',
    type: 'validation',
    titre: 'Demande de crédit reçue',
    message: 'Votre demande de crédit de 800 000 FCFA a bien été reçue et est en cours d\'examen par notre équipe.',
    date: '2024-04-08',
    lu: false,
  },
  {
    id: 'NC003',
    type: 'paiement',
    titre: 'Paiement confirmé',
    message: 'Votre paiement de 46 667 FCFA pour le crédit CRD001 a été confirmé. Merci pour votre ponctualité !',
    date: '2024-04-08',
    lu: false,
  },
  {
    id: 'NC004',
    type: 'info',
    titre: 'Mise à jour de votre score de crédit',
    message: 'Votre score de crédit a été mis à jour à 82/100. Continuez vos remboursements ponctuels pour l\'améliorer.',
    date: '2024-04-01',
    lu: true,
  },
  {
    id: 'NC005',
    type: 'validation',
    titre: 'Crédit CRD001 activé',
    message: 'Votre crédit de 500 000 FCFA a été validé et décaissé sur votre compte le 10 janvier 2024.',
    date: '2024-01-10',
    lu: true,
  },
  {
    id: 'NC006',
    type: 'paiement',
    titre: 'Paiement confirmé - Mars',
    message: 'Votre paiement de 46 667 FCFA pour le mois de mars a été enregistré avec succès.',
    date: '2024-03-10',
    lu: true,
  },
  {
    id: 'NC007',
    type: 'info',
    titre: 'Bienvenue chez COWEC Microfinance',
    message: 'Votre compte a été créé avec succès. Vous pouvez maintenant faire des demandes de crédit et suivre vos remboursements.',
    date: '2023-03-15',
    lu: true,
  },
  {
    id: 'NC008',
    type: 'alerte',
    titre: 'Documents requis',
    message: 'Votre attestation de travail est en cours de vérification. Veuillez vous assurer que le document est lisible.',
    date: '2023-06-12',
    lu: true,
  },
];
