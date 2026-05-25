import { useState, useEffect } from 'react';

interface Ticket {
  id: number;
  type: string;
  sujet: string;
  message: string;
  statut: 'ouvert' | 'en_cours' | 'resolu' | 'ferme';
  reponse: string | null;
  date_creation: string;
  date_reponse: string | null;
}

const typeLabel: Record<string, string> = {
  question: 'Question', probleme: 'Problème', credit: 'Crédit', tontine: 'Tontine', autre: 'Autre',
};

const statutConfig: Record<string, { label: string; cls: string }> = {
  ouvert:   { label: 'Ouvert',   cls: 'bg-blue-100 text-blue-700' },
  en_cours: { label: 'En cours', cls: 'bg-orange-100 text-orange-700' },
  resolu:   { label: 'Résolu',   cls: 'bg-green-100 text-green-700' },
  ferme:    { label: 'Fermé',    cls: 'bg-gray-100 text-gray-500' },
};

const authH = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

export default function SupportClientPage() {
  const [tab, setTab] = useState<'nouveau' | 'historique'>('nouveau');
  const [form, setForm] = useState({ sujet: '', message: '', type: 'question' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [selected, setSelected] = useState<Ticket | null>(null);

  const loadTickets = async () => {
    setTicketsLoading(true);
    try {
      const res = await fetch('/api/client/support', { headers: authH() });
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch { /* silently fail */ }
    finally { setTicketsLoading(false); }
  };

  useEffect(() => { loadTickets(); }, []);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError('');
    if (!form.sujet || !form.message) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/client/support', {
        method: 'POST',
        headers: authH(),
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      loadTickets();
    } catch {
      setError('Erreur lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setForm({ sujet: '', message: '', type: 'question' });
    setSent(false);
    setError('');
  };

  if (sent) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-check-line text-green-600 text-4xl" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Message envoyé</h2>
          <p className="text-gray-500 mb-6">
            Votre demande a bien été envoyée. Notre équipe vous répondra rapidement.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={reset}
              className="px-5 py-2 bg-orange-500 text-white rounded-lg">
              Nouveau message
            </button>
            <button onClick={() => { reset(); setTab('historique'); }}
              className="px-5 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">
              Voir mes tickets
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Support client</h2>
        <p className="text-sm text-gray-500">Une question ? Contactez notre équipe</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(['nouveau', 'historique'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t === 'nouveau' ? 'Nouveau ticket' : `Mes tickets${tickets.length > 0 ? ` (${tickets.length})` : ''}`}
          </button>
        ))}
      </div>

      {tab === 'nouveau' ? (
        <>
          <form onSubmit={handleSubmit}
            className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700">Type de demande</label>
              <select value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full mt-1 border rounded-lg p-2 focus:outline-none focus:border-orange-400">
                <option value="question">Question</option>
                <option value="probleme">Problème technique</option>
                <option value="credit">Crédit</option>
                <option value="tontine">Tontine</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Sujet</label>
              <input type="text" value={form.sujet}
                onChange={e => setForm({ ...form, sujet: e.target.value })}
                className="w-full mt-1 border rounded-lg p-2 focus:outline-none focus:border-orange-400"
                placeholder="Ex: Problème de retrait" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Message</label>
              <textarea value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                className="w-full mt-1 border rounded-lg p-2 h-32 focus:outline-none focus:border-orange-400"
                placeholder="Décrivez votre problème..." />
            </div>
            <button disabled={loading}
              className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold disabled:opacity-50 hover:bg-orange-600">
              {loading ? 'Envoi...' : 'Envoyer le message'}
            </button>
          </form>

          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
            <p className="font-medium text-gray-800 mb-1">Support rapide</p>
            <p>Temps de réponse moyen : <strong>24h</strong><br />Urgence : contactez le service client directement</p>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          {ticketsLoading ? (
            <div className="p-8 text-center text-gray-400">Chargement...</div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <i className="ri-customer-service-2-line text-3xl mb-2 block" />
              Aucun ticket pour l'instant
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  {['#', 'Sujet', 'Type', 'Statut', 'Date', ''].map(h => (
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
                      <td className="p-3 text-sm font-medium max-w-48 truncate">{t.sujet}</td>
                      <td className="p-3">
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {typeLabel[t.type] || t.type}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${sc.cls}`}>{sc.label}</span>
                      </td>
                      <td className="p-3 text-xs text-gray-400">
                        {new Date(t.date_creation).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-3">
                        <button onClick={() => setSelected(t)}
                          className="text-xs text-orange-500 hover:text-orange-700">
                          Voir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          )}
        </div>
      )}

      {/* Modal détail ticket */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white">
              <h3 className="font-bold text-gray-900">Ticket #{selected.id}</h3>
              <button onClick={() => setSelected(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <i className="ri-close-line text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{typeLabel[selected.type] || selected.type}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${statutConfig[selected.statut]?.cls}`}>
                  {statutConfig[selected.statut]?.label}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Sujet</p>
                <p className="text-sm font-medium">{selected.sujet}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Votre message</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-xl p-3">{selected.message}</p>
              </div>
              {selected.reponse ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-green-700 mb-1">
                    Réponse de l'équipe support
                    {selected.date_reponse && ` · ${new Date(selected.date_reponse).toLocaleDateString('fr-FR')}`}
                  </p>
                  <p className="text-sm text-green-800 whitespace-pre-wrap">{selected.reponse}</p>
                </div>
              ) : (
                <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
                  <i className="ri-time-line mr-1" />
                  En attente de réponse — délai moyen 24h
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
