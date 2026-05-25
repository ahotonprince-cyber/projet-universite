// /frontend/src/pages/admin/utilisateurs/page.tsx
import { useState, useEffect } from 'react';

interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: 'admin' | 'agent';
  statut: 'actif' | 'inactif';
  date_creation: string;
}

export default function UtilisateursPage() {
  const [users, setUsers] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<Utilisateur | null>(null);
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', role: 'agent', password: '' });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/utilisateurs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setUsers(data.utilisateurs || []);
    } catch (err) {
      showToast('Erreur chargement utilisateurs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const method = editUser ? 'PUT' : 'POST';
      const url = editUser ? `/api/admin/utilisateurs/${editUser.id}` : '/api/admin/utilisateurs';
      const body = editUser ? { role: form.role } : form;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error();
      showToast(editUser ? 'Utilisateur modifié' : 'Utilisateur créé');
      setModalOpen(false);
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      showToast('Erreur sauvegarde', 'error');
    }
  };

  const toggleStatut = async (id: number, statut: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/admin/utilisateurs/${id}/statut`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ statut: statut === 'actif' ? 'inactif' : 'actif' })
      });
      fetchUsers();
    } catch (err) { showToast('Erreur', 'error'); }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" /></div>;

  return (
    <div className="space-y-6">
      {toast && <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>{toast.message}</div>}

      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold">Gestion utilisateurs</h1><p className="text-sm text-gray-500">Administrateurs et agents</p></div>
        <button onClick={() => { setEditUser(null); setForm({ nom: '', prenom: '', email: '', telephone: '', role: 'agent', password: '' }); setModalOpen(true); }} className="bg-orange-500 text-white px-4 py-2 rounded-lg">+ Nouvel utilisateur</button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50"><tr>{['Utilisateur', 'Email', 'Téléphone', 'Rôle', 'Statut', 'Actions'].map(h => <th key={h} className="text-left px-5 py-3 text-xs">{h}</th>)}</tr></thead>
          <tbody className="divide-y">
            {users.map(u => (
              <tr key={u.id}>
                <td className="px-5 py-3 text-sm font-medium">{u.prenom} {u.nom}</td>
                <td className="px-5 py-3 text-sm text-blue-600">{u.email}</td>
                <td className="px-5 py-3 text-sm">{u.telephone}</td>
                <td className="px-5 py-3"><span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">{u.role}</span></td>
                <td className="px-5 py-3"><button onClick={() => toggleStatut(u.id, u.statut)} className={`px-2 py-1 rounded-full text-xs ${u.statut === 'actif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{u.statut === 'actif' ? 'Actif' : 'Inactif'}</button></td>
                <td className="px-5 py-3"><button onClick={() => { setEditUser(u); setForm({ nom: u.nom, prenom: u.prenom, email: u.email, telephone: u.telephone, role: u.role, password: '' }); setModalOpen(true); }} className="text-orange-500">Modifier rôle</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">{editUser ? 'Modifier rôle' : 'Nouvel utilisateur'}</h2>
            {!editUser && <><input className="w-full border rounded-lg px-3 py-2 mb-3" placeholder="Prénom" value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})} /><input className="w-full border rounded-lg px-3 py-2 mb-3" placeholder="Nom" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} /><input className="w-full border rounded-lg px-3 py-2 mb-3" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /><input className="w-full border rounded-lg px-3 py-2 mb-3" placeholder="Téléphone" value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} /><input className="w-full border rounded-lg px-3 py-2 mb-3" type="password" placeholder="Mot de passe" value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></>}
            <select className="w-full border rounded-lg px-3 py-2" value={form.role} onChange={e => setForm({...form, role: e.target.value})}><option value="admin">Admin</option><option value="agent">Agent</option></select>
            <div className="flex gap-3 mt-6"><button onClick={() => setModalOpen(false)} className="flex-1 border py-2 rounded-lg">Annuler</button><button onClick={handleSave} className="flex-1 bg-orange-500 text-white py-2 rounded-lg">Enregistrer</button></div>
          </div>
        </div>
      )}
    </div>
  );
}