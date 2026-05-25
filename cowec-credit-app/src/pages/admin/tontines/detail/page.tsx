import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface GroupeTontine {
  id: number;
  nom: string;
  montant_part: number;
  periodicite: string;
  nombre_membres: number;
  cycle_actuel: number;
  statut: 'actif' | 'cloture';
  date_creation: string;
  date_cloture?: string;
}

interface MembreTontine {
  id: number;
  utilisateur_id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  membre_statut: string;
  date_adhesion: string;
  montant_total_paye: number;
  ordre_passage: number | null;
  a_recu: number;
}

export default function AdminTontineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [groupe, setGroupe] = useState<GroupeTontine | null>(null);
  const [membres, setMembres] = useState<MembreTontine[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ordre_passage local editable par membre
  const [ordres, setOrdres] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/tontines/${id}/detail`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGroupe(data.groupe);
        setMembres(data.membres || []);
        const init: Record<number, string> = {};
        (data.membres || []).forEach((m: MembreTontine) => {
          init[m.id] = m.ordre_passage != null ? String(m.ordre_passage) : '';
        });
        setOrdres(init);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const handleSaveOrdres = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const payload = membres.map((m) => ({
        membre_id: m.id,
        ordre: ordres[m.id] !== '' ? Number(ordres[m.id]) : null
      }));

      const res = await fetch(`/api/admin/tontines/${id}/ordres`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ordres: payload })
      });

      if (res.ok) {
        showMsg('success', 'Ordres de passage enregistrés.');
        fetchDetail();
      } else {
        const d = await res.json();
        showMsg('error', d.error || 'Erreur');
      }
    } catch {
      showMsg('error', 'Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  const handleValiderCycle = async () => {
    if (!groupe) return;
    if (!confirm(`Valider le cycle ${groupe.cycle_actuel} ? Le bénéficiaire sera marqué comme ayant reçu.`)) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/tontines/${id}/valider-cycle`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        if (data.termine) {
          showMsg('success', data.message || 'Tontine clôturée !');
        } else {
          showMsg('success', `Cycle ${groupe.cycle_actuel} validé. Cycle suivant : ${data.cycle_actuel}`);
        }
        fetchDetail();
      } else {
        showMsg('error', data.error || 'Erreur');
      }
    } catch {
      showMsg('error', 'Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;
  if (!groupe) return <div className="p-8 text-center text-red-500">Tontine introuvable.</div>;

  const beneficiaireActuel = membres.find(
    (m) => m.ordre_passage === groupe.cycle_actuel && m.membre_statut === 'actif'
  );

  const progressPct = groupe.nombre_membres > 0
    ? Math.round(((groupe.cycle_actuel - 1) / groupe.nombre_membres) * 100)
    : 0;

  return (
    <div className="space-y-6">

      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <button onClick={() => navigate('/admin/tontines')} className="hover:underline text-orange-500">
          Tontines
        </button>
        <span>/</span>
        <span className="text-gray-800 font-medium">{groupe.nom}</span>
      </div>

      {/* MSG */}
      {msg && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
          msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {msg.text}
        </div>
      )}

      {/* INFOS GROUPE */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{groupe.nom}</h1>
            <p className="text-gray-500 capitalize mt-1">{groupe.periodicite}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            groupe.statut === 'actif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {groupe.statut === 'actif' ? 'Actif' : 'Clôturé'}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Montant / part</p>
            <p className="text-lg font-bold text-orange-600">{groupe.montant_part.toLocaleString('fr-FR')} FCFA</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Membres actifs</p>
            <p className="text-lg font-bold text-blue-600">{groupe.nombre_membres}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Cycle actuel</p>
            <p className="text-lg font-bold text-purple-600">
              {groupe.cycle_actuel} / {groupe.nombre_membres || '?'}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Pot total</p>
            <p className="text-lg font-bold text-green-600">
              {(groupe.montant_part * groupe.nombre_membres).toLocaleString('fr-FR')} FCFA
            </p>
          </div>
        </div>

        {/* PROGRESSION */}
        <div className="mt-5">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progression des cycles</span>
            <span>{progressPct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-orange-400 h-2 rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* BÉNÉFICIAIRE ACTUEL */}
        {groupe.statut === 'actif' && beneficiaireActuel && (
          <div className="mt-5 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-yellow-700 font-medium uppercase mb-1">Bénéficiaire du cycle {groupe.cycle_actuel}</p>
              <p className="font-semibold text-gray-800">
                {beneficiaireActuel.prenom} {beneficiaireActuel.nom}
              </p>
              <p className="text-sm text-gray-500">{beneficiaireActuel.email}</p>
            </div>
            <button
              onClick={handleValiderCycle}
              disabled={saving || groupe.statut === 'cloture'}
              className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-medium text-sm"
            >
              {saving ? '...' : 'Valider ce cycle'}
            </button>
          </div>
        )}

        {groupe.statut === 'actif' && !beneficiaireActuel && (
          <div className="mt-5 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
            Aucun membre assigné à l'ordre {groupe.cycle_actuel}. Assignez les ordres ci-dessous avant de valider.
          </div>
        )}

        {groupe.statut === 'cloture' && (
          <div className="mt-5 bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600 text-center">
            Cette tontine est clôturée. Tous les membres ont reçu leur tour.
          </div>
        )}
      </div>

      {/* TABLEAU MEMBRES */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-800">Membres &amp; ordres de passage</h2>
          <button
            onClick={handleSaveOrdres}
            disabled={saving || groupe.statut === 'cloture'}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm"
          >
            {saving ? 'Enregistrement...' : 'Sauvegarder les ordres'}
          </button>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">Membre</th>
              <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">Contact</th>
              <th className="px-4 py-3 text-center text-xs uppercase text-gray-500">Ordre</th>
              <th className="px-4 py-3 text-right text-xs uppercase text-gray-500">Total payé</th>
              <th className="px-4 py-3 text-center text-xs uppercase text-gray-500">A reçu</th>
              <th className="px-4 py-3 text-center text-xs uppercase text-gray-500">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {membres.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">Aucun membre.</td>
              </tr>
            )}
            {membres.map((m) => {
              const isCurrent = m.ordre_passage === groupe.cycle_actuel && groupe.statut === 'actif';
              return (
                <tr
                  key={m.id}
                  className={isCurrent ? 'bg-yellow-50' : ''}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">
                      {m.prenom} {m.nom}
                      {isCurrent && (
                        <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">
                          Tour actuel
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      Adhéré le {new Date(m.date_adhesion).toLocaleDateString('fr-FR')}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    <p>{m.email}</p>
                    <p className="text-xs">{m.telephone}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      min={1}
                      max={groupe.nombre_membres}
                      className="w-16 border rounded px-2 py-1 text-center text-sm"
                      value={ordres[m.id] ?? ''}
                      disabled={groupe.statut === 'cloture'}
                      onChange={(e) =>
                        setOrdres((prev) => ({ ...prev, [m.id]: e.target.value }))
                      }
                      placeholder="—"
                    />
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {Number(m.montant_total_paye || 0).toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="px-4 py-3 text-center">
                    {m.a_recu ? (
                      <span className="inline-block w-6 h-6 bg-green-500 text-white rounded-full text-xs flex items-center justify-center">✓</span>
                    ) : (
                      <span className="inline-block w-6 h-6 bg-gray-200 text-gray-400 rounded-full text-xs flex items-center justify-center">–</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      m.membre_statut === 'actif'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {m.membre_statut}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
