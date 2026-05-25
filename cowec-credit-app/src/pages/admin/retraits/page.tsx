import { useState, useEffect } from 'react';

interface DemandeRetrait {
  id: number;
  client_id: number;
  client_nom: string;
  client_prenom: string;
  montant: number;
  telephone: string;
  operateur: string;
  statut: 'en_attente' | 'valide' | 'rejete';
  date_demande: string;
}

const statusConfig = {
  en_attente: { label: 'En attente', bg: 'bg-yellow-50', text: 'text-yellow-600' },
  valide: { label: 'Validé', bg: 'bg-green-50', text: 'text-green-600' },
  rejete: { label: 'Rejeté', bg: 'bg-red-50', text: 'text-red-600' },
};

export default function RetraitsAdminPage() {
  const [demandes, setDemandes] = useState<DemandeRetrait[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'tous' | 'en_attente' | 'valide' | 'rejete'>('en_attente');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchDemandes();
  }, []);

  const fetchDemandes = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch('/api/admin/retraits', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setDemandes(data.demandes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleValider = async (id: number, accepte: boolean) => {
    try {
      setActionLoading(id);

      const token = localStorage.getItem('token');

      const res = await fetch(
        `/api/admin/retraits/${id}/valider`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ accepte })
        }
      );

      if (!res.ok) throw new Error();

      await fetchDemandes();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Chargement...
      </div>
    );
  }

  const filtered = demandes.filter((d) => {
    if (filter === 'tous') return true;
    return d.statut === filter;
  });

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Retraits clients
        </h1>

        {/* FILTERS */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">

          {(['en_attente', 'valide', 'rejete', 'tous'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs rounded-md ${
                filter === f
                  ? 'bg-white shadow text-orange-600'
                  : 'text-gray-500'
              }`}
            >
              {f === 'tous'
                ? 'Tous'
                : statusConfig[f as keyof typeof statusConfig]?.label}
            </button>
          ))}

        </div>
      </div>

      {/* LIST */}
      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-800">
            Résultats ({filtered.length})
          </h2>
        </div>

        <div className="divide-y">

          {filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              Aucune demande
            </div>
          ) : (
            filtered.map((d) => {
              const cfg = statusConfig[d.statut];

              return (
                <div
                  key={d.id}
                  className="p-4 flex justify-between items-center"
                >

                  {/* LEFT */}
                  <div>
                    <p className="font-semibold">
                      {d.client_prenom} {d.client_nom}
                    </p>

                    <p className="text-sm text-gray-500">
                      {d.telephone} ({d.operateur})
                    </p>

                    <p className="text-xs text-gray-400">
                      {new Date(d.date_demande).toLocaleDateString('fr-FR')}
                    </p>

                    <span
                      className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${cfg.bg} ${cfg.text}`}
                    >
                      {cfg.label}
                    </span>
                  </div>

                  {/* RIGHT */}
                  <div className="text-right">

                    <p className="text-xl font-bold text-orange-600">
                      {d.montant.toLocaleString()} FCFA
                    </p>

                    {/* ACTIONS */}
                    {d.statut === 'en_attente' && (
                      <div className="flex gap-2 mt-2">

                        <button
                          disabled={actionLoading === d.id}
                          onClick={() => handleValider(d.id, true)}
                          className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm"
                        >
                          {actionLoading === d.id ? '...' : 'Valider'}
                        </button>

                        <button
                          disabled={actionLoading === d.id}
                          onClick={() => handleValider(d.id, false)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm"
                        >
                          Rejeter
                        </button>

                      </div>
                    )}

                  </div>

                </div>
              );
            })
          )}

        </div>
      </div>

    </div>
  );
}