import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientCredits, CreditClient } from '@/mocks/clientCredits';

const statutLabels: Record<string, { label: string; color: string }> = {
  en_cours: { label: 'En cours', color: 'bg-green-100 text-green-700' },
  en_attente: { label: 'En attente', color: 'bg-orange-100 text-orange-700' },
  solde: { label: 'Soldé', color: 'bg-gray-100 text-gray-600' },
  rejete: { label: 'Rejeté', color: 'bg-red-100 text-red-600' },
  valide: { label: 'Validé', color: 'bg-blue-100 text-blue-700' },
};

export default function MesCreditsPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<CreditClient | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Mes crédits</h2>
          <p className="text-sm text-gray-500">{clientCredits.length} crédit(s) au total</p>
        </div>
        <button
          onClick={() => navigate('/espace-client/demande-credit')}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-lg text-sm font-semibold hover:from-orange-600 hover:to-orange-500 transition-all cursor-pointer whitespace-nowrap"
        >
          <i className="ri-add-line" /> Nouveau crédit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {clientCredits.map((credit) => {
          const s = statutLabels[credit.statut] || { label: credit.statut, color: 'bg-gray-100 text-gray-600' };
          return (
            <div key={credit.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:border-orange-200 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-gray-900">{credit.objet}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{credit.id} • Durée : {credit.duree} mois</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${s.color}`}>{s.label}</span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400 mb-0.5">Montant</p>
                  <p className="text-sm font-bold text-gray-800">{(credit.montant / 1000).toFixed(0)}K</p>
                </div>
                <div className="text-center p-2 bg-orange-50 rounded-lg">
                  <p className="text-xs text-gray-400 mb-0.5">Mensualité</p>
                  <p className="text-sm font-bold text-orange-600">{(credit.mensualite / 1000).toFixed(1)}K</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400 mb-0.5">Taux</p>
                  <p className="text-sm font-bold text-gray-800">{credit.tauxInteret}%</p>
                </div>
              </div>

              {credit.statut === 'en_cours' && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progression</span>
                    <span className="font-semibold">{credit.progression}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full" style={{ width: `${credit.progression}%` }} />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-400">Remboursé : {(credit.montantRembourse / 1000).toFixed(0)}K FCFA</span>
                    <span className="text-orange-600 font-medium">Reste : {(credit.resteAPayer / 1000).toFixed(0)}K FCFA</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setSelected(credit)}
                  className="flex-1 py-2 border border-orange-200 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-eye-line mr-1" /> Détails
                </button>
                {credit.statut === 'en_cours' && (
                  <button
                    onClick={() => navigate('/espace-client/remboursements')}
                    className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-orange-500 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-money-dollar-circle-line mr-1" /> Payer
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">Détails du crédit</h3>
              <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
                <i className="ri-close-line text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                ['Référence', selected.id],
                ['Objet', selected.objet],
                ['Montant', `${selected.montant.toLocaleString()} FCFA`],
                ['Taux d\'intérêt', `${selected.tauxInteret}%`],
                ['Durée', `${selected.duree} mois`],
                ['Mensualité', `${selected.mensualite.toLocaleString()} FCFA`],
                ['Total intérêts', `${selected.totalInterets.toLocaleString()} FCFA`],
                ['Total à rembourser', `${selected.totalARembourser.toLocaleString()} FCFA`],
                ['Montant remboursé', `${selected.montantRembourse.toLocaleString()} FCFA`],
                ['Reste à payer', `${selected.resteAPayer.toLocaleString()} FCFA`],
                ['Date de début', selected.dateDebut || '—'],
                ['Date de fin', selected.dateFin || '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-semibold text-gray-800">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
