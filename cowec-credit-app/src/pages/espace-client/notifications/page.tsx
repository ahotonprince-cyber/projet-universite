import { useState } from 'react';
import { clientNotifications, NotifClient } from '@/mocks/clientNotifications';

const typeConfig: Record<string, { icon: string; color: string; bg: string }> = {
  paiement: { icon: 'ri-money-dollar-circle-line', color: 'text-green-600', bg: 'bg-green-100' },
  validation: { icon: 'ri-shield-check-line', color: 'text-orange-600', bg: 'bg-orange-100' },
  rappel: { icon: 'ri-alarm-line', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  info: { icon: 'ri-information-line', color: 'text-blue-600', bg: 'bg-blue-100' },
  alerte: { icon: 'ri-error-warning-line', color: 'text-red-600', bg: 'bg-red-100' },
};

export default function NotificationsClientPage() {
  const [notifs, setNotifs] = useState<NotifClient[]>(clientNotifications);
  const [filter, setFilter] = useState<string>('tous');

  const markAllRead = () => setNotifs((n) => n.map((x) => ({ ...x, lu: true })));
  const markRead = (id: string) => setNotifs((n) => n.map((x) => x.id === id ? { ...x, lu: true } : x));
  const deleteNotif = (id: string) => setNotifs((n) => n.filter((x) => x.id !== id));

  const filters = ['tous', 'paiement', 'validation', 'rappel', 'info', 'alerte'];
  const filtered = filter === 'tous' ? notifs : notifs.filter((n) => n.type === filter);
  const unread = notifs.filter((n) => !n.lu).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          <p className="text-sm text-gray-500">{unread} non lue{unread > 1 ? 's' : ''}</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="text-sm text-orange-500 hover:text-orange-600 font-medium cursor-pointer whitespace-nowrap">
            <i className="ri-check-double-line mr-1" />Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all cursor-pointer whitespace-nowrap ${filter === f ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'}`}>
            {f === 'tous' ? 'Tous' : f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <i className="ri-notification-off-line text-4xl mb-2 block" />
            <p className="text-sm">Aucune notification</p>
          </div>
        )}
        {filtered.map((notif) => {
          const cfg = typeConfig[notif.type] || typeConfig.info;
          return (
            <div key={notif.id} className={`bg-white rounded-xl border p-4 flex gap-4 transition-all ${!notif.lu ? 'border-orange-200' : 'border-gray-100'}`}>
              <div className={`w-10 h-10 ${cfg.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                <i className={`${cfg.icon} ${cfg.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${!notif.lu ? 'text-gray-900' : 'text-gray-600'}`}>{notif.titre}</p>
                  {!notif.lu && <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1.5" />}
                </div>
                <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-2">{notif.date}</p>
              </div>
              <div className="flex flex-col gap-1">
                {!notif.lu && (
                  <button onClick={() => markRead(notif.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-green-50 cursor-pointer" title="Marquer comme lu">
                    <i className="ri-check-line text-green-500 text-sm" />
                  </button>
                )}
                <button onClick={() => deleteNotif(notif.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 cursor-pointer" title="Supprimer">
                  <i className="ri-delete-bin-line text-red-400 text-sm" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
