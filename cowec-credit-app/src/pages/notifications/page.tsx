import { useState } from 'react';
import { notifications as initialNotifs, Notification, NotifType } from '@/mocks/notifications';

const typeConfig: Record<NotifType, { icon: string; cls: string; bg: string }> = {
  retard: { icon: 'ri-alarm-warning-line', cls: 'text-red-500', bg: 'bg-red-50' },
  validation: { icon: 'ri-checkbox-circle-line', cls: 'text-sky-500', bg: 'bg-sky-50' },
  paiement: { icon: 'ri-money-dollar-circle-line', cls: 'text-green-500', bg: 'bg-green-50' },
  info: { icon: 'ri-information-line', cls: 'text-orange-500', bg: 'bg-orange-50' },
};

const typeLabels: Record<NotifType, string> = {
  retard: 'Retard',
  validation: 'Validation',
  paiement: 'Paiement',
  info: 'Information',
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>(initialNotifs);
  const [filterType, setFilterType] = useState<NotifType | 'tous'>('tous');
  const [filterLu, setFilterLu] = useState<'tous' | 'non_lu' | 'lu'>('tous');

  const filtered = notifs.filter((n) => {
    const matchType = filterType === 'tous' || n.type === filterType;
    const matchLu = filterLu === 'tous' || (filterLu === 'non_lu' ? !n.lu : n.lu);
    return matchType && matchLu;
  });

  const unreadCount = notifs.filter((n) => !n.lu).length;

  const markAsRead = (id: string) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, lu: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, lu: true })));
  };

  const deleteNotif = (id: string) => {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(['tous', 'non_lu', 'lu'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterLu(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${filterLu === f ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {f === 'tous' ? 'Tous' : f === 'non_lu' ? `Non lus (${unreadCount})` : 'Lus'}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(['tous', 'retard', 'validation', 'paiement', 'info'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${filterType === t ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t === 'tous' ? 'Tous' : typeLabels[t]}
              </button>
            ))}
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium cursor-pointer whitespace-nowrap ml-auto"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-check-double-line" />
            </div>
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(['retard', 'validation', 'paiement', 'info'] as NotifType[]).map((t) => {
          const cfg = typeConfig[t];
          const count = notifs.filter((n) => n.type === t).length;
          return (
            <div key={t} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
              <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${cfg.bg} flex-shrink-0`}>
                <i className={`${cfg.icon} text-xl ${cfg.cls}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500">{typeLabels[t]}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 py-16 text-center text-gray-400">
            <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <i className="ri-notification-off-line text-4xl text-gray-200" />
            </div>
            <p className="text-sm">Aucune notification</p>
          </div>
        )}
        {filtered.map((notif) => {
          const cfg = typeConfig[notif.type];
          return (
            <div
              key={notif.id}
              className={`bg-white rounded-xl border transition-all duration-200 p-5 ${!notif.lu ? 'border-orange-200 bg-orange-50/20' : 'border-gray-100'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 flex items-center justify-center rounded-xl ${cfg.bg} flex-shrink-0`}>
                  <i className={`${cfg.icon} text-xl ${cfg.cls}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-gray-900">{notif.titre}</h4>
                      {!notif.lu && (
                        <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.cls}`}>
                        {typeLabels[notif.type]}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!notif.lu && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-orange-50 text-gray-400 hover:text-orange-500 transition-colors cursor-pointer"
                          title="Marquer comme lu"
                        >
                          <i className="ri-check-line text-sm" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotif(notif.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Supprimer"
                      >
                        <i className="ri-delete-bin-line text-sm" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{notif.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-400">
                      <i className="ri-calendar-line mr-1" />
                      {new Date(notif.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    {notif.clientNom && (
                      <span className="text-xs text-gray-400">
                        <i className="ri-user-line mr-1" />
                        {notif.clientNom}
                      </span>
                    )}
                    {notif.creditId && (
                      <span className="text-xs font-mono text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">
                        {notif.creditId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
