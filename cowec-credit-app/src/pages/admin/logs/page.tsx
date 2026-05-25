// /frontend/src/pages/admin/logs/page.tsx
import { useState, useEffect } from 'react';

interface Log {
  id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  utilisateur_nom: string;
  utilisateur_prenom: string;
  utilisateur_role: string;
  ip_address: string;
  date_action: string;
  anciennes_valeurs?: any;
  nouvelles_valeurs?: any;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/admin/logs', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error();

        const data = await response.json();
        setLogs(data.logs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const actions = ['all', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'];

  const filtered = logs.filter(log => {
    const matchSearch = `${log.utilisateur_prenom} ${log.utilisateur_nom} ${log.action} ${log.entity_type}`.toLowerCase().includes(search.toLowerCase());
    const matchAction = filterAction === 'all' || log.action === filterAction;
    return matchSearch && matchAction;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Journal système</h1>
        <p className="text-sm text-gray-500">Traçabilité des actions administratives</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
        />
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          {actions.map(a => (
            <option key={a} value={a}>{a === 'all' ? 'Toutes actions' : a}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Utilisateur</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Action</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Entité</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">IP</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Date</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedLog(log)}>
                <td className="px-5 py-3 text-sm">{log.utilisateur_prenom} {log.utilisateur_nom}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    log.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                    log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                    log.action === 'DELETE' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm">{log.entity_type} #{log.entity_id}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{log.ip_address}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{new Date(log.date_action).toLocaleString('fr-FR')}</td>
                <td className="px-5 py-3 text-orange-500 text-sm">Détails →</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">Aucun log trouvé</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Détails */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedLog(null)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">Détails du log</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Action:</strong> {selectedLog.action}</p>
              <p><strong>Entité:</strong> {selectedLog.entity_type} #{selectedLog.entity_id}</p>
              <p><strong>Utilisateur:</strong> {selectedLog.utilisateur_prenom} {selectedLog.utilisateur_nom} ({selectedLog.utilisateur_role})</p>
              <p><strong>IP:</strong> {selectedLog.ip_address}</p>
              <p><strong>Date:</strong> {new Date(selectedLog.date_action).toLocaleString('fr-FR')}</p>
              {selectedLog.anciennes_valeurs && <p><strong>Anciennes valeurs:</strong> <pre className="text-xs bg-gray-100 p-2 rounded mt-1">{JSON.stringify(selectedLog.anciennes_valeurs, null, 2)}</pre></p>}
              {selectedLog.nouvelles_valeurs && <p><strong>Nouvelles valeurs:</strong> <pre className="text-xs bg-gray-100 p-2 rounded mt-1">{JSON.stringify(selectedLog.nouvelles_valeurs, null, 2)}</pre></p>}
            </div>
            <button onClick={() => setSelectedLog(null)} className="mt-4 w-full bg-gray-200 py-2 rounded-lg">Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}