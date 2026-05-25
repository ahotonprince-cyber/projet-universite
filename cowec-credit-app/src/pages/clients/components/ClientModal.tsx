import { useState, useEffect } from 'react';

// Définition locale du type Client (basée sur le backend)
interface Client {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  profession: string;
  statut: 'actif' | 'inactif';
  dateCreation?: string;
  avatar?: string;
  scoreCredit?: number;
}

interface ClientModalProps {
  open: boolean;
  client?: Client | null;
  onClose: () => void;
  onSave: (data: Omit<Client, 'id' | 'dateCreation' | 'avatar' | 'scoreCredit'> & { password?: string }) => void;
}

export default function ClientModal({ open, client, onClose, onSave }: ClientModalProps) {
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    profession: '',
    statut: 'actif' as 'actif' | 'inactif',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (client) {
      setForm({
        nom: client.nom,
        prenom: client.prenom,
        email: client.email || '',
        telephone: client.telephone,
        adresse: client.adresse,
        profession: client.profession,
        statut: client.statut,
        password: '',
      });
    } else {
      setForm({ 
        nom: '', 
        prenom: '', 
        email: '',
        telephone: '', 
        adresse: '', 
        profession: '', 
        statut: 'actif',
        password: '',
      });
    }
    setErrors({});
  }, [client, open]);

  if (!open) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.nom) newErrors.nom = 'Nom requis';
    if (!form.prenom) newErrors.prenom = 'Prénom requis';
    if (!form.email) {
      newErrors.email = 'Email requis';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email invalide';
    }
    if (!form.telephone) newErrors.telephone = 'Téléphone requis';
    if (!form.adresse) newErrors.adresse = 'Adresse requise';
    if (!form.profession) newErrors.profession = 'Profession requise';
    
    // Validation du mot de passe uniquement pour un nouveau client
    if (!client && !form.password) {
      newErrors.password = 'Mot de passe requis';
    } else if (!client && form.password.length < 8) {
      newErrors.password = 'Minimum 8 caractères';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // Pour la modification, on n'envoie le mot de passe que s'il est rempli
    const dataToSend: any = {
      nom: form.nom,
      prenom: form.prenom,
      email: form.email,
      telephone: form.telephone,
      adresse: form.adresse,
      profession: form.profession,
      statut: form.statut,
    };
    
    // Ajouter le mot de passe uniquement pour un nouveau client ou s'il a été modifié
    if (!client || form.password) {
      dataToSend.password = form.password;
    }
    
    onSave(dataToSend);
  };

  const isNewClient = !client;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="text-lg font-bold text-gray-900">
            {client ? 'Modifier le client' : 'Nouveau client'}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
            <i className="ri-close-line text-gray-500 text-xl" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Prénom et Nom */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
              <input
                required
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 transition-colors ${
                  errors.prenom ? 'border-red-400' : 'border-gray-200'
                }`}
                placeholder="Aminata"
              />
              {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                required
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 transition-colors ${
                  errors.nom ? 'border-red-400' : 'border-gray-200'
                }`}
                placeholder="Diallo"
              />
              {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                <i className="ri-mail-line text-gray-400 text-sm" />
              </div>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-orange-400 transition-colors ${
                  errors.email ? 'border-red-400' : 'border-gray-200'
                }`}
                placeholder="client@email.com"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                <i className="ri-phone-line text-gray-400 text-sm" />
              </div>
              <input
                required
                value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-orange-400 transition-colors ${
                  errors.telephone ? 'border-red-400' : 'border-gray-200'
                }`}
                placeholder="+221 77 000 00 00"
              />
            </div>
            {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isNewClient ? 'Mot de passe *' : 'Nouveau mot de passe (optionnel)'}
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                <i className="ri-lock-line text-gray-400 text-sm" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required={isNewClient}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={`w-full pl-9 pr-10 py-2 border rounded-lg text-sm focus:outline-none focus:border-orange-400 transition-colors ${
                  errors.password ? 'border-red-400' : 'border-gray-200'
                }`}
                placeholder={isNewClient ? "Minimum 8 caractères" : "Laisser vide pour conserver l'ancien"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center cursor-pointer"
              >
                <i className={`${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-gray-400 text-sm`} />
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            {isNewClient && !errors.password && form.password && form.password.length < 8 && (
              <p className="text-orange-500 text-xs mt-1">⚠️ Minimum 8 caractères recommandé</p>
            )}
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
            <input
              required
              value={form.adresse}
              onChange={(e) => setForm({ ...form, adresse: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 transition-colors ${
                errors.adresse ? 'border-red-400' : 'border-gray-200'
              }`}
              placeholder="Dakar, Médina, Rue 12"
            />
            {errors.adresse && <p className="text-red-500 text-xs mt-1">{errors.adresse}</p>}
          </div>

          {/* Profession */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profession *</label>
            <input
              required
              value={form.profession}
              onChange={(e) => setForm({ ...form, profession: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 transition-colors ${
                errors.profession ? 'border-red-400' : 'border-gray-200'
              }`}
              placeholder="Commerçante"
            />
            {errors.profession && <p className="text-red-500 text-xs mt-1">{errors.profession}</p>}
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={form.statut}
              onChange={(e) => setForm({ ...form, statut: e.target.value as 'actif' | 'inactif' })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 transition-colors bg-white"
            >
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>

          {/* Boutons */}
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
              {client ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}