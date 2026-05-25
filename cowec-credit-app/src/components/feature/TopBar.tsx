import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { uploadUrl } from '@/config/api';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/admin': { title: 'Accueil', subtitle: 'Vue d\'ensemble de l\'activité' },
  '/admin/clients': { title: 'Gestion des Clients', subtitle: 'Gérez vos clients et leurs informations' },
  '/admin/credits': { title: 'Gestion des Crédits', subtitle: 'Suivez les demandes et crédits actifs' },
  '/admin/remboursements': { title: 'Remboursements', subtitle: 'Enregistrez et suivez les paiements' },
  '/admin/tableau-de-bord': { title: 'Tableau de Bord', subtitle: 'Statistiques et analyses de performance' },
  '/admin/notifications': { title: 'Notifications', subtitle: 'Alertes et messages importants' },
  '/admin/comptes': { title: 'Comptes clients', subtitle: 'Gestion des comptes bancaires' },
  '/admin/retraits': { title: 'Demandes de retrait', subtitle: 'Traitez les demandes de retrait' },
  '/admin/kyc': { title: 'Validation KYC', subtitle: 'Vérification des identités' },
  '/admin/transactions': { title: 'Transactions', subtitle: 'Historique des opérations' },
  '/admin/statistiques': { title: 'Statistiques avancées', subtitle: 'Analyses et indicateurs clés' },
  '/admin/logs': { title: 'Journal système', subtitle: 'Traçabilité des actions' },
  '/admin/habilitations': { title: 'Habilitations', subtitle: 'Gestion des rôles et droits' },
  '/admin/utilisateurs': { title: 'Utilisateurs', subtitle: 'Gestion des comptes utilisateurs' },
  '/admin/risques': { title: 'Analyse des risques', subtitle: 'Suivi du risque portefeuille' },
  '/admin/tontines': { title: 'Tontines', subtitle: 'Groupes d\'épargne' },
  '/admin/produits-credit': { title: 'Produits crédit', subtitle: 'Catalogue des offres de crédit' },
  '/admin/operateurs-mobile': { title: 'Mobile Money', subtitle: 'Opérateurs de paiement mobile' },
};

interface UserInfo {
  nom: string;
  prenom: string;
  avatar?: string | null;
  role: string;
}

interface TopBarProps {
  sidebarCollapsed: boolean;
  onMobileMenuToggle?: () => void;
}

export default function TopBar({ sidebarCollapsed, onMobileMenuToggle }: TopBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    const cached = localStorage.getItem('user');
    if (cached) {
      try { setUser(JSON.parse(cached)); } catch { /* ignore */ }
    }

    Promise.all([
      fetch('/api/admin/notifications?unread=true', { headers }).then(r => r.ok ? r.json() : null),
      fetch('/api/auth/me', { headers }).then(r => r.ok ? r.json() : null),
    ]).then(([notifData, userData]) => {
      if (notifData) setUnreadCount(notifData.count ?? 0);
      if (userData?.user) {
        setUser(userData.user);
        localStorage.setItem('user', JSON.stringify(userData.user));
      }
    }).catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/client/connexion');
  };

  const initiales = user
    ? `${(user.prenom || '').charAt(0)}${(user.nom || '').charAt(0)}`.toUpperCase()
    : '?';

  const pageInfo = pageTitles[location.pathname] || { title: 'COWEC Admin', subtitle: '' };

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white border-b border-gray-100 z-30 flex items-center px-4 lg:px-6 gap-3 transition-all duration-300 left-0 ${
        sidebarCollapsed ? 'lg:left-20' : 'lg:left-64'
      }`}
    >
      {/* Hamburger mobile */}
      <button
        onClick={onMobileMenuToggle}
        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 flex-shrink-0"
      >
        <i className="ri-menu-line text-xl" />
      </button>

      <div className="flex-1 min-w-0">
        <h2 className="text-base lg:text-lg font-bold text-gray-900 leading-tight truncate">{pageInfo.title}</h2>
        <p className="text-xs text-gray-400 hidden sm:block">{pageInfo.subtitle}</p>
      </div>

      {/* Search */}
      <div className="relative hidden md:block">
        <i className="ri-search-line text-gray-400 text-sm absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:bg-white transition-colors w-56"
        />
      </div>

      {/* Notifications */}
      <button
        onClick={() => navigate('/admin/notifications')}
        className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-orange-50 text-gray-500 hover:text-orange-500 transition-colors cursor-pointer"
      >
        <i className="ri-notification-3-line text-xl" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Date */}
      <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
        <i className="ri-calendar-line text-orange-500" />
        <span>{new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
      </div>

      {/* User avatar + dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer"
        >
          {user?.avatar ? (
            <img src={uploadUrl(user.avatar)} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
              {initiales}
            </div>
          )}
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-gray-800 leading-tight">
              {user ? `${user.prenom} ${user.nom}` : '…'}
            </p>
            <p className="text-xs text-gray-400 capitalize">{user?.role || ''}</p>
          </div>
          <i className="ri-arrow-down-s-line text-gray-400 text-sm" />
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-gray-50">
              <p className="text-sm font-semibold text-gray-800">{user ? `${user.prenom} ${user.nom}` : ''}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={() => { setShowDropdown(false); navigate('/admin/profil'); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer text-left"
            >
              <i className="ri-user-settings-line text-gray-400 text-sm" />
              <span className="text-sm text-gray-700">Mon profil</span>
            </button>
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
    </header>
  );
}
