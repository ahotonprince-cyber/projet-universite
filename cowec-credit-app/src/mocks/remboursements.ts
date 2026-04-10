export interface Remboursement {
  id: string;
  creditId: string;
  clientNom: string;
  clientPrenom: string;
  montantEcheance: number;
  montantPaye: number;
  datePaiement: string;
  dateEcheance: string;
  statut: 'paye' | 'en_retard' | 'a_venir';
  resteAPayer: number;
}

export const remboursements: Remboursement[] = [
  {
    id: 'RMB001',
    creditId: 'CRD001',
    clientNom: 'Diallo',
    clientPrenom: 'Aminata',
    montantEcheance: 46667,
    montantPaye: 46667,
    datePaiement: '2024-02-10',
    dateEcheance: '2024-02-10',
    statut: 'paye',
    resteAPayer: 180000,
  },
  {
    id: 'RMB002',
    creditId: 'CRD001',
    clientNom: 'Diallo',
    clientPrenom: 'Aminata',
    montantEcheance: 46667,
    montantPaye: 46667,
    datePaiement: '2024-03-10',
    dateEcheance: '2024-03-10',
    statut: 'paye',
    resteAPayer: 133333,
  },
  {
    id: 'RMB003',
    creditId: 'CRD002',
    clientNom: 'Koné',
    clientPrenom: 'Ibrahim',
    montantEcheance: 45833,
    montantPaye: 45833,
    datePaiement: '2023-12-01',
    dateEcheance: '2023-12-01',
    statut: 'paye',
    resteAPayer: 300000,
  },
  {
    id: 'RMB004',
    creditId: 'CRD004',
    clientNom: 'Sow',
    clientPrenom: 'Mamadou',
    montantEcheance: 38333,
    montantPaye: 0,
    datePaiement: '',
    dateEcheance: '2024-04-01',
    statut: 'en_retard',
    resteAPayer: 150000,
  },
  {
    id: 'RMB005',
    creditId: 'CRD007',
    clientNom: 'Ndiaye',
    clientPrenom: 'Rokhaya',
    montantEcheance: 55000,
    montantPaye: 55000,
    datePaiement: '2024-03-01',
    dateEcheance: '2024-03-01',
    statut: 'paye',
    resteAPayer: 20000,
  },
  {
    id: 'RMB006',
    creditId: 'CRD001',
    clientNom: 'Diallo',
    clientPrenom: 'Aminata',
    montantEcheance: 46667,
    montantPaye: 0,
    datePaiement: '',
    dateEcheance: '2024-04-10',
    statut: 'en_retard',
    resteAPayer: 133333,
  },
  {
    id: 'RMB007',
    creditId: 'CRD002',
    clientNom: 'Koné',
    clientPrenom: 'Ibrahim',
    montantEcheance: 45833,
    montantPaye: 45833,
    datePaiement: '2024-02-01',
    dateEcheance: '2024-02-01',
    statut: 'paye',
    resteAPayer: 254167,
  },
  {
    id: 'RMB008',
    creditId: 'CRD002',
    clientNom: 'Koné',
    clientPrenom: 'Ibrahim',
    montantEcheance: 45833,
    montantPaye: 0,
    datePaiement: '',
    dateEcheance: '2024-05-01',
    statut: 'a_venir',
    resteAPayer: 300000,
  },
];
