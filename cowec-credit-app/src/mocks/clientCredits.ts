export type CreditStatutClient = 'en_attente' | 'valide' | 'rejete' | 'en_cours' | 'solde';

export interface CreditClient {
  id: string;
  objet: string;
  montant: number;
  tauxInteret: number;
  duree: number;
  mensualite: number;
  totalInterets: number;
  totalARembourser: number;
  montantRembourse: number;
  resteAPayer: number;
  statut: CreditStatutClient;
  dateDebut: string;
  dateFin: string;
  dateDemande: string;
  prochainePecheance: string;
  progression: number;
}

export const clientCredits: CreditClient[] = [
  {
    id: 'CRD001',
    objet: 'Fonds de roulement commerce',
    montant: 500000,
    tauxInteret: 12,
    duree: 12,
    mensualite: 46667,
    totalInterets: 60000,
    totalARembourser: 560000,
    montantRembourse: 320000,
    resteAPayer: 240000,
    statut: 'en_cours',
    dateDebut: '2024-01-10',
    dateFin: '2025-01-10',
    dateDemande: '2024-01-05',
    prochainePecheance: '2024-05-10',
    progression: 57,
  },
  {
    id: 'CRD003',
    objet: 'Achat machines à coudre',
    montant: 300000,
    tauxInteret: 8,
    duree: 6,
    mensualite: 52000,
    totalInterets: 12000,
    totalARembourser: 312000,
    montantRembourse: 312000,
    resteAPayer: 0,
    statut: 'solde',
    dateDebut: '2023-06-01',
    dateFin: '2023-12-01',
    dateDemande: '2023-05-25',
    prochainePecheance: '',
    progression: 100,
  },
  {
    id: 'CRD009',
    objet: 'Extension boutique - Phase 2',
    montant: 800000,
    tauxInteret: 11,
    duree: 18,
    mensualite: 49778,
    totalInterets: 96000,
    totalARembourser: 896000,
    montantRembourse: 0,
    resteAPayer: 896000,
    statut: 'en_attente',
    dateDebut: '',
    dateFin: '',
    dateDemande: '2024-04-08',
    prochainePecheance: '',
    progression: 0,
  },
];

export interface EcheanceClient {
  id: string;
  creditId: string;
  creditObjet: string;
  montant: number;
  dateEcheance: string;
  datePaiement: string;
  statut: 'paye' | 'en_retard' | 'a_venir';
  resteCredit: number;
}

export const echeancesClient: EcheanceClient[] = [
  { id: 'ECH001', creditId: 'CRD001', creditObjet: 'Fonds de roulement commerce', montant: 46667, dateEcheance: '2024-02-10', datePaiement: '2024-02-09', statut: 'paye', resteCredit: 513333 },
  { id: 'ECH002', creditId: 'CRD001', creditObjet: 'Fonds de roulement commerce', montant: 46667, dateEcheance: '2024-03-10', datePaiement: '2024-03-10', statut: 'paye', resteCredit: 466666 },
  { id: 'ECH003', creditId: 'CRD001', creditObjet: 'Fonds de roulement commerce', montant: 46667, dateEcheance: '2024-04-10', datePaiement: '2024-04-08', statut: 'paye', resteCredit: 419999 },
  { id: 'ECH004', creditId: 'CRD001', creditObjet: 'Fonds de roulement commerce', montant: 46667, dateEcheance: '2024-05-10', datePaiement: '', statut: 'a_venir', resteCredit: 373332 },
  { id: 'ECH005', creditId: 'CRD001', creditObjet: 'Fonds de roulement commerce', montant: 46667, dateEcheance: '2024-06-10', datePaiement: '', statut: 'a_venir', resteCredit: 326665 },
  { id: 'ECH006', creditId: 'CRD003', creditObjet: 'Achat machines à coudre', montant: 52000, dateEcheance: '2023-07-01', datePaiement: '2023-07-01', statut: 'paye', resteCredit: 260000 },
  { id: 'ECH007', creditId: 'CRD003', creditObjet: 'Achat machines à coudre', montant: 52000, dateEcheance: '2023-08-01', datePaiement: '2023-07-30', statut: 'paye', resteCredit: 208000 },
  { id: 'ECH008', creditId: 'CRD003', creditObjet: 'Achat machines à coudre', montant: 52000, dateEcheance: '2023-09-01', datePaiement: '2023-09-01', statut: 'paye', resteCredit: 156000 },
  { id: 'ECH009', creditId: 'CRD003', creditObjet: 'Achat machines à coudre', montant: 52000, dateEcheance: '2023-10-01', datePaiement: '2023-10-02', statut: 'paye', resteCredit: 104000 },
  { id: 'ECH010', creditId: 'CRD003', creditObjet: 'Achat machines à coudre', montant: 52000, dateEcheance: '2023-11-01', datePaiement: '2023-11-01', statut: 'paye', resteCredit: 52000 },
  { id: 'ECH011', creditId: 'CRD003', creditObjet: 'Achat machines à coudre', montant: 52000, dateEcheance: '2023-12-01', datePaiement: '2023-12-01', statut: 'paye', resteCredit: 0 },
];
