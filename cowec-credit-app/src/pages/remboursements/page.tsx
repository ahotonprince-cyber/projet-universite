import { useState } from 'react';
import { remboursements as initialData, Remboursement } from '@/mocks/remboursements';
import PaiementModal from './components/PaiementModal';

const statutConfig = {
  paye: { label: 'Payé', cls: 'bg-green-50 text-green-700', icon: 'ri-checkbox-circle-line' },
  en_retard: { label: 'En retard', cls: 'bg-red-50 text-red-700', icon: 'ri-alarm-warning-line' },
  a_venir: { label: 'À venir', cls: 'bg-gray-100 text-gray-600', icon: 'ri-time-line' },
};

export default function RemboursementsPage() {
  const [data, setData] = useState<Remboursement[]>(initialData);
  const [filterStatut, setFilterStatut] = useState<'tous' | 'paye' | 'en_retard' | 'a_venir'>('tous');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRmb, setSelectedRmb] = useState<Remboursement | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = data.filter((r) => {
    const matchSearch = `${r.clientPrenom} ${r.clientNom} ${r.creditId}`.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === 'tous' || r.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  const handlePaiement = (id: string, montant: number, date: string) => {
    setData((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const newReste = Math.max(0, r.resteAPayer - montant);
        return {
          ...r,
          montantPaye: montant,
          datePaiement: date,
          resteAPayer: newReste,
          statut: newReste === 0 ? 'paye' : r.statut,
        };
      })
    );
    setModalOpen(false);
    setSelectedRmb(null);
    showToast('Paiement enregistré avec succès');
  };

  const totalPaye = data.filter((r) => r.statut === 'paye').reduce((s, r) => s + r.montantPaye, 0);
  const totalRetard = data.filter((r) => r.statut === 'en_retard').reduce((s, r) => s + r.montantEcheance, 0);
  const totalAVenir = data.filter((r) => r.statut === 'a_venir').reduce((s, r) => s + r.montantEcheance, 0);

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl text-sm font-medium shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-checkbox-circle-line text-green-400" />
            </div>
            {toast}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 flex items-center justify-center bg-green-50 rounded-xl">
              <i className="ri-checkbox-circle-line text-green-500 text-xl" />
            </div>
            <p className="text-sm text-gray-500">Total encaissé</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{totalPaye.toLocaleString('fr-FR')} F</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 flex items-center justify-center bg-red-50 rounded-xl">
              <i className="ri-alarm-warning-line text-red-500 text-xl" />
            </div>
            <p className="text-sm text-gray-500">Impayés en retard</p>
          </div>
          <p className="text-2xl font-bold text-red-600">{totalRetard.toLocaleString('fr-FR')} F</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl">
              <i className="ri-time-line text-gray-500 text-xl" />
            </div>
            <p className="text-sm text-gray-500">À venir</p>
          </div>
          <p className="text-2xl font-bold text-gray-700">{totalAVenir.toLocaleString('fr-FR')} F</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
            <i className="ri-search-line text-gray-400 text-sm" />
          </div>
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:border-orange-400 transition-colors"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['tous', 'paye', 'en_retard', 'a_venir'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatut(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                filterStatut === s ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {s === 'tous' ? 'Tous' : s === 'paye' ? 'Payés' : s === 'en_retard' ? 'En retard' : 'À venir'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Crédit</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Échéance</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant dû</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reste à payer</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((r) => {
                const cfg = statutConfig[r.statut];
                return (
                  <tr key={r.id} className={`hover:bg-orange-50/20 transition-colors ${r.statut === 'en_retard' ? 'bg-red-50/20' : ''}`}>
                    <td className="px-5 py-3">
                      <p className="text-sm font-semibold text-gray-900">{r.clientPrenom} {r.clientNom}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{r.creditId}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">
                      {r.dateEcheance ? new Date(r.dateEcheance).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-900">
                      {r.montantEcheance.toLocaleString('fr-FR')} F
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-sm font-bold ${r.resteAPayer > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {r.resteAPayer.toLocaleString('fr-FR')} F
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full w-fit ${cfg.cls}`}>
                        <i className={`${cfg.icon} text-xs`} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {r.statut !== 'paye' && (
                        <button
                          onClick={() => { setSelectedRmb(r); setModalOpen(true); }}
                          className="flex items-center gap-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <i className="ri-money-dollar-circle-line" />
                          Payer
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
                    <div className="w-10 h-10 flex items-center justify-center mx-auto mb-3">
                      <i className="ri-money-dollar-circle-line text-3xl text-gray-200" />
                    </div>
                    Aucun remboursement trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PaiementModal
        open={modalOpen}
        remboursement={selectedRmb}
        onClose={() => { setModalOpen(false); setSelectedRmb(null); }}
        onSave={handlePaiement}
      />
    </div>
  );
}
