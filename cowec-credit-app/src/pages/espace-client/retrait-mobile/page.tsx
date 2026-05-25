import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RetraitMobilePage() {
  const navigate = useNavigate();

  const [operateur, setOperateur] = useState('mtn');
  const [montant, setMontant] = useState('');
  const [telephone, setTelephone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validatePhone = (phone: string) => {
    return /^[0-9]{8,12}$/.test(phone.replace(/\s/g, ''));
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    const amount = Number(montant);

    if (!amount || amount < 1000) {
      setError('Montant minimum 1 000 FCFA');
      return;
    }

    if (!telephone || !validatePhone(telephone)) {
      setError('Numéro de téléphone invalide');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Session expirée, veuillez vous reconnecter');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/client/retrait-mobile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          operateur,
          montant: amount,
          telephone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Solde insuffisant ou erreur serveur');
      }

      setSuccess('Demande de retrait envoyée avec succès ✔');

      setTimeout(() => {
        navigate('/espace-client/solde');
      }, 2500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const operators = [
    { id: 'mtn',  label: 'MTN MoMo',   icon: 'ri-smartphone-line' },
    { id: 'moov', label: 'Moov Money',  icon: 'ri-smartphone-line' },
    { id: 'wave', label: 'Wave',        icon: 'ri-bank-card-line'  },
  ];

  return (
    <div className="max-w-md mx-auto space-y-6">

      <div>
        <h2 className="text-xl font-bold text-gray-900">Retrait mobile</h2>
        <p className="text-sm text-gray-500">
          Retirez votre argent vers Mobile Money
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-100 p-6 space-y-5"
      >
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {success}
          </div>
        )}

        {/* OPERATEURS */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Opérateur
          </label>

          <div className="grid grid-cols-3 gap-2">
            {operators.map((op) => (
              <button
                key={op.id}
                type="button"
                onClick={() => setOperateur(op.id)}
                className={`py-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-1 transition ${
                  operateur === op.id
                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                    : 'border-gray-200 text-gray-600 hover:border-orange-300'
                }`}
              >
                <i className={op.icon} />
                {op.label}
              </button>
            ))}
          </div>
        </div>

        {/* TELEPHONE */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Numéro de téléphone
          </label>

          <input
            type="tel"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="77 000 00 00"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />

          <p className="text-xs text-gray-400 mt-1">
            Numéro lié à votre compte Mobile Money
          </p>
        </div>

        {/* MONTANT */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Montant (FCFA)
          </label>

          <input
            type="number"
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            placeholder="1000 minimum"
            min="1000"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />

          {montant && (
            <p className="text-xs text-gray-500 mt-1">
              Montant : {Number(montant).toLocaleString()} FCFA
            </p>
          )}
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-500 transition disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <i className="ri-loader-4-line animate-spin" />
              Traitement...
            </>
          ) : (
            <>
              <i className="ri-send-plane-line" />
              Demander le retrait
            </>
          )}
        </button>
      </form>
    </div>
  );
}