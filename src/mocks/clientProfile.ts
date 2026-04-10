export interface ClientProfile {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  profession: string;
  dateNaissance: string;
  numeroCNI: string;
  dateInscription: string;
  scoreCredit: number;
  avatar: string;
  statut: 'actif' | 'inactif';
}

export const clientProfile: ClientProfile = {
  id: 'CLI001',
  nom: 'Diallo',
  prenom: 'Aminata',
  email: 'aminata.diallo@email.com',
  telephone: '+221 77 234 56 78',
  adresse: 'Dakar, Médina, Rue 12',
  profession: 'Commerçante',
  dateNaissance: '1988-05-14',
  numeroCNI: '1 234 567 890 12',
  dateInscription: '2023-03-15',
  scoreCredit: 82,
  avatar: 'https://readdy.ai/api/search-image?query=professional%20african%20woman%20portrait%20smiling%20confident%20business%20attire%20neutral%20background%20studio%20photography&width=120&height=120&seq=profile001&orientation=squarish',
  statut: 'actif',
};

export interface Document {
  id: string;
  nom: string;
  type: string;
  dateUpload: string;
  statut: 'valide' | 'en_attente' | 'rejete';
}

export const documents: Document[] = [
  { id: 'DOC001', nom: 'Carte Nationale d\'Identité', type: 'CNI', dateUpload: '2023-03-15', statut: 'valide' },
  { id: 'DOC002', nom: 'Justificatif de domicile', type: 'Domicile', dateUpload: '2023-03-15', statut: 'valide' },
  { id: 'DOC003', nom: 'Attestation de travail', type: 'Emploi', dateUpload: '2023-06-10', statut: 'en_attente' },
];
