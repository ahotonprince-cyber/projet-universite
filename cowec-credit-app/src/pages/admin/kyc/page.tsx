import { useState, useEffect } from 'react';

interface Document {
  id: number;
  utilisateur_id: number;
  nom: string;
  prenom: string;
  email: string;
  type: string;
  url_fichier: string;
  statut: 'en_attente' | 'valide' | 'rejete';
  date_upload: string;
  motif_rejet?: string;
}

interface ClientGroup {
  utilisateur_id: number;
  nom: string;
  prenom: string;
  email: string;
  documents: Document[];
}

export default function KycPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'en_attente' | 'valide' | 'rejete'>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [rejectMotif, setRejectMotif] = useState('');
  const [rejectTarget, setRejectTarget] = useState<{ type: 'doc'; id: number } | { type: 'dossier'; userId: number } | null>(null);

  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientGroup | null>(null);
  const [docLoadError, setDocLoadError] = useState(false);

  const token = localStorage.getItem('token');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/admin/kyc/documents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch {
      showToast('Erreur chargement documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const handleValidation = async (documentId: number, statut: 'valide' | 'rejete', motif?: string) => {
    try {
      const response = await fetch(`/api/admin/kyc/validate/${documentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ statut, motif_rejet: motif || null })
      });
      if (!response.ok) throw new Error();
      showToast(`Document ${statut === 'valide' ? 'validé' : 'rejeté'} avec succès`);
      setSelectedDoc(null);
      setRejectTarget(null);
      setRejectMotif('');
      fetchDocuments();
    } catch {
      showToast('Erreur lors de la validation', 'error');
    }
  };

  const handleDossier = async (utilisateurId: number, statut: 'approuve' | 'rejete', commentaire?: string) => {
    setApprovingId(utilisateurId);
    try {
      const response = await fetch(`/api/admin/kyc/${utilisateurId}/statut`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ statut, commentaire: commentaire || null })
      });
      if (!response.ok) throw new Error();
      showToast(
        statut === 'approuve' ? '✅ Compte client activé !' : '❌ Dossier rejeté',
        statut === 'approuve' ? 'success' : 'error'
      );
      setSelectedClient(null);
      setRejectTarget(null);
      setRejectMotif('');
      fetchDocuments();
    } catch {
      showToast('Erreur lors du traitement du dossier', 'error');
    } finally {
      setApprovingId(null);
    }
  };

  const clientGroups = documents.reduce<ClientGroup[]>((acc, doc) => {
    const existing = acc.find(g => g.utilisateur_id === doc.utilisateur_id);
    if (existing) existing.documents.push(doc);
    else acc.push({ utilisateur_id: doc.utilisateur_id, nom: doc.nom, prenom: doc.prenom, email: doc.email, documents: [doc] });
    return acc;
  }, []);

  const filteredDocuments = documents.filter(doc => filter === 'all' ? true : doc.statut === filter);

  const stats = {
    total: documents.length,
    en_attente: documents.filter(d => d.statut === 'en_attente').length,
    valide: documents.filter(d => d.statut === 'valide').length,
    rejete: documents.filter(d => d.statut === 'rejete').length,
  };

  const isPdf = (url: string) => url?.toLowerCase().endsWith('.pdf');

  const getDocUrl = (url: string) => {
    if (!url) return '';
    // Windows absolute path → extract everything from 'uploads/' onward
    if (url.includes('\\') || /^[A-Za-z]:/.test(url)) {
      const normalized = url.replace(/\\/g, '/');
      const idx = normalized.indexOf('uploads/');
      return idx !== -1 ? `/${normalized.slice(idx)}` : '';
    }
    return url.startsWith('/') ? url : `/${url}`;
  };

  const typeLabel: Record<string, string> = {
    cni_recto: 'CNI Recto',
    cni_verso: 'CNI Verso',
    justificatif_revenus: 'Justif. revenus',
    justificatif_domicile: 'Justif. domicile',
    cni: 'CNI', passeport: 'Passeport', autre: 'Autre'
  };

  const statutBadge = (s: string) => {
    if (s === 'valide') return 'bg-green-100 text-green-700';
    if (s === 'en_attente') return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-600';
  };
  const statutLabel = (s: string) =>
    s === 'valide' ? '✅ Validé' : s === 'en_attente' ? '⏳ En attente' : '❌ Rejeté';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl text-white shadow-lg text-sm whitespace-nowrap ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.message}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL REJET — remplace prompt() natif
      ══════════════════════════════════════════════════ */}
      {rejectTarget && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4">
            <h3 className="font-bold text-gray-800">Motif du rejet</h3>
            <textarea
              value={rejectMotif}
              onChange={e => setRejectMotif(e.target.value)}
              placeholder="Expliquer la raison du rejet (optionnel)"
              rows={3}
              className="w-full border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setRejectTarget(null); setRejectMotif(''); }}
                className="flex-1 py-2.5 border rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (rejectTarget.type === 'doc') handleValidation(rejectTarget.id, 'rejete', rejectMotif || undefined);
                  else handleDossier(rejectTarget.userId, 'rejete', rejectMotif || undefined);
                }}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600"
              >
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL — Visualiser un document
      ══════════════════════════════════════════════════ */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-3xl flex flex-col"
               style={{ maxHeight: '95vh' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b shrink-0">
              <div className="min-w-0">
                <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate">
                  {typeLabel[selectedDoc.type] || selectedDoc.type}
                </h3>
                <p className="text-xs text-gray-400 truncate">
                  {selectedDoc.prenom} {selectedDoc.nom}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <a
                  href={getDocUrl(selectedDoc.url_fichier)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                  title="Ouvrir dans un nouvel onglet"
                >
                  <i className="ri-external-link-line text-gray-500 text-base" />
                </a>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
                >
                  <i className="ri-close-line text-gray-500 text-lg" />
                </button>
              </div>
            </div>

            {/* Document preview */}
            <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center p-3 sm:p-4">
              {docLoadError ? (
                <div className="text-center text-gray-400 space-y-2">
                  <i className="ri-file-warning-line text-4xl block" />
                  <p className="text-sm">Fichier non disponible sur le serveur</p>
                  <a href={getDocUrl(selectedDoc.url_fichier)} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-orange-500 underline">
                    Tenter d'ouvrir quand même
                  </a>
                </div>
              ) : isPdf(selectedDoc.url_fichier) ? (
                <object
                  data={getDocUrl(selectedDoc.url_fichier)}
                  type="application/pdf"
                  className="w-full rounded-lg border"
                  style={{ height: 'min(55vh, 500px)' }}
                  onError={() => setDocLoadError(true)}
                >
                  <div className="text-center text-gray-400 py-8 space-y-2">
                    <i className="ri-file-warning-line text-4xl block" />
                    <p className="text-sm">Impossible d'afficher le PDF</p>
                    <a href={getDocUrl(selectedDoc.url_fichier)} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-orange-500 underline">
                      Ouvrir dans un nouvel onglet
                    </a>
                  </div>
                </object>
              ) : (
                <img
                  src={getDocUrl(selectedDoc.url_fichier)}
                  alt={selectedDoc.type}
                  className="max-w-full rounded-lg shadow object-contain"
                  style={{ maxHeight: 'min(55vh, 500px)' }}
                  onError={() => setDocLoadError(true)}
                />
              )}
            </div>

            {/* Actions */}
            {selectedDoc.statut === 'en_attente' && (
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-t flex gap-2 shrink-0">
                <button
                  onClick={() => setRejectTarget({ type: 'doc', id: selectedDoc.id })}
                  className="flex-1 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition flex items-center justify-center gap-1"
                >
                  <i className="ri-close-line" /> Rejeter
                </button>
                <button
                  onClick={() => handleValidation(selectedDoc.id, 'valide')}
                  className="flex-1 py-2.5 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition flex items-center justify-center gap-1"
                >
                  <i className="ri-check-line" /> Valider
                </button>
              </div>
            )}

            {selectedDoc.statut !== 'en_attente' && (
              <div className="px-4 sm:px-6 py-3 border-t shrink-0 flex justify-center">
                <span className={`text-sm font-medium px-3 py-1.5 rounded-full ${statutBadge(selectedDoc.statut)}`}>
                  {statutLabel(selectedDoc.statut)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL — Dossier complet d'un client
      ══════════════════════════════════════════════════ */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl flex flex-col"
               style={{ maxHeight: '92vh' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b shrink-0">
              <div className="min-w-0">
                <h3 className="font-bold text-gray-800 truncate">
                  {selectedClient.prenom} {selectedClient.nom}
                </h3>
                <p className="text-xs text-gray-400 truncate">{selectedClient.email}</p>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 shrink-0 ml-2"
              >
                <i className="ri-close-line text-gray-500 text-lg" />
              </button>
            </div>

            {/* Compteur */}
            <div className="px-4 sm:px-6 py-2 border-b bg-gray-50 shrink-0">
              <p className="text-xs text-gray-500">
                {selectedClient.documents.filter(d => d.statut === 'valide').length} / {selectedClient.documents.length} documents validés
              </p>
            </div>

            {/* Liste documents */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-2">
              {selectedClient.documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 border rounded-xl hover:bg-gray-50">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    doc.statut === 'valide' ? 'bg-green-100' :
                    doc.statut === 'en_attente' ? 'bg-orange-100' : 'bg-red-100'
                  }`}>
                    <i className={`${isPdf(doc.url_fichier) ? 'ri-file-pdf-line' : 'ri-image-line'} ${
                      doc.statut === 'valide' ? 'text-green-500' :
                      doc.statut === 'en_attente' ? 'text-orange-500' : 'text-red-500'
                    }`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {typeLabel[doc.type] || doc.type}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(doc.date_upload).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`hidden sm:inline text-xs px-2 py-1 rounded-full ${statutBadge(doc.statut)}`}>
                      {statutLabel(doc.statut)}
                    </span>
                    <button
                      onClick={() => { setSelectedClient(null); setDocLoadError(false); setSelectedDoc(doc); }}
                      className="w-8 h-8 flex items-center justify-center border border-orange-300 text-orange-500 rounded-lg hover:bg-orange-50 transition"
                    >
                      <i className="ri-eye-line text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions dossier */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t flex gap-2 bg-gray-50 rounded-b-2xl shrink-0">
              <button
                onClick={() => setRejectTarget({ type: 'dossier', userId: selectedClient.utilisateur_id })}
                disabled={approvingId === selectedClient.utilisateur_id}
                className="flex-1 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-1"
              >
                <i className="ri-close-line" />
                <span className="hidden sm:inline">Rejeter le compte</span>
                <span className="sm:hidden">Rejeter</span>
              </button>
              <button
                onClick={() => handleDossier(selectedClient.utilisateur_id, 'approuve')}
                disabled={approvingId === selectedClient.utilisateur_id}
                className="flex-1 py-2.5 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {approvingId === selectedClient.utilisateur_id
                  ? <i className="ri-loader-4-line animate-spin" />
                  : <i className="ri-check-double-line" />
                }
                <span className="hidden sm:inline">Approuver le compte</span>
                <span className="sm:hidden">Approuver</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header page ── */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Validation KYC</h1>
        <p className="text-sm text-gray-500">Vérifiez et approuvez les dossiers clients</p>
      </div>

      {/* ── Stats — 2 colonnes mobile, 4 desktop ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-800' },
          { label: 'En attente', value: stats.en_attente, color: 'text-orange-500' },
          { label: 'Validés', value: stats.valide, color: 'text-green-500' },
          { label: 'Rejetés', value: stats.rejete, color: 'text-red-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border p-3 sm:p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Dossiers clients ── */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-800">Dossiers clients</h2>
          <p className="text-xs text-gray-400 mt-0.5">Appuyez sur un client pour voir et valider son dossier</p>
        </div>

        <div className="divide-y">
          {clientGroups.map((client) => {
            const tousValides = client.documents.every(d => d.statut === 'valide');
            const nbValides = client.documents.filter(d => d.statut === 'valide').length;

            return (
              <div
                key={client.utilisateur_id}
                className="px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between gap-3 active:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedClient(client)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                    <i className="ri-user-line text-orange-500 text-sm sm:text-base" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{client.prenom} {client.nom}</p>
                    <p className="text-xs text-gray-400 truncate hidden sm:block">{client.email}</p>
                    <p className="text-xs text-gray-400">{nbValides}/{client.documents.length} docs</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-lg ${
                    tousValides ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50'
                  }`}>
                    {tousValides ? '✅ Prêt' : '⏳ Attente'}
                  </span>
                  <i className="ri-arrow-right-s-line text-gray-400" />
                </div>
              </div>
            );
          })}

          {clientGroups.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">
              Aucun dossier client trouvé
            </div>
          )}
        </div>
      </div>

      {/* ── Documents individuels ── */}
      <div className="bg-white rounded-xl border overflow-hidden">

        {/* Header + filtres scrollables sur mobile */}
        <div className="px-4 sm:px-5 py-3 border-b bg-gray-50">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h2 className="font-semibold text-gray-800 text-sm sm:text-base">Tous les documents</h2>
          </div>
          <div className="flex gap-1 mt-2 overflow-x-auto pb-0.5 scrollbar-none">
            {(['all', 'en_attente', 'valide', 'rejete'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition shrink-0 ${
                  filter === f ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? `Tous (${stats.total})` :
                 f === 'en_attente' ? `En attente (${stats.en_attente})` :
                 f === 'valide' ? `Validés (${stats.valide})` : `Rejetés (${stats.rejete})`}
              </button>
            ))}
          </div>
        </div>

        {/* Table desktop */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Client</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Statut</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium">{doc.prenom} {doc.nom}</p>
                    <p className="text-xs text-gray-400">{doc.email}</p>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{typeLabel[doc.type] || doc.type}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {new Date(doc.date_upload).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${statutBadge(doc.statut)}`}>
                      {statutLabel(doc.statut)}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => { setDocLoadError(false); setSelectedDoc(doc); }}
                      className="px-3 py-1 border border-orange-300 text-orange-500 text-xs rounded-lg hover:bg-orange-50 transition mr-2"
                    >
                      <i className="ri-eye-line mr-1" /> Voir
                    </button>
                    {doc.statut === 'en_attente' && (
                      <>
                        <button
                          onClick={() => handleValidation(doc.id, 'valide')}
                          className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 mr-1"
                        >
                          Valider
                        </button>
                        <button
                          onClick={() => setRejectTarget({ type: 'doc', id: doc.id })}
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600"
                        >
                          Rejeter
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {filteredDocuments.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400 text-sm">
                    Aucun document trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Cartes mobile */}
        <div className="sm:hidden divide-y">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{doc.prenom} {doc.nom}</p>
                  <p className="text-xs text-gray-400 truncate">{doc.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {typeLabel[doc.type] || doc.type} · {new Date(doc.date_upload).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${statutBadge(doc.statut)}`}>
                  {statutLabel(doc.statut)}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => { setDocLoadError(false); setSelectedDoc(doc); }}
                  className="flex-1 py-2 border border-orange-300 text-orange-500 text-xs font-medium rounded-lg hover:bg-orange-50 flex items-center justify-center gap-1"
                >
                  <i className="ri-eye-line" /> Voir
                </button>
                {doc.statut === 'en_attente' && (
                  <>
                    <button
                      onClick={() => handleValidation(doc.id, 'valide')}
                      className="flex-1 py-2 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 flex items-center justify-center gap-1"
                    >
                      <i className="ri-check-line" /> Valider
                    </button>
                    <button
                      onClick={() => setRejectTarget({ type: 'doc', id: doc.id })}
                      className="flex-1 py-2 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 flex items-center justify-center gap-1"
                    >
                      <i className="ri-close-line" /> Rejeter
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {filteredDocuments.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">
              Aucun document trouvé
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
