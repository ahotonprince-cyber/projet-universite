import { useState, useEffect } from 'react';

interface Notification {
  id: number;
  titre: string;
  message: string;
  type: 'retard' | 'validation' | 'paiement' | 'info' | string;
  lu: boolean;
  date: string;
  client_nom?: string;
  credit_id?: number;
}

const typeConfig: Record<
  string,
  { icon: string; cls: string; bg: string }
> = {
  retard: {
    icon: 'ri-alarm-warning-line',
    cls: 'text-red-500',
    bg: 'bg-red-50',
  },
  validation: {
    icon: 'ri-checkbox-circle-line',
    cls: 'text-sky-500',
    bg: 'bg-sky-50',
  },
  paiement: {
    icon: 'ri-money-dollar-circle-line',
    cls: 'text-green-500',
    bg: 'bg-green-50',
  },
  info: {
    icon: 'ri-information-line',
    cls: 'text-orange-500',
    bg: 'bg-orange-50',
  },
};

// fallback sécurisé
const defaultConfig = typeConfig.info;

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('tous');
  const [filterLu, setFilterLu] = useState<'tous' | 'non_lu' | 'lu'>('tous');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // ✅ URL CORRIGÉE
      const response = await fetch('/api/admin/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error();

      const data = await response.json();
      setNotifs(data.notifications || []);
    } catch (err) {
      console.error(err);
      showToast('Erreur chargement notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filtered = notifs.filter((n) => {
    const matchType = filterType === 'tous' || n.type === filterType;
    const matchLu =
      filterLu === 'tous' ||
      (filterLu === 'non_lu' ? !n.lu : n.lu);

    return matchType && matchLu;
  });

  const unreadCount = notifs.filter((n) => !n.lu).length;

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('token');

      // ✅ URL CORRIGÉE
      await fetch(
        `/api/admin/notifications/${id}/read`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotifs((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, lu: true } : n
        )
      );
    } catch {
      showToast('Erreur marquage');
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');

      // ✅ URL CORRIGÉE
      await fetch(
        `/api/admin/notifications/read-all`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotifs((prev) =>
        prev.map((n) => ({ ...n, lu: true }))
      );

      showToast('Toutes les notifications sont lues');
    } catch {
      showToast('Erreur');
    }
  };

  const deleteNotif = async (id: number) => {
    try {
      const token = localStorage.getItem('token');

      // ✅ URL CORRIGÉE
      await fetch(
        `/api/admin/notifications/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotifs((prev) =>
        prev.filter((n) => n.id !== id)
      );

      showToast('Notification supprimée');
    } catch {
      showToast('Erreur suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* TOAST */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl text-sm shadow-lg">
          {toast}
        </div>
      )}

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3">

        <select
          value={filterLu}
          onChange={(e) => setFilterLu(e.target.value as any)}
          className="border px-3 py-2 rounded-lg text-sm"
        >
          <option value="tous">Tous</option>
          <option value="non_lu">
            Non lus ({unreadCount})
          </option>
          <option value="lu">Lus</option>
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border px-3 py-2 rounded-lg text-sm"
        >
          <option value="tous">Tous types</option>
          <option value="retard">Retard</option>
          <option value="validation">Validation</option>
          <option value="paiement">Paiement</option>
          <option value="info">Info</option>
        </select>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-orange-600 text-sm ml-auto"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center text-gray-400 py-10">
            Aucune notification
          </div>
        )}

        {filtered.map((notif) => {
          const cfg =
            typeConfig[notif.type] ?? defaultConfig;

          return (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border ${
                notif.lu
                  ? 'bg-white'
                  : 'bg-orange-50 border-orange-200'
              }`}
            >
              <div className="flex justify-between">

                <div className="flex gap-3">
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-xl ${cfg.bg}`}
                  >
                    <i
                      className={`${cfg.icon} ${cfg.cls}`}
                    />
                  </div>

                  <div>
                    <p className="font-semibold">
                      {notif.titre}
                    </p>
                    <p className="text-sm text-gray-500">
                      {notif.message}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!notif.lu && (
                    <button
                      onClick={() =>
                        markAsRead(notif.id)
                      }
                      className="text-green-500 text-sm"
                    >
                      ✔
                    </button>
                  )}

                  <button
                    onClick={() =>
                      deleteNotif(notif.id)
                    }
                    className="text-red-500 text-sm"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}