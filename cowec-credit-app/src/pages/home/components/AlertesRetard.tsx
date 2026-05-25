import { useState, useEffect } from 'react';

interface AlerteRetard {
  id: number;
  credit_id: number;
  client_nom: string;
  client_prenom: string;
  montant_echeance: number;
  jours_retard: number;
}

const getUrgency = (jours: number) => {
  if (jours >= 30) return { label: 'Critique', cls: 'bg-red-500 text-white' };
  if (jours >= 15) return { label: 'Élevé', cls: 'bg-orange-500 text-white' };
  if (jours >= 7) return { label: 'Moyen', cls: 'bg-yellow-400 text-white' };
  return { label: 'Faible', cls: 'bg-gray-200 text-gray-700' };
};

export default function AlertesRetard() {
  const [retards, setRetards] = useState<AlerteRetard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAlertes = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) return;

        const res = await fetch(
          '/api/credits/alertes',
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (!res.ok) throw new Error();

        const data = await res.json();
        setRetards(data.alertes || []);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAlertes();
  }, []);

  /* 🔥 TRI PAR GRAVITÉ */
  const sorted = [...retards].sort(
    (a, b) => b.jours_retard - a.jours_retard
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl border p-6 space-y-3">
        <div className="animate-pulse h-4 bg-gray-200 w-1/3 rounded" />
        <div className="animate-pulse h-3 bg-gray-200 w-full rounded" />
        <div className="animate-pulse h-3 bg-gray-200 w-5/6 rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border p-6 text-center text-red-500 text-sm">
        Erreur chargement des alertes
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">

      {/* HEADER */}
      <div className="flex items-center justify-between px-5 py-4 border-b">

        <div className="flex items-center gap-2">

          <i className="ri-alarm-warning-line text-red-500 text-lg" />

          <h3 className="font-semibold text-gray-800">
            Alertes de retard
          </h3>

          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
            {retards.length}
          </span>

        </div>

        <a
          href="/admin/remboursements"
          className="text-xs text-orange-500 font-medium hover:underline"
        >
          Gérer
        </a>

      </div>

      {/* LIST */}
      <div className="divide-y">

        {sorted.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            <i className="ri-checkbox-circle-line text-green-400 text-2xl mb-2" />
            <p>Aucun retard de paiement</p>
          </div>
        ) : (
          sorted.map((r) => {
            const urgency = getUrgency(r.jours_retard);

            return (
              <div
                key={r.id}
                className="flex items-center gap-3 px-5 py-3 hover:bg-red-50/30"
              >

                {/* ICON */}
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-red-100">
                  <i className="ri-time-line text-red-500" />
                </div>

                {/* INFO */}
                <div className="flex-1 min-w-0">

                  <p className="text-sm font-medium text-gray-800 truncate">
                    {r.client_prenom} {r.client_nom}
                  </p>

                  <p className="text-xs text-gray-400">
                    Crédit #{r.credit_id}
                  </p>

                  {/* URGENCY BADGE */}
                  <span
                    className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full ${urgency.cls}`}
                  >
                    {urgency.label}
                  </span>

                </div>

                {/* RIGHT */}
                <div className="text-right">

                  <p className="text-sm font-bold text-red-600">
                    {Number(r.montant_echeance || 0).toLocaleString('fr-FR')} F
                  </p>

                  <p className="text-xs text-red-400">
                    {r.jours_retard} jour(s)
                  </p>

                </div>

              </div>
            );
          })
        )}

      </div>
    </div>
  );
}