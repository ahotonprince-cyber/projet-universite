import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { notifications } from '@/mocks/notifications';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Accueil', subtitle: 'Vue d\'ensemble de l\'activité' },
  '/clients': { title: 'Gestion des Clients', subtitle: 'Gérez vos clients et leurs informations' },
  '/credits': { title: 'Gestion des Crédits', subtitle: 'Suivez les demandes et crédits actifs' },
  '/remboursements': { title: 'Remboursements', subtitle: 'Enregistrez et suivez les paiements' },
  '/tableau-de-bord': { title: 'Tableau de Bord', subtitle: 'Statistiques et analyses de performance' },
  '/notifications': { title: 'Notifications', subtitle: 'Alertes et messages importants' },
};

interface TopBarProps {
  sidebarCollapsed: boolean;
}

export default function TopBar({ sidebarCollapsed }: TopBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const pageInfo = pageTitles[location.pathname] || { title: 'COWEC', subtitle: '' };
  const unreadCount = notifications.filter((n) => !n.lu).length;

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white border-b border-gray-100 z-30 flex items-center px-6 gap-4 transition-all duration-300 ${
        sidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      <div className="flex-1">
        <h2 className="text-lg font-bold text-gray-900 leading-tight">{pageInfo.title}</h2>
        <p className="text-xs text-gray-400">{pageInfo.subtitle}</p>
      </div>

      {/* Search */}
      <div className="relative hidden md:block">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
          <i className="ri-search-line text-gray-400 text-sm" />
        </div>
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:bg-white transition-colors w-56"
        />
      </div>

      {/* Notifications Bell */}
      <button
        onClick={() => navigate('/notifications')}
        className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-orange-50 text-gray-500 hover:text-orange-500 transition-colors cursor-pointer"
      >
        <i className="ri-notification-3-line text-xl" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Date */}
      <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
        <div className="w-4 h-4 flex items-center justify-center">
          <i className="ri-calendar-line text-orange-500" />
        </div>
        <span>
          {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>
    </header>
  );
}
