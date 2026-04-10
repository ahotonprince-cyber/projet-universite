export type NotifType = 'retard' | 'validation' | 'paiement' | 'info';

export interface Notification {
  id: string;
  type: NotifType;
  titre: string;
  message: string;
  date: string;
  lu: boolean;
  clientNom?: string;
  creditId?: string;
}

export const notifications: Notification[] = [
  {
    id: 'NOTIF001',
    type: 'retard',
    titre: 'Retard de paiement - Sow Mamadou',
    message: 'Le crédit CRD004 de Mamadou Sow est en retard de 9 jours. Montant dû : 38 333 FCFA.',
    date: '2024-04-10',
    lu: false,
    clientNom: 'Sow Mamadou',
    creditId: 'CRD004',
  },
  {
    id: 'NOTIF002',
    type: 'retard',
    titre: 'Retard de paiement - Diallo Aminata',
    message: 'Le crédit CRD001 de Aminata Diallo est en retard de 0 jours. Échéance dépassée.',
    date: '2024-04-10',
    lu: false,
    clientNom: 'Diallo Aminata',
    creditId: 'CRD001',
  },
  {
    id: 'NOTIF003',
    type: 'validation',
    titre: 'Nouvelle demande de crédit',
    message: 'Mariama Camara a soumis une demande de crédit de 400 000 FCFA pour extension boutique.',
    date: '2024-04-09',
    lu: false,
    clientNom: 'Camara Mariama',
    creditId: 'CRD005',
  },
  {
    id: 'NOTIF004',
    type: 'paiement',
    titre: 'Paiement reçu - Ndiaye Rokhaya',
    message: 'Un paiement de 55 000 FCFA a été enregistré pour le crédit CRD007.',
    date: '2024-03-01',
    lu: true,
    clientNom: 'Ndiaye Rokhaya',
    creditId: 'CRD007',
  },
  {
    id: 'NOTIF005',
    type: 'validation',
    titre: 'Crédit validé - Bah Ousmane',
    message: 'Le crédit CRD006 de 1 000 000 FCFA pour Ousmane Bah a été validé et est prêt au décaissement.',
    date: '2024-04-05',
    lu: true,
    clientNom: 'Bah Ousmane',
    creditId: 'CRD006',
  },
  {
    id: 'NOTIF006',
    type: 'info',
    titre: 'Rapport mensuel disponible',
    message: 'Le rapport de performance du mois de mars 2024 est disponible. Taux de remboursement : 87%.',
    date: '2024-04-01',
    lu: true,
  },
  {
    id: 'NOTIF007',
    type: 'paiement',
    titre: 'Crédit soldé - Traoré Fatoumata',
    message: 'Le crédit CRD003 de Fatoumata Traoré a été entièrement remboursé. Félicitations !',
    date: '2023-12-01',
    lu: true,
    clientNom: 'Traoré Fatoumata',
    creditId: 'CRD003',
  },
  {
    id: 'NOTIF008',
    type: 'retard',
    titre: 'Alerte : 3 crédits en retard',
    message: 'Attention : 3 crédits sont actuellement en situation de retard de paiement. Action requise.',
    date: '2024-04-08',
    lu: false,
  },
];
