import { useState, useEffect, useRef } from 'react';

type DocType = 'cni_recto' | 'cni_verso' | 'justificatif_revenus' | 'justificatif_domicile';

const DOC_LIST: { key: DocType; label: string; icon: string; desc: string }[] = [
  { key: 'cni_recto', label: "CNI Recto", icon: 'ri-id-card-line', desc: "Face avant de votre carte d'identité" },
  { key: 'cni_verso', label: "CNI Verso", icon: 'ri-id-card-line', desc: "Face arrière de votre carte d'identité" },
  { key: 'justificatif_revenus', label: "Justificatif de revenus", icon: 'ri-money-dollar-circle-line', desc: "Bulletin de salaire ou attestation de revenus" },
  { key: 'justificatif_domicile', label: "Justificatif de domicile", icon: 'ri-home-line', desc: "Facture ou attestation de résidence" },
];

const TYPE_OPTIONS = [
  { value: 'cni_recto',              label: 'CNI Recto' },
  { value: 'cni_verso',              label: 'CNI Verso' },
  { value: 'justificatif_revenus',   label: 'Justificatif de revenus' },
  { value: 'justificatif_domicile',  label: 'Justificatif de domicile' },
  { value: 'autre',                  label: 'Autre document' },
];

const TYPE_LABEL: Record<string, string> = Object.fromEntries(TYPE_OPTIONS.map(o => [o.value, o.label]));

interface DocExistant {
  id: number;
  type: string;
  nom: string;
  statut: 'en_attente' | 'valide' | 'rejete';
  url_fichier: string;
  date_upload: string;
  motif_rejet?: string;
}

interface Dossier {
  statut: 'en_attente' | 'approuve' | 'rejete';
  commentaire_admin?: string;
  soumis_le?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function DocumentsUploadPage() {
  const [files, setFiles] = useState<Partial<Record<DocType, File>>>({});
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [docsExistants, setDocsExistants] = useState<DocExistant[]>([]);
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [loadingDocs, setLoadingDocs] = useState(true);

  // État pour l'upload de document unique (compte validé)
  const [demandeType, setDemandeType] = useState('cni_recto');
  const [demandeFile, setDemandeFile] = useState<File | null>(null);
  const [demandeError, setDemandeError] = useState('');
  const [demandeSuccess, setDemandeSuccess] = useState('');
  const [demandeUploading, setDemandeUploading] = useState(false);
  const demandeInputRef = useRef<HTMLInputElement>(null);

  const token = localStorage.getItem('token');

  const fetchDocs = async () => {
    try {
      const res = await fetch('/api/client/documents/mes-documents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setDocsExistants(data.documents || []);
      setDossier(data.dossier || null);
    } catch {
      // silence
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  /* ── Validation taille fichier ── */
  const handleFile = (key: DocType, file: File | null) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setError(`"${file.name}" dépasse la taille maximale de 5 Mo. Veuillez choisir un fichier plus petit.`);
      return;
    }
    setError('');
    setFiles(prev => ({ ...prev, [key]: file }));
  };

  const handleDemandeFile = (file: File | null) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setDemandeError(`"${file.name}" dépasse la taille maximale de 5 Mo.`);
      return;
    }
    setDemandeError('');
    setDemandeFile(file);
  };

  /* ── Soumission KYC complet ── */
  const allUploaded = DOC_LIST.every(d => files[d.key]);

  const handleSubmit = async () => {
    if (!allUploaded) { setError('Veuillez uploader tous les documents requis.'); return; }
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      DOC_LIST.forEach(d => { if (files[d.key]) formData.append(d.key, files[d.key]!); });
      const response = await fetch('/api/client/documents/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur lors de l'envoi");
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Erreur serveur');
    } finally {
      setUploading(false);
    }
  };

  /* ── Soumission document unique (demande admin) ── */
  const handleDemandeSubmit = async () => {
    if (!demandeFile) { setDemandeError('Veuillez sélectionner un fichier.'); return; }
    setDemandeUploading(true);
    setDemandeError('');
    setDemandeSuccess('');
    try {
      const formData = new FormData();
      formData.append('document', demandeFile);
      formData.append('type', demandeType);
      const response = await fetch('/api/client/documents/upload-demande', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur lors de l'envoi");
      setDemandeSuccess('Document envoyé avec succès. Il sera examiné par notre équipe.');
      setDemandeFile(null);
      if (demandeInputRef.current) demandeInputRef.current.value = '';
      fetchDocs();
    } catch (err: any) {
      setDemandeError(err.message || 'Erreur serveur');
    } finally {
      setDemandeUploading(false);
    }
  };

  if (loadingDocs) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <i className="ri-loader-4-line animate-spin text-orange-500 text-3xl" />
      </div>
    );
  }

  /* ── COMPTE VALIDÉ : upload de document demandé ── */
  if (dossier?.statut === 'approuve') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Statut validé */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="ri-shield-check-line text-green-500 text-xl" />
          </div>
          <div>
            <h2 className="font-bold text-green-800 text-lg">Compte vérifié</h2>
            <p className="text-green-600 text-sm mt-1">
              Votre identité a été validée. Si l'administration vous a demandé un document
              supplémentaire, envoyez-le ici.
            </p>
          </div>
        </div>

        {/* Documents existants */}
        {docsExistants.length > 0 && (
          <div className="bg-white rounded-xl p-6 space-y-3">
            <h3 className="font-semibold text-gray-800 border-b pb-2">Mes documents</h3>
            {docsExistants.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    doc.statut === 'valide' ? 'bg-green-100' :
                    doc.statut === 'rejete' ? 'bg-red-100' : 'bg-orange-100'
                  }`}>
                    <i className={`ri-file-line text-lg ${
                      doc.statut === 'valide' ? 'text-green-500' :
                      doc.statut === 'rejete' ? 'text-red-500' : 'text-orange-500'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{TYPE_LABEL[doc.type] || doc.type}</p>
                    <p className="text-xs text-gray-400">{new Date(doc.date_upload).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  doc.statut === 'valide' ? 'bg-green-100 text-green-700' :
                  doc.statut === 'rejete' ? 'bg-red-100 text-red-600' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {doc.statut === 'valide' ? '✅ Validé' :
                   doc.statut === 'rejete' ? '❌ Rejeté' : '⏳ En attente'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Formulaire document demandé */}
        <div className="bg-white rounded-xl p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-gray-800">Envoyer un document demandé</h3>
            <p className="text-xs text-gray-400 mt-0.5">Sélectionnez le type et joignez le fichier demandé par l'administration</p>
          </div>

          {demandeSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
              <i className="ri-check-circle-line" /> {demandeSuccess}
            </div>
          )}
          {demandeError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {demandeError}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Type de document</label>
            <select
              value={demandeType}
              onChange={e => setDemandeType(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:border-orange-400"
            >
              {TYPE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Fichier <span className="text-gray-400 font-normal">(PDF, JPG, PNG — max 5 Mo)</span>
            </label>
            <input
              ref={demandeInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={e => handleDemandeFile(e.target.files?.[0] || null)}
            />
            <div
              onClick={() => demandeInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${
                demandeFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-orange-400'
              }`}
            >
              {demandeFile ? (
                <div className="flex items-center justify-center gap-2 text-green-700">
                  <i className="ri-file-check-line text-xl" />
                  <span className="text-sm font-medium">
                    {demandeFile.name} · {(demandeFile.size / 1024 / 1024).toFixed(1)} Mo
                  </span>
                </div>
              ) : (
                <>
                  <i className="ri-upload-2-line text-2xl text-gray-400 mb-1 block" />
                  <p className="text-sm text-gray-500">Cliquez pour choisir un fichier</p>
                </>
              )}
            </div>
            {demandeFile && (
              <button
                onClick={() => { setDemandeFile(null); if (demandeInputRef.current) demandeInputRef.current.value = ''; }}
                className="mt-1 text-xs text-gray-400 hover:text-red-500 transition"
              >
                Supprimer le fichier
              </button>
            )}
          </div>

          <button
            onClick={handleDemandeSubmit}
            disabled={!demandeFile || demandeUploading}
            className="w-full py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {demandeUploading
              ? <><i className="ri-loader-4-line animate-spin" /> Envoi en cours...</>
              : <><i className="ri-send-plane-line" /> Envoyer le document</>
            }
          </button>
        </div>
      </div>
    );
  }

  /* ── DOSSIER EN ATTENTE ── */
  if (!submitted && dossier && dossier.statut === 'en_attente' && docsExistants.length > 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="ri-time-line text-orange-500 text-xl" />
          </div>
          <div>
            <h2 className="font-bold text-orange-800 text-lg">Dossier en cours d'examen</h2>
            <p className="text-orange-600 text-sm mt-1">
              Vos documents ont été reçus. Notre équipe va examiner votre dossier sous 24-48h.
              Vous serez notifié dès la décision.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 space-y-3">
          <h3 className="font-semibold text-gray-800 mb-2">Documents soumis</h3>
          {docsExistants.map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-3 border rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  doc.statut === 'valide' ? 'bg-green-100' :
                  doc.statut === 'rejete' ? 'bg-red-100' : 'bg-orange-100'
                }`}>
                  <i className={`ri-file-line ${
                    doc.statut === 'valide' ? 'text-green-500' :
                    doc.statut === 'rejete' ? 'text-red-500' : 'text-orange-500'
                  }`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{TYPE_LABEL[doc.type] || doc.type}</p>
                  <p className="text-xs text-gray-400">{new Date(doc.date_upload).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                doc.statut === 'valide' ? 'bg-green-100 text-green-700' :
                doc.statut === 'rejete' ? 'bg-red-100 text-red-600' :
                'bg-orange-100 text-orange-700'
              }`}>
                {doc.statut === 'valide' ? '✅ Validé' :
                 doc.statut === 'rejete' ? '❌ Rejeté' : '⏳ En attente'}
              </span>
            </div>
          ))}
        </div>

        {docsExistants.some(d => d.statut === 'rejete') && (
          <button
            onClick={() => { setDossier(null); setDocsExistants([]); }}
            className="w-full py-3 border-2 border-orange-400 text-orange-500 font-semibold rounded-xl hover:bg-orange-50 transition"
          >
            <i className="ri-upload-cloud-line mr-2" />Resoumettre mes documents
          </button>
        )}
      </div>
    );
  }

  /* ── SUCCÈS ── */
  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-check-double-line text-green-500 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Documents envoyés !</h2>
          <p className="text-gray-500 mb-2">Vos documents ont bien été reçus. Notre équipe va examiner votre dossier.</p>
          <p className="text-sm text-orange-500 font-medium mb-6">Vous serez notifié dès validation de votre compte.</p>
        </div>
      </div>
    );
  }

  /* ── FORMULAIRE KYC INITIAL ── */
  return (
    <div className="max-w-2xl mx-auto space-y-6">

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
          <i className="ri-time-line text-orange-500 text-xl" />
        </div>
        <div>
          <h2 className="font-bold text-orange-800 text-lg">Compte en attente de validation</h2>
          <p className="text-orange-600 text-sm mt-1">
            Pour activer votre compte, veuillez uploader les documents ci-dessous.
            L'administrateur les examinera et vous notifiera sous 24-48h.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800">Documents requis</h3>
          <span className="text-xs text-gray-400">Max 5 Mo par fichier · JPG, PNG, PDF</span>
        </div>

        {DOC_LIST.map(doc => {
          const file = files[doc.key];
          return (
            <div key={doc.key} className={`border-2 rounded-xl p-4 transition-all ${file ? 'border-green-400 bg-green-50' : 'border-dashed border-gray-200 hover:border-orange-300'}`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${file ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <i className={`${file ? 'ri-check-line text-green-500' : `${doc.icon} text-gray-400`} text-lg`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{doc.label}</p>
                    <p className="text-xs text-gray-400">
                      {file ? `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} Mo` : doc.desc}
                    </p>
                  </div>
                </div>
                <label className="cursor-pointer">
                  <input type="file" accept="image/*,.pdf" className="hidden"
                    onChange={e => handleFile(doc.key, e.target.files?.[0] || null)} />
                  <span className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                    file ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}>
                    {file ? 'Changer' : 'Choisir'}
                  </span>
                </label>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">Progression</span>
          <span className="font-semibold text-orange-500">{Object.keys(files).length}/{DOC_LIST.length} documents</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div className="bg-orange-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(Object.keys(files).length / DOC_LIST.length) * 100}%` }} />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
      )}

      <button onClick={handleSubmit} disabled={!allUploaded || uploading}
        className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-500 transition disabled:opacity-50 flex items-center justify-center gap-2">
        {uploading
          ? <><i className="ri-loader-4-line animate-spin" /> Envoi en cours...</>
          : <><i className="ri-upload-cloud-line" /> Envoyer mes documents</>
        }
      </button>
    </div>
  );
}
