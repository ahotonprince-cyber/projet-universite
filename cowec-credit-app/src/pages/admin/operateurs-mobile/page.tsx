import { useState, useEffect } from 'react';

interface Operateur {
  id: number;
  nom: string;
  code: string;
  actif: boolean;
}

export default function OperateursMobilePage() {
  const [operateurs, setOperateurs] = useState<Operateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Operateur | null>(null);

  const [form, setForm] = useState({ nom: '', code: '' });
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    fetchOperateurs();
  }, []);

  const fetchOperateurs = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('token');

      const res = await fetch(
        '/api/admin/operateurs-mobile',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error();

      const data = await res.json();
      setOperateurs(data.operateurs ?? []);
    } catch (err) {
      console.error('Erreur fetch operateurs:', err);
      setOperateurs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError('');

      const token = localStorage.getItem('token');

      const url = editItem
        ? `/api/admin/operateurs-mobile/${editItem.id}`
        : '/api/admin/operateurs-mobile';

      const method = editItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.error || 'Erreur lors de l\'enregistrement');
        return;
      }

      await fetchOperateurs();
      setModalOpen(false);
      setEditItem(null);
      setForm({ nom: '', code: '' });
    } catch (err) {
      setSaveError('Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  const toggleActif = async (id: number, actif: boolean) => {
    try {
      const token = localStorage.getItem('token');

      await fetch(
        `/api/admin/operateurs-mobile/${id}/toggle`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ actif: !actif }),
        }
      );

      fetchOperateurs();
    } catch (err) {
      console.error('Erreur toggle:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Chargement...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Opérateurs Mobile Money
        </h1>

        <button
          onClick={() => {
            setEditItem(null);
            setForm({ nom: '', code: '' });
            setSaveError('');
            setModalOpen(true);
          }}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg"
        >
          + Ajouter
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs uppercase text-gray-500">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs uppercase text-gray-500">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs uppercase text-gray-500">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs uppercase text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {operateurs.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-6 text-gray-400"
                >
                  Aucun opérateur
                </td>
              </tr>
            ) : (
              operateurs.map((op) => (
                <tr key={op.id}>
                  <td className="px-6 py-4">{op.nom}</td>
                  <td className="px-6 py-4">{op.code}</td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        toggleActif(op.id, op.actif)
                      }
                      className={`px-2 py-1 rounded-full text-xs ${
                        op.actif
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {op.actif ? 'Actif' : 'Inactif'}
                    </button>
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setEditItem(op);
                        setForm({ nom: op.nom, code: op.code });
                        setSaveError('');
                        setModalOpen(true);
                      }}
                      className="text-orange-500 hover:text-orange-700"
                    >
                      Modifier
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">

            <h2 className="text-xl font-bold mb-4">
              {editItem ? 'Modifier' : 'Ajouter'}
            </h2>

            {saveError && (
              <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {saveError}
              </div>
            )}

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nom (ex: MTN Money)"
                value={form.nom}
                onChange={(e) =>
                  setForm({
                    ...form,
                    nom: e.target.value,
                  })
                }
                className="w-full border rounded-lg px-3 py-2"
              />

              <input
                type="text"
                placeholder="Code (ex: MTN)"
                value={form.code}
                onChange={(e) =>
                  setForm({
                    ...form,
                    code: e.target.value,
                  })
                }
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 border py-2 rounded-lg"
                disabled={saving}
              >
                Annuler
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-orange-500 text-white py-2 rounded-lg disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}