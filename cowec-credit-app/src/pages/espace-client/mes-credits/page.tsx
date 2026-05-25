import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface CreditClient {
  id: number;
  numero_credit: string;
  objet: string;
  montant_accorde: number;
  montant_rembourse: number;
  reste_a_payer: number;
  mensualite: number;
  duree_mois: number;
  taux_annuel: number;
  statut: string;
  progression: number;
  date_debut: string;
  date_fin: string;
}

const statutLabels: Record<string, { label: string; color: string }> = {
  actif: { label: 'En cours', color: 'bg-green-100 text-green-700' },
  en_attente: { label: 'En attente', color: 'bg-orange-100 text-orange-700' },
  valide: { label: 'Validé', color: 'bg-blue-100 text-blue-700' },
  solde: { label: 'Soldé', color: 'bg-gray-100 text-gray-600' },
  rejete: { label: 'Rejeté', color: 'bg-red-100 text-red-600' },
};

// 🔐 Helper auth fetch
const authFetch = async (url: string, navigate: any) => {
  const token = localStorage.getItem('token');
  if (!token) {
    navigate('/client/connexion');
    return null;
  }

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (res.status === 401) {
    navigate('/client/connexion');
    return null;
  }

  return res;
};

export default function MesCreditsPage() {
  const navigate = useNavigate();
  const [credits, setCredits] = useState<CreditClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<CreditClient | null>(null);

  // Filtres et recherche
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/client/connexion');
          return;
        }

        const res = await authFetch('/api/client/credits', navigate);
        if (!res) return;

        const data = await res.json();
        setCredits(data.credits || []);
      } catch (err) {
        console.error('Erreur chargement crédits:', err);
        setError('Impossible de charger vos crédits');
      } finally {
        setLoading(false);
      }
    };

    fetchCredits();
  }, [navigate]);

  const archivedCount = useMemo(
    () => credits.filter(c => c.statut === 'solde' || c.statut === 'rejete').length,
    [credits]
  );

  // Filtre + recherche + tri
  const filteredCredits = useMemo(() => {
    let result = [...credits];

    // Séparation actifs / archivés
    if (!showArchived) {
      result = result.filter(c => c.statut !== 'solde' && c.statut !== 'rejete');
    } else {
      result = result.filter(c => c.statut === 'solde' || c.statut === 'rejete');
    }

    // Recherche
    if (search) {
      result = result.filter(c =>
        c.objet?.toLowerCase().includes(search.toLowerCase()) ||
        c.numero_credit?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filtre statut
    if (filterStatut !== 'all') {
      result = result.filter(c => c.statut === filterStatut);
    }

    // Tri
    if (sortBy === 'montant') {
      result.sort((a, b) => b.montant_accorde - a.montant_accorde);
    } else if (sortBy === 'progression') {
      result.sort((a, b) => b.progression - a.progression);
    } else {
      result.sort((a, b) => new Date(b.date_debut).getTime() - new Date(a.date_debut).getTime());
    }

    return result;
  }, [credits, search, filterStatut, sortBy, showArchived]);

  // Statistiques
  const stats = useMemo(() => {
    const totalAccorde = credits.reduce((sum, c) => sum + c.montant_accorde, 0);
    const totalRembourse = credits.reduce((sum, c) => sum + c.montant_rembourse, 0);
    const encours = credits.filter(c => c.statut === 'actif').length;
    const enAttente = credits.filter(c => c.statut === 'en_attente').length;
    
    return { totalAccorde, totalRembourse, encours, enAttente };
  }, [credits]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse" />
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <i className="ri-error-warning-line text-red-500 text-3xl mb-2 block" />
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg text-sm"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER AVEC STATS */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mes crédits</h2>
          <p className="text-sm text-gray-500">
            {filteredCredits.length} crédit(s) • {stats.totalAccorde.toLocaleString()} FCFA décaissés
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowArchived(v => !v); setFilterStatut('all'); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition ${
              showArchived
                ? 'bg-gray-700 text-white border-gray-700'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <i className={showArchived ? 'ri-archive-fill' : 'ri-archive-line'} />
            {showArchived ? 'Voir actifs' : `Archivés${archivedCount > 0 ? ` (${archivedCount})` : ''}`}
          </button>

          {!showArchived && (
            <button
              onClick={() => navigate('/espace-client/demande-credit')}
              className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
            >
              <i className="ri-add-line" />
              Nouveau crédit
            </button>
          )}
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border">
          <p className="text-xs text-gray-400">Total décaissé</p>
          <p className="font-bold text-orange-600">{stats.totalAccorde.toLocaleString()} F</p>
        </div>
        <div className="bg-white p-3 rounded-xl border">
          <p className="text-xs text-gray-400">Total remboursé</p>
          <p className="font-bold text-green-600">{stats.totalRembourse.toLocaleString()} F</p>
        </div>
        <div className="bg-white p-3 rounded-xl border">
          <p className="text-xs text-gray-400">En cours</p>
          <p className="font-bold text-blue-600">{stats.encours}</p>
        </div>
        <div className="bg-white p-3 rounded-xl border">
          <p className="text-xs text-gray-400">En attente</p>
          <p className="font-bold text-yellow-600">{stats.enAttente}</p>
        </div>
      </div>

      {/* FILTRES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Rechercher (objet, numéro)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 transition"
          />
        </div>

        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
        >
          {showArchived ? (
            <>
              <option value="all">Tous les archivés</option>
              <option value="solde">Soldé</option>
              <option value="rejete">Rejeté</option>
            </>
          ) : (
            <>
              <option value="all">Tous les statuts</option>
              <option value="actif">En cours</option>
              <option value="en_attente">En attente</option>
              <option value="valide">Validé</option>
            </>
          )}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
        >
          <option value="date">Plus récent</option>
          <option value="montant">Montant (décroissant)</option>
          <option value="progression">Progression</option>
        </select>
      </div>

      {/* LISTE DES CRÉDITS */}
      {filteredCredits.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <i className={`${showArchived ? 'ri-archive-line' : 'ri-bank-card-line'} text-4xl text-gray-300 mb-3 block`} />
          <p className="text-gray-400">
            {showArchived ? 'Aucun crédit archivé' : 'Aucun crédit actif'}
          </p>
          {!showArchived && (
            <button
              onClick={() => navigate('/espace-client/demande-credit')}
              className="mt-4 text-orange-500 text-sm font-medium hover:underline"
            >
              Faire une demande →
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredCredits.map((credit) => {
            const s = statutLabels[credit.statut] || { label: credit.statut, color: 'bg-gray-100 text-gray-600' };
            const isActive = credit.statut === 'actif';

            return (
              <div key={credit.id} className="bg-white p-5 rounded-xl border border-gray-100 hover:shadow-md transition group">
                
                {/* En-tête */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-gray-900">{credit.objet || 'Crédit'}</p>
                    <p className="text-xs text-gray-400 font-mono">{credit.numero_credit}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${s.color}`}>
                    {s.label}
                  </span>
                </div>

                {/* Montant */}
                <p className="text-2xl font-bold text-orange-600 mb-3">
                  {credit.montant_accorde.toLocaleString()} <span className="text-sm font-normal text-gray-400">FCFA</span>
                </p>

                {/* Progression (si actif) */}
                {isActive && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Remboursement</span>
                      <span>{credit.progression}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${credit.progression}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-green-600">{credit.montant_rembourse.toLocaleString()} F payé</span>
                      <span className="text-gray-400">{credit.reste_a_payer.toLocaleString()} F restant</span>
                    </div>
                  </div>
                )}

                {/* Infos complémentaires */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <i className="ri-calendar-line text-orange-400" />
                    <span>{credit.date_debut ? new Date(credit.date_debut).toLocaleDateString('fr-FR') : '—'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <i className="ri-percent-line text-orange-400" />
                    <span>{credit.taux_annuel}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <i className="ri-time-line text-orange-400" />
                    <span>{credit.duree_mois} mois</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <i className="ri-money-dollar-circle-line text-orange-400" />
                    <span>{credit.mensualite.toLocaleString()} F/mois</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setSelected(credit)}
                    className="flex-1 flex items-center justify-center gap-1 border border-gray-200 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
                  >
                    <i className="ri-information-line" />
                    Détails
                  </button>

                  {isActive && (
                    <button
                      onClick={() => navigate('/espace-client/remboursements')}
                      className="flex-1 flex items-center justify-center gap-1 bg-orange-500 text-white py-2 rounded-lg text-sm hover:bg-orange-600 transition"
                    >
                      <i className="ri-money-dollar-circle-line" />
                      Payer
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 🔥 MODAL DÉTAILS CORRIGÉE */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
              <h3 className="font-bold text-lg text-gray-900">Détails du crédit</h3>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
              >
                <i className="ri-close-line text-gray-500 text-xl" />
              </button>
            </div>

            {/* Contenu */}
            <div className="p-5 space-y-4">
              
              {/* Badge statut */}
              <div className="flex justify-center">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  statutLabels[selected.statut]?.color || 'bg-gray-100 text-gray-600'
                }`}>
                  {statutLabels[selected.statut]?.label || selected.statut}
                </span>
              </div>

              {/* Numéro */}
              <div className="text-center">
                <p className="text-xs text-gray-400">Numéro de crédit</p>
                <p className="font-mono text-sm font-medium">{selected.numero_credit}</p>
              </div>

              {/* Objet */}
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-xs text-gray-400">Objet</p>
                <p className="font-medium">{selected.objet || 'Non spécifié'}</p>
              </div>

              {/* Grille d'informations */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Montant accordé</p>
                  <p className="font-bold text-orange-600 text-lg">{selected.montant_accorde.toLocaleString()} F</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Déjà remboursé</p>
                  <p className="font-semibold text-green-600">{selected.montant_rembourse.toLocaleString()} F</p>
                </div>
                <div className="border-t pt-2">
                  <p className="text-xs text-gray-400">Reste à payer</p>
                  <p className="font-bold text-red-600 text-lg">{selected.reste_a_payer.toLocaleString()} F</p>
                </div>
                <div className="border-t pt-2">
                  <p className="text-xs text-gray-400">Mensualité estimée</p>
                  <p className="font-semibold">{selected.mensualite.toLocaleString()} F</p>
                </div>
              </div>

              {/* Progression */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progression</span>
                  <span>{selected.progression}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${selected.progression}%` }}
                  />
                </div>
              </div>

              {/* Autres infos */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Taux annuel</p>
                  <p className="font-medium">{selected.taux_annuel}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Durée</p>
                  <p className="font-medium">{selected.duree_mois} mois</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Date début</p>
                  <p className="text-sm">{selected.date_debut ? new Date(selected.date_debut).toLocaleDateString('fr-FR') : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Date fin prévue</p>
                  <p className="text-sm">{selected.date_fin ? new Date(selected.date_fin).toLocaleDateString('fr-FR') : '—'}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t bg-gray-50 flex gap-3">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 border border-gray-200 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
              >
                Fermer
              </button>
              {selected.statut === 'actif' && (
                <button
                  onClick={() => {
                    setSelected(null);
                    navigate('/espace-client/remboursements');
                  }}
                  className="flex-1 bg-orange-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition flex items-center justify-center gap-2"
                >
                  <i className="ri-money-dollar-circle-line" />
                  Effectuer un paiement
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}