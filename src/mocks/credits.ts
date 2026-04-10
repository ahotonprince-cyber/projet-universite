export type CreditStatut = 'en_attente' | 'valide' | 'rejete' | 'en_cours' | 'solde';

export interface Credit {
  id: string;
  clientId: string;
  clientNom: string;
  clientPrenom: string;
  montant: number;
  tauxInteret: number;
  duree: number;
  statut: CreditStatut;
  dateDebut: string;
  dateFin: string;
  montantRembourse: number;
  objet: string;
}

export const credits: Credit[] = [
  {
    id: 'CRD001',
    clientId: 'CLI001',
    clientNom: 'Diallo',
    clientPrenom: 'Aminata',
    montant: 500000,
    tauxInteret: 12,
    duree: 12,
    statut: 'en_cours',
    dateDebut: '2024-01-10',
    dateFin: '2025-01-10',
    montantRembourse: 320000,
    objet: 'Fonds de roulement commerce',
  },
  {
    id: 'CRD002',
    clientId: 'CLI002',
    clientNom: 'Koné',
    clientPrenom: 'Ibrahim',
    montant: 750000,
    tauxInteret: 10,
    duree: 18,
    statut: 'en_cours',
    dateDebut: '2023-11-01',
    dateFin: '2025-05-01',
    montantRembourse: 450000,
    objet: 'Achat matériel agricole',
  },
  {
    id: 'CRD003',
    clientId: 'CLI003',
    clientNom: 'Traoré',
    clientPrenom: 'Fatoumata',
    montant: 300000,
    tauxInteret: 8,
    duree: 6,
    statut: 'solde',
    dateDebut: '2023-06-01',
    dateFin: '2023-12-01',
    montantRembourse: 324000,
    objet: 'Achat machines à coudre',
  },
  {
    id: 'CRD004',
    clientId: 'CLI004',
    clientNom: 'Sow',
    clientPrenom: 'Mamadou',
    montant: 200000,
    tauxInteret: 15,
    duree: 6,
    statut: 'en_cours',
    dateDebut: '2024-03-01',
    dateFin: '2024-09-01',
    montantRembourse: 50000,
    objet: 'Équipement de pêche',
  },
  {
    id: 'CRD005',
    clientId: 'CLI005',
    clientNom: 'Camara',
    clientPrenom: 'Mariama',
    montant: 400000,
    tauxInteret: 11,
    duree: 12,
    statut: 'en_attente',
    dateDebut: '2024-04-01',
    dateFin: '2025-04-01',
    montantRembourse: 0,
    objet: 'Extension boutique',
  },
  {
    id: 'CRD006',
    clientId: 'CLI006',
    clientNom: 'Bah',
    clientPrenom: 'Ousmane',
    montant: 1000000,
    tauxInteret: 9,
    duree: 24,
    statut: 'valide',
    dateDebut: '2024-04-05',
    dateFin: '2026-04-05',
    montantRembourse: 0,
    objet: 'Achat bétail',
  },
  {
    id: 'CRD007',
    clientId: 'CLI007',
    clientNom: 'Ndiaye',
    clientPrenom: 'Rokhaya',
    montant: 600000,
    tauxInteret: 10,
    duree: 12,
    statut: 'en_cours',
    dateDebut: '2023-10-01',
    dateFin: '2024-10-01',
    montantRembourse: 580000,
    objet: 'Équipement restaurant',
  },
  {
    id: 'CRD008',
    clientId: 'CLI008',
    clientNom: 'Mbaye',
    clientPrenom: 'Cheikh',
    montant: 350000,
    tauxInteret: 13,
    duree: 9,
    statut: 'rejete',
    dateDebut: '',
    dateFin: '',
    montantRembourse: 0,
    objet: 'Achat outillage mécanique',
  },
];
