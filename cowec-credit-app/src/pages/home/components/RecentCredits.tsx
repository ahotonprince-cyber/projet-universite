import { useState, useEffect } from 'react';

interface Credit {
  id: number;
  numero_credit: string;
  client_nom: string;
  client_prenom: string;
  montant_accorde: number;
  montant_rembourse: number;
  statut: string;
}

const statutConfig: Record<string, { label: string; cls: string }> = {
  en_attente: { label: 'En attente', cls: 'bg-yellow-50 text-yellow-700' },
  valide: { label: 'Validé', cls: 'bg-sky-50 text-sky-700' },
  rejete: { label: 'Rejeté', cls: 'bg-red-50 text-red-700' },
  actif: { label: 'En cours', cls: 'bg-green-50 text-green-700' },
  solde: { label: 'Soldé', cls: 'bg-gray-100 text-gray-600' },
};

export default function RecentCredits() {
  const [credits, setCredits] = useState<Credit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentCredits = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) return;

        const res = await fetch('/api/admin/credits/recent', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        setCredits(data.credits || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentCredits();
  }, []);

  /* 🔥 LOADING SKELETON PRO */
  if (loading) {
    return (
      <div className="bg-white rounded-xl border p-6 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-2 bg-gray-200 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">

      {/* HEADER */}
      <div className="flex justify-between items-center px-5 py-4 border-b">
        <h3 className="font-semibold text-gray-800">
          Crédits récents
        </h3>

        <a
          href="/admin/credits"
          className="text-xs text-orange-500 font-medium hover:underline"
        >
          Voir tout
        </a>
      </div>

      {/* LIST */}
      <div className="divide-y">

        {credits.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">
            Aucun crédit récent
          </div>
        ) : (
          credits.map((credit) => {
            const safeAccorde = credit.montant_accorde || 0;
            const safeRembourse = credit.montant_rembourse || 0;

            /* 🔥 SAFE % */
            const pct =
              safeAccorde > 0
                ? Math.min(
                    100,
                    Math.round((safeRembourse / safeAccorde) * 100)
                  )
                : 0;

            const cfg =
              statutConfig[credit.statut] || {
                label: credit.statut,
                cls: 'bg-gray-100 text-gray-600'
              };

            return (
              <div
                key={credit.id}
                className="flex items-center gap-4 px-5 py-3 hover:bg-orange-50/30"
              >

                {/* ICON */}
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-100">
                  <i className="ri-bank-card-line text-orange-500" />
                </div>

                {/* INFO */}
                <div className="flex-1 min-w-0">

                  <p className="text-sm font-medium text-gray-800 truncate">
                    {credit.client_prenom} {credit.client_nom}
                  </p>

                  {/* PROGRESS */}
                  <div className="flex items-center gap-2 mt-1">

                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <span className="text-xs text-gray-400">
                      {pct}%
                    </span>

                  </div>

                </div>

                {/* RIGHT */}
                <div className="text-right">

                  <p className="text-sm font-bold text-gray-900">
                    {safeAccorde.toLocaleString('fr-FR')} F
                  </p>

                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${cfg.cls}`}
                  >
                    {cfg.label}
                  </span>

                </div>

              </div>
            );
          })
        )}

      </div>
    </div>
  );
}