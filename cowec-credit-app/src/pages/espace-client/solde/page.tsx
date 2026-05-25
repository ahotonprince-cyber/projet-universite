import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Solde {
  solde_epargne: number;
  solde_courant: number;
  solde_tontine: number;
}

interface Operation {
  id: number;
  type_operation: string;
  montant: number;
  date_operation: string;
  description: string;
}

export default function SoldePage() {
  const navigate = useNavigate();

  const [solde, setSolde] = useState<Solde | null>(null);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/client/connexion');
        return;
      }

      const [soldeRes, opsRes] = await Promise.all([
        fetch('/api/client/solde', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/client/operations', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!soldeRes.ok) throw new Error('Erreur chargement solde');

      const soldeData = await soldeRes.json();
      setSolde(soldeData);

      if (opsRes.ok) {
        const opsData = await opsRes.json();
        setOperations(opsData.operations || []);
      }
    } catch (err) {
      console.error(err);
      setError('Impossible de charger vos soldes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const POSITIVE_TYPES = ['depot', 'credit_decaisse', 'virement_entrant'];

  const isPositive = (type: string) => POSITIVE_TYPES.includes(type);

  const getTypeColor = (type: string) =>
    isPositive(type) ? 'text-green-600' : 'text-red-600';

  const getTypeIcon = (type: string) =>
    isPositive(type) ? 'ri-arrow-up-line' : 'ri-arrow-down-line';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !solde) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600">{error || 'Solde introuvable'}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-xl font-bold text-gray-900">Mon solde</h2>
        <p className="text-sm text-gray-500">
          Gestion de vos comptes et opérations
        </p>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* ÉPARGNE */}
        <div className="bg-white rounded-xl border p-5">
          <div className="flex justify-between mb-2">
            <p className="text-sm text-gray-500">Épargne</p>
            <i className="ri-bank-line text-orange-500 text-xl" />
          </div>

          <p className="text-2xl font-bold">
            {solde.solde_epargne.toLocaleString()} FCFA
          </p>

          <button
            onClick={() => navigate('/espace-client/depot-mobile')}
            className="mt-3 w-full py-2 bg-orange-500 text-white rounded-lg"
          >
            Déposer
          </button>
        </div>

        {/* COURANT */}
        <div className="bg-white rounded-xl border p-5">
          <div className="flex justify-between mb-2">
            <p className="text-sm text-gray-500">Courant</p>
            <i className="ri-wallet-line text-orange-500 text-xl" />
          </div>

          <p className="text-2xl font-bold">
            {solde.solde_courant.toLocaleString()} FCFA
          </p>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => navigate('/espace-client/depot-mobile')}
              className="flex-1 py-2 bg-orange-500 text-white rounded-lg"
            >
              Déposer
            </button>

            <button
              onClick={() => navigate('/espace-client/retrait-mobile')}
              className="flex-1 py-2 border border-orange-500 text-orange-600 rounded-lg"
            >
              Retirer
            </button>
          </div>
        </div>

        {/* TONTINE */}
        <div className="bg-white rounded-xl border p-5">
          <div className="flex justify-between mb-2">
            <p className="text-sm text-gray-500">Tontine</p>
            <i className="ri-group-line text-orange-500 text-xl" />
          </div>

          <p className="text-2xl font-bold">
            {solde.solde_tontine.toLocaleString()} FCFA
          </p>

          <button
            onClick={() => navigate('/espace-client/tontine')}
            className="mt-3 w-full py-2 bg-gray-100 text-gray-700 rounded-lg"
          >
            Voir tontine
          </button>
        </div>
      </div>

      {/* OPERATIONS */}
      <div className="bg-white rounded-xl border p-5">

        <h3 className="font-semibold text-gray-800 mb-4">
          Historique des opérations
        </h3>

        {operations.length === 0 ? (
          <p className="text-gray-400 text-sm">
            Aucune opération disponible
          </p>
        ) : (
          <div className="space-y-3">

            {operations.map((op) => (
              <div
                key={op.id}
                className="flex justify-between items-center border-b pb-2"
              >

                <div className="flex items-center gap-3">

                  <i className={`${getTypeIcon(op.type_operation)} text-orange-500`} />

                  <div>
                    <p className="text-sm font-medium">
                      {op.description}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(op.date_operation)}
                    </p>
                  </div>

                </div>

                <span className={`text-sm font-bold ${getTypeColor(op.type_operation)}`}>
                  {isPositive(op.type_operation) ? '+' : '-'}
                  {Math.abs(op.montant).toLocaleString()} FCFA
                </span>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}