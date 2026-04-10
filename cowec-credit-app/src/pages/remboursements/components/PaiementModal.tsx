import { useState } from 'react';
import { Remboursement } from '@/mocks/remboursements';

interface PaiementModalProps {
  open: boolean;
  remboursement: Remboursement | null;
  onClose: () => void;
  onSave: (id: string, montant: number, date: string) => void;
}

export default function PaiementModal({ open, remboursement, onClose, onSave }: PaiementModalProps) {
  const [montant, setMontant] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!open || !remboursement) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(remboursement.id, parseFloat(montant), date);
    setMontant('');
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Enregistrer un paiement</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
            <i className="ri-close-line text-gray-500 text-xl" />
          </button>
        </div>
        <div className="p-6">
          <div className="bg-orange-50 rounded-xl p-4 mb-5 border border-orange-100">
            <p className="text-sm font-semibold text-gray-800">{remboursement.clientPrenom} {remboursement.clientNom}</p>
            <p className="text-xs text-gray-500 mt-1">Crédit #{remboursement.creditId}</p>
            <div className="flex justify-between mt-3 text-sm">
              <span className="text-gray-500">Montant échéance :</span>
              <span className="font-bold text-orange-600">{remboursement.montantEcheance.toLocaleString('fr-FR')} FCFA</span>
            </div>
            <div className="flex justify-between mt-1 text-sm">
              <span className="text-gray-500">Reste à payer :</span>
              <span className="font-bold text-red-600">{remboursement.resteAPayer.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant payé (FCFA) *</label>
              <input
                required
                type="number"
                min="1"
                max={remboursement.resteAPayer}
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 transition-colors"
                placeholder={String(remboursement.montantEcheance)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de paiement *</label>
              <input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 transition-colors"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-lg py-2.5 text-sm font-medium hover:from-orange-600 hover:to-orange-500 transition-all cursor-pointer whitespace-nowrap"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
