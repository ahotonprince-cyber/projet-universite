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

const typeConfig: Record<string, { icon: string; cls: string; bg: string }> = {
  retard: { icon: 'ri-alarm-warning-line', cls: 'text-red-500', bg: 'bg-red-50' },
  validation: { icon: 'ri-checkbox-circle-line', cls: 'text-sky-500', bg: 'bg-sky-50' },
  paiement: { icon: 'ri-money-dollar-circle-line', cls: 'text-green-500', bg: 'bg-green-50' },
  info: { icon: 'ri-information-line', cls: 'text-orange-500', bg: 'bg-orange-50' },
};

/* 🔥 GROUPER PAR DATE */
const groupByDate = (notifications: Notification[]) => {
  const groups: Record<string, Notification[]> = {};

  const today = new Date().toDateString();

  notifications.forEach((n) => {
    const date = new Date(n.date).toDateString();

    let key = "Ancien";

    if (date === today) {
      key = "Aujourd'hui";
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (date === yesterday.toDateString()) {
        key = "Hier";
      }
    }

    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  });

  return groups;
};

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

      const res = await fetch('/api/admin/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setNotifs(data.notifications || []);
    } catch {
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

      await fetch(`/api/admin/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifs((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lu: true } : n))
      );
    } catch {
      showToast('Erreur action');
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');

      await fetch('/api/admin/notifications/read-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifs((prev) => prev.map((n) => ({ ...n, lu: true })));
      showToast('Toutes les notifications lues');
    } catch {
      showToast('Erreur');
    }
  };

  const deleteNotif = async (id: number) => {
    try {
      const token = localStorage.getItem('token');

      await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifs((prev) => prev.filter((n) => n.id !== id));
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
    <div className="space-y-6">

      {/* TOAST */}
      {toast && (
        <div className="fixed top-20 right-6 bg-black text-white px-4 py-2 rounded-lg text-sm shadow">
          {toast}
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">

        <div className="flex gap-2 flex-wrap">

          <div className="bg-gray-100 p-1 rounded-lg flex">
            {(['tous', 'non_lu', 'lu'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterLu(f)}
                className={`px-3 py-1 text-xs rounded-md ${
                  filterLu === f
                    ? 'bg-white text-orange-600 shadow'
                    : 'text-gray-500'
                }`}
              >
                {f === 'tous'
                  ? 'Tous'
                  : f === 'non_lu'
                  ? `Non lus (${unreadCount})`
                  : 'Lus'}
              </button>
            ))}
          </div>

          <div className="bg-gray-100 p-1 rounded-lg flex">
            {(['tous', 'retard', 'validation', 'paiement', 'info'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 text-xs rounded-md ${
                  filterType === t
                    ? 'bg-white text-orange-600 shadow'
                    : 'text-gray-500'
                }`}
              >
                {t === 'tous' ? 'Tous' : t}
              </button>
            ))}
          </div>

        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-orange-600 text-sm font-medium"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* LIST GROUPED */}
      <div className="space-y-6">

        {Object.entries(groupByDate(filtered)).map(([group, items]) => (
          <div key={group} className="space-y-3">

            <h2 className="text-xs font-bold text-gray-400 uppercase">
              {group}
            </h2>

            {items.map((n) => {
              /* 🔥 FIX IMPORTANT ICI */
              const cfg =
                typeConfig[n.type as keyof typeof typeConfig] || typeConfig.info;

              return (
                <div
                  key={n.id}
                  className={`bg-white p-4 rounded-xl border flex gap-3 ${
                    !n.lu ? 'border-orange-200 bg-orange-50/20' : 'border-gray-100'
                  }`}
                >

                  <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${cfg.bg}`}>
                    <i className={`${cfg.icon} ${cfg.cls}`} />
                  </div>

                  <div className="flex-1">

                    <div className="flex justify-between">
                      <h3 className="font-semibold text-sm">
                        {n.titre}
                      </h3>

                      <div className="flex gap-2">
                        {!n.lu && (
                          <button
                            onClick={() => markAsRead(n.id)}
                            className="text-xs text-orange-500"
                          >
                            Lire
                          </button>
                        )}

                        <button
                          onClick={() => deleteNotif(n.id)}
                          className="text-xs text-red-500"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-1">
                      {n.message}
                    </p>

                  </div>

                </div>
              );
            })}

          </div>
        ))}

      </div>

      {filtered.length === 0 && (
        <div className="text-center text-gray-400 py-10">
          Aucune notification
        </div>
      )}

    </div>
  );
}