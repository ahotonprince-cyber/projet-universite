import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface GroupeTontine {
  id: number;
  nom: string;
  montant_part: number;
  periodicite: 'hebdo' | 'mensuel';
  nombre_membres: number;
  date_creation: string;
  statut: 'actif' | 'cloture';
}

export default function TontinesAdminPage() {
  const navigate = useNavigate();

  const [groupes, setGroupes] = useState<GroupeTontine[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<GroupeTontine | null>(null);

  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState<'all' | 'actif' | 'cloture'>('all');
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'hebdo' | 'mensuel'>('all');

  const [form, setForm] = useState({
    nom: '',
    montant_part: '',
    periodicite: 'mensuel'
  });

  useEffect(() => {
    fetchGroupes();
  }, []);

  const fetchGroupes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/tontines', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setGroupes(data.groupes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredGroupes = groupes.filter((g) => {
    const matchSearch = g.nom.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === 'all' || g.statut === filterStatut;
    const matchPeriod = filterPeriod === 'all' || g.periodicite === filterPeriod;

    return matchSearch && matchStatut && matchPeriod;
  });

  const stats = {
    total: groupes.length,
    actifs: groupes.filter(g => g.statut === 'actif').length,
    membres: groupes.reduce((acc, g) => acc + g.nombre_membres, 0),
    capital: groupes.reduce((acc, g) => acc + g.montant_part * g.nombre_membres, 0),
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');

      const url = editItem
        ? `/api/admin/tontines/${editItem.id}`
        : '/api/admin/tontines';

      const method = editItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        fetchGroupes();
        setModalOpen(false);
        setEditItem(null);
        setForm({ nom: '', montant_part: '', periodicite: 'mensuel' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette tontine ?')) return;

    const token = localStorage.getItem('token');

    await fetch(`/api/admin/tontines/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    fetchGroupes();
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Gestion des tontines
        </h1>

        <button
          onClick={() => {
            setEditItem(null);
            setForm({ nom: '', montant_part: '', periodicite: 'mensuel' });
            setModalOpen(true);
          }}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg"
        >
          + Nouvelle tontine
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Total tontines</p>
          <h2 className="text-xl font-bold">{stats.total}</h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Actives</p>
          <h2 className="text-xl font-bold text-green-600">{stats.actifs}</h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Membres</p>
          <h2 className="text-xl font-bold">{stats.membres}</h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Capital estimé</p>
          <h2 className="text-xl font-bold text-orange-500">
            {stats.capital.toLocaleString()} FCFA
          </h2>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Rechercher une tontine..."
          className="border px-3 py-2 rounded-lg w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border px-3 py-2 rounded-lg"
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value as any)}
        >
          <option value="all">Tous statuts</option>
          <option value="actif">Actif</option>
          <option value="cloture">Clôturé</option>
        </select>

        <select
          className="border px-3 py-2 rounded-lg"
          value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value as any)}
        >
          <option value="all">Toutes périodes</option>
          <option value="mensuel">Mensuel</option>
          <option value="hebdo">Hebdomadaire</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs uppercase">Nom</th>
              <th className="px-6 py-3 text-left text-xs uppercase">Montant</th>
              <th className="px-6 py-3 text-left text-xs uppercase">Période</th>
              <th className="px-6 py-3 text-left text-xs uppercase">Membres</th>
              <th className="px-6 py-3 text-left text-xs uppercase">Statut</th>
              <th className="px-6 py-3 text-left text-xs uppercase">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filteredGroupes.map((g) => (
              <tr key={g.id}>
                <td className="px-6 py-4 font-medium">{g.nom}</td>

                <td className="px-6 py-4">
                  {g.montant_part.toLocaleString()} FCFA
                </td>

                <td className="px-6 py-4 capitalize">{g.periodicite}</td>

                <td className="px-6 py-4">{g.nombre_membres}</td>

                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      g.statut === 'actif'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {g.statut === 'actif' ? 'Actif' : 'Clôturé'}
                  </span>
                </td>

                <td className="px-6 py-4 space-x-2">
                  <button
                    onClick={() => navigate(`/admin/tontines/${g.id}`)}
                    className="text-blue-500"
                  >
                    Voir
                  </button>

                  <button
                    onClick={() => {
                      setEditItem(g);
                      setForm({
                        nom: g.nom,
                        montant_part: String(g.montant_part),
                        periodicite: g.periodicite
                      });
                      setModalOpen(true);
                    }}
                    className="text-orange-500"
                  >
                    Modifier
                  </button>

                  <button
                    onClick={() => handleDelete(g.id)}
                    className="text-red-500"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editItem ? 'Modifier' : 'Nouvelle tontine'}
            </h2>

            <div className="space-y-3">
              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Nom"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
              />

              <input
                className="w-full border px-3 py-2 rounded"
                type="number"
                placeholder="Montant part"
                value={form.montant_part}
                onChange={(e) =>
                  setForm({ ...form, montant_part: e.target.value })
                }
              />

              <select
                className="w-full border px-3 py-2 rounded"
                value={form.periodicite}
                onChange={(e) =>
                  setForm({ ...form, periodicite: e.target.value })
                }
              >
                <option value="mensuel">Mensuel</option>
                <option value="hebdo">Hebdomadaire</option>
              </select>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 border py-2 rounded"
              >
                Annuler
              </button>

              <button
                onClick={handleSave}
                className="flex-1 bg-orange-500 text-white py-2 rounded"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}