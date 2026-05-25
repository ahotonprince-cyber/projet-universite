import { useState, useEffect, useMemo, useCallback } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

// ============ TYPES ============
interface User {
  id: number;
  nom: string;
  prenom: string;
  role: 'admin' | 'superadmin' | 'agent';
}

interface NavItem {
  path: string;
  label: string;
  icon: string;
  section: 'core' | 'finance' | 'verification' | 'analytics' | 'system' | 'market';
  badge?: 'notification' | 'risk' | 'kyc';
  roles?: ('admin' | 'superadmin' | 'agent')[];
}

// ============ NAVIGATION STRUCTURÉE ============
const navItems: NavItem[] = [
  // SECTION: CORE
  { path: '/admin/tableau-de-bord', label: 'Tableau de bord', icon: 'ri-bar-chart-2-line', section: 'core' },
  { path: '/admin/clients', label: 'Clients', icon: 'ri-group-line', section: 'core' },
  { path: '/admin/comptes', label: 'Comptes clients', icon: 'ri-wallet-line', section: 'core' },

  // SECTION: FINANCE
  { path: '/admin/credits', label: 'Crédits', icon: 'ri-bank-card-line', section: 'finance' },
  { path: '/admin/remboursements', label: 'Remboursements', icon: 'ri-refund-2-line', section: 'finance' },
  { path: '/admin/depots', label: 'Dépôts', icon: 'ri-arrow-down-circle-line', section: 'finance' },
  { path: '/admin/retraits', label: 'Demandes retrait', icon: 'ri-money-dollar-circle-line', section: 'finance' },
  { path: '/admin/transactions', label: 'Transactions globales', icon: 'ri-exchange-line', section: 'finance', roles: ['superadmin', 'admin'] },

  // SECTION: VERIFICATION
  { path: '/admin/kyc', label: 'Validation KYC', icon: 'ri-file-check-line', section: 'verification', badge: 'kyc', roles: ['superadmin', 'admin'] },

  // SECTION: ANALYTICS
  { path: '/admin/statistiques', label: 'Statistiques avancées', icon: 'ri-pie-chart-line', section: 'analytics' },
  { path: '/admin/risques', label: 'Analyse des risques', icon: 'ri-alert-line', section: 'analytics', badge: 'risk', roles: ['superadmin', 'admin'] },

  // SECTION: SYSTEM
  { path: '/admin/support', label: 'Support client', icon: 'ri-customer-service-2-line', section: 'system' },
  { path: '/admin/notifications', label: 'Notifications', icon: 'ri-notification-3-line', section: 'system', badge: 'notification' },
  { path: '/admin/logs', label: 'Journal système', icon: 'ri-history-line', section: 'system', roles: ['superadmin'] },
  { path: '/admin/habilitations', label: 'Habilitations', icon: 'ri-shield-user-line', section: 'system', roles: ['superadmin', 'admin'] },
  { path: '/admin/utilisateurs', label: 'Gestion utilisateurs', icon: 'ri-admin-line', section: 'system', roles: ['superadmin'] },

  // SECTION: MARKET
  { path: '/admin/tontines', label: 'Tontines', icon: 'ri-group-line', section: 'market' },
  { path: '/admin/cotisations-tontine', label: 'Cotisations tontine', icon: 'ri-coins-line', section: 'market' },
  { path: '/admin/produits-credit', label: 'Produits crédit', icon: 'ri-percent-line', section: 'market' },
  { path: '/admin/operateurs-mobile', label: 'Mobile Money', icon: 'ri-smartphone-line', section: 'market' },
];

// ============ SECTIONS ============
const sections: { id: string; label: string; order: number }[] = [
  { id: 'core', label: 'CORE', order: 1 },
  { id: 'finance', label: 'FINANCE', order: 2 },
  { id: 'verification', label: 'VÉRIFICATION', order: 3 },
  { id: 'analytics', label: 'ANALYTICS', order: 4 },
  { id: 'system', label: 'SYSTÈME', order: 5 },
  { id: 'market', label: 'MARKET', order: 6 },
];

// ============ HELPER ============
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
    localStorage.clear();
    navigate('/client/connexion');
    return null;
  }

  return res;
};

// ============ COMPOSANT PRINCIPAL ============
interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ collapsed, onToggle, mobileOpen = false, onMobileClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [kycPendingCount, setKycPendingCount] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ============ FETCH DATA ============
  const fetchData = useCallback(async () => {
    try {
      const [notifRes, kycRes, userRes] = await Promise.all([
        authFetch('/api/admin/notifications?unread=true', navigate),
        authFetch('/api/admin/kyc/pending-count', navigate),
        authFetch('/api/auth/me', navigate),
      ]);

      if (notifRes && notifRes.ok) {
        const data = await notifRes.json();
        setUnreadCount(data.count || 0);
      }

      if (kycRes && kycRes.ok) {
        const data = await kycRes.json();
        setKycPendingCount(data.count || 0);
      }

      if (userRes && userRes.ok) {
        const data = await userRes.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error('Erreur chargement sidebar:', err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
    // Rafraîchissement toutes les 30 secondes (au lieu de 10)
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ============ FILTRER ITEMS PAR RÔLE ============
  const filteredNavItems = useMemo(() => {
    if (!user) return [];
    return navItems.filter(item => {
      if (!item.roles) return true;
      return item.roles.includes(user.role);
    });
  }, [user]);

  // ============ GROUPER PAR SECTION ============
  const groupedItems = useMemo(() => {
    const groups: Record<string, NavItem[]> = {};
    
    sections.forEach(section => {
      groups[section.id] = filteredNavItems.filter(item => item.section === section.id);
    });
    
    return groups;
  }, [filteredNavItems]);

  // ============ BADGE RENDU ============
  const getBadge = (item: NavItem) => {
    if (item.badge === 'notification' && unreadCount > 0) {
      return <span className="ml-auto bg-red-500 text-white text-xs px-2 rounded-full">{unreadCount > 99 ? '99+' : unreadCount}</span>;
    }
    if (item.badge === 'kyc' && kycPendingCount > 0) {
      return <span className="ml-auto bg-orange-500 text-white text-xs px-2 rounded-full">{kycPendingCount}</span>;
    }
    if (item.badge === 'risk') {
      return <span className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse" />;
    }
    return null;
  };

  // ============ LOGOUT ============
  const handleLogout = () => {
    localStorage.clear();
    navigate('/client/connexion');
  };

  // ============ ACTIVE CHECK ============
  const isActive = (path: string) => location.pathname.startsWith(path);

  // ============ SKELETON LOADING ============
  if (loading) {
    return (
      <aside className={`fixed left-0 top-0 h-full bg-white border-r z-40 flex flex-col transition-transform duration-300 ${collapsed ? 'w-20' : 'w-64'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center gap-3 px-4 py-5 border-b">
          <div className="w-10 h-10 bg-orange-500 rounded-xl" />
          {!collapsed && <div className="h-5 bg-gray-200 rounded w-24 animate-pulse" />}
        </div>
        <div className="flex-1 p-3 space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-100 z-40 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      {/* ============ HEADER ============ */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-sm">
          <i className="ri-bank-line text-white text-xl" />
        </div>
        {!collapsed && (
          <div className="flex-1">
            <h1 className="font-bold text-gray-800">COWEC</h1>
            <p className="text-xs text-orange-500">Admin Panel</p>
          </div>
        )}
        {/* Bouton fermer (mobile uniquement) */}
        <button
          onClick={onMobileClose}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
        >
          <i className="ri-close-line text-gray-500" />
        </button>
        {/* Bouton collapse (desktop uniquement) */}
        <button
          onClick={onToggle}
          className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg hover:bg-gray-100 transition"
        >
          <i className={`${collapsed ? 'ri-arrow-right-s-line' : 'ri-arrow-left-s-line'} text-gray-500`} />
        </button>
      </div>

      {/* ============ NAVIGATION ============ */}
      <nav className="flex-1 overflow-y-auto p-3">
        {sections.map(section => {
          const items = groupedItems[section.id];
          if (!items || items.length === 0) return null;

          return (
            <div key={section.id} className="mb-4">
              {!collapsed && (
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                  {section.label}
                </p>
              )}
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive: navActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                          navActive || isActive(item.path)
                            ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-sm'
                            : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                        }`
                      }
                      title={collapsed ? item.label : undefined}
                    >
                      <i className={`${item.icon} text-lg ${collapsed ? 'mx-auto' : ''}`} />
                      {!collapsed && <span className="text-sm flex-1">{item.label}</span>}
                      {!collapsed && getBadge(item)}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* ============ USER SECTION ============ */}
      <div className="border-t border-gray-100 p-3">
        <div
          onClick={handleLogout}
          className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-red-50 transition group ${collapsed ? 'justify-center' : ''}`}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white shadow-sm">
            <i className="ri-user-line text-sm" />
          </div>
          {!collapsed && (
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800 group-hover:text-red-600 transition">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          )}
          {!collapsed && (
            <i className="ri-logout-box-r-line text-gray-400 group-hover:text-red-500 transition" />
          )}
        </div>
      </div>
    </aside>
  );
}