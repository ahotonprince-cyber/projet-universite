import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  profession: string;
  date_naissance: string;
  date_creation: string;
  avatar: string;
  score_credit: number;
}

interface DocumentItem {
  id: number;
  nom: string;
  type: string;
  dateUpload: string;
  statut: 'valide' | 'en_attente' | 'rejete';
}

interface RevenuOperateur {
  operateur: string;
  total_depot: number;
  total_retrait: number;
}

interface Preferences {
  notification_email: boolean;
  notification_sms: boolean;
  notification_push: boolean;
}

const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Non authentifié');
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/client/connexion';
    throw new Error('Session expirée');
  }
  return res;
};

/* ─── Score Gauge SVG ─── */
function ScoreGauge({ score }: { score: number }) {
  const r = 50;
  const pathLength = Math.PI * r; // ~157
  const dashOffset = pathLength * (1 - score / 100);
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#f97316' : '#dc2626';
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Bon' : 'À risque';
  const arc = `M 10 62 A ${r} ${r} 0 0 1 110 62`;

  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="72" viewBox="0 0 120 72">
        <path d={arc} fill="none" stroke="#e5e7eb" strokeWidth="10" strokeLinecap="round" />
        <path
          d={arc}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={pathLength}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="60" y="55" textAnchor="middle" fontSize="20" fontWeight="bold" fill={color}>
          {score}
        </text>
        <text x="60" y="68" textAnchor="middle" fontSize="9" fill="#9ca3af">
          /100
        </text>
      </svg>
      <span className="text-xs font-semibold mt-1" style={{ color }}>{label}</span>
      <span className="text-xs text-gray-400">Score crédit</span>
    </div>
  );
}

/* ─── Score tips ─── */
function ScoreTips({ score }: { score: number }) {
  const tips =
    score >= 80
      ? ['Continuez à payer à temps', 'Évitez les crédits multiples', 'Maintenez votre profil complet']
      : score >= 60
      ? ['Payez vos échéances sans retard', 'Réduisez le nombre de crédits actifs', 'Complétez vos documents KYC']
      : ['Régularisez vos retards de paiement', 'Contactez un agent COWEC', 'Téléchargez vos justificatifs'];

  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
        Conseils pour améliorer votre score
      </p>
      {tips.map((tip, i) => (
        <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
          <i className="ri-lightbulb-line text-orange-400 mt-0.5 shrink-0" />
          {tip}
        </div>
      ))}
    </div>
  );
}

export default function ProfilClientPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [revenus, setRevenus] = useState<RevenuOperateur[]>([]);
  const [preferences, setPreferences] = useState<Preferences>({
    notification_email: true,
    notification_sms: true,
    notification_push: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'infos' | 'docs' | 'securite' | 'preferences' | 'revenus'>('infos');
  const [avatarUploading, setAvatarUploading] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', telephone: '',
    adresse: '', profession: '', date_naissance: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch('/api/client/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setProfile(data.profile);
      setForm({
        prenom: data.profile.prenom || '',
        nom: data.profile.nom || '',
        email: data.profile.email || '',
        telephone: data.profile.telephone || '',
        adresse: data.profile.adresse || '',
        profession: data.profile.profession || '',
        date_naissance: data.profile.date_naissance || '',
      });
      if (data.preferences) setPreferences(data.preferences);
    } catch {
      setError('Impossible de charger votre profil');
    }
  };

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/client/documents', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (err) { console.error(err); }
  };

  const fetchRevenus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/client/revenus-operateur', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setRevenus(data.revenus || []);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    Promise.all([fetchProfile(), fetchDocuments(), fetchRevenus()]).finally(() => setLoading(false));
  }, []);

  /* ─── Complétude du profil ─── */
  const completeness = useMemo(() => {
    if (!profile) return { pct: 0, items: [] };
    const hasValidDoc = documents.some(d => d.statut === 'valide');
    const items = [
      { label: 'Nom & prénom',        done: !!(profile.nom && profile.prenom),  tab: 'infos' as const },
      { label: 'Email',               done: !!profile.email,                      tab: 'infos' as const },
      { label: 'Téléphone',           done: !!profile.telephone,                  tab: 'infos' as const },
      { label: 'Adresse',             done: !!profile.adresse,                    tab: 'infos' as const },
      { label: 'Profession',          done: !!profile.profession,                 tab: 'infos' as const },
      { label: 'Date de naissance',   done: !!profile.date_naissance,             tab: 'infos' as const },
      { label: 'Documents KYC validés', done: hasValidDoc,                        tab: 'docs' as const },
    ];
    const pct = Math.round((items.filter(i => i.done).length / items.length) * 100);
    return { pct, items };
  }, [profile, documents]);

  /* ─── Avatar upload ─── */
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast('Photo max 2MB', 'error'); return; }
    if (!['image/jpeg', 'image/png'].includes(file.type)) { showToast('Format JPG ou PNG requis', 'error'); return; }

    setAvatarUploading(true);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await fetch('/api/client/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProfile(p => p ? { ...p, avatar: data.avatar } : p);
      showToast('Photo mise à jour');
    } catch (err: any) {
      showToast(err.message || 'Erreur upload photo', 'error');
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/client/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      showToast('Profil mis à jour');
      fetchProfile();
    } catch {
      showToast('Erreur lors de la sauvegarde', 'error');
    }
  };

  const handlePasswordChange = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas'); return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError('Minimum 8 caractères'); return;
    }
    try {
      const res = await authFetch('/api/client/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPasswordSuccess('Mot de passe mis à jour');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Mot de passe modifié');
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err: any) {
      setPasswordError(err.message);
    }
  };

  const handleSavePreferences = async () => {
    try {
      const res = await authFetch('/api/client/preferences', {
        method: 'PUT',
        body: JSON.stringify(preferences),
      });
      if (!res.ok) throw new Error();
      showToast('Préférences enregistrées');
    } catch {
      showToast('Erreur enregistrement', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-b-2 border-orange-500 rounded-full" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-center">
        <p className="text-red-600">{error || 'Profil introuvable'}</p>
        <button onClick={fetchProfile} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg text-sm">
          Réessayer
        </button>
      </div>
    );
  }

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const avatarSrc = profile.avatar
    ? profile.avatar.startsWith('/uploads') ? `${apiUrl}${profile.avatar}` : profile.avatar
    : `https://ui-avatars.com/api/?background=f97316&color=fff&name=${encodeURIComponent(profile.prenom + '+' + profile.nom)}&size=128`;

  const allValid = documents.length > 0 && documents.every(d => d.statut === 'valide');
  const hasRejected = documents.some(d => d.statut === 'rejete');

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Input caché avatar */}
      <input ref={avatarInputRef} type="file" accept=".jpg,.jpeg,.png" onChange={handleAvatarChange} className="hidden" />

      {/* TOAST */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-gray-900">Mon profil</h2>
        <p className="text-sm text-gray-500">Gérez vos informations personnelles et préférences</p>
      </div>

      {/* ── CARD PROFIL RÉSUMÉ ── */}
      <div className="bg-white border rounded-xl p-6 flex flex-col sm:flex-row sm:flex-wrap items-center gap-5 shadow-sm">

        {/* Avatar cliquable */}
        <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
          <img
            src={avatarSrc}
            className={`w-20 h-20 rounded-full object-cover border-2 border-orange-200 transition ${avatarUploading ? 'opacity-50' : ''}`}
            alt="avatar"
          />
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            {avatarUploading
              ? <i className="ri-loader-4-line animate-spin text-white text-xl" />
              : <i className="ri-camera-line text-white text-xl" />
            }
          </div>
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg">{profile.prenom} {profile.nom}</h3>
          <p className="text-sm text-gray-500">{profile.email}</p>
          <p className="text-xs text-gray-400 mt-1">
            Membre depuis {new Date(profile.date_creation).toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Score gauge */}
        <ScoreGauge score={profile.score_credit || 0} />
      </div>

      {/* ── COMPLÉTUDE DU PROFIL ── */}
      <div className="bg-white border rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">Complétude du profil</p>
          <span className={`text-sm font-bold ${
            completeness.pct === 100 ? 'text-green-600' : completeness.pct >= 60 ? 'text-orange-500' : 'text-red-500'
          }`}>{completeness.pct}%</span>
        </div>

        {/* Barre */}
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              completeness.pct === 100 ? 'bg-green-500' : completeness.pct >= 60 ? 'bg-orange-500' : 'bg-red-400'
            }`}
            style={{ width: `${completeness.pct}%` }}
          />
        </div>

        {/* Checklist */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          {completeness.items.map(item => (
            <button
              key={item.label}
              onClick={() => !item.done && setActiveTab(item.tab)}
              className={`flex items-center gap-2 text-xs px-2 py-1 rounded-lg text-left transition ${
                item.done ? 'text-green-700' : 'text-gray-400 hover:bg-orange-50 hover:text-orange-600 cursor-pointer'
              }`}
            >
              <i className={item.done ? 'ri-checkbox-circle-fill text-green-500' : 'ri-checkbox-blank-circle-line'} />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl flex-wrap">
        {[
          ['infos', 'Informations', 'ri-user-line'],
          ['docs', 'Documents KYC', 'ri-file-list-line'],
          ['securite', 'Sécurité', 'ri-lock-line'],
          ['preferences', 'Préférences', 'ri-settings-3-line'],
          ['revenus', 'Statistiques', 'ri-bar-chart-line'],
        ].map(([key, label, icon]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
              activeTab === key ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <i className={icon} />
            {label}
          </button>
        ))}
      </div>

      {/* ── ONGLET INFOS ── */}
      {activeTab === 'infos' && (
        <form onSubmit={handleSaveProfile} className="bg-white border rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-gray-800 border-b pb-2">Informations personnelles</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Prénom</label>
              <input className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:border-orange-400"
                value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm text-gray-600">Nom</label>
              <input className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:border-orange-400"
                value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input type="email" className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:border-orange-400"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="text-sm text-gray-600">Téléphone</label>
            <input className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:border-orange-400"
              value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} required />
          </div>
          <div>
            <label className="text-sm text-gray-600">Adresse</label>
            <input className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:border-orange-400"
              value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-gray-600">Profession</label>
            <input className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:border-orange-400"
              value={form.profession} onChange={e => setForm({ ...form, profession: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-gray-600">Date de naissance</label>
            <input type="date" className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:border-orange-400"
              value={form.date_naissance} onChange={e => setForm({ ...form, date_naissance: e.target.value })} />
          </div>
          <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition">
            Sauvegarder les modifications
          </button>
        </form>
      )}

      {/* ── ONGLET DOCUMENTS ── */}
      {activeTab === 'docs' && (
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <div className={`p-4 rounded-xl border ${
            allValid ? 'bg-green-50 border-green-200' :
            hasRejected ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
          }`}>
            <p className="font-semibold text-sm">
              {allValid && '✅ Tous vos documents sont validés'}
              {!allValid && !hasRejected && '⏳ Documents en attente de validation'}
              {hasRejected && '❌ Certains documents ont été rejetés'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              La validation des documents est obligatoire pour activer certaines fonctionnalités
            </p>
          </div>

          {documents.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">Aucun document téléchargé</p>
          ) : (
            documents.map(doc => (
              <div key={doc.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-semibold">{doc.nom}</p>
                  <p className="text-xs text-gray-400">{doc.type}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Uploadé le {new Date(doc.dateUpload).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  doc.statut === 'valide' ? 'bg-green-100 text-green-700' :
                  doc.statut === 'en_attente' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-600'
                }`}>
                  {doc.statut === 'valide' ? 'Validé' : doc.statut === 'en_attente' ? 'En attente' : 'Rejeté'}
                </span>
              </div>
            ))
          )}

          <button
            onClick={() => navigate('/espace-client/documents')}
            className="w-full border-2 border-dashed border-orange-300 p-5 text-center rounded-xl hover:border-orange-500 hover:bg-orange-50 transition cursor-pointer"
          >
            <i className="ri-upload-cloud-line text-2xl text-orange-400 mb-1 block" />
            <p className="text-sm font-medium text-orange-600">Soumettre / mettre à jour mes documents KYC</p>
            <p className="text-xs text-gray-400 mt-1">CNI, justificatif de revenus et de domicile · max 5 Mo</p>
          </button>
        </div>
      )}

      {/* ── ONGLET SÉCURITÉ ── */}
      {activeTab === 'securite' && (
        <form onSubmit={handlePasswordChange} className="bg-white border rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-gray-800 border-b pb-2">Changer le mot de passe</h3>
          {passwordError && <div className="bg-red-50 text-red-600 p-2 rounded-lg text-sm">{passwordError}</div>}
          {passwordSuccess && <div className="bg-green-50 text-green-600 p-2 rounded-lg text-sm">{passwordSuccess}</div>}
          <div>
            <label className="text-sm text-gray-600">Mot de passe actuel</label>
            <input type="password" className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:border-orange-400"
              value={passwordData.currentPassword}
              onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })} required />
          </div>
          <div>
            <label className="text-sm text-gray-600">Nouveau mot de passe</label>
            <input type="password" className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:border-orange-400"
              value={passwordData.newPassword}
              onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} required />
            <p className="text-xs text-gray-400 mt-1">Minimum 8 caractères</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Confirmer le mot de passe</label>
            <input type="password" className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:border-orange-400"
              value={passwordData.confirmPassword}
              onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} required />
          </div>
          <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition">
            Mettre à jour le mot de passe
          </button>
          <div className="pt-4 border-t">
            <h4 className="font-semibold text-red-600 mb-2">Zone sensible</h4>
            <button
              type="button"
              onClick={() => { localStorage.removeItem('token'); window.location.href = '/client/connexion'; }}
              className="w-full bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition"
            >
              Se déconnecter
            </button>
          </div>
        </form>
      )}

      {/* ── ONGLET PRÉFÉRENCES ── */}
      {activeTab === 'preferences' && (
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-gray-800 border-b pb-2">Préférences de notification</h3>
          {([
            ['notification_email', 'Notifications par email', 'Recevez des alertes par email'],
            ['notification_sms', 'Notifications par SMS', 'Recevez des alertes par SMS'],
            ['notification_push', 'Notifications push', 'Notifications dans le navigateur'],
          ] as const).map(([key, title, desc]) => (
            <label key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-sm">{title}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              <input
                type="checkbox"
                checked={preferences[key]}
                onChange={e => setPreferences({ ...preferences, [key]: e.target.checked })}
                className="w-5 h-5 accent-orange-500 rounded"
              />
            </label>
          ))}
          <button onClick={handleSavePreferences}
            className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition">
            Enregistrer les préférences
          </button>
        </div>
      )}

      {/* ── ONGLET STATISTIQUES ── */}
      {activeTab === 'revenus' && (
        <div className="space-y-4">
          {/* Score et conseils */}
          <div className="bg-white border rounded-xl p-6 flex flex-wrap gap-6 items-start">
            <div className="flex flex-col items-center">
              <ScoreGauge score={profile.score_credit || 0} />
            </div>
            <div className="flex-1 min-w-48">
              <ScoreTips score={profile.score_credit || 0} />
            </div>
          </div>

          {/* Revenus par opérateur */}
          <div className="bg-white border rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-gray-800 border-b pb-2">Statistiques par opérateur Mobile Money</h3>
            {revenus.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Aucune transaction enregistrée</p>
            ) : (
              revenus.map(r => (
                <div key={r.operateur} className="p-4 bg-gray-50 rounded-xl">
                  <p className="font-semibold text-sm mb-2">{r.operateur}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Dépôts totaux</p>
                      <p className="font-bold text-green-600">{r.total_depot.toLocaleString()} FCFA</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Retraits totaux</p>
                      <p className="font-bold text-red-500">{r.total_retrait.toLocaleString()} FCFA</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
