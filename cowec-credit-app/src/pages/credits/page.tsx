import { useState } from 'react';
import { credits as initialCredits, Credit, CreditStatut } from '@/mocks/credits';
import CreditModal from './components/CreditModal';

const statutConfig: Record<CreditStatut, { label: string; cls: string; icon: string }> = {
  en_attente: { label: 'En attente', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: 'ri-time-line' },
  valide: { label: 'Validé', cls: 'bg-sky-50 text-sky-700 border-sky-200', icon: 'ri-checkbox-circle-line' },
  rejete: { label: 'Rejeté', cls: 'bg-red-50 text-red-700 border-red-200', icon: 'ri-close-circle-line' },
  en_cours: { label: 'En cours', cls: 'bg-green-50 text-green-700 border-green-200', icon: 'ri-play-circle-line' },
  solde: { label: 'Soldé', cls: 'bg-gray-100 text-gray-600 border-gray-200', icon: 'ri-check-double-line' },
};

export default function CreditsPage() {
  const [creditList, setCreditList] = useState<Credit[]>(initialCredits);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState<CreditStatut | 'tous'>('tous');
  const [modalOpen, setModalOpen] = useState(false);
  const [editCredit, setEditCredit] = useState<Credit | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = creditList.filter((c) => {
    const matchSearch = `${c.clientPrenom} ${c.clientNom} ${c.id} ${c.objet}`.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === 'tous' || c.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  const handleSave = (data: Partial<Credit>) => {
    if (editCredit) {
      setCreditList((prev) => prev.map((c) => (c.id === editCredit.id ? { ...c, ...data } : c)));
      showToast('Crédit modifié avec succès');
    } else {
      const newCredit: Credit = {
        id: `CRD${String(creditList.length + 1).padStart(3, '0')}`,
        ...data,
      } as Credit;
      setCreditList((prev) => [newCredit, ...prev]);
      showToast('Demande de crédit soumise');
    }
    setModalOpen(false);
    setEditCredit(null);
  };

  const handleStatutChange = (id: string, newStatut: CreditStatut) => {
    setCreditList((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const today = new Date().toISOString().split('T')[0];
        const dateFin = newStatut === 'en_cours'
          ? new Date(Date.now() + c.duree * 30 * 24 * 3600 * 1000).toISOString().split('T')[0]
          : c.dateFin;
        return {
          ...c,
          statut: newStatut,
          dateDebut: newStatut === 'en_cours' ? today : c.dateDebut,
          dateFin,
        };
      })
    );
    const labels: Record<string, string> = { valide: 'Crédit validé', rejete: 'Crédit rejeté', en_cours: 'Crédit décaissé' };
    showToast(labels[newStatut] || 'Statut mis à jour', newStatut === 'rejete' ? 'error' : 'success');
  };

  const totalMontant = creditList.reduce((s, c) => s + c.montant, 0);
  const enCours = creditList.filter((c) => c.statut === 'en_cours').length;
  const enAttente = creditList.filter((c) => c.statut === 'en_attente').length;

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg ${toast.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-500 text-white'}`}>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className={toast.type === 'success' ? 'ri-checkbox-circle-line text-green-400' : 'ri-close-circle-line text-white'} />
            </div>
            {toast.msg}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{creditList.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total crédits</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{enCours}</p>
          <p className="text-xs text-gray-500 mt-1">En cours</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{enAttente}</p>
          <p className="text-xs text-gray-500 mt-1">En attente</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-xl font-bold text-orange-600">{(totalMontant / 1000000).toFixed(1)}M</p>
          <p className="text-xs text-gray-500 mt-1">FCFA décaissés</p>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
            <i className="ri-search-line text-gray-400 text-sm" />
          </div>
          <input
            type="text"
            placeholder="Rechercher un crédit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:border-orange-400 transition-colors"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 flex-wrap">
          {(['tous', 'en_attente', 'valide', 'en_cours', 'solde', 'rejete'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatut(s)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                filterStatut === s ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {s === 'tous' ? 'Tous' : statutConfig[s as CreditStatut]?.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setEditCredit(null); setModalOpen(true); }}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-400 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:from-orange-600 hover:to-orange-500 transition-all cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-add-line" />
          </div>
          Nouvelle demande
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((credit) => {
          const cfg = statutConfig[credit.statut];
          const pct = credit.montant > 0 ? Math.round((credit.montantRembourse / credit.montant) * 100) : 0;
          const totalDu = Math.round(credit.montant * (1 + credit.tauxInteret / 100));
          const mensualite = credit.duree > 0 ? Math.round(totalDu / credit.duree) : 0;

          return (
            <div key={credit.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:border-orange-200 transition-all duration-200 border-l-4 border-l-orange-400">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400 font-mono">{credit.id}</p>
                  <p className="text-base font-bold text-gray-900 mt-0.5">{credit.clientPrenom} {credit.clientNom}</p>
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.cls}`}>
                  <i className={`${cfg.icon} text-xs`} />
                  {cfg.label}
                </span>
              </div>

              <p className="text-2xl font-bold text-orange-500 mb-3">
                {credit.montant.toLocaleString('fr-FR')} <span className="text-sm font-normal text-gray-400">FCFA</span>
              </p>

              <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-percent-line text-orange-400" />
                  </div>
                  <span>Taux : <strong className="text-gray-700">{credit.tauxInteret}%</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-calendar-line text-orange-400" />
                  </div>
                  <span>Durée : <strong className="text-gray-700">{credit.duree} mois</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-money-dollar-circle-line text-orange-400" />
                  </div>
                  <span>Mensualité : <strong className="text-gray-700">{mensualite.toLocaleString('fr-FR')} F</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-briefcase-line text-orange-400" />
                  </div>
                  <span className="truncate">{credit.objet}</span>
                </div>
              </div>

              {/* Progress */}
              {(credit.statut === 'en_cours' || credit.statut === 'solde') && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Remboursé</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-green-600 font-medium">{credit.montantRembourse.toLocaleString('fr-FR')} F payé</span>
                    <span className="text-gray-400">{(credit.montant - credit.montantRembourse).toLocaleString('fr-FR')} F restant</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-50">
                {credit.statut === 'en_attente' && (
                  <>
                    <button
                      onClick={() => handleStatutChange(credit.id, 'valide')}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-green-50 text-green-700 rounded-lg py-2 text-xs font-medium hover:bg-green-100 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-checkbox-circle-line" /> Valider
                    </button>
                    <button
                      onClick={() => handleStatutChange(credit.id, 'rejete')}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 text-red-700 rounded-lg py-2 text-xs font-medium hover:bg-red-100 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-close-circle-line" /> Rejeter
                    </button>
                  </>
                )}
                {credit.statut === 'valide' && (
                  <button
                    onClick={() => handleStatutChange(credit.id, 'en_cours')}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-orange-50 text-orange-700 rounded-lg py-2 text-xs font-medium hover:bg-orange-100 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-send-plane-line" /> Décaisser
                  </button>
                )}
                <button
                  onClick={() => { setEditCredit(credit); setModalOpen(true); }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-orange-50 text-gray-400 hover:text-orange-500 transition-colors cursor-pointer flex-shrink-0"
                >
                  <i className="ri-edit-line text-base" />
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-3 py-16 text-center text-gray-400">
            <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <i className="ri-bank-card-line text-4xl text-gray-200" />
            </div>
            <p className="text-sm">Aucun crédit trouvé</p>
          </div>
        )}
      </div>

      <CreditModal
        open={modalOpen}
        credit={editCredit}
        onClose={() => { setModalOpen(false); setEditCredit(null); }}
        onSave={handleSave}
      />
    </div>
  );
}
