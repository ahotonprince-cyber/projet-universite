import { useState, useEffect, useMemo } from 'react';

interface Cotisation {
  membre_id: number;
  utilisateur_id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  groupe_id: number;
  groupe_nom: string;
  montant_part: number;
  periodicite: string;
  montant_total_paye: number;
  date_adhesion: string;
  membre_statut: string;
}

const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

export default function AdminCotisationsTontinePage() {
  const [cotisations, setCotisations] = useState<Cotisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterGroupe, setFilterGroupe] = useState('all');
  const [modal, setModal] = useState<Cotisation | null>(null);
  const [montant, setMontant] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tontines/cotisations', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const data = await res.json();
      setCotisations(data.cotisations || []);
    } catch { showToast('Erreur chargement', false); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const groupes = useMemo(() => {
    const seen = new Set<string>();
    return cotisations.filter(c => { if (seen.has(c.groupe_nom)) return false; seen.add(c.groupe_nom); return true; });
  }, [cotisations]);

  const filtered = useMemo(() => {
    let r = [...cotisations];
    if (filterGroupe !== 'all') r = r.filter(c => c.groupe_nom === filterGroupe);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(c => c.nom.toLowerCase().includes(q) || c.prenom.toLowerCase().includes(q) || c.telephone.includes(q));
    }
    return r;
  }, [cotisations, search, filterGroupe]);

  const handleEnregistrer = async () => {
    if (!modal || !montant || Number(montant) <= 0) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/tontines/cotisations/enregistrer', {
        method: 'POST',
        headers: authH(),
        body: JSON.stringify({ membre_id: modal.membre_id, montant: Number(montant) }),
      });
      if (!res.ok) throw new Error();
      showToast('Cotisation enregistrée');
      setModal(null);
      setMontant('');
      load();
    } catch { showToast('Erreur', false); }
    finally { setSubmitting(false); }
  };

  const totalCotise = filtered.reduce((s, c) => s + Number(c.montant_total_paye || 0), 0);

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg ${toast.ok ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-gray-900">Cotisations Tontine</h2>
        <p className="text-sm text-gray-500">Suivi et enregistrement des cotisations membres</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-400">Membres</p>
          <p className="text-2xl font-bold text-blue-600">{filtered.length}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-400">Groupes</p>
          <p className="text-2xl font-bold text-orange-600">{groupes.length}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-400">Total cotisé</p>
          <p className="text-xl font-bold text-green-600">{totalCotise.toLocaleString('fr-FR')} F</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input type="text" placeholder="Rechercher membre..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-orange-400" />
        </div>
        <select value={filterGroupe} onChange={e => setFilterGroupe(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400">
          <option value="all">Tous les groupes</option>
          {groupes.map(g => <option key={g.groupe_nom} value={g.groupe_nom}>{g.groupe_nom}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Aucune cotisation trouvée</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr>
                {['Membre', 'Groupe', 'Périodicité', 'Part', 'Total cotisé', 'Adhésion', 'Action'].map(h => (
                  <th key={h} className="text-left p-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.membre_id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <p className="text-sm font-medium">{c.prenom} {c.nom}</p>
                    <p className="text-xs text-gray-400">{c.telephone}</p>
                  </td>
                  <td className="p-3 text-sm">{c.groupe_nom}</td>
                  <td className="p-3">
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                      {c.periodicite}
                    </span>
                  </td>
                  <td className="p-3 text-sm font-medium">{Number(c.montant_part).toLocaleString('fr-FR')} F</td>
                  <td className="p-3 font-bold text-green-600">
                    {Number(c.montant_total_paye || 0).toLocaleString('fr-FR')} F
                  </td>
                  <td className="p-3 text-xs text-gray-400">
                    {new Date(c.date_adhesion).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="p-3">
                    <button onClick={() => { setModal(c); setMontant(String(c.montant_part)); }}
                      className="px-3 py-1 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600">
                      Enregistrer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal enregistrement */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900">Enregistrer une cotisation</h3>
            <div className="bg-gray-50 rounded-xl p-3 text-sm">
              <p className="font-medium">{modal.prenom} {modal.nom}</p>
              <p className="text-gray-500">{modal.groupe_nom} · {modal.periodicite}</p>
              <p className="text-gray-400 mt-1">Part : {Number(modal.montant_part).toLocaleString('fr-FR')} FCFA</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Montant (FCFA)</label>
              <input type="number" value={montant} onChange={e => setMontant(e.target.value)}
                className="w-full mt-1 border rounded-lg p-2 focus:outline-none focus:border-orange-400"
                min={1} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setModal(null)}
                className="flex-1 border py-2 rounded-lg text-sm hover:bg-gray-50">
                Annuler
              </button>
              <button onClick={handleEnregistrer} disabled={submitting || !montant || Number(montant) <= 0}
                className="flex-1 bg-orange-500 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-orange-600">
                {submitting ? 'Enregistrement...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
