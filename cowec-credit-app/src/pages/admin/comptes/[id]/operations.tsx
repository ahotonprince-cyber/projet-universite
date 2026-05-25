import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface CompteInfo {
  id: number;
  numero_compte: string;
  type_nom: string;
  solde: number;
  statut: string;
  client_nom: string;
  client_prenom: string;
  client_email: string;
  date_creation: string;
}

interface Operation {
  id: number;
  type: string;
  montant: number;
  description: string | null;
  reference: string | null;
  date_operation: string;
  sens: 'credit' | 'debit';
}

const TYPE_CONFIG: Record<string, { label: string; color: string; sens: 'credit' | 'debit' }> = {
  depot:               { label: 'Dépôt',           color: 'bg-green-100 text-green-700',  sens: 'credit' },
  retrait:             { label: 'Retrait',          color: 'bg-red-100 text-red-700',      sens: 'debit'  },
  paiement:            { label: 'Paiement crédit',  color: 'bg-red-100 text-red-700',      sens: 'debit'  },
  cotisation_tontine:  { label: 'Cotisation tontine', color: 'bg-purple-100 text-purple-700', sens: 'debit' },
  virement:            { label: 'Virement',         color: 'bg-blue-100 text-blue-700',    sens: 'credit' },
  decaissement:        { label: 'Décaissement',     color: 'bg-orange-100 text-orange-700', sens: 'credit' },
};

function getSens(type: string, op: Operation): 'credit' | 'debit' {
  if (op.sens) return op.sens;
  return TYPE_CONFIG[type]?.sens ?? 'credit';
}

export default function CompteOperationsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [compte, setCompte] = useState<CompteInfo | null>(null);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/admin/comptes/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => setCompte(d.compte)),
      fetch(`/api/admin/comptes/${id}/operations?limit=200`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => setOperations(d.operations || [])),
    ]).finally(() => setLoading(false));
  }, [id]);

  const filtered = operations.filter(op => {
    const matchType = !filterType || op.type === filterType;
    const q = search.toLowerCase();
    const matchSearch = !q
      || (op.description || '').toLowerCase().includes(q)
      || (op.reference || '').toLowerCase().includes(q)
      || op.type.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  const totalEntrees = operations
    .filter(op => getSens(op.type, op) === 'credit')
    .reduce((s, op) => s + Number(op.montant), 0);

  const totalSorties = operations
    .filter(op => getSens(op.type, op) === 'debit')
    .reduce((s, op) => s + Number(op.montant), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-b-2 border-orange-500 rounded-full" />
      </div>
    );
  }

  if (!compte) {
    return (
      <div className="p-8 text-center text-gray-400">
        <i className="ri-error-warning-line text-3xl mb-2 block" />
        Compte introuvable
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <button onClick={() => navigate('/admin/comptes')} className="hover:text-orange-500 transition">
          Comptes
        </button>
        <i className="ri-arrow-right-s-line" />
        <span className="text-gray-800 font-medium">
          {compte.client_prenom} {compte.client_nom} — {compte.type_nom}
        </span>
      </div>

      {/* En-tête compte */}
      <div className="bg-white rounded-xl shadow p-5 flex flex-wrap gap-4 justify-between items-start">
        <div>
          <p className="text-xs text-gray-400 mb-1">Client</p>
          <p className="text-lg font-bold text-gray-800">{compte.client_prenom} {compte.client_nom}</p>
          <p className="text-sm text-gray-500">{compte.client_email}</p>
          <p className="text-xs text-gray-400 mt-1">N° {compte.numero_compte} · Ouvert le {new Date(compte.date_creation).toLocaleDateString('fr-FR')}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 mb-1">Solde actuel</p>
          <p className="text-3xl font-bold text-orange-500">{Number(compte.solde).toLocaleString('fr-FR')} FCFA</p>
          <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
            compte.statut === 'actif' ? 'bg-green-100 text-green-700'
            : compte.statut === 'bloque' ? 'bg-red-100 text-red-700'
            : 'bg-gray-100 text-gray-600'
          }`}>
            {compte.statut}
          </span>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-xs text-gray-400">Total opérations</p>
          <p className="text-2xl font-bold text-gray-800">{operations.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-xs text-gray-400">Total entrées (+)</p>
          <p className="text-2xl font-bold text-green-600">+{totalEntrees.toLocaleString('fr-FR')} FCFA</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-xs text-gray-400">Total sorties (−)</p>
          <p className="text-2xl font-bold text-red-500">−{totalSorties.toLocaleString('fr-FR')} FCFA</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Rechercher (description, référence…)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
        />
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
        >
          <option value="">Tous les types</option>
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
        <span className="self-center text-xs text-gray-400">{filtered.length} opération(s)</span>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Description</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Référence</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                    <i className="ri-exchange-line text-3xl block mb-2 text-gray-300" />
                    Aucune opération trouvée
                  </td>
                </tr>
              ) : (
                filtered.map(op => {
                  const cfg = TYPE_CONFIG[op.type];
                  const estCredit = getSens(op.type, op) === 'credit';
                  return (
                    <tr key={op.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(op.date_operation).toLocaleDateString('fr-FR')}{' '}
                        <span className="text-xs text-gray-400">
                          {new Date(op.date_operation).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg?.color ?? 'bg-gray-100 text-gray-600'}`}>
                          {cfg?.label ?? op.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">
                        {op.description || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                        {op.reference || '—'}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${estCredit ? 'text-green-600' : 'text-red-500'}`}>
                        {estCredit ? '+' : '−'}{Number(op.montant).toLocaleString('fr-FR')} FCFA
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
