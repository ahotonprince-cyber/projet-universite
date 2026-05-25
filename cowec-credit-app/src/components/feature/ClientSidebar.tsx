import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

// 🔐 Helper sécurisé
const authFetch = async (url: string, navigate: any) => {
  const token = localStorage.getItem('token');
  if (!token) {
    navigate('/client/connexion');
    return null;
  }
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (res.status === 401) {
    navigate('/client/connexion');
    return null;
  }
  return res;
};

// 🔒 Items bloqués si compte en attente
const ITEMS_BLOQUES_SI_EN_ATTENTE = [
  '/espace-client/solde',
  '/espace-client/mes-credits',
  '/espace-client/demande-credit',
  '/espace-client/remboursements',
  '/espace-client/depot-mobile',
  '/espace-client/retrait-mobile',
  '/espace-client/tontine',
  '/espace-client/statistiques',
  '/espace-client/historique',
];

// 🚀 Navigation
const navItems = [
  { path: '/espace-client', label: 'Tableau de bord', icon: 'ri-dashboard-line', exact: true },
  // { path: '/espace-client/documents', label: 'Mes documents', icon: 'ri-file-upload-line' },
  { path: '/espace-client/solde', label: 'Mon solde', icon: 'ri-wallet-line' },
  { path: '/espace-client/historique', label: 'Historique', icon: 'ri-history-line' },
  { path: '/espace-client/depot-mobile', label: 'Dépôt Mobile', icon: 'ri-smartphone-line' },
  { path: '/espace-client/retrait-mobile', label: 'Retrait Mobile', icon: 'ri-money-dollar-circle-line' },
  { path: '/espace-client/tontine', label: 'Tontine', icon: 'ri-group-line' },
  { path: '/espace-client/mes-credits', label: 'Mes crédits', icon: 'ri-bank-card-line' },
  { path: '/espace-client/remboursements', label: 'Remboursements', icon: 'ri-refund-2-line' },
  // { path: '/espace-client/statistiques', label: 'Statistiques', icon: 'ri-bar-chart-line' },
  { path: '/espace-client/notifications', label: 'Notifications', icon: 'ri-notification-3-line' },
  { path: '/espace-client/securite', label: 'Sécurité', icon: 'ri-shield-keyhole-line' },
  { path: '/espace-client/parametres', label: 'Paramètres', icon: 'ri-settings-3-line' },
  { path: '/espace-client/support', label: 'Support', icon: 'ri-customer-service-2-line' },
  { path: '/espace-client/profil', label: 'Mon profil', icon: 'ri-user-settings-line' },
];

interface ClientSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function ClientSidebar({ collapsed, onToggle, mobileOpen = false, onMobileClose }: ClientSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState<any>({ nom: '', prenom: '', photo: '' });
  const [isLoading, setIsLoading] = useState(true);

  // Lire le statut depuis localStorage
  const userStatut = JSON.parse(localStorage.getItem('user') || '{}')?.statut;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notifRes, userRes] = await Promise.all([
          authFetch('/api/client/notifications?unread=true', navigate),
          authFetch('/api/auth/me', navigate)
        ]);

        if (notifRes && notifRes.status !== 429) {
          const data = await notifRes.json();
          setUnreadCount(data.count || 0);
        }

        if (userRes && userRes.status !== 429) {
          const data = await userRes.json();
          setUser(data.user || { nom: '', prenom: '', photo: '' });
        }
      } catch (err) {
        console.error('Erreur sidebar:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/client/connexion');
  };

  const displayName = isLoading
    ? 'Chargement...'
    : `${user?.prenom || ''} ${user?.nom || ''}`.trim() || 'Client';

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-100 z-40 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b">
        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
          <i className="ri-bank-line text-white" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-bold">COWEC</h1>
            <p className="text-xs text-orange-500">Espace Client</p>
          </div>
        )}
        {/* Fermer (mobile) */}
        <button
          onClick={onMobileClose}
          className="ml-auto lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
        >
          <i className="ri-close-line text-gray-500" />
        </button>
        {/* Collapse (desktop) */}
        <button
          onClick={onToggle}
          className="ml-auto hidden lg:flex w-8 h-8 items-center justify-center rounded-lg hover:bg-gray-100 transition"
        >
          <i className={collapsed ? 'ri-arrow-right-s-line' : 'ri-arrow-left-s-line'} />
        </button>
      </div>

      {/* Bandeau en attente */}
      {!collapsed && userStatut === 'en_attente' && (
        <div className="mx-3 mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2">
            <i className="ri-time-line text-orange-500 text-sm" />
            <p className="text-xs text-orange-700 font-medium">Compte en attente</p>
          </div>
          <p className="text-xs text-orange-500 mt-0.5">Uploadez vos documents</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            const isNotif = item.path.includes('notifications');

            // Griser si compte en attente et item bloqué
            const estBloque = userStatut === 'en_attente' &&
              ITEMS_BLOQUES_SI_EN_ATTENTE.includes(item.path);

            return (
              <li
                key={item.path}
                className={estBloque ? 'opacity-40 pointer-events-none' : ''}
                title={estBloque ? 'Disponible après validation de votre compte' : undefined}
              >
                <NavLink
                  to={item.path}
                  onClick={onMobileClose}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    isActive
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                  }`}
                >
                  <div className="relative">
                    <i className={item.icon} />
                    {isNotif && unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                  {!collapsed && (
                    <span className="text-sm flex-1">{item.label}</span>
                  )}
                  {/* Icône cadenas si bloqué */}
                  {!collapsed && estBloque && (
                    <i className="ri-lock-line text-gray-300 text-xs" />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User */}
      <div className="border-t p-3">
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
          {user?.photo ? (
            <img
              src={user.photo}
              className="w-8 h-8 rounded-full object-cover"
              alt="avatar"
            />
          ) : (
            <div
              onClick={() => navigate('/espace-client/profil')}
              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition"
            >
              <i className="ri-user-line text-gray-500 text-sm" />
            </div>
          )}

          {!collapsed && (
            <div className="flex-1">
              <p className="text-sm font-semibold truncate">{displayName}</p>
              <p className={`text-xs ${userStatut === 'en_attente' ? 'text-orange-400' : 'text-orange-500'}`}>
                {userStatut === 'en_attente' ? 'En attente' : 'Client actif'}
              </p>
            </div>
          )}

          {!collapsed && (
            <button
              onClick={handleLogout}
              title="Déconnexion"
              className="hover:bg-gray-100 p-1 rounded-lg transition"
            >
              <i className="ri-logout-box-r-line text-gray-400" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}