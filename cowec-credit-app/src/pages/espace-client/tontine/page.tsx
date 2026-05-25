import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface GroupeTontine {
  id: number;
  nom: string;
  montant_part: number;
  periodicite: string;
  statut: string;
  nombre_membres: number;
  date_creation: string;
  mon_statut?: string | null;
  mon_total_paye?: number;
}

interface CycleTontine {
  id: number;
  nom: string;
  groupe_nom: string;
  montant_part: number;
  periodicite: string;
  nombre_membres: number;
  statut: string;
  cycle_actuel: number;
  date_adhesion: string;
  montant_total_paye: number;
  ordre_passage: number | null;
  a_recu: number;
  membre_id: number;
}

interface Cotisation {
  id: number;
  groupe_nom: string;
  montant_part: number;
  periodicite: string;
  nombre_membres: number;
  statut: string;
  cycle_actuel: number;
  date_adhesion: string;
  montant_total_paye: number;
  ordre_passage: number | null;
  a_recu: number;
}

type Tab = 'groupes' | 'mes-groupes' | 'cotisations';

interface PayModal {
  groupeId: number;
  groupeNom: string;
  montantPart: number;
}

export default function TontinePage() {
  const navigate = useNavigate();

  const [groupes, setGroupes] = useState<GroupeTontine[]>([]);
  const [cycles, setCycles] = useState<CycleTontine[]>([]);
  const [mesCotisations, setMesCotisations] = useState<Cotisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('groupes');
  const [search, setSearch] = useState('');
  const [adheringId, setAdheringId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal paiement cotisation
  const [payModal, setPayModal] = useState<PayModal | null>(null);
  const [payOperateur, setPayOperateur] = useState('mtn');
  const [payTelephone, setPayTelephone] = useState('');
  const [payMontant, setPayMontant] = useState('');
  const [paying, setPaying] = useState(false);

  const token = localStorage.getItem('token');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTontine = async () => {
    try {
      if (!token) { navigate('/client/connexion'); return; }

      const [groupesRes, cyclesRes, cotisationsRes] = await Promise.all([
        fetch('/api/client/tontine/groupes', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/client/tontine/cycles', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/client/tontine/mes-cotisations', {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);

      const groupesData = groupesRes.ok ? await groupesRes.json() : { groupes: [] };
      const cyclesData = cyclesRes.ok ? await cyclesRes.json() : { cycles: [] };
      const cotisationsData = cotisationsRes.ok ? await cotisationsRes.json() : { cotisations: [] };

      setGroupes(groupesData.groupes || []);
      setCycles(cyclesData.cycles || []);
      setMesCotisations(cotisationsData.cotisations || []);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger la tontine');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTontine(); }, []);

  // ── Rejoindre un groupe ──────────────────────────────────────────
  const handleAdherer = async (groupeId: number) => {
    setAdheringId(groupeId);
    try {
      const response = await fetch(
        `/api/client/tontine/${groupeId}/adhesion`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur adhésion');
      showToast('✅ Adhésion réussie !');
      fetchTontine(); // Rafraîchir
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l\'adhésion', 'error');
    } finally {
      setAdheringId(null);
    }
  };

  const openPayModal = (groupeId: number, groupeNom: string, montantPart: number) => {
    setPayModal({ groupeId, groupeNom, montantPart });
    setPayMontant(String(montantPart));
    setPayOperateur('mtn');
    setPayTelephone('');
  };

  const handlePayer = async () => {
    if (!payModal) return;
    const montant = parseFloat(payMontant);
    if (!payTelephone || montant <= 0) return;
    setPaying(true);
    try {
      const res = await fetch(`/api/client/tontine/${payModal.groupeId}/payer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ operateur: payOperateur, telephone: payTelephone, montant })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      showToast(data.message || '✅ Cotisation payée !');
      setPayModal(null);
      fetchTontine();
    } catch (err: any) {
      showToast(err.message || 'Erreur paiement', 'error');
    } finally {
      setPaying(false);
    }
  };

  const stats = useMemo(() => ({
    totalCotise: mesCotisations.reduce((acc, c) => acc + Number(c.montant_total_paye), 0),
    groupesRejoints: cycles.length,
    groupesDisponibles: groupes.filter(g => !g.mon_statut).length,
  }), [mesCotisations, groupes, cycles]);

  const groupesFiltres = groupes.filter(g =>
    g.nom.toLowerCase().includes(search.toLowerCase())
  );

  const periodiciteLabel = (p: string) =>
    p === 'hebdo' ? 'Hebdomadaire' : p === 'mensuel' ? 'Mensuel' : p;

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <i className="ri-error-warning-line text-red-400 text-3xl block mb-2" />
        <p className="text-red-600">{error}</p>
        <button onClick={fetchTontine} className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg text-sm">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl text-white shadow-lg text-sm ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.message}
        </div>
      )}

      {/* HEADER */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Ma tontine</h2>
        <p className="text-sm text-gray-500">Groupes, cycles et cotisations</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total cotisé',       value: `${stats.totalCotise.toLocaleString('fr-FR')} FCFA`, color: 'text-green-600',  bg: 'bg-green-50',  icon: 'ri-money-dollar-circle-line' },
          { label: 'Groupes rejoints',   value: stats.groupesRejoints,                               color: 'text-blue-600',   bg: 'bg-blue-50',   icon: 'ri-group-line' },
          { label: 'Groupes disponibles',value: stats.groupesDisponibles,                            color: 'text-orange-600', bg: 'bg-orange-50', icon: 'ri-door-open-line' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} p-4 rounded-xl border`}>
            <div className="flex items-center gap-2 mb-1">
              <i className={`${s.icon} ${s.color} text-sm`} />
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
            <p className={`font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
        {[
          { key: 'groupes',    label: 'Tous les groupes', icon: 'ri-community-line' },
          { key: 'mes-groupes', label: 'Mes groupes',     icon: 'ri-user-heart-line' },
          { key: 'cotisations', label: 'Mes cotisations', icon: 'ri-money-dollar-box-line' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as Tab)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
              tab === t.key ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className={t.icon} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TOUS LES GROUPES ── */}
      {tab === 'groupes' && (
        <div className="space-y-4">
          <input
            placeholder="🔍 Rechercher un groupe..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-orange-400 transition"
          />

          {groupesFiltres.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <i className="ri-group-line text-4xl text-gray-300 block mb-2" />
              <p className="text-sm">Aucun groupe disponible</p>
            </div>
          ) : (
            groupesFiltres.map((g) => (
              <div key={g.id} className="bg-white p-4 rounded-xl border hover:shadow-sm transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="ri-group-line text-orange-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{g.nom}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {Number(g.montant_part).toLocaleString('fr-FR')} FCFA / {periodiciteLabel(g.periodicite)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {g.nombre_membres} membre{g.nombre_membres > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      g.statut === 'actif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {g.statut === 'actif' ? 'Actif' : 'Clôturé'}
                    </span>

                    {/* Bouton rejoindre */}
                    {g.mon_statut ? (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        ✅ Membre
                      </span>
                    ) : g.statut === 'actif' ? (
                      <button
                        onClick={() => handleAdherer(g.id)}
                        disabled={adheringId === g.id}
                        className="text-xs px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 flex items-center gap-1"
                      >
                        {adheringId === g.id ? (
                          <i className="ri-loader-4-line animate-spin" />
                        ) : (
                          <i className="ri-user-add-line" />
                        )}
                        Rejoindre
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── MES GROUPES ── */}
      {tab === 'mes-groupes' && (
        <div className="space-y-3">
          {cycles.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <i className="ri-user-heart-line text-4xl text-gray-300 block mb-2" />
              <p className="text-sm">Vous n'avez rejoint aucun groupe</p>
              <button
                onClick={() => setTab('groupes')}
                className="mt-3 px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition"
              >
                Voir les groupes disponibles
              </button>
            </div>
          ) : (
            cycles.map((c) => {
              const monTour = c.ordre_passage != null && c.cycle_actuel === c.ordre_passage && c.statut === 'actif';
              const dejaCuRecu = c.a_recu === 1;
              const cyclesPasses = (c.cycle_actuel || 1) - 1;
              const pct = c.nombre_membres > 0 ? Math.round((cyclesPasses / c.nombre_membres) * 100) : 0;

              return (
                <div key={c.id} className={`bg-white p-4 rounded-xl border ${monTour ? 'border-yellow-400 shadow-md' : ''}`}>
                  {monTour && (
                    <div className="mb-3 flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-sm font-semibold text-yellow-700">
                      <i className="ri-trophy-line text-yellow-500" />
                      C'est votre tour ! Préparez-vous à recevoir le pot.
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${monTour ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                        <i className={`ri-group-line ${monTour ? 'text-yellow-500' : 'text-blue-500'}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{c.nom || c.groupe_nom}</p>
                        <p className="text-xs text-gray-500">
                          {Number(c.montant_part).toLocaleString('fr-FR')} FCFA / {periodiciteLabel(c.periodicite)}
                        </p>
                        <p className="text-xs text-gray-400">
                          Membre depuis {new Date(c.date_adhesion).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-400">Total cotisé</p>
                      <p className="font-bold text-green-600">
                        {Number(c.montant_total_paye).toLocaleString('fr-FR')} FCFA
                      </p>
                      {c.statut === 'cloture' && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full mt-1 inline-block">Clôturé</span>
                      )}
                    </div>
                  </div>

                  {/* Infos cycle */}
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-400 mb-0.5">Cycle actuel</p>
                      <p className="font-semibold text-gray-700">{c.cycle_actuel || 1} / {c.nombre_membres}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-400 mb-0.5">Mon ordre</p>
                      <p className="font-semibold text-gray-700">
                        {c.ordre_passage != null ? `#${c.ordre_passage}` : 'Non assigné'}
                      </p>
                    </div>
                    <div className={`rounded-lg p-2 ${dejaCuRecu ? 'bg-green-50' : 'bg-gray-50'}`}>
                      <p className="text-gray-400 mb-0.5">Pot reçu</p>
                      <p className={`font-semibold ${dejaCuRecu ? 'text-green-600' : 'text-gray-400'}`}>
                        {dejaCuRecu ? 'Oui ✓' : 'Non'}
                      </p>
                    </div>
                  </div>

                  {/* Barre progression */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Progression</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  {/* Bouton payer */}
                  {c.statut === 'actif' && (
                    <button
                      onClick={() => openPayModal(c.id, c.nom || c.groupe_nom, c.montant_part)}
                      className="mt-3 w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition flex items-center justify-center gap-1.5"
                    >
                      <i className="ri-smartphone-line" />
                      Payer ma cotisation — {Number(c.montant_part).toLocaleString('fr-FR')} FCFA
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── MES COTISATIONS ── */}
      {tab === 'cotisations' && (
        <div className="space-y-3">
          {mesCotisations.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <i className="ri-money-dollar-box-line text-4xl text-gray-300 block mb-2" />
              <p className="text-sm">Aucune cotisation enregistrée</p>
            </div>
          ) : (
            mesCotisations.map((c) => (
              <div key={c.id} className="bg-white p-4 rounded-xl border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
                      <i className="ri-money-dollar-circle-line text-green-500 text-sm" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{c.groupe_nom}</p>
                      <p className="text-xs text-gray-400">
                        {periodiciteLabel(c.periodicite)} — {c.nombre_membres} membres
                      </p>
                      <p className="text-xs text-gray-400">
                        Depuis {new Date(c.date_adhesion).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Total cotisé</p>
                    <p className="font-bold text-green-600 text-sm">
                      {Number(c.montant_total_paye).toLocaleString('fr-FR')} FCFA
                    </p>
                    {c.a_recu === 1 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Pot reçu ✓</span>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex gap-3 text-xs text-gray-500">
                  <span>Cycle : <strong>{c.cycle_actuel || 1}/{c.nombre_membres}</strong></span>
                  {c.ordre_passage != null && (
                    <span>Mon ordre : <strong>#{c.ordre_passage}</strong></span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── MODAL PAIEMENT COTISATION ── */}
      {payModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
            <div className="p-5 border-b">
              <h3 className="font-bold text-gray-900">Payer ma cotisation</h3>
              <p className="text-sm text-gray-500 mt-0.5">{payModal.groupeNom}</p>
            </div>

            <div className="p-5 space-y-4">
              {/* Opérateur */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Opérateur Mobile Money</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'mtn',  label: 'MTN MoMo' },
                    { id: 'moov', label: 'Moov' },
                    { id: 'wave', label: 'Wave' },
                  ].map((op) => (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => setPayOperateur(op.id)}
                      className={`py-2.5 rounded-xl border-2 text-xs font-semibold transition ${
                        payOperateur === op.id
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Téléphone */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Numéro de téléphone</label>
                <input
                  type="tel"
                  value={payTelephone}
                  onChange={(e) => setPayTelephone(e.target.value.replace(/\D/g, ''))}
                  placeholder="97 00 00 00"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              {/* Montant */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Montant (FCFA)</label>
                <input
                  type="number"
                  value={payMontant}
                  onChange={(e) => setPayMontant(e.target.value)}
                  min={1}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <p className="text-xs text-gray-400 mt-1">Montant suggéré : {Number(payModal.montantPart).toLocaleString('fr-FR')} FCFA</p>
              </div>

              {/* Récap */}
              {payTelephone.length >= 8 && parseFloat(payMontant) > 0 && (
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-sm">
                  <p className="font-semibold text-orange-700 mb-1">Récapitulatif</p>
                  <p className="text-gray-600">Opérateur : <strong>{payOperateur.toUpperCase()}</strong></p>
                  <p className="text-gray-600">Montant : <strong className="text-orange-600">{Number(payMontant).toLocaleString('fr-FR')} FCFA</strong></p>
                </div>
              )}
            </div>

            <div className="flex gap-3 p-5 border-t">
              <button
                onClick={() => setPayModal(null)}
                className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm text-gray-600"
              >
                Annuler
              </button>
              <button
                onClick={handlePayer}
                disabled={paying || payTelephone.length < 8 || parseFloat(payMontant) <= 0}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition"
              >
                {paying
                  ? <><i className="ri-loader-4-line animate-spin" /> Traitement...</>
                  : <><i className="ri-smartphone-line" /> Confirmer</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}