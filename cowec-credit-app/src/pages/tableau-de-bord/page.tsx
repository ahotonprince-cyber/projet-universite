import { useState, useEffect, useMemo } from 'react';

interface Credit {
  id: number;
  montant_accorde: number;
  montant_rembourse: number;
  statut: string;
  duree_mois: number;
  taux_annuel: number;
  date_debut: string;
}

interface Client {
  id: number;
  nom: string;
  prenom: string;
  statut: 'actif' | 'inactif';
  score_credit: number;
}

interface Remboursement {
  id: number;
  statut: string;
  montant_echeance: number;
}

interface TopClient {
  id: number;
  nom: string;
  prenom: string;
  score_credit: number;
  total_emprunte: number;
  nombre_credits: number;
}

const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

function buildMonthlyArray(data: { mois: string; value: number }[]): number[] {
  const arr = new Array(12).fill(0);
  data.forEach(({ mois, value }) => {
    const idx = parseInt(mois.split('-')[1], 10) - 1;
    if (idx >= 0 && idx < 12) arr[idx] += value / 1000;
  });
  return arr;
}

export default function TableauDeBordPage() {
  const [period, setPeriod] = useState<'6m' | '12m'>('12m');
  const [credits, setCredits] = useState<Credit[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [remboursements, setRemboursements] = useState<Remboursement[]>([]);
  const [topClients, setTopClients] = useState<TopClient[]>([]);
  const [decaissements, setDecaissements] = useState<number[]>(new Array(12).fill(0));
  const [remboursementsChart, setRemboursementsChart] = useState<number[]>(new Array(12).fill(0));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const headers = { 'Authorization': `Bearer ${token}` };

        const [creditsRes, clientsRes, remboursementsRes, topClientsRes, evolutionRes, rmbMensuelRes] =
          await Promise.all([
            fetch('/api/admin/credits', { headers }),
            fetch('/api/admin/clients', { headers }),
            fetch('/api/admin/remboursements', { headers }),
            fetch('/api/admin/statistiques/top-clients', { headers }),
            fetch('/api/admin/statistiques/evolution', { headers }),
            fetch('/api/admin/statistiques/remboursements-mensuels', { headers }),
          ]);

        if (!creditsRes.ok || !clientsRes.ok || !remboursementsRes.ok) {
          throw new Error('Erreur chargement données');
        }

        const creditsData = await creditsRes.json();
        const clientsData = await clientsRes.json();
        const remboursementsData = await remboursementsRes.json();

        setCredits(creditsData.credits || []);
        setClients(clientsData.clients || []);
        setRemboursements(remboursementsData.remboursements || []);

        if (topClientsRes.ok) {
          const { top_clients } = await topClientsRes.json();
          setTopClients(top_clients || []);
        }

        if (evolutionRes.ok) {
          const { evolution } = await evolutionRes.json();
          setDecaissements(
            buildMonthlyArray(
              (evolution || []).map((e: { mois: string; montant: number }) => ({ mois: e.mois, value: e.montant }))
            )
          );
        }

        if (rmbMensuelRes.ok) {
          const { remboursements: rmbData } = await rmbMensuelRes.json();
          setRemboursementsChart(
            buildMonthlyArray(
              (rmbData || []).map((r: { mois: string; total: number }) => ({ mois: r.mois, value: r.total }))
            )
          );
        }
      } catch (err) {
        console.error(err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const totalMontant = credits.reduce((s, c) => s + c.montant_accorde, 0);
    const totalRembourse = credits.reduce((s, c) => s + c.montant_rembourse, 0);
    const tauxRemboursement = totalMontant > 0 ? Math.round((totalRembourse / totalMontant) * 100) : 0;
    const clientsActifs = clients.filter((c) => c.statut === 'actif').length;
    const retards = remboursements.filter((r) => r.statut === 'en_retard').length;
    const enCours = credits.filter((c) => c.statut === 'actif').length;
    const enAttente = credits.filter((c) => c.statut === 'en_attente').length;
    const solde = credits.filter((c) => c.statut === 'solde').length;
    const rejetes = credits.filter((c) => c.statut === 'rejete').length;
    const valides = credits.filter((c) => c.statut === 'valide').length;
    const totalCredits = credits.length;
    const totalClients = clients.length;
    const scoreMoyen =
      totalClients > 0
        ? Math.round(clients.reduce((s, c) => s + (c.score_credit || 0), 0) / totalClients)
        : 0;
    const scoreMax = totalClients > 0 ? Math.max(...clients.map((c) => c.score_credit || 0)) : 0;
    const scoreMin = totalClients > 0 ? Math.min(...clients.map((c) => c.score_credit || 100)) : 0;
    const excellent = clients.filter((c) => (c.score_credit || 0) >= 80).length;
    const bon = clients.filter((c) => (c.score_credit || 0) >= 60 && (c.score_credit || 0) < 80).length;
    const risque = clients.filter((c) => (c.score_credit || 0) < 60).length;
    return {
      totalMontant, totalRembourse, tauxRemboursement, clientsActifs, retards, enCours,
      enAttente, solde, rejetes, valides, totalCredits, totalClients, scoreMoyen, scoreMax, scoreMin,
      excellent, bon, risque,
    };
  }, [credits, clients, remboursements]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg">
          Réessayer
        </button>
      </div>
    );
  }

  const displayMonths = period === '6m' ? months.slice(6) : months;
  const displayDec = period === '6m' ? decaissements.slice(6) : decaissements;
  const displayRmb = period === '6m' ? remboursementsChart.slice(6) : remboursementsChart;
  const displayMax = Math.max(...displayDec, ...displayRmb, 1);

  const scoreDistrib = [
    { label: 'Excellent (80-100)', count: stats.excellent, color: 'bg-green-400' },
    { label: 'Bon (60-79)', count: stats.bon, color: 'bg-yellow-400' },
    { label: 'Risqué (<60)', count: stats.risque, color: 'bg-red-400' },
  ];
  const maxScore = Math.max(...scoreDistrib.map((s) => s.count), 1);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Volume total décaissé', value: `${(stats.totalMontant / 1000000).toFixed(2)}M FCFA`, icon: 'ri-money-dollar-circle-line', color: 'text-orange-500 bg-orange-50' },
          { label: 'Total remboursé', value: `${(stats.totalRembourse / 1000000).toFixed(2)}M FCFA`, icon: 'ri-arrow-up-circle-line', color: 'text-green-500 bg-green-50' },
          { label: 'Taux de remboursement', value: `${stats.tauxRemboursement}%`, icon: 'ri-percent-line', color: 'text-sky-500 bg-sky-50' },
          { label: 'Crédits en retard', value: String(stats.retards), icon: 'ri-alarm-warning-line', color: 'text-red-500 bg-red-50' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className={`w-9 h-9 flex items-center justify-center rounded-xl ${kpi.color} mb-2`}>
              <i className={`${kpi.icon} text-lg`} />
            </div>
            <p className="text-base lg:text-xl font-bold text-gray-900 truncate">{kpi.value}</p>
            <p className="text-xs text-gray-500 mt-1 leading-tight">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-gray-800">Évolution mensuelle</h3>
              <p className="text-xs text-gray-400 mt-0.5">En milliers de FCFA</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {(['6m', '12m'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${period === p ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'}`}
                  >
                    {p === '6m' ? '6 mois' : '12 mois'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-400 inline-block" />Décaissements</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-400 inline-block" />Remboursements</span>
          </div>
          <div className="flex items-end gap-2 h-48">
            {displayMonths.map((m, i) => (
              <div key={m} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer">
                <div className="w-full flex gap-0.5 items-end h-40">
                  <div
                    className="flex-1 bg-orange-400 rounded-t group-hover:bg-orange-500 transition-colors"
                    style={{ height: `${(displayDec[i] / displayMax) * 100}%` }}
                  />
                  <div
                    className="flex-1 bg-green-300 rounded-t group-hover:bg-green-400 transition-colors"
                    style={{ height: `${(displayRmb[i] / displayMax) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Statut Breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Statut des crédits</h3>
          <div className="space-y-3">
            {[
              { label: 'En cours', count: stats.enCours, total: stats.totalCredits, color: 'bg-green-400' },
              { label: 'En attente', count: stats.enAttente, total: stats.totalCredits, color: 'bg-yellow-400' },
              { label: 'Soldés', count: stats.solde, total: stats.totalCredits, color: 'bg-gray-300' },
              { label: 'Rejetés', count: stats.rejetes, total: stats.totalCredits, color: 'bg-red-400' },
              { label: 'Validés', count: stats.valides, total: stats.totalCredits, color: 'bg-sky-400' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-semibold text-gray-800">{item.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all`}
                    style={{ width: `${item.total > 0 ? (item.count / item.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Clients actifs</h4>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-400 rounded-full"
                  style={{ width: `${stats.totalClients > 0 ? (stats.clientsActifs / stats.totalClients) * 100 : 0}%` }}
                />
              </div>
              <span className="text-sm font-bold text-orange-600">{stats.clientsActifs}/{stats.totalClients}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clients */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Top clients par montant emprunté</h3>
          {topClients.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Aucune donnée disponible</p>
          ) : (
            <div className="space-y-3">
              {topClients.slice(0, 5).map((c, i) => (
                <div key={c.id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${i === 0 ? 'bg-orange-500 text-white' : i === 1 ? 'bg-orange-200 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{c.prenom} {c.nom}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-400 rounded-full"
                          style={{ width: `${c.score_credit || 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">Score: {c.score_credit || 0}</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 flex-shrink-0">
                    {(c.total_emprunte || 0).toLocaleString('fr-FR')} F
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Score Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Distribution des scores de crédit</h3>
          <div className="space-y-4">
            {scoreDistrib.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-600">{s.label}</span>
                  <span className="font-bold text-gray-800">{s.count} clients</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${s.color} rounded-full transition-all`}
                    style={{ width: `${(s.count / maxScore) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xl font-bold text-gray-900">{stats.scoreMoyen}</p>
              <p className="text-xs text-gray-400">Score moyen</p>
            </div>
            <div>
              <p className="text-xl font-bold text-green-600">{stats.scoreMax}</p>
              <p className="text-xs text-gray-400">Score max</p>
            </div>
            <div>
              <p className="text-xl font-bold text-red-500">{stats.scoreMin}</p>
              <p className="text-xs text-gray-400">Score min</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
