import { useState, useEffect, useMemo } from 'react';

interface Echeance {
  id: number;
  credit_id: number;
  credit_objet: string;
  numero_credit: string;
  date_echeance: string;
  montant_echeance: number;
  date_paiement?: string;
  statut: 'paye' | 'en_retard' | 'a_venir';
}

export default function RemboursementsClientPage() {
  const [echeances, setEcheances] = useState<Echeance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [payModal, setPayModal] = useState<number | null>(null);
  const [method, setMethod] = useState('mtn');
  const [paying, setPaying] = useState(false);

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [filterCredit, setFilterCredit] = useState<string>('all');
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  // Liste unique des crédits pour le dropdown
  const credits = useMemo(() => {
    const seen = new Set<string>();
    return echeances.filter(e => {
      if (seen.has(e.numero_credit)) return false;
      seen.add(e.numero_credit);
      return true;
    });
  }, [echeances]);

  // Echeances filtrées
  const filtered = useMemo(() => {
    let result = [...echeances];
    if (filterStatut !== 'all') result = result.filter(e => e.statut === filterStatut);
    if (filterCredit !== 'all') result = result.filter(e => e.numero_credit === filterCredit);
    return result;
  }, [echeances, filterStatut, filterCredit]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Reset page quand les filtres changent
  const handleFilterStatut = (s: string) => { setFilterStatut(s); setPage(1); };
  const handleFilterCredit = (c: string) => { setFilterCredit(c); setPage(1); };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchEcheances = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/client/echeances', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Erreur chargement échéances');

      const data = await response.json();
      setEcheances(data.echeances || []);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger vos échéances');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEcheances();
  }, []);

  // ESC pour fermer modal
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPayModal(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handlePay = async () => {
    if (!payModal) return;

    setPaying(true);

    try {
      const token = localStorage.getItem('token');
      const echeance = echeances.find(e => e.id === payModal);

      if (!echeance) throw new Error('Échéance introuvable');

      const response = await fetch('/api/client/paiement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          echeance_id: payModal,
          montant: echeance.montant_echeance,
          mode_paiement:
            method === 'mtn'
              ? 'mtn_money'
              : method === 'moov'
              ? 'moov_money'
              : 'wave',
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Erreur paiement');

      showToast('Paiement effectué avec succès', 'success');
      setPayModal(null);
      fetchEcheances();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setPaying(false);
    }
  };

  const statutStyle: Record<string, string> = {
    paye: 'bg-green-100 text-green-700',
    en_retard: 'bg-red-100 text-red-600',
    a_venir: 'bg-orange-100 text-orange-700',
  };

  const statutLabel: Record<string, string> = {
    paye: 'Payé',
    en_retard: 'En retard',
    a_venir: 'À venir',
  };

  const stats = {
    paye: echeances.filter(e => e.statut === 'paye').length,
    en_retard: echeances.filter(e => e.statut === 'en_retard').length,
    a_venir: echeances.filter(e => e.statut === 'a_venir').length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* TOAST */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl text-white shadow-lg text-sm font-medium ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-gray-900">Mes remboursements</h2>
        <p className="text-sm text-gray-500">Historique et échéances</p>
      </div>

      {/* STATS CLIQUABLES */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { key: 'paye',      label: 'Payées',     count: stats.paye,      color: 'text-green-600',  ring: 'ring-green-400'  },
          { key: 'en_retard', label: 'En retard',  count: stats.en_retard, color: 'text-red-600',    ring: 'ring-red-400'    },
          { key: 'a_venir',   label: 'À venir',    count: stats.a_venir,   color: 'text-orange-600', ring: 'ring-orange-400' },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => handleFilterStatut(filterStatut === s.key ? 'all' : s.key)}
            className={`bg-white p-4 rounded-xl border text-left transition ${
              filterStatut === s.key ? `ring-2 ${s.ring}` : 'hover:bg-gray-50'
            }`}
          >
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
          </button>
        ))}
      </div>

      {/* FILTRES */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={filterCredit}
          onChange={e => handleFilterCredit(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
        >
          <option value="all">Tous les crédits</option>
          {credits.map(c => (
            <option key={c.numero_credit} value={c.numero_credit}>
              {c.credit_objet} — {c.numero_credit}
            </option>
          ))}
        </select>

        {(filterStatut !== 'all' || filterCredit !== 'all') && (
          <button
            onClick={() => { handleFilterStatut('all'); handleFilterCredit('all'); }}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            <i className="ri-close-circle-line" /> Réinitialiser
          </button>
        )}

        <span className="ml-auto text-xs text-gray-400">
          {filtered.length} échéance{filtered.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {['Crédit', 'Échéance', 'Montant', 'Statut', 'Action'].map(h => (
                <th key={h} className="text-left text-xs p-3 text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400 text-sm">
                  Aucune échéance trouvée
                </td>
              </tr>
            ) : paginated.map(e => (
              <tr key={e.id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <p className="text-sm font-medium">{e.credit_objet}</p>
                  <p className="text-xs text-gray-400">{e.numero_credit}</p>
                </td>

                <td className="p-3 text-sm">
                  {new Date(e.date_echeance).toLocaleDateString('fr-FR')}
                </td>

                <td className="p-3 font-semibold">
                  {(e.montant_echeance || 0).toLocaleString()} FCFA
                </td>

                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded ${statutStyle[e.statut]}`}>
                    {statutLabel[e.statut]}
                  </span>
                </td>

                <td className="p-3">
                  {e.statut !== 'paye' && (
                    <button
                      onClick={() => setPayModal(e.id)}
                      className="px-3 py-1 bg-orange-500 text-white text-xs rounded-lg"
                    >
                      Payer
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40 hover:bg-white transition"
            >
              ← Précédent
            </button>

            <span className="text-xs text-gray-500">
              Page {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40 hover:bg-white transition"
            >
              Suivant →
            </button>
          </div>
        )}
      </div>

      {/* MODAL */}
      {payModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setPayModal(null)}
        >
          <div
            className="bg-white p-6 rounded-xl w-full max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-bold mb-4">Paiement</h3>

            <p className="mb-3 text-sm">
              Montant :{' '}
              <strong>
                {(echeances.find(e => e.id === payModal)?.montant_echeance || 0).toLocaleString()} FCFA
              </strong>
            </p>

            <div className="space-y-2 mb-4">
              {['mtn', 'moov', 'wave'].map(m => (
                <label key={m} className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={method === m}
                    onChange={() => setMethod(m)}
                  />
                  {m.toUpperCase()}
                </label>
              ))}
            </div>

            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full bg-orange-500 text-white py-2 rounded-lg"
            >
              {paying ? 'Traitement...' : 'Confirmer'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}