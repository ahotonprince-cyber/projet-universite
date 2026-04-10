import { useState } from 'react';
import StatCard from './components/StatCard';
import RecentCredits from './components/RecentCredits';
import AlertesRetard from './components/AlertesRetard';
import { credits } from '@/mocks/credits';
import { clients } from '@/mocks/clients';
import { remboursements } from '@/mocks/remboursements';

const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
const decaissements = [320, 450, 380, 520, 610, 480, 700, 650, 590, 720, 810, 760];
const remboursementsData = [180, 260, 310, 390, 450, 420, 560, 530, 480, 610, 680, 720];

const maxVal = Math.max(...decaissements, ...remboursementsData);

export default function Home() {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const totalPrets = credits.filter((c) => c.statut === 'en_cours').length;
  const totalMontant = credits.reduce((s, c) => s + c.montant, 0);
  const totalRembourse = credits.reduce((s, c) => s + c.montantRembourse, 0);
  const tauxRemboursement = totalMontant > 0 ? Math.round((totalRembourse / totalMontant) * 100) : 0;
  const clientsActifs = clients.filter((c) => c.statut === 'actif').length;
  const retards = remboursements.filter((r) => r.statut === 'en_retard').length;

  const donutData = [
    { label: 'En cours', value: credits.filter((c) => c.statut === 'en_cours').length, color: '#f97316' },
    { label: 'Soldés', value: credits.filter((c) => c.statut === 'solde').length, color: '#22c55e' },
    { label: 'En retard', value: retards, color: '#ef4444' },
    { label: 'En attente', value: credits.filter((c) => c.statut === 'en_attente').length, color: '#eab308' },
  ];
  const donutTotal = donutData.reduce((s, d) => s + d.value, 0);

  let cumulAngle = 0;
  const donutSegments = donutData.map((d) => {
    const angle = donutTotal > 0 ? (d.value / donutTotal) * 360 : 0;
    const start = cumulAngle;
    cumulAngle += angle;
    return { ...d, startAngle: start, angle };
  });

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-full opacity-10">
          <i className="ri-bank-line text-9xl absolute -right-4 -top-4" />
        </div>
        <div className="relative z-10">
          <p className="text-orange-100 text-sm font-medium mb-1">Bienvenue sur</p>
          <h2 className="text-2xl font-bold mb-1">COWEC Microfinance</h2>
          <p className="text-orange-100 text-sm">
            Gestion optimisée des crédits &mdash; {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Prêts actifs" value={String(totalPrets)} icon="ri-bank-card-line" trend="+12%" trendUp color="orange" />
        <StatCard label="Montant décaissé" value={`${(totalMontant / 1000000).toFixed(1)}M F`} icon="ri-money-dollar-circle-line" trend="+8%" trendUp color="green" />
        <StatCard label="Taux de remboursement" value={`${tauxRemboursement}%`} icon="ri-percent-line" trend="+3%" trendUp color="blue" />
        <StatCard label="Clients actifs" value={String(clientsActifs)} icon="ri-group-line" trend="+5%" trendUp color="orange" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-gray-800">Évolution des crédits</h3>
              <p className="text-xs text-gray-400 mt-0.5">Décaissements vs Remboursements (en milliers FCFA)</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />
                Décaissements
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
                Remboursements
              </span>
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-44">
            {months.map((m, i) => (
              <div
                key={m}
                className="flex-1 flex flex-col items-center gap-0.5 cursor-pointer group"
                onMouseEnter={() => setHoveredBar(i)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {hoveredBar === i && (
                  <div className="absolute bg-gray-800 text-white text-xs rounded px-2 py-1 -mt-10 whitespace-nowrap z-10 pointer-events-none">
                    D: {decaissements[i]}k | R: {remboursementsData[i]}k
                  </div>
                )}
                <div className="w-full flex gap-0.5 items-end h-36">
                  <div
                    className="flex-1 bg-orange-400 rounded-t-sm group-hover:bg-orange-500 transition-colors"
                    style={{ height: `${(decaissements[i] / maxVal) * 100}%` }}
                  />
                  <div
                    className="flex-1 bg-green-300 rounded-t-sm group-hover:bg-green-400 transition-colors"
                    style={{ height: `${(remboursementsData[i] / maxVal) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Répartition des crédits</h3>
          <div className="flex justify-center mb-4">
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {donutSegments.map((seg, i) => (
                  <path
                    key={i}
                    d={describeArc(50, 50, 38, seg.startAngle, seg.startAngle + seg.angle)}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="14"
                    strokeLinecap="butt"
                  />
                ))}
                <circle cx="50" cy="50" r="24" fill="white" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-gray-900">{donutTotal}</span>
                <span className="text-xs text-gray-400">Total</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {donutData.map((d) => (
              <div key={d.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-gray-600">{d.label}</span>
                </div>
                <span className="font-semibold text-gray-800">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentCredits />
        <AlertesRetard />
      </div>
    </div>
  );
}
