import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { clientNotifications } from '@/mocks/clientNotifications';

const pageTitles: Record<string, string> = {
  '/espace-client': 'Tableau de bord',
  '/espace-client/mes-credits': 'Mes crédits',
  '/espace-client/demande-credit': 'Demander un crédit',
  '/espace-client/remboursements': 'Mes remboursements',
  '/espace-client/notifications': 'Notifications',
  '/espace-client/profil': 'Mon profil',
};

export default function ClientTopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const unreadCount = clientNotifications.filter((n) => !n.lu).length;
  const title = pageTitles[location.pathname] || 'Espace Client';

  return (
    <header className="fixed top-0 right-0 left-0 h-16 bg-white border-b border-gray-100 z-30 flex items-center px-6 gap-4">
      <div className="flex-1">
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        <p className="text-xs text-gray-400">COWEC Microfinance — Espace Client</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Score de crédit */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-lg">
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-star-line text-orange-500 text-sm" />
          </div>
          <span className="text-xs font-semibold text-orange-600">Score : 82/100</span>
        </div>

        {/* Notifications */}
        <button
          onClick={() => navigate('/espace-client/notifications')}
          className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-orange-50 transition-colors cursor-pointer"
        >
          <i className="ri-notification-3-line text-gray-500 text-lg" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer"
          >
            <img
              src="https://readdy.ai/api/search-image?query=professional%20african%20woman%20portrait%20smiling%20confident%20business%20attire%20neutral%20background%20studio%20photography&width=40&height=40&seq=topbar-avatar&orientation=squarish"
              alt="Aminata"
              className="w-7 h-7 rounded-full object-cover"
            />
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-gray-800 leading-tight">Aminata D.</p>
              <p className="text-xs text-orange-500">Client</p>
            </div>
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-arrow-down-s-line text-gray-400 text-sm" />
            </div>
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl overflow-hidden z-50">
              <button
                onClick={() => { navigate('/espace-client/profil'); setShowDropdown(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors cursor-pointer text-left"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-user-line text-gray-500 text-sm" />
                </div>
                <span className="text-sm text-gray-700">Mon profil</span>
              </button>
              <button
                onClick={() => { navigate('/espace-client/notifications'); setShowDropdown(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors cursor-pointer text-left"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-notification-3-line text-gray-500 text-sm" />
                </div>
                <span className="text-sm text-gray-700">Notifications</span>
                {unreadCount > 0 && <span className="ml-auto text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">{unreadCount}</span>}
              </button>
              <div className="h-px bg-gray-100" />
              <button
                onClick={() => navigate('/client/connexion')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors cursor-pointer text-left"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-logout-box-r-line text-red-400 text-sm" />
                </div>
                <span className="text-sm text-red-500">Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
