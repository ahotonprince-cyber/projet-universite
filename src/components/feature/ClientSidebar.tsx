import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { clientNotifications } from "@/mocks/clientNotifications";

const navItems = [
  { path: '/espace-client', label: 'Tableau de bord', icon: 'ri-dashboard-line', exact: true },
  { path: '/espace-client/mes-credits', label: 'Mes crédits', icon: 'ri-bank-card-line' },
  { path: '/espace-client/demande-credit', label: 'Demander un crédit', icon: 'ri-add-circle-line' },
  { path: '/espace-client/remboursements', label: 'Remboursements', icon: 'ri-money-dollar-circle-line' },
  { path: '/espace-client/notifications', label: 'Notifications', icon: 'ri-notification-3-line' },
  { path: '/espace-client/profil', label: 'Mon profil', icon: 'ri-user-settings-line' },
];

interface ClientSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function ClientSidebar({ collapsed, onToggle }: ClientSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const unreadCount = clientNotifications.filter((n) => !n.lu).length;

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-100 z-40 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <i className="ri-bank-line text-white text-lg" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">COWEC</h1>
            <p className="text-xs text-orange-500 font-medium">Espace Client</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg hover:bg-orange-50 text-gray-400 hover:text-orange-500 transition-colors cursor-pointer flex-shrink-0"
        >
          <i className={`${collapsed ? 'ri-arrow-right-s-line' : 'ri-arrow-left-s-line'} text-lg`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        {!collapsed && (
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
            Menu principal
          </p>
        )}
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            const isNotif = item.path.includes('notifications');

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white'
                      : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                  }`}
                >
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 relative">
                    <i className={`${item.icon} text-lg`} />
                    {isNotif && unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {!collapsed && (
          <>
            <div className="my-4 h-px bg-gray-100" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
              Aide
            </p>
            <ul className="space-y-1">
              <li>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-all cursor-pointer whitespace-nowrap">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-customer-service-2-line text-lg" />
                  </div>
                  <span className="text-sm font-medium">Support</span>
                </button>
              </li>
              <li>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-all cursor-pointer whitespace-nowrap">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-question-line text-lg" />
                  </div>
                  <span className="text-sm font-medium">FAQ</span>
                </button>
              </li>
            </ul>
          </>
        )}
      </nav>

      {/* User Profile */}
      <div className="border-t border-gray-100 p-3">
        <div className={`flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-orange-50 cursor-pointer transition-colors ${collapsed ? 'justify-center' : ''}`}>
          <img
            src="https://readdy.ai/api/search-image?query=professional%20african%20woman%20portrait%20smiling%20confident%20business%20attire%20neutral%20background%20studio%20photography&width=40&height=40&seq=sidebar-avatar&orientation=squarish"
            alt="Aminata Diallo"
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">Aminata Diallo</p>
              <p className="text-xs text-orange-500">Client actif</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => navigate('/client/connexion')}
              className="w-5 h-5 flex items-center justify-center cursor-pointer"
              title="Déconnexion"
            >
              <i className="ri-logout-box-r-line text-gray-400 text-sm" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
