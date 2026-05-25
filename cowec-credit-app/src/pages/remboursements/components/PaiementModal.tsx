import { useEffect, useState } from 'react';

interface Remboursement {
  id: number;
  client_nom: string;
  client_prenom: string;
  credit_id: number;
  numero_credit: string;
  montant_echeance: number;
  reste_a_payer: number;
  date_echeance: string;
  statut: string;
}

interface PaiementModalProps {
  open: boolean;
  remboursement: Remboursement | null;
  onClose: () => void;
  onSave: (id: number, montant: number, date: string) => Promise<void> | void;
}

export default function PaiementModal({
  open,
  remboursement,
  onClose,
  onSave
}: PaiementModalProps) {

  const [montant, setMontant] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* 🔥 RESET AUTO À CHAQUE OUVERTURE */
  useEffect(() => {
    if (open && remboursement) {
      setMontant('');
      setDate(new Date().toISOString().split('T')[0]);
      setError('');
    }
  }, [open, remboursement]);

  if (!open || !remboursement) return null;

  const reste = remboursement.reste_a_payer || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const montantNum = Number(montant);

    /* 🔥 VALIDATION */
    if (!montantNum || montantNum <= 0) {
      setError('Montant invalide');
      return;
    }

    if (montantNum > reste) {
      setError('Montant supérieur au reste à payer');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await onSave(remboursement.id, montantNum, date);

    } catch (err) {
      setError('Erreur lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">

      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b">

          <h3 className="text-lg font-bold">
            Enregistrer un paiement
          </h3>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg"
          >
            <i className="ri-close-line text-xl text-gray-500" />
          </button>

        </div>

        {/* BODY */}
        <div className="p-6">

          {/* INFO CLIENT */}
          <div className="bg-orange-50 p-4 rounded-xl mb-5 border">

            <p className="font-semibold text-sm">
              {remboursement.client_prenom} {remboursement.client_nom}
            </p>

            <p className="text-xs text-gray-500">
              Crédit #{remboursement.numero_credit}
            </p>

            <div className="mt-3 text-sm flex justify-between">
              <span>Échéance</span>
              <span className="font-bold text-orange-600">
                {Number(remboursement.montant_echeance || 0).toLocaleString()} FCFA
              </span>
            </div>

            <div className="text-sm flex justify-between mt-1">
              <span>Reste</span>
              <span className="font-bold text-red-600">
                {reste.toLocaleString()} FCFA
              </span>
            </div>

          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ERROR */}
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-2 rounded-lg">
                {error}
              </div>
            )}

            {/* MONTANT */}
            <div>
              <label className="text-sm font-medium">
                Montant payé *
              </label>

              <input
                type="number"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                max={reste}
                min={1}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
                placeholder="Ex: 5000"
              />
            </div>

            {/* DATE */}
            <div>
              <label className="text-sm font-medium">
                Date *
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
              />
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3 pt-2">

              <button
                type="button"
                onClick={onClose}
                className="flex-1 border rounded-lg py-2 text-sm"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-orange-500 text-white rounded-lg py-2 text-sm disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : 'Valider'}
              </button>

            </div>

          </form>

        </div>

      </div>
    </div>
  );
}