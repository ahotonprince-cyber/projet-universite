import { useEffect, useMemo, useState } from 'react';

interface Operation {
  id: number;
  type_operation: string;
  montant: number;
  date_operation: string;
  description: string;
}

export default function HistoriquePage() {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'tous' | 'depot' | 'retrait' | 'paiement'>('tous');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOperations = async (currentPage: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) { setLoading(false); return; }

      const res = await fetch(
        `/api/client/operations?page=${currentPage}&limit=20`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) { setLoading(false); return; }

      const data = await res.json();

      // ✅ Normaliser le montant en number
      const ops = (data.operations || []).map((op: any) => ({
        ...op,
        montant: Number(op.montant) || 0
      }));

      setOperations(ops);
      setTotalPages(data.pagination?.totalPages || 1);

    } catch (err) {
      console.error('Erreur fetch operations:', err);
      setError('Impossible de charger votre historique');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOperations(page); }, [page]);

  const filtered = useMemo(() => {
    let result = [...operations];

    if (filter !== 'tous') {
      result = result.filter(op => op.type_operation === filter);
    }

    if (search.trim()) {
      result = result.filter(op =>
        // ✅ Sécuriser description null
        (op.description || '').toLowerCase().includes(search.toLowerCase())
      );
    }

    result.sort((a, b) =>
      new Date(b.date_operation).getTime() - new Date(a.date_operation).getTime()
    );

    return result;
  }, [operations, filter, search]);

  const stats = useMemo(() => ({
    totalDepot: operations
      .filter(o => o.type_operation === 'depot')
      .reduce((a, b) => a + b.montant, 0),
    totalRetrait: operations
      .filter(o => o.type_operation === 'retrait')
      .reduce((a, b) => a + b.montant, 0),
    totalPaiement: operations
      .filter(o => o.type_operation === 'paiement')
      .reduce((a, b) => a + b.montant, 0),
  }), [operations]);

  const typeConfig: Record<string, { label: string; color: string; bg: string; icon: string; sign: string }> = {
    depot:            { label: 'Dépôt',            color: 'text-green-600',  bg: 'bg-green-100',  icon: 'ri-arrow-down-circle-line',  sign: '+' },
    retrait:          { label: 'Retrait',           color: 'text-red-600',    bg: 'bg-red-100',    icon: 'ri-arrow-up-circle-line',    sign: '-' },
    retrait_mobile:   { label: 'Retrait Mobile',    color: 'text-red-600',    bg: 'bg-red-100',    icon: 'ri-smartphone-line',         sign: '-' },
    paiement:         { label: 'Paiement',          color: 'text-orange-600', bg: 'bg-orange-100', icon: 'ri-refund-2-line',           sign: '-' },
    credit_decaisse:  { label: 'Crédit reçu',       color: 'text-blue-600',   bg: 'bg-blue-100',   icon: 'ri-bank-line',               sign: '+' },
    remboursement:    { label: 'Remboursement',      color: 'text-purple-600', bg: 'bg-purple-100', icon: 'ri-exchange-line',           sign: '-' },
    virement:         { label: 'Virement',           color: 'text-indigo-600', bg: 'bg-indigo-100', icon: 'ri-send-plane-line',         sign: '±' },
  };

  const defaultConfig = { label: 'Opération', color: 'text-gray-600', bg: 'bg-gray-100', icon: 'ri-swap-line', sign: '' };

  if (loading && page === 1) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => fetchOperations(page)}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg text-sm"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Historique des opérations</h2>
        <p className="text-sm text-gray-500">Suivez tous vos mouvements financiers</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Dépôts',      value: stats.totalDepot,    color: 'text-green-600',  bg: 'bg-green-50',  icon: 'ri-arrow-down-circle-line' },
          { label: 'Retraits',    value: stats.totalRetrait,  color: 'text-red-600',    bg: 'bg-red-50',    icon: 'ri-arrow-up-circle-line' },
          { label: 'Paiements',   value: stats.totalPaiement, color: 'text-orange-600', bg: 'bg-orange-50', icon: 'ri-refund-2-line' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} p-4 rounded-xl border`}>
            <div className="flex items-center gap-2 mb-1">
              <i className={`${s.icon} ${s.color} text-sm`} />
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
            <p className={`font-bold ${s.color}`}>
              {s.value.toLocaleString('fr-FR')} FCFA
            </p>
          </div>
        ))}
      </div>

      {/* FILTERS + SEARCH */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-wrap">
          {(['tous', 'depot', 'retrait', 'paiement'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                filter === f
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'tous' ? 'Tous' : f === 'depot' ? 'Dépôts' : f === 'retrait' ? 'Retraits' : 'Paiements'}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange-400 transition-colors"
        />
      </div>

      {/* LISTE */}
      {filtered.length === 0 ? (
        <div className="text-center text-gray-400 py-10">
          <i className="ri-history-line text-4xl text-gray-300 block mb-2" />
          <p className="text-sm">Aucune opération trouvée</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {filtered.map(op => {
              const config = typeConfig[op.type_operation] ?? defaultConfig;
              return (
                <div
                  key={op.id}
                  className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4 hover:shadow-sm transition-shadow"
                >
                  {/* Icône type */}
                  <div className={`w-10 h-10 ${config.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <i className={`${config.icon} ${config.color}`} />
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {op.description || config.label}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color} font-medium`}>
                        {config.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(op.date_operation).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Montant */}
                  <span className={`font-bold text-base flex-shrink-0 ${config.color}`}>
                    {config.sign}{op.montant.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              );
            })}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 pt-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                ← Précédent
              </button>
              <span className="text-sm text-gray-500">
                Page <span className="font-semibold text-gray-800">{page}</span> / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                Suivant →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}