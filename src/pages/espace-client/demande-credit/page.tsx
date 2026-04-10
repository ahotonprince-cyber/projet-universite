import { useState } from 'react';

export default function DemandeCreditPage() {
  const [form, setForm] = useState({ montant: 500000, duree: 12, objet: '', description: '' });
  const [submitted, setSubmitted] = useState(false);

  const taux = 11;
  const totalInterets = Math.round((form.montant * taux / 100) * (form.duree / 12));
  const totalARembourser = form.montant + totalInterets;
  const mensualite = Math.round(totalARembourser / form.duree);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.objet) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-check-double-line text-green-500 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Demande envoyée !</h2>
          <p className="text-gray-500 mb-6">Votre demande de crédit de <strong>{form.montant.toLocaleString()} FCFA</strong> a été soumise avec succès. Notre équipe vous contactera sous 48h.</p>
          <button onClick={() => setSubmitted(false)} className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-lg font-semibold cursor-pointer whitespace-nowrap hover:from-orange-600 hover:to-orange-500 transition-all">
            Nouvelle demande
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Demande de crédit</h2>
        <p className="text-sm text-gray-500">Simulez et soumettez votre demande de prêt</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-3 bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-3">Informations du prêt</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Montant souhaité (FCFA)</label>
            <input
              type="range" min={50000} max={5000000} step={50000}
              value={form.montant}
              onChange={(e) => setForm({ ...form, montant: Number(e.target.value) })}
              className="w-full accent-orange-500 mb-2"
            />
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>50 000</span><span>5 000 000</span>
            </div>
            <div className="text-center py-2 bg-orange-50 rounded-lg">
              <span className="text-xl font-bold text-orange-600">{form.montant.toLocaleString()} FCFA</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Durée de remboursement</label>
            <div className="grid grid-cols-4 gap-2">
              {[6, 12, 18, 24].map((d) => (
                <button key={d} type="button"
                  onClick={() => setForm({ ...form, duree: d })}
                  className={`py-2 rounded-lg text-sm font-semibold border transition-all cursor-pointer whitespace-nowrap ${form.duree === d ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 text-gray-600 hover:border-orange-300'}`}>
                  {d} mois
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Objet du crédit *</label>
            <select
              value={form.objet}
              onChange={(e) => setForm({ ...form, objet: e.target.value })}
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">Sélectionner l'objet...</option>
              <option>Fonds de roulement</option>
              <option>Achat d'équipement</option>
              <option>Extension d'activité</option>
              <option>Agriculture / Élevage</option>
              <option>Immobilier</option>
              <option>Éducation</option>
              <option>Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (optionnel)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              maxLength={500}
              placeholder="Décrivez votre projet..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>

          <button type="submit" className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-500 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2">
            <i className="ri-send-plane-line" /> Soumettre la demande
          </button>
        </form>

        {/* Simulation */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <i className="ri-calculator-line" /> Simulation
            </h3>
            <div className="space-y-3">
              {[
                ['Montant emprunté', `${form.montant.toLocaleString()} FCFA`],
                ['Taux d\'intérêt', `${taux}% / an`],
                ['Durée', `${form.duree} mois`],
                ['Total intérêts', `${totalInterets.toLocaleString()} FCFA`],
                ['Total à rembourser', `${totalARembourser.toLocaleString()} FCFA`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-orange-100">{label}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
              <div className="border-t border-orange-400 pt-3 flex justify-between">
                <span className="text-orange-100 font-medium">Mensualité</span>
                <span className="text-xl font-bold">{mensualite.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <i className="ri-shield-check-line text-green-500" /> Conditions requises
            </h3>
            <ul className="space-y-2">
              {['Être client actif COWEC', 'CNI valide', 'Justificatif de revenus', 'Pas de crédit en retard', 'Score crédit ≥ 50/100'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-check-line text-green-500 text-xs" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-orange-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="ri-information-line text-orange-500" />
              </div>
              <p className="text-xs text-orange-700">Votre demande sera examinée sous <strong>48 heures ouvrables</strong>. Vous recevrez une notification dès qu'une décision sera prise.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
