import { useState, useEffect, useMemo } from 'react';

export default function StatistiquesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState({
    soldeEpargne: 0,
    soldeCourant: 0,
    soldeTontine: 0,
    creditsEnCours: 0,
    totalCredits: 0,
    remboursements: 0,
    depots: 0
  });

  useEffect(() => {
    const fetchStatistiques = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const [soldeRes, creditsRes, operationsRes] = await Promise.all([
          fetch('/api/client/solde', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('/api/client/credits', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('/api/client/operations', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        // ✅ API retourne directement { solde_epargne, solde_courant, solde_tontine }
        const soldeData = soldeRes.ok
          ? await soldeRes.json()
          : { solde_epargne: 0, solde_courant: 0, solde_tontine: 0 };

        const creditsData = creditsRes.ok
          ? await creditsRes.json()
          : { credits: [] };

        const operationsData = operationsRes.ok
          ? await operationsRes.json()
          : { operations: [] };

        const credits = creditsData.credits || [];
        const operations = operationsData.operations || [];

        const creditsEnCours = credits.filter((c: any) => c.statut === 'actif').length;
        const totalCredits = credits.length;

        const remboursements = operations
          .filter((op: any) => op.type_operation === 'paiement')
          .reduce((sum: number, op: any) => sum + Number(op.montant), 0);

        const depots = operations
          .filter((op: any) => op.type_operation === 'depot')
          .reduce((sum: number, op: any) => sum + Number(op.montant), 0);

        setData({
          soldeEpargne: Number(soldeData.solde_epargne) || 0,
          soldeCourant: Number(soldeData.solde_courant) || 0,
          soldeTontine: Number(soldeData.solde_tontine) || 0,
          creditsEnCours,
          totalCredits,
          remboursements,
          depots
        });

      } catch (err) {
        console.error('Erreur chargement statistiques:', err);
        setError('Impossible de charger les statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistiques();
  }, []);

  // ✅ Solde disponible = courant uniquement
  // ✅ Patrimoine total = épargne + courant + tontine
  const patrimoineTotal = useMemo(
    () => data.soldeEpargne + data.soldeCourant + data.soldeTontine,
    [data]
  );

  const stats = [
    {
      label: 'Solde disponible',
      value: `${data.soldeCourant.toLocaleString('fr-FR')} FCFA`,
      color: 'text-green-600',
      bg: 'bg-green-50',
      icon: 'ri-wallet-3-line',
      desc: 'Compte courant'
    },
    {
      label: 'Épargne',
      value: `${data.soldeEpargne.toLocaleString('fr-FR')} FCFA`,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      icon: 'ri-safe-line',
      desc: 'Compte épargne'
    },
    {
      label: 'Tontine',
      value: `${data.soldeTontine.toLocaleString('fr-FR')} FCFA`,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      icon: 'ri-group-line',
      desc: 'Compte tontine'
    },
    {
      label: 'Patrimoine total',
      value: `${patrimoineTotal.toLocaleString('fr-FR')} FCFA`,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      icon: 'ri-funds-line',
      desc: 'Tous comptes confondus'
    },
  ];

  const activite = [
    {
      label: 'Crédits actifs',
      value: data.creditsEnCours,
      suffix: '',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      icon: 'ri-bank-card-line'
    },
    {
      label: 'Total crédits',
      value: data.totalCredits,
      suffix: '',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      icon: 'ri-file-list-3-line'
    },
    {
      label: 'Dépôts reçus',
      value: data.depots.toLocaleString('fr-FR'),
      suffix: ' FCFA',
      color: 'text-green-600',
      bg: 'bg-green-50',
      icon: 'ri-arrow-down-circle-line'
    },
    {
      label: 'Remboursements',
      value: data.remboursements.toLocaleString('fr-FR'),
      suffix: ' FCFA',
      color: 'text-red-600',
      bg: 'bg-red-50',
      icon: 'ri-refund-2-line'
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Statistiques</h2>
        <p className="text-sm text-gray-500">Analyse de ton activité financière</p>
      </div>

      {/* ── SOLDES ── */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Mes soldes
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className={`${s.bg} p-5 rounded-xl border hover:shadow-md transition`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm`}>
                  <i className={`${s.icon} text-lg ${s.color}`} />
                </div>
                <span className="text-xs text-gray-400">{s.desc}</span>
              </div>
              <p className="text-sm text-gray-500 mt-3">{s.label}</p>
              <p className={`text-lg font-bold ${s.color} mt-0.5`}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── RÉPARTITION ── */}
      <div className="bg-white p-6 rounded-xl border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-800">Répartition du patrimoine</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Total : <span className="font-semibold text-orange-500">
                {patrimoineTotal.toLocaleString('fr-FR')} FCFA
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Épargne', value: data.soldeEpargne, color: 'bg-blue-500', text: 'text-blue-600' },
            { label: 'Courant', value: data.soldeCourant, color: 'bg-green-500', text: 'text-green-600' },
            { label: 'Tontine', value: data.soldeTontine, color: 'bg-purple-500', text: 'text-purple-600' },
          ].map((item) => {
            const pct = patrimoineTotal > 0
              ? Math.round((item.value / patrimoineTotal) * 100)
              : 0;

            return (
              <div key={item.label}>
                <div className="flex justify-between items-center text-sm mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-gray-600 font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold ${item.text}`}>{pct}%</span>
                    <span className="font-semibold text-gray-800">
                      {item.value.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full">
                  <div
                    className={`${item.color} h-2.5 rounded-full transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Légende */}
        {patrimoineTotal === 0 && (
          <p className="text-center text-gray-400 text-sm mt-4">
            Aucun solde disponible pour le moment
          </p>
        )}
      </div>

      {/* ── ACTIVITÉ FINANCIÈRE ── */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Activité financière
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activite.map((a, i) => (
            <div key={i} className={`${a.bg} p-5 rounded-xl border hover:shadow-md transition`}>
              <div className={`w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm mb-3`}>
                <i className={`${a.icon} text-lg ${a.color}`} />
              </div>
              <p className="text-sm text-gray-500">{a.label}</p>
              <p className={`text-lg font-bold ${a.color} mt-0.5`}>
                {a.value}{a.suffix}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── RÉSUMÉ CRÉDITS ── */}
      {data.totalCredits > 0 && (
        <div className="bg-white p-6 rounded-xl border">
          <h3 className="font-semibold text-gray-800 mb-4">Résumé des crédits</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-100 h-4 rounded-full overflow-hidden">
              <div
                className="bg-orange-500 h-4 rounded-full transition-all duration-700"
                style={{
                  width: `${data.totalCredits > 0
                    ? (data.creditsEnCours / data.totalCredits) * 100
                    : 0}%`
                }}
              />
            </div>
            <span className="text-sm text-gray-600 whitespace-nowrap">
              <span className="font-bold text-orange-600">{data.creditsEnCours}</span>
              {' '}actif{data.creditsEnCours > 1 ? 's' : ''} sur{' '}
              <span className="font-bold">{data.totalCredits}</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {data.totalCredits - data.creditsEnCours} crédit{data.totalCredits - data.creditsEnCours > 1 ? 's' : ''} terminé{data.totalCredits - data.creditsEnCours > 1 ? 's' : ''}
          </p>
        </div>
      )}

    </div>
  );
}