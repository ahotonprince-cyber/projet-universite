// /frontend/src/pages/admin/risques/page.tsx
import { useState, useEffect } from 'react';

interface CreditRisque {
  id: number;
  client_nom: string;
  client_prenom: string;
  montant_accorde: number;
  montant_rembourse: number;
  reste_a_payer: number;
  jours_retard: number;
  statut: string;
  score_credit: number;
}

export default function RisquesPage() {
  const [credits, setCredits] = useState<CreditRisque[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'retard' | 'critique'>('all');

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/credits/alertes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error();
        const data = await response.json();
        setCredits(data.alertes || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchCredits();
  }, []);

  const filtered = credits.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'retard') return c.jours_retard >= 7 && c.jours_retard < 30;
    if (filter === 'critique') return c.jours_retard >= 30;
    return true;
  });

  const stats = {
    total: credits.length,
    retard_7_29: credits.filter(c => c.jours_retard >= 7 && c.jours_retard < 30).length,
    retard_30_plus: credits.filter(c => c.jours_retard >= 30).length,
    montant_risque: credits.reduce((sum, c) => sum + c.reste_a_payer, 0),
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-800">Analyse des risques crédits</h1><p className="text-sm text-gray-500">Surveillance des impayés et créances douteuses</p></div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4"><p className="text-sm text-gray-400">Total alertes</p><p className="text-2xl font-bold">{stats.total}</p></div>
        <div className="bg-white rounded-xl border p-4"><p className="text-sm text-gray-400">Retards 7-29j</p><p className="text-2xl font-bold text-orange-500">{stats.retard_7_29}</p></div>
        <div className="bg-white rounded-xl border p-4"><p className="text-sm text-gray-400">Retards 30j+</p><p className="text-2xl font-bold text-red-500">{stats.retard_30_plus}</p></div>
        <div className="bg-white rounded-xl border p-4"><p className="text-sm text-gray-400">Montant à risque</p><p className="text-xl font-bold text-red-600">{stats.montant_risque.toLocaleString()} FCFA</p></div>
      </div>

      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit"><button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm ${filter === 'all' ? 'bg-white text-orange-600 shadow' : 'text-gray-500'}`}>Tous</button><button onClick={() => setFilter('retard')} className={`px-4 py-2 rounded-lg text-sm ${filter === 'retard' ? 'bg-white text-orange-600 shadow' : 'text-gray-500'}`}>Retards 7-29j</button><button onClick={() => setFilter('critique')} className={`px-4 py-2 rounded-lg text-sm ${filter === 'critique' ? 'bg-white text-orange-600 shadow' : 'text-gray-500'}`}>Critiques 30j+</button></div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full"><thead className="bg-gray-50"><tr><th className="text-left px-5 py-3 text-xs">Client</th><th className="text-left px-5 py-3 text-xs">Montant dû</th><th className="text-left px-5 py-3 text-xs">Score crédit</th><th className="text-left px-5 py-3 text-xs">Jours retard</th><th className="text-left px-5 py-3 text-xs">Niveau</th><th className="text-left px-5 py-3 text-xs">Action</th></tr></thead>
          <tbody className="divide-y">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-sm font-medium">{c.client_prenom} {c.client_nom}</td>
                <td className="px-5 py-3 text-sm font-semibold text-red-600">{c.reste_a_payer.toLocaleString()} FCFA</td>
                <td className="px-5 py-3"><span className={`text-xs px-2 py-1 rounded-full ${c.score_credit >= 80 ? 'bg-green-100 text-green-700' : c.score_credit >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>{c.score_credit}/100</span></td>
                <td className="px-5 py-3 text-sm">{c.jours_retard} jour(s)</td>
                <td className="px-5 py-3"><span className={`text-xs px-2 py-1 rounded-full ${c.jours_retard >= 30 ? 'bg-red-500 text-white' : c.jours_retard >= 7 ? 'bg-orange-500 text-white' : 'bg-yellow-500 text-white'}`}>{c.jours_retard >= 30 ? 'Critique' : c.jours_retard >= 7 ? 'Élevé' : 'Modéré'}</span></td>
                <td className="px-5 py-3"><button className="text-orange-500 text-sm">Contacter</button></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-gray-400">Aucun crédit à risque</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}