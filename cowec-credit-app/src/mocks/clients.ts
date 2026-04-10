export interface Client {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string;
  profession: string;
  statut: 'actif' | 'inactif';
  dateCreation: string;
  avatar: string;
  scoreCredit: number;
}

export const clients: Client[] = [
  {
    id: 'CLI001',
    nom: 'Diallo',
    prenom: 'Aminata',
    telephone: '+221 77 234 56 78',
    adresse: 'Dakar, Médina, Rue 12',
    profession: 'Commerçante',
    statut: 'actif',
    dateCreation: '2023-03-15',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20african%20woman%20portrait%20smiling%20confident%20business%20attire%20neutral%20background%20studio%20photography&width=80&height=80&seq=cli001&orientation=squarish',
    scoreCredit: 82,
  },
  {
    id: 'CLI002',
    nom: 'Koné',
    prenom: 'Ibrahim',
    telephone: '+221 76 345 67 89',
    adresse: 'Thiès, Quartier Mbour, Avenue 5',
    profession: 'Agriculteur',
    statut: 'actif',
    dateCreation: '2023-05-20',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20african%20man%20portrait%20smiling%20confident%20business%20attire%20neutral%20background%20studio%20photography&width=80&height=80&seq=cli002&orientation=squarish',
    scoreCredit: 74,
  },
  {
    id: 'CLI003',
    nom: 'Traoré',
    prenom: 'Fatoumata',
    telephone: '+221 78 456 78 90',
    adresse: 'Saint-Louis, Sor, Rue 8',
    profession: 'Couturière',
    statut: 'actif',
    dateCreation: '2023-07-10',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20african%20woman%20portrait%20smiling%20confident%20business%20attire%20neutral%20background%20studio%20photography&width=80&height=80&seq=cli003&orientation=squarish',
    scoreCredit: 91,
  },
  {
    id: 'CLI004',
    nom: 'Sow',
    prenom: 'Mamadou',
    telephone: '+221 70 567 89 01',
    adresse: 'Ziguinchor, Centre, Rue 3',
    profession: 'Pêcheur',
    statut: 'inactif',
    dateCreation: '2023-02-08',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20african%20man%20portrait%20smiling%20confident%20business%20attire%20neutral%20background%20studio%20photography&width=80&height=80&seq=cli004&orientation=squarish',
    scoreCredit: 55,
  },
  {
    id: 'CLI005',
    nom: 'Camara',
    prenom: 'Mariama',
    telephone: '+221 77 678 90 12',
    adresse: 'Kaolack, Médina Baye, Rue 15',
    profession: 'Vendeuse',
    statut: 'actif',
    dateCreation: '2023-09-01',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20african%20woman%20portrait%20smiling%20confident%20business%20attire%20neutral%20background%20studio%20photography&width=80&height=80&seq=cli005&orientation=squarish',
    scoreCredit: 68,
  },
  {
    id: 'CLI006',
    nom: 'Bah',
    prenom: 'Ousmane',
    telephone: '+221 76 789 01 23',
    adresse: 'Touba, Quartier Darou, Rue 22',
    profession: 'Éleveur',
    statut: 'actif',
    dateCreation: '2023-11-14',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20african%20man%20portrait%20smiling%20confident%20business%20attire%20neutral%20background%20studio%20photography&width=80&height=80&seq=cli006&orientation=squarish',
    scoreCredit: 79,
  },
  {
    id: 'CLI007',
    nom: 'Ndiaye',
    prenom: 'Rokhaya',
    telephone: '+221 78 890 12 34',
    adresse: 'Dakar, Plateau, Avenue Pompidou',
    profession: 'Restauratrice',
    statut: 'actif',
    dateCreation: '2024-01-05',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20african%20woman%20portrait%20smiling%20confident%20business%20attire%20neutral%20background%20studio%20photography&width=80&height=80&seq=cli007&orientation=squarish',
    scoreCredit: 88,
  },
  {
    id: 'CLI008',
    nom: 'Mbaye',
    prenom: 'Cheikh',
    telephone: '+221 70 901 23 45',
    adresse: 'Rufisque, Diokoul, Rue 7',
    profession: 'Mécanicien',
    statut: 'actif',
    dateCreation: '2024-02-18',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20african%20man%20portrait%20smiling%20confident%20business%20attire%20neutral%20background%20studio%20photography&width=80&height=80&seq=cli008&orientation=squarish',
    scoreCredit: 63,
  },
];
