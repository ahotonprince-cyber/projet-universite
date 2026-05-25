import { useState, useEffect } from 'react';
import ClientModal from './components/ClientModal';

interface Client {
  id: number;
  nom: string;
  prenom: string;
  email: string;           // ✅ AJOUTÉ
  telephone: string;
  adresse: string;
  profession: string;
  statut: 'actif' | 'inactif';
  dateCreation?: string;
  avatar?: string;
  scoreCredit?: number;
}

const scoreColor = (score: number = 0) => {
  if (score >= 80) return 'text-green-600 bg-green-50';
  if (score >= 60) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
};

export default function ClientsPage() {
  const [clientList, setClientList] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState<'tous' | 'actif' | 'inactif'>('tous');
  const [modalOpen, setModalOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch('/api/admin/clients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erreur chargement clients');
      const data = await response.json();
      setClientList(data.clients || []);
    } catch (err) {
      console.error(err);
      showToast('Erreur lors du chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filtered = clientList.filter((c) => {
    const matchSearch =
      `${c.prenom} ${c.nom} ${c.email} ${c.telephone} ${c.profession}`.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === 'tous' || c.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  // ✅ TYPE CORRIGÉ
  const handleSave = async (data: Omit<Client, 'id' | 'dateCreation' | 'avatar' | 'scoreCredit'> & { password?: string }) => {
    try {
      const token = localStorage.getItem('token');
      const method = editClient ? 'PUT' : 'POST';
      const url = editClient
        ? `/api/admin/clients/${editClient.id}`
        : '/api/admin/clients';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erreur sauvegarde');
      showToast(editClient ? 'Client modifié' : 'Client ajouté');
      setModalOpen(false);
      setEditClient(null);
      fetchClients();
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la sauvegarde', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/clients/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erreur suppression');
      showToast('Client supprimé');
      setDeleteConfirm(null);
      fetchClients();
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl text-sm font-medium shadow-lg">
          <div className="flex items-center gap-2">
            <i className="ri-checkbox-circle-line text-green-400" />
            {toast}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                <i className="ri-search-line text-gray-400 text-sm" />
              </div>
              <input
                type="text"
                placeholder="Rechercher un client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:border-orange-400 transition-colors"
              />
            </div>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {(['tous', 'actif', 'inactif'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatut(s)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap capitalize ${
                    filterStatut === s ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {s === 'tous' ? 'Tous' : s === 'actif' ? 'Actifs' : 'Inactifs'}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={() => { setEditClient(null); setModalOpen(true); }}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-400 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:from-orange-600 hover:to-orange-500 transition-all cursor-pointer whitespace-nowrap"
        >
          <i className="ri-user-add-line" />
          Nouveau client
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{clientList.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total clients</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{clientList.filter((c) => c.statut === 'actif').length}</p>
          <p className="text-xs text-gray-500 mt-1">Actifs</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-gray-400">{clientList.filter((c) => c.statut === 'inactif').length}</p>
          <p className="text-xs text-gray-500 mt-1">Inactifs</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Téléphone</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Adresse</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Profession</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((client) => (
                <tr key={client.id} className="hover:bg-orange-50/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={client.avatar || 'https://ui-avatars.com/api/?background=orange&color=fff&name=' + encodeURIComponent(client.prenom + ' ' + client.nom)}
                        alt={client.nom}
                        className="w-10 h-10 rounded-full object-cover border-2 border-orange-100 flex-shrink-0"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{client.prenom} {client.nom}</p>
                        <p className="text-xs text-gray-400">#{client.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-blue-600">{client.email}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{client.telephone}</td>
                  <td className="px-5 py-3 text-sm text-gray-600 hidden md:table-cell max-w-xs truncate">{client.adresse}</td>
                  <td className="px-5 py-3 text-sm text-gray-600 hidden lg:table-cell">{client.profession}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${scoreColor(client.scoreCredit)}`}>
                      {client.scoreCredit || 'N/A'}/100
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      client.statut === 'actif' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {client.statut === 'actif' ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditClient(client); setModalOpen(true); }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-orange-50 text-gray-400 hover:text-orange-500 transition-colors cursor-pointer"
                        title="Modifier"
                      >
                        <i className="ri-edit-line text-base" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(client.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Supprimer"
                      >
                        <i className="ri-delete-bin-line text-base" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-gray-400 text-sm">
                    <div className="w-10 h-10 flex items-center justify-center mx-auto mb-3">
                      <i className="ri-user-search-line text-3xl text-gray-300" />
                    </div>
                    Aucun client trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="w-12 h-12 flex items-center justify-center bg-red-50 rounded-full mx-auto mb-4">
              <i className="ri-delete-bin-line text-red-500 text-2xl" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Supprimer le client ?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-500 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-red-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <ClientModal
        open={modalOpen}
        client={editClient}
        onClose={() => { setModalOpen(false); setEditClient(null); }}
        onSave={handleSave}
      />
    </div>
  );
}