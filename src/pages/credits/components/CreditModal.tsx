import { useState, useEffect } from 'react';
import { Credit } from '@/mocks/credits';
import { clients } from '@/mocks/clients';

interface CreditModalProps {
  open: boolean;
  credit?: Credit | null;
  onClose: () => void;
  onSave: (data: Partial<Credit>) => void;
}

export default function CreditModal({ open, credit, onClose, onSave }: CreditModalProps) {
  const [form, setForm] = useState({
    clientId: '',
    montant: '',
    tauxInteret: '',
    duree: '',
    objet: '',
  });

  useEffect(() => {
    if (credit) {
      setForm({
        clientId: credit.clientId,
        montant: String(credit.montant),
        tauxInteret: String(credit.tauxInteret),
        duree: String(credit.duree),
        objet: credit.objet,
      });
    } else {
      setForm({ clientId: '', montant: '', tauxInteret: '', duree: '', objet: '' });
    }
  }, [credit, open]);

  if (!open) return null;

  const selectedClient = clients.find((c) => c.id === form.clientId);
  const montant = parseFloat(form.montant) || 0;
  const taux = parseFloat(form.tauxInteret) || 0;
  const duree = parseInt(form.duree) || 0;
  const mensualite = duree > 0 ? Math.round((montant * (1 + taux / 100)) / duree) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === form.clientId);
    onSave({
      clientId: form.clientId,
      clientNom: client?.nom || '',
      clientPrenom: client?.prenom || '',
      montant: parseFloat(form.montant),
      tauxInteret: parseFloat(form.tauxInteret),
      duree: parseInt(form.duree),
      objet: form.objet,
      statut: 'en_attente',
      montantRembourse: 0,
      dateDebut: '',
      dateFin: '',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="text-lg font-bold text-gray-900">
            {credit ? 'Modifier le crédit' : 'Nouvelle demande de crédit'}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
            <i className="ri-close-line text-gray-500 text-xl" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
            <select
              required
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 transition-colors bg-white"
            >
              <option value="">Sélectionner un client</option>
              {clients.filter((c) => c.statut === 'actif').map((c) => (
                <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
              ))}
            </select>
            {selectedClient && (
              <p className="text-xs text-orange-500 mt-1">Score de crédit : {selectedClient.scoreCredit}/100</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Objet du crédit *</label>
            <input
              required
              value={form.objet}
              onChange={(e) => setForm({ ...form, objet: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 transition-colors"
              placeholder="Ex: Fonds de roulement commerce"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant (FCFA) *</label>
              <input
                required
                type="number"
                min="10000"
                value={form.montant}
                onChange={(e) => setForm({ ...form, montant: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 transition-colors"
                placeholder="500000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Taux d&apos;intérêt (%) *</label>
              <input
                required
                type="number"
                min="1"
                max="50"
                step="0.5"
                value={form.tauxInteret}
                onChange={(e) => setForm({ ...form, tauxInteret: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 transition-colors"
                placeholder="12"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Durée (mois) *</label>
            <input
              required
              type="number"
              min="1"
              max="60"
              value={form.duree}
              onChange={(e) => setForm({ ...form, duree: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 transition-colors"
              placeholder="12"
            />
          </div>

          {/* Simulation */}
          {montant > 0 && duree > 0 && (
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
              <p className="text-xs font-semibold text-orange-700 mb-2">Simulation de remboursement</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-lg font-bold text-orange-600">{mensualite.toLocaleString('fr-FR')}</p>
                  <p className="text-xs text-gray-500">FCFA/mois</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-800">{Math.round(montant * taux / 100).toLocaleString('fr-FR')}</p>
                  <p className="text-xs text-gray-500">Intérêts totaux</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-800">{Math.round(montant * (1 + taux / 100)).toLocaleString('fr-FR')}</p>
                  <p className="text-xs text-gray-500">Total à rembourser</p>
                </div>
              </div>
            </div>
          )}

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
              {credit ? 'Enregistrer' : 'Soumettre la demande'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
