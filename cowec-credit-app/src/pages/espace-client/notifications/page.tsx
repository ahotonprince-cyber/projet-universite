import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: number;
  titre: string;
  message: string;
  date: string;
  lu: boolean;
  type: string;
}

const typeConfig: Record<string, { icon: string; color: string; bg: string }> = {
  paiement: { icon: 'ri-money-dollar-circle-line', color: 'text-green-600', bg: 'bg-green-100' },
  validation: { icon: 'ri-shield-check-line', color: 'text-orange-600', bg: 'bg-orange-100' },
  rappel: { icon: 'ri-alarm-line', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  info: { icon: 'ri-information-line', color: 'text-blue-600', bg: 'bg-blue-100' },
  alerte: { icon: 'ri-error-warning-line', color: 'text-red-600', bg: 'bg-red-100' },
};

// 🔐 Helper auth fetch
const authFetch = async (url: string, options: RequestInit = {}, navigate?: any) => {
  const token = localStorage.getItem('token');

  if (!token) {
    if (navigate) navigate('/client/connexion');
    throw new Error('Non authentifié');
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (res.status === 401) {
    if (navigate) navigate('/client/connexion');
    throw new Error('Session expirée');
  }

  return res;
};

export default function NotificationsClientPage() {
  const navigate = useNavigate();

  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [filter, setFilter] = useState('tous');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/client/connexion');
        return;
      }

      const res = await fetch('/api/client/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 401) {
        navigate('/client/connexion');
        return;
      }

      if (!res.ok) throw new Error('Erreur chargement notifications');

      const data = await res.json();
      setNotifs(data.notifications || []);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [navigate]);

  // ✅ Marquer UNE notification comme lue (avec appel API)
  const markAsRead = async (id: number) => {
    try {
      setActionLoading(id);

      const res = await authFetch(
        `/api/client/notifications/${id}/read`,
        { method: 'PUT' },
        navigate
      );

      if (!res.ok) throw new Error('Erreur lors du marquage');

      // Mettre à jour le state local
      setNotifs(prev =>
        prev.map(n => (n.id === id ? { ...n, lu: true } : n))
      );

      showToast('Notification marquée comme lue');
    } catch (err) {
      console.error(err);
      showToast('Erreur lors du marquage', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // ✅ Marquer TOUTES les notifications comme lues (avec appel API)
  const markAllAsRead = async () => {
    try {
      const res = await authFetch(
        '/api/client/notifications/read-all',
        { method: 'POST' },
        navigate
      );

      if (!res.ok) throw new Error('Erreur lors du marquage');

      // Mettre à jour le state local
      setNotifs(prev => prev.map(n => ({ ...n, lu: true })));

      showToast('Toutes les notifications ont été marquées comme lues');
    } catch (err) {
      console.error(err);
      showToast('Erreur lors du marquage', 'error');
    }
  };

  // ✅ Supprimer une notification (avec appel API)
  const deleteNotification = async (id: number) => {
    if (!confirm('Supprimer cette notification ?')) return;

    try {
      setActionLoading(id);

      const res = await authFetch(
        `/api/client/notifications/${id}`,
        { method: 'DELETE' },
        navigate
      );

      if (!res.ok) throw new Error('Erreur lors de la suppression');

      // Mettre à jour le state local
      setNotifs(prev => prev.filter(n => n.id !== id));

      showToast('Notification supprimée');
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la suppression', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = useMemo(() => {
    let result = [...notifs];

    if (filter !== 'tous') {
      result = result.filter(n => n.type === filter);
    }

    if (search.trim()) {
      result = result.filter(n =>
        n.titre.toLowerCase().includes(search.toLowerCase()) ||
        n.message.toLowerCase().includes(search.toLowerCase())
      );
    }

    return result.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [notifs, filter, search]);

  const unread = notifs.filter(n => !n.lu).length;

  const filters = ['tous', 'paiement', 'validation', 'rappel', 'info', 'alerte'];

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 bg-red-50 p-4 rounded-xl">
        <p>{error}</p>
        <button
          onClick={fetchNotifications}
          className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg text-sm"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto">

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Notifications</h2>
          <p className="text-sm text-gray-500">{unread} non lue(s)</p>
        </div>

        {unread > 0 && (
          <button 
            onClick={markAllAsRead} 
            className="text-orange-500 text-sm font-medium hover:text-orange-600 transition"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      <input
        type="text"
        placeholder="Rechercher une notification..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 transition-colors"
      />

      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs transition ${
              filter === f ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'tous' ? 'Tous' : f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
            <i className="ri-notification-3-line text-3xl text-gray-300" />
          </div>
          <p className="text-sm">Aucune notification</p>
        </div>
      ) : (
        filtered.map(n => {
          const cfg = typeConfig[n.type] || typeConfig.info;
          const isLoading = actionLoading === n.id;

          return (
            <div
              key={n.id}
              className={`bg-white p-4 rounded-xl border flex gap-3 transition ${
                !n.lu ? 'border-orange-200 bg-orange-50/20' : 'border-gray-100'
              }`}
            >
              <div className={`w-10 h-10 ${cfg.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                <i className={`${cfg.icon} ${cfg.color}`} />
              </div>

              <div className="flex-1">
                <p className="font-semibold text-sm">
                  {n.titre}
                  {!n.lu && <span className="ml-2 text-xs text-orange-500 font-normal">Nouveau</span>}
                </p>

                <p className="text-xs text-gray-500 mt-1">{n.message}</p>

                <p className="text-xs text-gray-400 mt-2">
                  {new Date(n.date).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {!n.lu && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    disabled={isLoading}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-green-50 transition"
                    title="Marquer comme lu"
                  >
                    <i className="ri-check-line text-green-500 text-lg" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(n.id)}
                  disabled={isLoading}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition"
                  title="Supprimer"
                >
                  <i className="ri-delete-bin-line text-red-400 text-lg" />
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}