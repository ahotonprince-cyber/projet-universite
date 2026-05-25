import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Compte {
  id: number;
  type_code: string;
  type_nom: string;
  solde: number;
  numero_compte: string;
}

export default function DepotMobilePage() {
  const navigate = useNavigate();

  const [operateur, setOperateur] = useState('mtn');
  const [montant, setMontant] = useState('');
  const [telephone, setTelephone] = useState('');
  const [typeCompte, setTypeCompte] = useState('COURANT');
  const [comptes, setComptes] = useState<Compte[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');

  const authFetch = async (url: string, options: any = {}) => {
    if (!token) throw new Error('Session expirée');
    return fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers },
    });
  };

  useEffect(() => {
    authFetch('/api/client/comptes')
      .then(r => r.json())
      .then(d => setComptes(d.comptes || []))
      .catch(() => {});
  }, []);

  const formatFCFA = (n: number) => n.toLocaleString('fr-FR') + ' FCFA';
  const montantNumber = parseFloat(montant);
  const isValid = montantNumber >= 500 && telephone.length >= 8 && !!operateur && !!typeCompte;

  const compteSelectionne = comptes.find(c => c.type_code === typeCompte);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isValid) { setError('Veuillez remplir correctement les champs'); return; }

    setLoading(true);
    try {
      const response = await authFetch('/api/client/depot-mobile', {
        method: 'POST',
        body: JSON.stringify({ operateur, montant: montantNumber, telephone, type_compte: typeCompte }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur');
      setSuccess(data.message || 'Dépôt effectué avec succès');
      setTimeout(() => navigate('/espace-client/solde'), 2500);
    } catch (err: any) {
      setError(err.message || 'Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  const operateurs = [
    { id: 'mtn',  label: 'MTN MoMo', color: 'bg-yellow-400' },
    { id: 'moov', label: 'Moov Money', color: 'bg-blue-500' },
    { id: 'wave', label: 'Wave',       color: 'bg-teal-500' },
  ];

  const typesCompte = [
    { code: 'COURANT',  label: 'Compte Courant',  icon: 'ri-bank-line' },
    { code: 'EPARGNE',  label: 'Épargne',          icon: 'ri-safe-line' },
    { code: 'TONTINE',  label: 'Tontine',          icon: 'ri-group-line' },
  ];

  return (
    <div className="max-w-md mx-auto space-y-6 pb-8">

      <div>
        <h2 className="text-xl font-bold text-gray-900">Dépôt mobile</h2>
        <p className="text-sm text-gray-500">Rechargez votre compte via Mobile Money</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5 shadow-sm">

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-2">
            <i className="ri-error-warning-line mt-0.5 shrink-0" /> {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-start gap-2">
            <i className="ri-check-line mt-0.5 shrink-0" /> {success}
          </div>
        )}

        {/* Compte cible */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Compte à créditer
          </label>
          <div className="grid grid-cols-3 gap-2">
            {typesCompte.map((tc) => {
              const compte = comptes.find(c => c.type_code === tc.code);
              return (
                <button
                  key={tc.code}
                  type="button"
                  onClick={() => setTypeCompte(tc.code)}
                  className={`py-3 px-2 rounded-xl border-2 text-xs font-medium transition flex flex-col items-center gap-1 ${
                    typeCompte === tc.code
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 text-gray-600 hover:border-orange-300'
                  }`}
                >
                  <i className={`${tc.icon} text-lg`} />
                  <span>{tc.label}</span>
                  {compte && (
                    <span className="text-gray-400 font-normal text-xs">
                      {formatFCFA(compte.solde)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {compteSelectionne && (
            <p className="text-xs text-gray-400 mt-1.5 text-center">
              N° {compteSelectionne.numero_compte}
            </p>
          )}
        </div>

        {/* Opérateur */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Opérateur</label>
          <div className="grid grid-cols-3 gap-2">
            {operateurs.map((op) => (
              <button
                key={op.id}
                type="button"
                onClick={() => setOperateur(op.id)}
                className={`py-2.5 rounded-xl border-2 text-xs font-semibold transition ${
                  operateur === op.id
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {op.label}
              </button>
            ))}
          </div>
        </div>

        {/* Téléphone */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Numéro de téléphone</label>
          <input
            type="tel"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value.replace(/\D/g, ''))}
            placeholder="97 00 00 00"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <p className="text-xs text-gray-400 mt-1">Numéro lié à votre compte Mobile Money</p>
        </div>

        {/* Montant */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Montant (FCFA)</label>
          <input
            type="number"
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            placeholder="Minimum 500 FCFA"
            min="500"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          {montantNumber >= 500 && (
            <p className="text-xs text-green-600 mt-1 font-medium">{formatFCFA(montantNumber)}</p>
          )}
        </div>

        {/* Résumé */}
        {isValid && (
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-sm space-y-1">
            <p className="font-semibold text-orange-700 mb-1">Récapitulatif</p>
            <p className="text-gray-600"><span className="font-medium">Compte :</span> {typesCompte.find(t => t.code === typeCompte)?.label}</p>
            <p className="text-gray-600"><span className="font-medium">Opérateur :</span> {operateur.toUpperCase()}</p>
            <p className="text-gray-600"><span className="font-medium">Montant :</span> <span className="text-orange-600 font-semibold">{formatFCFA(montantNumber)}</span></p>
          </div>
        )}

        <button
          type="submit"
          disabled={!isValid || loading}
          className="w-full py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <><i className="ri-loader-4-line animate-spin" /> Traitement...</> : <><i className="ri-arrow-down-circle-line" /> Effectuer le dépôt</>}
        </button>
      </form>
    </div>
  );
}
