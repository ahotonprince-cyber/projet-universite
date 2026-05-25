// /frontend/src/pages/admin/statistiques/page.tsx
import { useState, useEffect } from 'react';

interface StatistiqueKPI {
  total_clients: number;
  total_credits: number;
  total_decaissements: number;
  credits_actifs: number;
  credits_en_attente: number;
  total_rembourse: number;
  alertes_retard: number;
}

interface EvolutionData {
  mois: string;
  nombre: number;
  montant: number;
}

export default function StatistiquesAdminPage() {
  const [kpi, setKpi] = useState<StatistiqueKPI | null>(null);
  const [evolution, setEvolution] = useState<EvolutionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'6m' | '12m'>('12m');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const [kpiRes, evolutionRes] = await Promise.all([
          fetch('/api/admin/statistiques/kpi', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('/api/admin/statistiques/evolution', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (kpiRes.ok) {
          const data = await kpiRes.json();
          setKpi(data);
        }

        if (evolutionRes.ok) {
          const data = await evolutionRes.json();
          setEvolution(data.evolution || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading || !kpi) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  const evolutionFiltered = evolution.slice(period === '6m' ? -6 : -12);
  const maxMontant = Math.max(...evolutionFiltered.map(e => e.montant), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Statistiques avancées</h1>
        <p className="text-sm text-gray-500">Analyse détaillée de l'activité</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-400">Total clients</p>
          <p className="text-2xl font-bold">{kpi.total_clients}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-400">Total décaissé</p>
          <p className="text-2xl font-bold text-orange-600">{(kpi.total_decaissements / 1000000).toFixed(1)}M FCFA</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-400">Total remboursé</p>
          <p className="text-2xl font-bold text-green-600">{(kpi.total_rembourse / 1000000).toFixed(1)}M FCFA</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-400">Alertes retard</p>
          <p className="text-2xl font-bold text-red-600">{kpi.alertes_retard}</p>
        </div>
      </div>

      {/* Credit Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold mb-4">Statut des crédits</h3>
          <div className="space-y-3">
            {[
              { label: 'Crédits actifs', count: kpi.credits_actifs, total: kpi.total_credits, color: 'bg-green-400' },
              { label: 'Crédits en attente', count: kpi.credits_en_attente, total: kpi.total_credits, color: 'bg-yellow-400' },
              { label: 'Crédits soldés', count: kpi.total_credits - kpi.credits_actifs - kpi.credits_en_attente, total: kpi.total_credits, color: 'bg-gray-400' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.label}</span>
                  <span>{item.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.total > 0 ? (item.count / item.total) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Évolution graphique simplifiée */}
        <div className="bg-white rounded-xl border p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Évolution mensuelle</h3>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {(['6m', '12m'] as const).map((p) => (
                <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1 rounded-md text-xs ${period === p ? 'bg-white text-orange-600 shadow' : 'text-gray-500'}`}>
                  {p === '6m' ? '6 mois' : '12 mois'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-2 h-48">
            {evolutionFiltered.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-orange-400 rounded-t" style={{ height: `${(item.montant / maxMontant) * 100}%`, minHeight: '4px' }} />
                <span className="text-xs text-gray-400 mt-1">{item.mois?.slice(5, 7)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}