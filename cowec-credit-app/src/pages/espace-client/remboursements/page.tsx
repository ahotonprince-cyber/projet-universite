import { useState } from 'react';
import { echeancesClient } from '@/mocks/clientCredits';

export default function RemboursementsClientPage() {
  const [payModal, setPayModal] = useState<string | null>(null);
  const [method, setMethod] = useState('mtn');
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState<string[]>([]);

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      if (payModal) setPaid((p) => [...p, payModal]);
      setPayModal(null);
    }, 1500);
  };

  const statutStyle: Record<string, string> = {
    paye: 'bg-green-100 text-green-700',
    en_retard: 'bg-red-100 text-red-600',
    a_venir: 'bg-orange-100 text-orange-700',
  };
  const statutLabel: Record<string, string> = { paye: 'Payé', en_retard: 'En retard', a_venir: 'À venir' };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Mes remboursements</h2>
        <p className="text-sm text-gray-500">Historique et échéances de paiement</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Payées', count: echeancesClient.filter(e => e.statut === 'paye').length, color: 'text-green-600', bg: 'bg-green-50', icon: 'ri-check-double-line' },
          { label: 'En retard', count: echeancesClient.filter(e => e.statut === 'en_retard').length, color: 'text-red-600', bg: 'bg-red-50', icon: 'ri-alarm-warning-line' },
          { label: 'À venir', count: echeancesClient.filter(e => e.statut === 'a_venir').length, color: 'text-orange-600', bg: 'bg-orange-50', icon: 'ri-calendar-line' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
            <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center`}>
              <i className={`${s.icon} ${s.color} text-lg`} />
            </div>
            <div>
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Toutes les échéances</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Crédit', 'Échéance', 'Montant', 'Date paiement', 'Statut', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {echeancesClient.map((e) => {
                const isPaid = paid.includes(e.id) || e.statut === 'paye';
                const statut = isPaid ? 'paye' : e.statut;
                return (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800 truncate max-w-[160px]">{e.creditObjet}</p>
                      <p className="text-xs text-gray-400">{e.creditId}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{e.dateEcheance}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800 whitespace-nowrap">{e.montant.toLocaleString()} FCFA</td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{e.datePaiement || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${statutStyle[statut]}`}>
                        {statutLabel[statut]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {!isPaid && (e.statut === 'a_venir' || e.statut === 'en_retard') && (
                        <button
                          onClick={() => setPayModal(e.id)}
                          className="px-3 py-1.5 bg-orange-500 text-white text-xs rounded-lg font-medium hover:bg-orange-600 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Payer
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {payModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setPayModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 text-lg mb-4">Effectuer un paiement</h3>
            <div className="p-3 bg-orange-50 rounded-lg mb-4 text-center">
              <p className="text-xs text-gray-500">Montant à payer</p>
              <p className="text-2xl font-bold text-orange-600">
                {echeancesClient.find(e => e.id === payModal)?.montant.toLocaleString()} FCFA
              </p>
            </div>
            <p className="text-sm font-medium text-gray-700 mb-3">Choisir le mode de paiement</p>
            <div className="space-y-2 mb-5">
              {[
                { id: 'mtn', label: 'MTN Mobile Money', icon: 'ri-smartphone-line', color: 'text-yellow-600' },
                { id: 'moov', label: 'Moov Money', icon: 'ri-smartphone-line', color: 'text-orange-500' },
                { id: 'wave', label: 'Wave', icon: 'ri-bank-card-line', color: 'text-blue-500' },
              ].map((m) => (
                <label key={m.id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${method === m.id ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-orange-200'}`}>
                  <input type="radio" name="method" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} className="accent-orange-500" />
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className={`${m.icon} ${m.color}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{m.label}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPayModal(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap hover:bg-gray-50">Annuler</button>
              <button onClick={handlePay} disabled={paying} className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-lg text-sm font-semibold cursor-pointer whitespace-nowrap hover:from-orange-600 hover:to-orange-500 disabled:opacity-70 flex items-center justify-center gap-2">
                {paying ? <><i className="ri-loader-4-line animate-spin" /> Traitement...</> : <><i className="ri-check-line" /> Confirmer</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
