import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const authFetch = async (url: string, navigate: any) => {
  const token = localStorage.getItem('token');
  if (!token) { navigate('/client/connexion'); return null; }
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 401) { navigate('/client/connexion'); return null; }
  return res;
};

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>({
    profile: null, credits: [], notifications: [], solde: null, operations: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Hier";
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await authFetch('/api/client/profile', navigate);
        if (!profileRes) return;
        const profileData = await profileRes.json();

        const [creditsRes, notifRes, soldeRes, opsRes] = await Promise.all([
          authFetch('/api/client/credits', navigate),
          authFetch('/api/client/notifications', navigate),
          authFetch('/api/client/solde', navigate),
          authFetch('/api/client/operations?limit=5', navigate)
        ]);

        const creditsData = creditsRes ? await creditsRes.json() : { credits: [] };
        const notifData = notifRes ? await notifRes.json() : { notifications: [] };
        const soldeData = soldeRes ? await soldeRes.json() : null;
        const opsData = opsRes ? await opsRes.json() : { operations: [] };

        // ✅ Normaliser les montants
        const ops = (opsData.operations || []).map((op: any) => ({
          ...op, montant: Number(op.montant) || 0
        }));

        setData({
          profile: profileData.profile,
          credits: creditsData.credits || [],
          notifications: notifData.notifications || [],
          solde: soldeData,
          operations: ops
        });
      } catch (err) {
        setError('Serveur indisponible, réessayez plus tard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-28 bg-gray-200 rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
        </div>
        <div className="h-48 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (error || !data.profile) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <i className="ri-error-warning-line text-red-400 text-4xl mb-2 block" />
        <p className="text-red-600">{error || 'Profil introuvable'}</p>
        <button onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg text-sm">
          Réessayer
        </button>
      </div>
    );
  }

  const { profile, credits, notifications, solde, operations } = data;
  const unreadCount = notifications.filter((n: any) => !n.lu).length;
  const creditEnCours = credits.find((c: any) => c.statut === 'actif');

  const soldeEpargne = Number(solde?.solde_epargne) || 0;
  const soldeCourant = Number(solde?.solde_courant) || 0;
  const soldeTontine = Number(solde?.solde_tontine) || 0;
  const patrimoineTotal = soldeEpargne + soldeCourant + soldeTontine;

  const typeOpConfig: Record<string, { color: string; bg: string; icon: string; sign: string }> = {
    depot:    { color: 'text-green-600',  bg: 'bg-green-100',  icon: 'ri-arrow-down-circle-line', sign: '+' },
    retrait:  { color: 'text-red-600',    bg: 'bg-red-100',    icon: 'ri-arrow-up-circle-line',   sign: '-' },
    paiement: { color: 'text-orange-600', bg: 'bg-orange-100', icon: 'ri-refund-2-line',           sign: '-' },
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* ── HEADER ── */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute right-12 bottom-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />

        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-orange-100 text-sm mb-1">Bienvenue sur votre espace</p>
            <h2 className="text-2xl font-bold">
              Bonjour, {profile.prenom} 👋
            </h2>
            <p className="text-orange-100 text-sm mt-2">
              Score crédit : <span className="font-bold text-white">{profile.score_credit || 0}/100</span>
            </p>
          </div>

          <div
            onClick={() => navigate('/espace-client/profil')}
            className="cursor-pointer"
          >
            {profile.photo ? (
              <img src={profile.photo} className="w-14 h-14 rounded-full object-cover border-2 border-white/50" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center">
                <i className="ri-user-line text-white text-2xl" />
              </div>
            )}
          </div>
        </div>

        {/* Patrimoine total dans le header */}
        <div className="mt-4 pt-4 border-t border-white/20 relative z-10">
          <p className="text-orange-100 text-xs">Patrimoine total</p>
          <p className="text-3xl font-bold mt-0.5">
            {patrimoineTotal.toLocaleString('fr-FR')} <span className="text-lg font-normal">FCFA</span>
          </p>
        </div>
      </div>

      {/* ── SOLDES ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Épargne',  value: soldeEpargne,  icon: 'ri-safe-line',    color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-100' },
          { label: 'Courant',  value: soldeCourant,  icon: 'ri-wallet-line',  color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-100' },
          { label: 'Tontine',  value: soldeTontine,  icon: 'ri-group-line',   color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border ${s.border} p-4 rounded-xl`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{s.label}</p>
              <div className={`w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm`}>
                <i className={`${s.icon} ${s.color} text-sm`} />
              </div>
            </div>
            <p className={`text-xl font-bold ${s.color}`}>
              {s.value.toLocaleString('fr-FR')}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">FCFA</p>
          </div>
        ))}
      </div>

      {/* ── CRÉDIT EN COURS ── */}
      {creditEnCours ? (
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Crédit en cours</h3>
            <button
              onClick={() => navigate('/espace-client/mes-credits')}
              className="text-orange-500 text-sm hover:underline"
            >
              Détails →
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-400">Montant accordé</p>
              <p className="font-bold text-gray-800">
                {Number(creditEnCours.montant_accorde).toLocaleString('fr-FR')} FCFA
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Reste à payer</p>
              <p className="font-bold text-red-600">
                {Number(creditEnCours.reste_a_payer || 0).toLocaleString('fr-FR')} FCFA
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Mensualité</p>
              <p className="font-bold text-orange-600">
                {Number(creditEnCours.mensualite || 0).toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>

          {/* Barre de progression remboursement */}
          {creditEnCours.montant_accorde > 0 && (
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Progression du remboursement</span>
                <span>
                  {Math.round((Number(creditEnCours.montant_rembourse || 0) / Number(creditEnCours.montant_accorde)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, Math.round((Number(creditEnCours.montant_rembourse || 0) / Number(creditEnCours.montant_accorde)) * 100))}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="font-medium text-orange-800">Aucun crédit actif</p>
            <p className="text-sm text-orange-600 mt-0.5">Faites une demande de crédit dès maintenant</p>
          </div>
          <button
            onClick={() => navigate('/espace-client/demande-credit')}
            className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition flex-shrink-0"
          >
            Demander un crédit
          </button>
        </div>
      )}

      {/* ── DERNIÈRES OPÉRATIONS ── */}
      <div className="bg-white rounded-xl border p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800">Dernières opérations</h3>
          <button
            onClick={() => navigate('/espace-client/historique')}
            className="text-orange-500 text-sm hover:underline"
          >
            Voir tout →
          </button>
        </div>

        {operations.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <i className="ri-exchange-line text-3xl text-gray-300 block mb-2" />
            <p className="text-sm">Aucune opération pour le moment</p>
          </div>
        ) : (
          <div className="space-y-2">
            {operations.map((op: any) => {
              const config = typeOpConfig[op.type_operation] || typeOpConfig.paiement;
              return (
                <div key={op.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <div className={`w-9 h-9 ${config.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <i className={`${config.icon} ${config.color} text-sm`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {op.description || op.type_operation}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(op.date_operation)}</p>
                  </div>
                  <span className={`font-bold text-sm flex-shrink-0 ${config.color}`}>
                    {config.sign}{op.montant.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── ACTIONS RAPIDES ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Dépôt Mobile',   icon: 'ri-smartphone-line',        path: '/espace-client/depot-mobile',   color: 'text-green-600',  bg: 'bg-green-50' },
          { label: 'Retrait',        icon: 'ri-money-dollar-circle-line', path: '/espace-client/retrait-mobile', color: 'text-red-600',    bg: 'bg-red-50' },
          { label: 'Mes crédits',    icon: 'ri-bank-card-line',           path: '/espace-client/mes-credits',    color: 'text-blue-600',   bg: 'bg-blue-50' },
          { label: 'Tontine',        icon: 'ri-group-line',               path: '/espace-client/tontine',        color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className={`${action.bg} p-4 rounded-xl border hover:shadow-md transition text-center`}
          >
            <i className={`${action.icon} ${action.color} text-2xl block mb-2`} />
            <p className="text-xs font-medium text-gray-700">{action.label}</p>
          </button>
        ))}
      </div>

      {/* ── NOTIFICATIONS ── */}
      {unreadCount > 0 && (
        <div
          onClick={() => navigate('/espace-client/notifications')}
          className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-orange-100 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center">
              <i className="ri-notification-3-line text-white text-sm" />
            </div>
            <div>
              <p className="font-medium text-orange-800 text-sm">
                {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-orange-600">Cliquez pour voir</p>
            </div>
          </div>
          <i className="ri-arrow-right-s-line text-orange-400 text-xl" />
        </div>
      )}

    </div>
  );
}