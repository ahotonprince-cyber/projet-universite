// /frontend/src/pages/admin/transactions/page.tsx
import { useState, useEffect } from 'react';

interface Transaction {
  id: number;
  date_operation: string;
  type_operation: 'depot' | 'retrait' | 'paiement';
  montant: number;
  description: string;
  client_nom: string;
  client_prenom: string;
  compte_type: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/admin/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error();

      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      showToast('Erreur chargement transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const isPaiement = (type: string) =>
    !['depot', 'retrait'].includes(type);

  const filtered = transactions.filter(t => {
    const matchSearch = `${t.client_prenom} ${t.client_nom} ${t.description}`.toLowerCase().includes(search.toLowerCase());
    const matchType =
      filterType === 'all' ||
      t.type_operation === filterType ||
      (filterType === 'paiement' && isPaiement(t.type_operation));
    return matchSearch && matchType;
  });

  const stats = {
    total:     transactions.reduce((sum, t) => sum + Number(t.montant), 0),
    depots:    transactions.filter(t => t.type_operation === 'depot').reduce((sum, t) => sum + Number(t.montant), 0),
    retraits:  transactions.filter(t => t.type_operation === 'retrait').reduce((sum, t) => sum + Number(t.montant), 0),
    paiements: transactions.filter(t => isPaiement(t.type_operation)).reduce((sum, t) => sum + Number(t.montant), 0),
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
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-xl text-white shadow-lg text-sm bg-green-500">
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Transactions globales</h1>
        <p className="text-sm text-gray-500">Suivez toutes les opérations financières</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-400">Volume total</p>
          <p className="text-xl font-bold text-gray-800">{stats.total.toLocaleString()} FCFA</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-400">Dépôts</p>
          <p className="text-xl font-bold text-green-600">{stats.depots.toLocaleString()} FCFA</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-400">Retraits</p>
          <p className="text-xl font-bold text-red-600">{stats.retraits.toLocaleString()} FCFA</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-400">Paiements</p>
          <p className="text-xl font-bold text-orange-600">{stats.paiements.toLocaleString()} FCFA</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Rechercher un client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">Tous types</option>
          <option value="depot">Dépôts</option>
          <option value="retrait">Retraits</option>
          <option value="paiement">Paiements</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Client</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Type</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Montant</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Description</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-sm font-medium">{t.client_prenom} {t.client_nom}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    t.type_operation === 'depot' ? 'bg-green-100 text-green-700' :
                    t.type_operation === 'retrait' ? 'bg-red-100 text-red-600' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {t.type_operation === 'depot' ? 'Dépôt' : t.type_operation === 'retrait' ? 'Retrait' : 'Paiement'}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm font-semibold text-gray-800">{Number(t.montant).toLocaleString('fr-FR')} FCFA</td>
                <td className="px-5 py-3 text-sm text-gray-600">{t.description}</td>
                <td className="px-5 py-3 text-sm text-gray-600">{new Date(t.date_operation).toLocaleDateString('fr-FR')}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400">Aucune transaction trouvée</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}