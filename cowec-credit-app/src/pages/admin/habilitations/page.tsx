import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utilisateur } from '../../../types';

interface HabilitationsPageProps {
  initialRoleFilter?: 'all' | 'admin' | 'agent' | 'client';
}

// Mode "client" = page Gestion clients (/admin/clients)
// Mode "all/admin/agent" = page Habilitations (/admin/habilitations) — admins et agents uniquement

export default function HabilitationsPage({ initialRoleFilter = 'all' }: HabilitationsPageProps) {
  const navigate = useNavigate();
  const [users, setUsers] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<Utilisateur | null>(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'agent' | 'client'>(
    initialRoleFilter === 'all' ? 'all' : initialRoleFilter
  );
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    role: 'agent',
    mot_de_passe: '',
    // Champs clients
    adresse: '',
    profession: '',
    dateNaissance: ''
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const url = filterRole === 'all' 
        ? '/api/admin/utilisateurs'
        : `/api/admin/utilisateurs?role=${filterRole}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        let fetchedUsers: Utilisateur[] = data.utilisateurs || [];
        // Habilitations mode: les clients ont leur propre page dédiée
        if (initialRoleFilter !== 'client') {
          fetchedUsers = fetchedUsers.filter(u => u.role !== 'client');
        }
        setUsers(fetchedUsers);
      } else {
        showToast('Erreur chargement utilisateurs', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Erreur lors du chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Resynchroniser quand on navigue entre /admin/clients et /admin/habilitations
  useEffect(() => {
    setFilterRole(initialRoleFilter === 'all' ? 'all' : initialRoleFilter);
  }, [initialRoleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    agents: users.filter(u => u.role === 'agent').length,
    clients: users.filter(u => u.role === 'client').length,
  };

  const filteredUsers = users.filter(u => {
    const matchSearch =
      u.nom.toLowerCase().includes(search.toLowerCase()) ||
      u.prenom.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.telephone.includes(search);

    return matchSearch;
  });

  const changerStatut = async (id: number, nouveauStatut: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/utilisateurs/${id}/statut`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ statut: nouveauStatut })
      });
      if (res.ok) {
        const labels: Record<string, string> = { actif: 'activé', inactif: 'désactivé', rejete: 'rejeté' };
        showToast(`Compte ${labels[nouveauStatut] || nouveauStatut}`);
        fetchUsers();
      } else {
        showToast('Erreur lors du changement de statut', 'error');
      }
    } catch (err) {
      showToast('Erreur réseau', 'error');
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = editUser
        ? `/api/admin/utilisateurs/${editUser.id}`
        : '/api/admin/utilisateurs';
      const method = editUser ? 'PUT' : 'POST';

      const body = editUser
        ? { 
            role: form.role,
            adresse: form.adresse,
            profession: form.profession,
            dateNaissance: form.dateNaissance
          }
        : form;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        showToast(editUser ? 'Utilisateur modifié' : 'Utilisateur créé');
        setModalOpen(false);
        setEditUser(null);
        fetchUsers();
      } else {
        const error = await res.json();
        showToast(error.error || 'Erreur lors de la sauvegarde', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la sauvegarde', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer définitivement cet utilisateur ?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/utilisateurs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        showToast('Utilisateur supprimé');
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-b-2 border-orange-500 rounded-full" />
      </div>
    );
  }

  const isClientFilter = filterRole === 'client';
  const showClientFields = editUser?.role === 'client' || (!editUser && form.role === 'client');

  return (
    <div className="space-y-6">
      {/* TOAST */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isClientFilter ? 'Gestion des clients' : 'Habilitations'}
          </h1>
          <p className="text-sm text-gray-500">
            {isClientFilter
              ? `Gérez les comptes clients (${stats.clients} au total)`
              : `Gérez les administrateurs et agents (${stats.total} au total)`}
          </p>
        </div>

        <button
          onClick={() => {
            setEditUser(null);
            setForm({
              nom: '', prenom: '', email: '', telephone: '', role: isClientFilter ? 'client' : 'agent',
              mot_de_passe: '', adresse: '', profession: '', dateNaissance: ''
            });
            setModalOpen(true);
          }}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center gap-2"
        >
          <i className="ri-add-line" />
          {isClientFilter ? 'Nouveau client' : 'Nouvel utilisateur'}
        </button>
      </div>

      {/* STATS (uniquement si vue générale) */}
      {!isClientFilter && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <p className="text-sm text-gray-500">Total</p>
            <h2 className="text-2xl font-bold text-gray-800">{stats.total}</h2>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <p className="text-sm text-gray-500">Administrateurs</p>
            <h2 className="text-2xl font-bold text-red-500">{stats.admins}</h2>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <p className="text-sm text-gray-500">Agents</p>
            <h2 className="text-2xl font-bold text-orange-500">{stats.agents}</h2>
          </div>
        </div>
      )}

      {/* FILTRES */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Rechercher (nom, email, téléphone)..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {!isClientFilter && (
          <select
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
          >
            <option value="all">Tous les rôles</option>
            <option value="admin">Administrateurs</option>
            <option value="agent">Agents</option>
          </select>
        )}
      </div>

      {/* TABLEAU */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Utilisateur</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Contact</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rôle</th>
                {isClientFilter && (
                  <>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Score</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Adresse</th>
                  </>
                )}
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-orange-50/30 transition">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar || `https://ui-avatars.com/api/?background=orange&color=fff&name=${encodeURIComponent(user.prenom + ' ' + user.nom)}`}
                        alt={user.nom}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{user.prenom} {user.nom}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{user.telephone}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-red-100 text-red-700' :
                      user.role === 'agent' ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : user.role === 'agent' ? 'Agent' : 'Client'}
                    </span>
                  </td>
                  {isClientFilter && (
                    <>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          (user.score_credit ?? user.scoreCredit ?? 0) >= 80 ? 'bg-green-50 text-green-700' :
                          (user.score_credit ?? user.scoreCredit ?? 0) >= 60 ? 'bg-yellow-50 text-yellow-700' :
                          'bg-red-50 text-red-700'
                        }`}>
                          {user.score_credit ?? user.scoreCredit ?? 'N/A'}/100
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500 max-w-xs truncate">
                        {user.adresse || '—'}
                      </td>
                    </>
                  )}
                  <td className="px-5 py-3">
                    {user.statut === 'actif' && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Actif</span>
                    )}
                    {user.statut === 'inactif' && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Inactif</span>
                    )}
                    {user.statut === 'en_attente' && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">En attente</span>
                    )}
                    {user.statut === 'bloque' && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Bloqué</span>
                    )}
                    {user.statut === 'rejete' && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-200 text-red-800">Rejeté</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 flex-wrap">
                      {/* Valider un compte en attente */}
                      {user.statut === 'en_attente' && (
                        <>
                          <button
                            onClick={() => changerStatut(user.id, 'actif')}
                            className="px-2 py-1 rounded text-xs font-medium bg-green-500 text-white hover:bg-green-600 transition"
                            title="Valider le compte"
                          >
                            ✓ Valider
                          </button>
                          <button
                            onClick={() => changerStatut(user.id, 'rejete')}
                            className="px-2 py-1 rounded text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition"
                            title="Rejeter le compte"
                          >
                            ✗ Rejeter
                          </button>
                        </>
                      )}
                      {/* Débloquer un compte bloqué */}
                      {user.statut === 'bloque' && (
                        <button
                          onClick={() => changerStatut(user.id, 'actif')}
                          className="px-2 py-1 rounded text-xs font-medium bg-orange-500 text-white hover:bg-orange-600 transition"
                          title="Débloquer le compte"
                        >
                          🔓 Débloquer
                        </button>
                      )}
                      {/* Activer/Désactiver seulement pour actif/inactif */}
                      {(user.statut === 'actif' || user.statut === 'inactif') && (
                        <button
                          onClick={() => changerStatut(user.id, user.statut === 'actif' ? 'inactif' : 'actif')}
                          className={`px-2 py-1 rounded text-xs font-medium transition ${
                            user.statut === 'actif'
                              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {user.statut === 'actif' ? 'Désactiver' : 'Activer'}
                        </button>
                      )}
                      {/* Modifier */}
                      <button
                        onClick={() => {
                          setEditUser(user);
                          setForm({
                            nom: user.nom, prenom: user.prenom, email: user.email,
                            telephone: user.telephone, role: user.role, mot_de_passe: '',
                            adresse: user.adresse || '', profession: user.profession || '',
                            dateNaissance: user.dateNaissance || ''
                          });
                          setModalOpen(true);
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-orange-50 text-gray-400 hover:text-orange-500"
                        title="Modifier"
                      >
                        <i className="ri-edit-line" />
                      </button>
                      {/* Voir fiche client */}
                      {user.role === 'client' && (
                        <button
                          onClick={() => navigate(`/admin/clients/${user.id}`)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500"
                          title="Voir fiche client"
                        >
                          <i className="ri-eye-line" />
                        </button>
                      )}
                      {/* Supprimer */}
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                        title="Supprimer"
                      >
                        <i className="ri-delete-bin-line" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={isClientFilter ? 7 : 5} className="px-5 py-12 text-center text-gray-400">
                    <i className="ri-user-search-line text-3xl text-gray-300 mb-2 block" />
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL AJOUT/MODIFICATION */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">
              {editUser ? 'Modifier l\'utilisateur' : (isClientFilter ? 'Nouveau client' : 'Nouvel utilisateur')}
            </h2>

            <div className="space-y-3">
              <input
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400"
                placeholder="Prénom"
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
              />
              <input
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400"
                placeholder="Nom"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
              />
              <input
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400"
                placeholder="Téléphone"
                value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              />

              {!editUser && (
                <input
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400"
                  placeholder="Mot de passe"
                  type="password"
                  value={form.mot_de_passe}
                  onChange={(e) => setForm({ ...form, mot_de_passe: e.target.value })}
                />
              )}

              {(!editUser || editUser.role !== 'client') && (
                <select
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="admin">Administrateur</option>
                  <option value="agent">Agent</option>
                  {isClientFilter && <option value="client">Client</option>}
                </select>
              )}

              {/* Champs spécifiques clients */}
              {(showClientFields || isClientFilter) && (
                <>
                  <input
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400"
                    placeholder="Adresse"
                    value={form.adresse}
                    onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                  />
                  <input
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400"
                    placeholder="Profession"
                    value={form.profession}
                    onChange={(e) => setForm({ ...form, profession: e.target.value })}
                  />
                  <input
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400"
                    placeholder="Date de naissance"
                    type="date"
                    value={form.dateNaissance}
                    onChange={(e) => setForm({ ...form, dateNaissance: e.target.value })}
                  />
                </>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 border border-gray-200 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition"
              >
                {editUser ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}