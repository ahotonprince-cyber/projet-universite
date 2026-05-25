// /frontend/src/types/index.ts

export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: 'admin' | 'agent' | 'client';
  statut: 'actif' | 'inactif' | 'bloque';
  dateCreation: string;
  // Champs spécifiques clients
  adresse?: string;
  profession?: string;
  dateNaissance?: string;
  avatar?: string;
  score_credit?: number;
  scoreCredit?: number;
}

export interface Client extends Utilisateur {
  role: 'client';
}

export interface Admin extends Utilisateur {
  role: 'admin';
}

export interface Agent extends Utilisateur {
  role: 'agent';
}

export interface TypeCompte {
  id: number;
  nom: string;
  code: string;
  taux_interet?: number;
  frais_tenue?: number;
  actif?: boolean;
}

export interface Notification {
  id: number;
  utilisateur_id: number;
  titre: string;
  message: string;
  type: 'retard' | 'validation' | 'paiement' | 'info' | 'rappel' | 'alerte';
  lu: boolean;
  date_creation: string;
  reference_id?: number;
  reference_type?: string;
}

export interface Credit {
  id: number;
  numero_credit: string;
  utilisateur_id: number;
  montant_accorde: number;
  montant_rembourse: number;
  reste_a_payer: number;
  mensualite: number;
  duree_mois: number;
  taux_annuel: number;
  statut: 'en_attente' | 'valide' | 'rejete' | 'actif' | 'solde';
  objet: string;
  date_debut: string;
  date_fin: string;
  progression: number;
}

export interface Operation {
  id: number;
  compte_id: number;
  type_operation: 'depot' | 'retrait' | 'paiement' | 'transfert';
  montant: number;
  description: string;
  date_operation: string;
  statut: 'pending' | 'completed' | 'failed';
}