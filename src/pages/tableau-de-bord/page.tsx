import { useState } from 'react';
import { credits } from '@/mocks/credits';
import { clients } from '@/mocks/clients';
import { remboursements } from '@/mocks/remboursements';

const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
const decaissements = [320, 450, 380, 520, 610, 480, 700, 650, 590, 720, 810, 760];
const remboursementsChart = [180, 260, 310, 390, 450, 420, 560, 530, 480, 610, 680, 720];
const maxVal = Math.max(...decaissements, ...remboursementsChart);

const topClients = [
  { nom: 'Traoré Fatoumata', montant: 324000, credits: 1, score: 91 },
  { nom: 'Ndiaye Rokhaya', montant: 580000, credits: 1, score: 88 },
  { nom: 'Diallo Aminata', montant: 320000, credits: 1, score: 82 },
  { nom: 'Bah Ousmane', montant: 0, credits: 1, score: 79 },
  { nom: 'Koné Ibrahim', montant: 450000, credits: 1, score: 74 },
];

export default function TableauDeBordPage() {
  const [period, setPeriod] = useState<'6m' | '12m'>('12m');

  const totalMontant = credits.reduce((s, c) => s + c.montant, 0);
  const totalRembourse = credits.reduce((s, c) => s + c.montantRembourse, 0);
  const tauxRemboursement = totalMontant > 0 ? Math.round((totalRembourse / totalMontant) * 100) : 0;
  const clientsActifs = clients.filter((c) => c.statut === 'actif').length;
  const retards = remboursements.filter((r) => r.statut === 'en_retard').length;
  const enCours = credits.filter((c) => c.statut === 'en_cours').length;

  const displayMonths = period === '6m' ? months.slice(6) : months;
  const displayDec = period === '6m' ? decaissements.slice(6) : decaissements;
  const displayRmb = period === '6m' ? remboursementsChart.slice(6) : remboursementsChart;
  const displayMax = Math.max(...displayDec, ...displayRmb);

  const scoreDistrib = [
    { label: 'Excellent (80-100)', count: clients.filter((c) => c.scoreCredit >= 80).length, color: 'bg-green-400' },
    { label: 'Bon (60-79)', count: clients.filter((c) => c.scoreCredit >= 60 && c.scoreCredit < 80).length, color: 'bg-yellow-400' },
    { label: 'Risqué (&lt;60)', count: clients.filter((c) => c.scoreCredit < 60).length, color: 'bg-red-400' },
  ];
  const maxScore = Math.max(...scoreDistrib.map((s) => s.count));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Volume total décaissé', value: `${(totalMontant / 1000000).toFixed(2)}M FCFA`, icon: 'ri-money-dollar-circle-line', color: 'text-orange-500 bg-orange-50', trend: '+8%', up: true },
          { label: 'Total remboursé', value: `${(totalRembourse / 1000000).toFixed(2)}M FCFA`, icon: 'ri-arrow-up-circle-line', color: 'text-green-500 bg-green-50', trend: '+12%', up: true },
          { label: 'Taux de remboursement', value: `${tauxRemboursement}%`, icon: 'ri-percent-line', color: 'text-sky-500 bg-sky-50', trend: '+3%', up: true },
          { label: 'Crédits en retard', value: String(retards), icon: 'ri-alarm-warning-line', color: 'text-red-500 bg-red-50', trend: '-2', up: false },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-11 h-11 flex items-center justify-center rounded-xl ${kpi.color}`}>
                <i className={`${kpi.icon} text-xl`} />
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-0.5 ${kpi.up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                <i className={`${kpi.up ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} text-xs`} />
                {kpi.trend}
              </span>
            </div>
            <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
            <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
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
              { label: 'En cours', count: enCours, total: credits.length, color: 'bg-green-400' },
              { label: 'En attente', count: credits.filter((c) => c.statut === 'en_attente').length, total: credits.length, color: 'bg-yellow-400' },
              { label: 'Soldés', count: credits.filter((c) => c.statut === 'solde').length, total: credits.length, color: 'bg-gray-300' },
              { label: 'Rejetés', count: credits.filter((c) => c.statut === 'rejete').length, total: credits.length, color: 'bg-red-400' },
              { label: 'Validés', count: credits.filter((c) => c.statut === 'valide').length, total: credits.length, color: 'bg-sky-400' },
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
                  style={{ width: `${(clientsActifs / clients.length) * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold text-orange-600">{clientsActifs}/{clients.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clients */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Top clients par remboursement</h3>
          <div className="space-y-3">
            {topClients.map((c, i) => (
              <div key={c.nom} className="flex items-center gap-3">
                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${i === 0 ? 'bg-orange-500 text-white' : i === 1 ? 'bg-orange-200 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{c.nom}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-400 rounded-full"
                        style={{ width: `${c.score}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">Score: {c.score}</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-900 flex-shrink-0">
                  {c.montant.toLocaleString('fr-FR')} F
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Score Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Distribution des scores de crédit</h3>
          <div className="space-y-4">
            {scoreDistrib.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-600" dangerouslySetInnerHTML={{ __html: s.label }} />
                  <span className="font-bold text-gray-800">{s.count} clients</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${s.color} rounded-full transition-all`}
                    style={{ width: `${maxScore > 0 ? (s.count / maxScore) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xl font-bold text-gray-900">{Math.round(clients.reduce((s, c) => s + c.scoreCredit, 0) / clients.length)}</p>
              <p className="text-xs text-gray-400">Score moyen</p>
            </div>
            <div>
              <p className="text-xl font-bold text-green-600">{Math.max(...clients.map((c) => c.scoreCredit))}</p>
              <p className="text-xs text-gray-400">Score max</p>
            </div>
            <div>
              <p className="text-xl font-bold text-red-500">{Math.min(...clients.map((c) => c.scoreCredit))}</p>
              <p className="text-xs text-gray-400">Score min</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
