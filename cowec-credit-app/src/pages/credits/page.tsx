import { useState, useEffect } from 'react';
import CreditModal from './components/CreditModal';

interface Credit {
  id: number;
  numero_credit: string;
  client_id: number;
  client_nom: string;
  client_prenom: string;
  montant_accorde: number;
  montant_rembourse: number;
  duree_mois: number;
  taux_annuel: number;
  statut: string;
  date_debut: string;
  date_fin: string;
  objet?: string;
  description?: string;
}

const statutConfig: Record<string, { label: string; cls: string; icon: string }> = {
  en_attente: { label: 'En attente', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: 'ri-time-line' },
  valide:     { label: 'Validé',     cls: 'bg-sky-50 text-sky-700 border-sky-200',           icon: 'ri-checkbox-circle-line' },
  rejete:     { label: 'Rejeté',     cls: 'bg-red-50 text-red-700 border-red-200',            icon: 'ri-close-circle-line' },
  actif:      { label: 'En cours',   cls: 'bg-green-50 text-green-700 border-green-200',      icon: 'ri-play-circle-line' },
  solde:      { label: 'Soldé',      cls: 'bg-gray-100 text-gray-600 border-gray-200',        icon: 'ri-check-double-line' },
};

export default function CreditsPage() {
  const [creditList, setCreditList]   = useState<Credit[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('tous');
  const [modalOpen, setModalOpen]     = useState(false);
  const [editCredit, setEditCredit]   = useState<Credit | null>(null);
  const [detailCredit, setDetailCredit] = useState<Credit | null>(null);
  const [confirmRejet, setConfirmRejet] = useState<{ id: number; nom: string } | null>(null);
  const [toast, setToast]             = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCredits = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch('/api/admin/credits', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setCreditList(data.credits || []);
    } catch {
      showToast('Erreur lors du chargement des crédits', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCredits(); }, []);

  const filtered = creditList.filter((c) => {
    const matchSearch = `${c.client_prenom} ${c.client_nom} ${c.numero_credit} ${c.objet || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === 'tous' || c.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  const handleSave = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const url = editCredit
        ? `/api/admin/credits/${editCredit.id}`
        : '/api/admin/credits';
      const method = editCredit ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          client_id: data.client_id,
          montant: data.montant,
          duree_mois: data.duree_mois,
          taux_annuel: data.taux_annuel,
          objet: data.objet,
          description: data.description || null
        })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Erreur sauvegarde');
      }
      showToast(editCredit ? 'Crédit modifié' : 'Demande soumise');
      setModalOpen(false);
      setEditCredit(null);
      fetchCredits();
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la sauvegarde', 'error');
    }
  };

  const handleStatutChange = async (id: number, newStatut: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/credits/${id}/statut`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ statut: newStatut })
      });
      if (!response.ok) throw new Error();
      const labels: Record<string, string> = {
        valide: 'Crédit validé ✅',
        rejete: 'Crédit rejeté',
        actif:  'Crédit décaissé ✅'
      };
      showToast(labels[newStatut] || 'Statut mis à jour', newStatut === 'rejete' ? 'error' : 'success');
      setConfirmRejet(null);
      fetchCredits();
    } catch {
      showToast('Erreur lors du changement de statut', 'error');
    }
  };

  const totalMontant = creditList.reduce((s, c) => s + Number(c.montant_accorde), 0);
  const enCours    = creditList.filter((c) => c.statut === 'actif').length;
  const enAttente  = creditList.filter((c) => c.statut === 'en_attente').length;

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
    </div>
  );

  return (
    <div className="space-y-5">

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg ${toast.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-500 text-white'}`}>
          <div className="flex items-center gap-2">
            <i className={toast.type === 'success' ? 'ri-checkbox-circle-line text-green-400' : 'ri-close-circle-line'} />
            {toast.msg}
          </div>
        </div>
      )}

      {/* ── Modal confirmation rejet ── */}
      {confirmRejet && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <i className="ri-close-circle-line text-red-500 text-xl" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Rejeter ce crédit ?</p>
                <p className="text-xs text-gray-500">{confirmRejet.nom}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">Cette action est irréversible. Le client sera notifié du rejet de sa demande.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmRejet(null)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => handleStatutChange(confirmRejet.id, 'rejete')}
                className="flex-1 bg-red-500 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-red-600 transition-colors cursor-pointer"
              >
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal détail crédit ── */}
      {detailCredit && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-gray-900">Détail du crédit</h3>
              <button onClick={() => setDetailCredit(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
                <i className="ri-close-line text-gray-500 text-xl" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Numéro & statut */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-gray-400">{detailCredit.numero_credit}</span>
                <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${statutConfig[detailCredit.statut]?.cls}`}>
                  <i className={`${statutConfig[detailCredit.statut]?.icon} text-xs`} />
                  {statutConfig[detailCredit.statut]?.label}
                </span>
              </div>
              {/* Client */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Client</p>
                <p className="font-bold text-gray-900">{detailCredit.client_prenom} {detailCredit.client_nom}</p>
              </div>
              {/* Montant */}
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                <p className="text-xs text-orange-500 mb-1">Montant accordé</p>
                <p className="text-2xl font-bold text-orange-600">{Number(detailCredit.montant_accorde).toLocaleString('fr-FR')} <span className="text-sm font-normal">FCFA</span></p>
              </div>
              {/* Détails */}
              <div className="grid grid-cols-2 gap-3">
                {(() => {
                  const dm = Number(detailCredit.montant_accorde);
                  const dt = Number(detailCredit.taux_annuel);
                  const dd = Number(detailCredit.duree_mois);
                  const dr = Number(detailCredit.montant_rembourse || 0);
                  const dTotalDu = Math.round(dm * (1 + dt / 100));
                  const dRestant = Math.max(0, dm - dr);
                  return [
                    { label: 'Taux annuel', value: `${dt}%` },
                    { label: 'Durée',       value: `${dd} mois` },
                    { label: 'Mensualité',  value: `${dd > 0 ? Math.round(dTotalDu / dd).toLocaleString('fr-FR') : 0} F` },
                    { label: 'Total dû',    value: `${dTotalDu.toLocaleString('fr-FR')} F` },
                    { label: 'Remboursé',   value: `${dr.toLocaleString('fr-FR')} F` },
                    { label: 'Restant',     value: dRestant > 0 ? `${dRestant.toLocaleString('fr-FR')} F` : 'Soldé ✓' },
                  ];
                })().map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="font-semibold text-gray-800 text-sm">{value}</p>
                  </div>
                ))}
              </div>
              {/* Objet */}
              {detailCredit.objet && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Objet</p>
                  <p className="text-sm text-gray-800">{detailCredit.objet}</p>
                </div>
              )}
              {/* Description */}
              {detailCredit.description && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Description</p>
                  <p className="text-sm text-gray-800">{detailCredit.description}</p>
                </div>
              )}
              {/* Actions rapides depuis détail */}
              {detailCredit.statut === 'en_attente' && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { handleStatutChange(detailCredit.id, 'valide'); setDetailCredit(null); }}
                    className="flex-1 bg-green-500 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-green-600 transition-colors cursor-pointer"
                  >
                    <i className="ri-checkbox-circle-line mr-1" /> Valider
                  </button>
                  <button
                    onClick={() => { setDetailCredit(null); setConfirmRejet({ id: detailCredit.id, nom: `${detailCredit.client_prenom} ${detailCredit.client_nom}` }); }}
                    className="flex-1 bg-red-500 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-red-600 transition-colors cursor-pointer"
                  >
                    <i className="ri-close-circle-line mr-1" /> Rejeter
                  </button>
                </div>
              )}
              {detailCredit.statut === 'valide' && (
                <button
                  onClick={() => { handleStatutChange(detailCredit.id, 'actif'); setDetailCredit(null); }}
                  className="w-full bg-orange-500 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-orange-600 transition-colors cursor-pointer"
                >
                  <i className="ri-send-plane-line mr-1" /> Décaisser
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total crédits',   value: creditList.length,                       cls: 'text-gray-900' },
          { label: 'En cours',        value: enCours,                                  cls: 'text-green-600' },
          { label: 'En attente',      value: enAttente,                                cls: 'text-yellow-600' },
          { label: 'FCFA décaissés',  value: `${(totalMontant / 1000000).toFixed(1)}M`, cls: 'text-orange-600' },
        ].map(({ label, value, cls }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className={`text-2xl font-bold ${cls}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Filtres & Actions ── */}
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
          {(['tous', 'en_attente', 'valide', 'actif', 'solde', 'rejete'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatut(s)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                filterStatut === s ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {s === 'tous' ? 'Tous' : statutConfig[s]?.label || s}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setEditCredit(null); setModalOpen(true); }}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-400 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:from-orange-600 hover:to-orange-500 transition-all cursor-pointer whitespace-nowrap"
        >
          <i className="ri-add-line" /> Nouvelle demande
        </button>
      </div>

      {/* ── Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((credit) => {
          const cfg = statutConfig[credit.statut] || statutConfig.en_attente;
          const montant      = Number(credit.montant_accorde);
          const rembourse    = Number(credit.montant_rembourse || 0);
          const taux         = Number(credit.taux_annuel);
          const duree        = Number(credit.duree_mois);
          const pctReel      = montant > 0 ? Math.round((rembourse / montant) * 100) : 0;
          const pctBar       = Math.min(100, pctReel);
          const restant      = Math.max(0, montant - rembourse);
          const totalDu      = Math.round(montant * (1 + taux / 100));
          const mensualite   = duree > 0 ? Math.round(totalDu / duree) : 0;

          return (
            <div key={credit.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:border-orange-200 transition-all duration-200 border-l-4 border-l-orange-400">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400 font-mono">{credit.numero_credit}</p>
                  <p className="text-base font-bold text-gray-900 mt-0.5">{credit.client_prenom} {credit.client_nom}</p>
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.cls}`}>
                  <i className={`${cfg.icon} text-xs`} />
                  {cfg.label}
                </span>
              </div>

              <p className="text-2xl font-bold text-orange-500 mb-3">
                {montant.toLocaleString('fr-FR')} <span className="text-sm font-normal text-gray-400">FCFA</span>
              </p>

              <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <i className="ri-percent-line text-orange-400" />
                  <span>Taux : <strong className="text-gray-700">{taux}%</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <i className="ri-calendar-line text-orange-400" />
                  <span>Durée : <strong className="text-gray-700">{duree} mois</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <i className="ri-money-dollar-circle-line text-orange-400" />
                  <span>Mensualité : <strong className="text-gray-700">{mensualite.toLocaleString('fr-FR')} F</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <i className="ri-briefcase-line text-orange-400" />
                  <span className="truncate">{credit.objet || 'Crédit'}</span>
                </div>
              </div>

              {/* Barre de progression */}
              {(credit.statut === 'actif' || credit.statut === 'solde') && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Remboursé</span>
                    <span className={pctReel >= 100 ? 'text-green-600 font-semibold' : ''}>{pctReel}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pctReel >= 100 ? 'bg-green-500' : 'bg-gradient-to-r from-orange-400 to-orange-500'}`}
                      style={{ width: `${pctBar}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-green-600 font-medium">{rembourse.toLocaleString('fr-FR')} F payé</span>
                    {restant > 0
                      ? <span className="text-gray-400">{restant.toLocaleString('fr-FR')} F restant</span>
                      : <span className="text-green-600 font-medium">Remboursé ✓</span>
                    }
                  </div>
                </div>
              )}

              {/* ── Actions ── */}
              <div className="flex gap-2 pt-3 border-t border-gray-50">
                {credit.statut === 'en_attente' && (
                  <>
                    <button
                      onClick={() => handleStatutChange(credit.id, 'valide')}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-green-50 text-green-700 rounded-lg py-2 text-xs font-medium hover:bg-green-100 transition-colors cursor-pointer"
                    >
                      <i className="ri-checkbox-circle-line" /> Valider
                    </button>
                    <button
                      onClick={() => setConfirmRejet({ id: credit.id, nom: `${credit.client_prenom} ${credit.client_nom}` })}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 text-red-700 rounded-lg py-2 text-xs font-medium hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      <i className="ri-close-circle-line" /> Rejeter
                    </button>
                  </>
                )}
                {credit.statut === 'valide' && (
                  <button
                    onClick={() => handleStatutChange(credit.id, 'actif')}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-orange-50 text-orange-700 rounded-lg py-2 text-xs font-medium hover:bg-orange-100 transition-colors cursor-pointer"
                  >
                    <i className="ri-send-plane-line" /> Décaisser
                  </button>
                )}

                {/* ✅ Bouton Détails — toujours visible */}
                <button
                  onClick={() => setDetailCredit(credit)}
                  className="flex items-center justify-center gap-1 bg-gray-50 text-gray-600 rounded-lg px-3 py-2 text-xs font-medium hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <i className="ri-eye-line" /> Détails
                </button>

                {/* ✅ Bouton Modifier — toujours visible */}
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
            <i className="ri-bank-card-line text-4xl text-gray-200 mb-3 block" />
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