import { useState, useEffect, useMemo } from 'react';

interface Depot {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  numero_compte: string;
  montant: number;
  description: string;
  date_operation: string;
  reference_externe: string | null;
}

interface Stats {
  total: number;
  montant_total: number;
  today_count: number;
  today_amount: number;
}

const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export default function AdminDepotsPage() {
  const [depots, setDepots] = useState<Depot[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [d, s] = await Promise.all([
          fetch('/api/admin/depots', { headers: authH() }).then(r => r.json()),
          fetch('/api/admin/depots/stats', { headers: authH() }).then(r => r.json()),
        ]);
        setDepots(d.depots || []);
        setStats(s.stats || null);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search) return depots;
    const q = search.toLowerCase();
    return depots.filter(d =>
      d.nom?.toLowerCase().includes(q) ||
      d.prenom?.toLowerCase().includes(q) ||
      d.telephone?.includes(q) ||
      d.numero_compte?.includes(q) ||
      d.description?.toLowerCase().includes(q)
    );
  }, [depots, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dépôts</h2>
        <p className="text-sm text-gray-500">Historique de tous les dépôts Mobile Money</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total dépôts',    value: stats.total,                    color: 'text-blue-600',   fmt: false },
            { label: 'Montant total',   value: stats.montant_total,            color: 'text-green-600',  fmt: true  },
            { label: "Aujourd'hui",     value: stats.today_count,              color: 'text-orange-600', fmt: false },
            { label: "Montant du jour", value: stats.today_amount,             color: 'text-orange-600', fmt: true  },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border p-4">
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>
                {s.fmt ? `${Number(s.value || 0).toLocaleString('fr-FR')} F` : s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Recherche */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Rechercher client, compte, opérateur..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-orange-400"
          />
        </div>
        <span className="text-xs text-gray-400">{filtered.length} dépôt(s)</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Chargement...</div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  {['Client', 'Compte', 'Opérateur / Description', 'Montant', 'Date'].map(h => (
                    <th key={h} className="text-left p-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-400">Aucun dépôt trouvé</td></tr>
                ) : paginated.map(d => (
                  <tr key={d.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <p className="text-sm font-medium">{d.prenom} {d.nom}</p>
                      <p className="text-xs text-gray-400">{d.telephone}</p>
                    </td>
                    <td className="p-3 text-xs font-mono text-gray-500">{d.numero_compte}</td>
                    <td className="p-3 text-sm text-gray-600 max-w-48 truncate">{d.description || '—'}</td>
                    <td className="p-3 font-bold text-green-600">
                      +{Number(d.montant).toLocaleString('fr-FR')} F
                    </td>
                    <td className="p-3 text-xs text-gray-400">
                      {new Date(d.date_operation).toLocaleDateString('fr-FR')}
                      <br />
                      <span className="text-gray-300">
                        {new Date(d.date_operation).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40 hover:bg-white">
                  ← Précédent
                </button>
                <span className="text-xs text-gray-500">Page {page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40 hover:bg-white">
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
