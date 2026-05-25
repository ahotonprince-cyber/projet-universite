import { useState, useEffect } from 'react';

interface Ticket {
  id: number;
  utilisateur_id: number;
  nom: string;
  prenom: string;
  email: string;
  type: string;
  sujet: string;
  message: string;
  statut: 'ouvert' | 'en_cours' | 'resolu' | 'ferme';
  reponse: string | null;
  agent_nom: string | null;
  agent_prenom: string | null;
  date_creation: string;
  date_reponse: string | null;
}

const statutConfig: Record<string, { label: string; cls: string }> = {
  ouvert:    { label: 'Ouvert',    cls: 'bg-blue-100 text-blue-700' },
  en_cours:  { label: 'En cours',  cls: 'bg-orange-100 text-orange-700' },
  resolu:    { label: 'Résolu',    cls: 'bg-green-100 text-green-700' },
  ferme:     { label: 'Fermé',     cls: 'bg-gray-100 text-gray-500' },
};

const typeLabel: Record<string, string> = {
  question: 'Question', probleme: 'Problème', credit: 'Crédit', tontine: 'Tontine', autre: 'Autre',
};

const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [filterStatut, setFilterStatut] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [reponse, setReponse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatut) params.set('statut', filterStatut);
      if (filterType)   params.set('type', filterType);
      const res = await fetch(`/api/admin/support?${params}`, { headers: authH() });
      const data = await res.json();
      setTickets(data.tickets || []);
      const map: Record<string, number> = {};
      (data.counts || []).forEach((c: any) => { map[c.statut] = parseInt(c.total); });
      setCounts(map);
    } catch { showToast('Erreur chargement', false); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterStatut, filterType]);

  const handleRepondre = async () => {
    if (!selected || !reponse.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/support/${selected.id}/repondre`, {
        method: 'POST',
        headers: { ...authH(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ reponse }),
      });
      if (!res.ok) throw new Error();
      showToast('Réponse envoyée');
      setSelected(null);
      setReponse('');
      load();
    } catch { showToast('Erreur envoi réponse', false); }
    finally { setSubmitting(false); }
  };

  const handleStatut = async (id: number, statut: string) => {
    try {
      await fetch(`/api/admin/support/${id}/statut`, {
        method: 'PATCH',
        headers: { ...authH(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut }),
      });
      load();
    } catch { showToast('Erreur', false); }
  };

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg ${toast.ok ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Support client</h2>
          <p className="text-sm text-gray-500">{total} ticket(s) au total</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { key: 'ouvert',   label: 'Ouverts',   color: 'text-blue-600' },
          { key: 'en_cours', label: 'En cours',  color: 'text-orange-600' },
          { key: 'resolu',   label: 'Résolus',   color: 'text-green-600' },
          { key: 'ferme',    label: 'Fermés',    color: 'text-gray-500' },
        ].map(s => (
          <div key={s.key} className="bg-white rounded-xl border p-4">
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{counts[s.key] || 0}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex gap-3 flex-wrap">
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400">
          <option value="">Tous les statuts</option>
          <option value="ouvert">Ouvert</option>
          <option value="en_cours">En cours</option>
          <option value="resolu">Résolu</option>
          <option value="ferme">Fermé</option>
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400">
          <option value="">Tous les types</option>
          {Object.entries(typeLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        {(filterStatut || filterType) && (
          <button onClick={() => { setFilterStatut(''); setFilterType(''); }}
            className="text-xs text-gray-400 hover:text-gray-600">
            Réinitialiser
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Chargement...</div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Aucun ticket trouvé</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr>
                {['#', 'Client', 'Type', 'Sujet', 'Statut', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left p-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickets.map(t => {
                const sc = statutConfig[t.statut] || { label: t.statut, cls: 'bg-gray-100 text-gray-500' };
                return (
                  <tr key={t.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 text-xs text-gray-400">#{t.id}</td>
                    <td className="p-3">
                      <p className="text-sm font-medium">{t.prenom} {t.nom}</p>
                      <p className="text-xs text-gray-400">{t.email}</p>
                    </td>
                    <td className="p-3">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {typeLabel[t.type] || t.type}
                      </span>
                    </td>
                    <td className="p-3 text-sm max-w-48 truncate">{t.sujet}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${sc.cls}`}>{sc.label}</span>
                    </td>
                    <td className="p-3 text-xs text-gray-400">
                      {new Date(t.date_creation).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <button onClick={() => { setSelected(t); setReponse(t.reponse || ''); }}
                          className="px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600">
                          {t.reponse ? 'Voir' : 'Répondre'}
                        </button>
                        {t.statut === 'ouvert' && (
                          <button onClick={() => handleStatut(t.id, 'en_cours')}
                            className="px-2 py-1 text-xs border rounded hover:bg-gray-50 text-gray-600">
                            En cours
                          </button>
                        )}
                        {t.statut !== 'ferme' && (
                          <button onClick={() => handleStatut(t.id, 'ferme')}
                            className="px-2 py-1 text-xs text-gray-400 hover:text-gray-600">
                            Fermer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Modal réponse */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white">
              <h3 className="font-bold text-gray-900">Ticket #{selected.id}</h3>
              <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <i className="ri-close-line text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Infos */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <p className="font-medium">{selected.prenom} {selected.nom}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${statutConfig[selected.statut]?.cls}`}>
                    {statutConfig[selected.statut]?.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{selected.email}</p>
                <p className="text-xs text-gray-400">
                  {new Date(selected.date_creation).toLocaleString('fr-FR')} · {typeLabel[selected.type]}
                </p>
              </div>

              {/* Message client */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Sujet</p>
                <p className="text-sm font-medium">{selected.sujet}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Message</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.message}</p>
              </div>

              {/* Réponse existante */}
              {selected.reponse && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-green-700 mb-1">
                    Réponse de {selected.agent_prenom} {selected.agent_nom}
                    {selected.date_reponse && ` · ${new Date(selected.date_reponse).toLocaleDateString('fr-FR')}`}
                  </p>
                  <p className="text-sm text-green-800 whitespace-pre-wrap">{selected.reponse}</p>
                </div>
              )}

              {/* Zone de réponse */}
              {selected.statut !== 'ferme' && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    {selected.reponse ? 'Modifier la réponse' : 'Votre réponse'}
                  </label>
                  <textarea
                    value={reponse}
                    onChange={e => setReponse(e.target.value)}
                    rows={4}
                    className="w-full mt-1 border rounded-xl p-3 text-sm focus:outline-none focus:border-orange-400"
                    placeholder="Rédigez votre réponse..."
                  />
                  <button
                    onClick={handleRepondre}
                    disabled={submitting || !reponse.trim()}
                    className="mt-2 w-full bg-orange-500 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-orange-600"
                  >
                    {submitting ? 'Envoi...' : 'Envoyer la réponse'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
