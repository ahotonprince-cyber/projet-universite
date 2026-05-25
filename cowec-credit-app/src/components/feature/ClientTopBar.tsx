import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { uploadUrl } from '@/config/api';

const pageTitles: Record<string, string> = {
  '/espace-client': 'Tableau de bord',
  '/espace-client/mes-credits': 'Mes crédits',
  '/espace-client/demande-credit': 'Demander un crédit',
  '/espace-client/remboursements': 'Mes remboursements',
  '/espace-client/notifications': 'Notifications',
  '/espace-client/profil': 'Mon profil',
  '/espace-client/solde': 'Mon solde',
  '/espace-client/historique': 'Historique',
  '/espace-client/depot-mobile': 'Dépôt Mobile',
  '/espace-client/retrait-mobile': 'Retrait Mobile',
  '/espace-client/tontine': 'Tontine',
  '/espace-client/securite': 'Sécurité',
  '/espace-client/statistiques': 'Statistiques',
  '/espace-client/support': 'Support',
};

interface UserInfo {
  nom: string;
  prenom: string;
  avatar: string | null;
  score_credit: number;
  role: string;
}

interface ClientTopBarProps {
  onMobileMenuToggle?: () => void;
}

export default function ClientTopBar({ onMobileMenuToggle }: ClientTopBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState<UserInfo | null>(null);

  const title = pageTitles[location.pathname] || 'Espace Client';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    // Chargement immédiat depuis localStorage
    const cached = localStorage.getItem('user');
    if (cached) {
      try { setUser(JSON.parse(cached)); } catch { /* ignore */ }
    }

    // Mise à jour depuis l'API
    Promise.all([
      fetch('/api/auth/me', { headers }).then(r => r.ok ? r.json() : null),
      fetch('/api/client/notifications?unread=true', { headers }).then(r => r.ok ? r.json() : null),
    ]).then(([userData, notifData]) => {
      if (userData?.user) {
        setUser(userData.user);
        localStorage.setItem('user', JSON.stringify(userData.user));
      }
      if (notifData) setUnreadCount(notifData.count ?? 0);
    }).catch(() => {});
  }, []);

  const displayName = user
    ? `${user.prenom || ''} ${(user.nom || '').charAt(0)}.`.trim()
    : '…';

  const initiales = user
    ? `${(user.prenom || '').charAt(0)}${(user.nom || '').charAt(0)}`.toUpperCase()
    : '?';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/client/connexion');
  };

  return (
    <header className="fixed top-0 right-0 left-0 h-16 bg-white border-b border-gray-100 z-30 flex items-center px-4 gap-3">
      {/* Hamburger mobile */}
      <button
        onClick={onMobileMenuToggle}
        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 flex-shrink-0"
      >
        <i className="ri-menu-line text-xl" />
      </button>

      <div className="flex-1 min-w-0">
        <h2 className="text-base font-semibold text-gray-800 truncate">{title}</h2>
        <p className="text-xs text-gray-400 hidden sm:block">COWEC Microfinance — Espace Client</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Score de crédit */}
        {user && user.score_credit > 0 && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-lg">
            <i className="ri-star-line text-orange-500 text-sm" />
            <span className="text-xs font-semibold text-orange-600">
              Score : {user.score_credit}/100
            </span>
          </div>
        )}

        {/* Notifications */}
        <button
          onClick={() => navigate('/espace-client/notifications')}
          className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-orange-50 transition-colors cursor-pointer"
        >
          <i className="ri-notification-3-line text-gray-500 text-lg" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer"
          >
            {user?.avatar ? (
              <img
                src={uploadUrl(user.avatar)}
                alt={displayName}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                {initiales}
              </div>
            )}
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-gray-800 leading-tight">{displayName}</p>
              <p className="text-xs text-orange-500 capitalize">{user?.role || 'Client'}</p>
            </div>
            <i className="ri-arrow-down-s-line text-gray-400 text-sm" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl overflow-hidden z-50 shadow-lg">
              <button
                onClick={() => { navigate('/espace-client/profil'); setShowDropdown(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors cursor-pointer text-left"
              >
                <i className="ri-user-line text-gray-500 text-sm" />
                <span className="text-sm text-gray-700">Mon profil</span>
              </button>
              <button
                onClick={() => { navigate('/espace-client/notifications'); setShowDropdown(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors cursor-pointer text-left"
              >
                <i className="ri-notification-3-line text-gray-500 text-sm" />
                <span className="text-sm text-gray-700">Notifications</span>
                {unreadCount > 0 && (
                  <span className="ml-auto text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
                    {unreadCount}
                  </span>
                )}
              </button>
              <div className="h-px bg-gray-100" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors cursor-pointer text-left"
              >
                <i className="ri-logout-box-r-line text-red-400 text-sm" />
                <span className="text-sm text-red-500">Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
