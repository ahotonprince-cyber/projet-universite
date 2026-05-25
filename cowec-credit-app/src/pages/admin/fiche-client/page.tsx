import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface ClientStats {
  totalEmprunte: number;
  totalRembourse: number;
  creditsActifs: number;
  creditsSoldes: number;
  totalCredits: number;
  echeancesRetard: number;
  totalDepots: number;
  totalRetraits: number;
}

interface Compte { id: number; numero_compte: string; solde: number; type_nom: string; type_code: string; statut: string; }
interface Operation { id: number; type_operation: string; montant: number; description: string; date_operation: string; }
interface Credit { id: number; numero_credit: string; objet: string; montant_accorde: number; statut: string; progression: number; }
interface Client { id: number; nom: string; prenom: string; email: string; telephone: string; adresse: string; profession: string; score_credit: number; statut: string; date_creation: string; avatar: string; }

const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

const statutCreditCls: Record<string, string> = {
  actif: 'bg-green-100 text-green-700', en_attente: 'bg-orange-100 text-orange-700',
  valide: 'bg-blue-100 text-blue-700', solde: 'bg-gray-100 text-gray-500', rejete: 'bg-red-100 text-red-600',
};

export default function FicheClientPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [comptes, setComptes] = useState<Compte[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'credits' | 'operations' | 'documents'>('overview');

  // Score ajustable
  const [editScore, setEditScore] = useState(false);
  const [newScore, setNewScore] = useState(0);
  const [savingScore, setSavingScore] = useState(false);

  // Demande de document
  const [docModal, setDocModal] = useState(false);
  const [docType, setDocType] = useState('CNI');
  const [docMsg, setDocMsg] = useState('');
  const [sendingDoc, setSendingDoc] = useState(false);

  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const [clientRes, statsRes] = await Promise.all([
          fetch(`/api/admin/clients/${id}`, { headers: authH() }).then(r => r.json()),
          fetch(`/api/admin/clients/${id}/stats`, { headers: authH() }).then(r => r.json()),
        ]);
        setClient(clientRes.client);
        setNewScore(clientRes.client?.score_credit || 0);
        setStats(statsRes.stats);
        setComptes(statsRes.comptes || []);
        setOperations(statsRes.recentOperations || []);
        setCredits(statsRes.credits || []);
      } catch { showToast('Erreur chargement', false); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleSaveScore = async () => {
    setSavingScore(true);
    try {
      const res = await fetch(`/api/admin/clients/${id}/score`, {
        method: 'PATCH', headers: authH(), body: JSON.stringify({ score: newScore }),
      });
      if (!res.ok) throw new Error();
      setClient(c => c ? { ...c, score_credit: newScore } : c);
      setEditScore(false);
      showToast('Score mis à jour');
    } catch { showToast('Erreur', false); }
    finally { setSavingScore(false); }
  };

  const handleDemandeDoc = async () => {
    setSendingDoc(true);
    try {
      const res = await fetch(`/api/admin/clients/${id}/demande-document`, {
        method: 'POST', headers: authH(),
        body: JSON.stringify({ document_type: docType, message: docMsg || undefined }),
      });
      if (!res.ok) throw new Error();
      showToast('Demande envoyée au client');
      setDocModal(false);
      setDocMsg('');
    } catch { showToast('Erreur', false); }
    finally { setSendingDoc(false); }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin w-8 h-8 border-b-2 border-orange-500 rounded-full" /></div>;
  if (!client) return <div className="p-8 text-center text-red-500">Client introuvable</div>;

  const scoreColor = client.score_credit >= 80 ? '#16a34a' : client.score_credit >= 60 ? '#f97316' : '#dc2626';
  const scoreLabel = client.score_credit >= 80 ? 'Excellent' : client.score_credit >= 60 ? 'Bon' : 'À risque';

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg ${toast.ok ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
        <i className="ri-arrow-left-line" /> Retour
      </button>

      {/* Header client */}
      <div className="bg-white rounded-xl border p-6 flex flex-wrap items-start gap-5">
        <img
          src={client.avatar || `https://ui-avatars.com/api/?background=f97316&color=fff&name=${encodeURIComponent(client.prenom + '+' + client.nom)}&size=80`}
          className="w-16 h-16 rounded-full object-cover"
          alt="avatar"
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900">{client.prenom} {client.nom}</h2>
          <p className="text-sm text-gray-500">{client.email} · {client.telephone}</p>
          {client.profession && <p className="text-xs text-gray-400 mt-1">{client.profession}</p>}
          <p className="text-xs text-gray-400 mt-1">Client depuis {new Date(client.date_creation).toLocaleDateString('fr-FR')}</p>
        </div>

        {/* Score crédit */}
        <div className="flex flex-col items-center gap-1 min-w-32">
          {editScore ? (
            <div className="flex flex-col items-center gap-2">
              <input type="range" min={0} max={100} value={newScore} onChange={e => setNewScore(Number(e.target.value))}
                className="w-24 accent-orange-500" />
              <span className="text-lg font-bold" style={{ color: scoreColor }}>{newScore}/100</span>
              <div className="flex gap-1">
                <button onClick={handleSaveScore} disabled={savingScore}
                  className="px-2 py-1 bg-orange-500 text-white text-xs rounded disabled:opacity-50">
                  {savingScore ? '...' : 'OK'}
                </button>
                <button onClick={() => setEditScore(false)} className="px-2 py-1 border text-xs rounded">✕</button>
              </div>
            </div>
          ) : (
            <>
              <span className="text-3xl font-bold" style={{ color: scoreColor }}>{client.score_credit}</span>
              <span className="text-xs text-gray-400">/100 · {scoreLabel}</span>
              <button onClick={() => setEditScore(true)}
                className="text-xs text-orange-500 hover:underline flex items-center gap-1">
                <i className="ri-edit-line" /> Ajuster
              </button>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button onClick={() => setDocModal(true)}
            className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-orange-50 hover:border-orange-300 text-gray-600">
            <i className="ri-file-add-line text-orange-500" />
            Demander un document
          </button>
        </div>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total emprunté',   value: `${stats.totalEmprunte.toLocaleString('fr-FR')} F`,   color: 'text-blue-600' },
            { label: 'Remboursé',        value: `${stats.totalRembourse.toLocaleString('fr-FR')} F`,  color: 'text-green-600' },
            { label: 'Crédits actifs',   value: stats.creditsActifs,                                   color: 'text-orange-600' },
            { label: 'Échéances retard', value: stats.echeancesRetard,                                 color: stats.echeancesRetard > 0 ? 'text-red-600' : 'text-gray-500' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border p-4">
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Comptes */}
      {comptes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {comptes.map(c => (
            <div key={c.id} className="bg-white rounded-xl border p-4">
              <p className="text-xs text-gray-400">{c.type_nom}</p>
              <p className="text-xl font-bold text-gray-800">{Number(c.solde).toLocaleString('fr-FR')} FCFA</p>
              <p className="text-xs text-gray-400 font-mono mt-1">{c.numero_compte}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        {[['overview','Vue d\'ensemble','ri-dashboard-line'],['credits','Crédits','ri-bank-card-line'],['operations','Opérations','ri-exchange-line']].map(([k, l, ic]) => (
          <button key={k} onClick={() => setTab(k as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${tab === k ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}>
            <i className={ic} />{l}
          </button>
        ))}
      </div>

      {/* Tab: Crédits */}
      {tab === 'credits' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          {credits.length === 0 ? (
            <p className="p-8 text-center text-gray-400">Aucun crédit</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>{['Numéro', 'Objet', 'Montant', 'Progression', 'Statut'].map(h => <th key={h} className="text-left p-3 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody>
                {credits.map(c => (
                  <tr key={c.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 text-xs font-mono text-gray-400">{c.numero_credit}</td>
                    <td className="p-3 text-sm">{c.objet}</td>
                    <td className="p-3 font-medium">{Number(c.montant_accorde).toLocaleString('fr-FR')} F</td>
                    <td className="p-3 w-32">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                          <div className="bg-orange-500 h-full rounded-full" style={{ width: `${c.progression || 0}%` }} />
                        </div>
                        <span className="text-xs text-gray-400">{c.progression || 0}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${statutCreditCls[c.statut] || 'bg-gray-100 text-gray-500'}`}>
                        {c.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab: Opérations récentes */}
      {tab === 'operations' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          {operations.length === 0 ? (
            <p className="p-8 text-center text-gray-400">Aucune opération</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>{['Type', 'Description', 'Montant', 'Date'].map(h => <th key={h} className="text-left p-3 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody>
                {operations.map(op => {
                  const pos = ['depot','depot_mobile','credit_decaisse','virement_entrant'].includes(op.type_operation);
                  return (
                    <tr key={op.id} className="border-t hover:bg-gray-50">
                      <td className="p-3 text-xs">{op.type_operation}</td>
                      <td className="p-3 text-sm text-gray-600 max-w-48 truncate">{op.description || '—'}</td>
                      <td className={`p-3 font-semibold ${pos ? 'text-green-600' : 'text-red-500'}`}>
                        {pos ? '+' : '-'}{Number(op.montant).toLocaleString('fr-FR')} F
                      </td>
                      <td className="p-3 text-xs text-gray-400">{new Date(op.date_operation).toLocaleDateString('fr-FR')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab: Vue d'ensemble (graphique simple) */}
      {tab === 'overview' && stats && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border p-5">
            <p className="text-sm font-semibold text-gray-700 mb-3">Résumé crédits</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Total crédits</span><span className="font-medium">{stats.totalCredits}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Actifs</span><span className="font-medium text-green-600">{stats.creditsActifs}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Soldés</span><span className="font-medium text-gray-500">{stats.creditsSoldes}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Échéances retard</span><span className={`font-medium ${stats.echeancesRetard > 0 ? 'text-red-600' : 'text-gray-500'}`}>{stats.echeancesRetard}</span></div>
            </div>
          </div>
          <div className="bg-white rounded-xl border p-5">
            <p className="text-sm font-semibold text-gray-700 mb-3">Flux financiers</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Total dépôts</span><span className="font-medium text-green-600">+{stats.totalDepots.toLocaleString('fr-FR')} F</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total retraits</span><span className="font-medium text-red-500">-{stats.totalRetraits.toLocaleString('fr-FR')} F</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Emprunté</span><span className="font-medium">{stats.totalEmprunte.toLocaleString('fr-FR')} F</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Remboursé</span><span className="font-medium text-green-600">{stats.totalRembourse.toLocaleString('fr-FR')} F</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Modal demande de document */}
      {docModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDocModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900">Demander un document</h3>
            <p className="text-sm text-gray-500">
              Une notification sera envoyée à <strong>{client.prenom} {client.nom}</strong> pour demander ce document.
            </p>
            <div>
              <label className="text-sm text-gray-600">Type de document</label>
              <select value={docType} onChange={e => setDocType(e.target.value)}
                className="w-full mt-1 border rounded-lg p-2 text-sm focus:outline-none focus:border-orange-400">
                <option>CNI (recto)</option>
                <option>CNI (verso)</option>
                <option>Justificatif de revenus</option>
                <option>Justificatif de domicile</option>
                <option>Photo d'identité</option>
                <option>Autre document</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Message personnalisé (optionnel)</label>
              <textarea value={docMsg} onChange={e => setDocMsg(e.target.value)} rows={3}
                className="w-full mt-1 border rounded-lg p-2 text-sm focus:outline-none focus:border-orange-400"
                placeholder="Ex: Votre CNI semble expirée, merci d'en fournir une nouvelle version." />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDocModal(false)} className="flex-1 border py-2 rounded-lg text-sm hover:bg-gray-50">Annuler</button>
              <button onClick={handleDemandeDoc} disabled={sendingDoc}
                className="flex-1 bg-orange-500 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                {sendingDoc ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
