import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Client {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
}

interface Compte {
  id: number;
  client_id: number;
  type_compte_id: number;
  solde: number;
  date_creation: string;
  date_derniere_operation: string | null;
  statut: 'actif' | 'bloque' | 'ferme';
}

interface TypeCompte {
  id: number;
  nom: string;
  code: string;
}

export default function ComptesAdminPage() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [typesCompte, setTypesCompte] = useState<TypeCompte[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [comptes, setComptes] = useState<Compte[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'ajout' | 'solde'>('ajout');
  const [selectedCompte, setSelectedCompte] = useState<Compte | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [form, setForm] = useState({
    type_compte_id: '',
    montant: '',
    operation: 'depot'
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/clients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Erreur chargement clients', 'error');
    }
  };

  const fetchTypesCompte = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/types-compte', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTypesCompte(data.types || []);
        // Définir la valeur par défaut sur le premier type disponible
        if (data.types && data.types.length > 0) {
          setForm(prev => ({ ...prev, type_compte_id: String(data.types[0].id) }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComptes = async (clientId: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/clients/${clientId}/comptes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setComptes(data.comptes || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Erreur chargement comptes', 'error');
    }
  };

  useEffect(() => {
    Promise.all([fetchClients(), fetchTypesCompte()]).finally(() => setLoading(false));
  }, []);

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    fetchComptes(client.id);
  };

  const handleAjouterCompte = async () => {
    if (!selectedClient) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/clients/${selectedClient.id}/comptes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ type_compte_id: parseInt(form.type_compte_id) })
      });
      
      if (res.ok) {
        showToast('Compte ajouté avec succès');
        fetchComptes(selectedClient.id);
        setModalOpen(false);
        setForm({ type_compte_id: typesCompte[0]?.id.toString() || '', montant: '', operation: 'depot' });
      } else {
        const error = await res.json();
        showToast(error.error || 'Erreur lors de l\'ajout', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de l\'ajout', 'error');
    }
  };

  const handleModifierSolde = async () => {
    if (!selectedCompte) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/comptes/${selectedCompte.id}/solde`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          montant: parseFloat(form.montant),
          operation: form.operation
        })
      });
      
      if (res.ok) {
        showToast('Solde modifié avec succès');
        if (selectedClient) fetchComptes(selectedClient.id);
        setModalOpen(false);
        setSelectedCompte(null);
        setForm({ type_compte_id: typesCompte[0]?.id.toString() || '', montant: '', operation: 'depot' });
      } else {
        const error = await res.json();
        showToast(error.error || 'Erreur lors de la modification', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la modification', 'error');
    }
  };

  const handleToggleStatut = async (compteId: number, statutActuel: string) => {
    const nouveauStatut = statutActuel === 'actif' ? 'bloque' : 'actif';
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/comptes/${compteId}/statut`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ statut: nouveauStatut })
      });
      
      if (res.ok && selectedClient) {
        showToast(`Compte ${nouveauStatut === 'bloque' ? 'bloqué' : 'débloqué'}`);
        fetchComptes(selectedClient.id);
      }
    } catch (err) {
      console.error(err);
      showToast('Erreur lors du changement de statut', 'error');
    }
  };

  // Mapping dynamique des libellés
  const getTypeCompteLabel = (typeId: number): string => {
    const type = typesCompte.find(t => t.id === typeId);
    return type?.nom || `Type ${typeId}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-b-2 border-orange-500 rounded-full" />
      </div>
    );
  }

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

      <h1 className="text-2xl font-bold text-gray-800">Gestion des comptes clients</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des clients */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-800">Clients</h2>
            <p className="text-xs text-gray-400">{clients.length} client(s)</p>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {clients.map((client) => (
              <button
                key={client.id}
                onClick={() => handleSelectClient(client)}
                className={`w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors ${
                  selectedClient?.id === client.id ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''
                }`}
              >
                <p className="font-medium text-gray-800">{client.prenom} {client.nom}</p>
                <p className="text-xs text-gray-500">{client.email}</p>
                <p className="text-xs text-gray-400">{client.telephone}</p>
              </button>
            ))}
            {clients.length === 0 && (
              <div className="p-4 text-center text-gray-400">Aucun client</div>
            )}
          </div>
        </div>

        {/* Comptes du client sélectionné */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow">
          {!selectedClient ? (
            <div className="p-8 text-center text-gray-400">
              <i className="ri-user-search-line text-3xl text-gray-300 mb-2 block" />
              Sélectionnez un client pour voir ses comptes
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h2 className="font-semibold text-gray-800">
                    Comptes de {selectedClient.prenom} {selectedClient.nom}
                  </h2>
                  <p className="text-xs text-gray-500">{selectedClient.email}</p>
                </div>
                <button
                  onClick={() => { setModalType('ajout'); setModalOpen(true); }}
                  className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-orange-600 transition flex items-center gap-1"
                >
                  <i className="ri-add-line" />
                  Ajouter un compte
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {comptes.map((compte) => (
                  <div key={compte.id} className="p-4 flex justify-between items-center flex-wrap gap-3">
                    <div>
                      <p className="font-semibold text-gray-800">{getTypeCompteLabel(compte.type_compte_id)}</p>
                      <p className="text-2xl font-bold text-orange-600">{compte.solde.toLocaleString()} FCFA</p>
                      <p className="text-xs text-gray-400">Ouvert le {new Date(compte.date_creation).toLocaleDateString('fr-FR')}</p>
                      <p className="text-xs text-gray-400">Dernière opération : {compte.date_derniere_operation ? new Date(compte.date_derniere_operation).toLocaleDateString('fr-FR') : '—'}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => navigate(`/admin/comptes/${compte.id}/operations`)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 transition flex items-center gap-1"
                      >
                        <i className="ri-list-check" />
                        Opérations
                      </button>
                      <button
                        onClick={() => { setSelectedCompte(compte); setModalType('solde'); setModalOpen(true); }}
                        className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-sm hover:bg-orange-100 transition flex items-center gap-1"
                      >
                        <i className="ri-money-dollar-circle-line" />
                        Modifier solde
                      </button>
                      <button
                        onClick={() => handleToggleStatut(compte.id, compte.statut)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition flex items-center gap-1 ${
                          compte.statut === 'actif' 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        <i className={compte.statut === 'actif' ? 'ri-lock-line' : 'ri-lock-unlock-line'} />
                        {compte.statut === 'actif' ? 'Bloquer' : 'Débloquer'}
                      </button>
                    </div>
                  </div>
                ))}
                {comptes.length === 0 && (
                  <div className="p-8 text-center text-gray-400">
                    <i className="ri-bank-line text-3xl text-gray-300 mb-2 block" />
                    Aucun compte pour ce client
                    <button
                      onClick={() => { setModalType('ajout'); setModalOpen(true); }}
                      className="block mx-auto mt-3 text-orange-500 text-sm hover:underline"
                    >
                      Créer un compte →
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">
              {modalType === 'ajout' ? 'Ajouter un compte' : 'Modifier le solde'}
            </h2>
            
            {modalType === 'ajout' ? (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Type de compte</label>
                <select
                  value={form.type_compte_id}
                  onChange={(e) => setForm({ ...form, type_compte_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400"
                >
                  {typesCompte.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.nom}
                    </option>
                  ))}
                </select>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setModalOpen(false)} 
                    className="flex-1 border py-2 rounded-lg hover:bg-gray-50 transition"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={handleAjouterCompte} 
                    className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition"
                  >
                    Créer
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Compte : {selectedCompte && getTypeCompteLabel(selectedCompte.type_compte_id)}</p>
                  <p className="text-lg font-bold text-orange-600">{selectedCompte?.solde.toLocaleString()} FCFA</p>
                </div>
                
                <label className="block text-sm font-medium text-gray-700">Opération</label>
                <select
                  value={form.operation}
                  onChange={(e) => setForm({ ...form, operation: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400"
                >
                  <option value="depot">Dépôt (+)</option>
                  <option value="retrait">Retrait (-)</option>
                </select>
                
                <label className="block text-sm font-medium text-gray-700">Montant (FCFA)</label>
                <input
                  type="number"
                  value={form.montant}
                  onChange={(e) => setForm({ ...form, montant: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-400"
                  placeholder="0"
                  min="0"
                  step="100"
                />
                
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setModalOpen(false)} 
                    className="flex-1 border py-2 rounded-lg hover:bg-gray-50 transition"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={handleModifierSolde} 
                    className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition"
                  >
                    Valider
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}