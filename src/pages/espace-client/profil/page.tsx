import { useState } from 'react';
import { clientProfile, documents } from '@/mocks/clientProfile';

export default function ProfilClientPage() {
  const [form, setForm] = useState({ ...clientProfile });
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'infos' | 'docs' | 'securite'>('infos');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const scoreColor = form.scoreCredit >= 80 ? 'text-green-600' : form.scoreCredit >= 60 ? 'text-orange-500' : 'text-red-500';
  const scoreBg = form.scoreCredit >= 80 ? 'bg-green-500' : form.scoreCredit >= 60 ? 'bg-orange-500' : 'bg-red-500';

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Mon profil</h2>
        <p className="text-sm text-gray-500">Gérez vos informations personnelles et documents</p>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 flex items-center gap-5">
        <div className="relative">
          <img src={form.avatar} alt={form.prenom} className="w-20 h-20 rounded-full object-cover" />
          <button className="absolute bottom-0 right-0 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer">
            <i className="ri-camera-line text-white text-xs" />
          </button>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{form.prenom} {form.nom}</h3>
          <p className="text-sm text-gray-500">{form.email}</p>
          <p className="text-xs text-gray-400 mt-1">Client depuis {form.dateInscription}</p>
        </div>
        <div className="text-center">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke={form.scoreCredit >= 80 ? '#22c55e' : '#f97316'} strokeWidth="3"
                strokeDasharray={`${form.scoreCredit} 100`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-sm font-bold ${scoreColor}`}>{form.scoreCredit}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">Score crédit</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {([['infos', 'Informations'], ['docs', 'Documents'], ['securite', 'Sécurité']] as const).map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${activeTab === tab ? 'bg-white text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'infos' && (
        <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          {saved && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <i className="ri-checkbox-circle-line text-green-500" />
              <span className="text-sm text-green-700 font-medium">Informations sauvegardées avec succès !</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
              <input type="text" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
              <input type="text" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
            <input type="tel" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse</label>
            <input type="text" value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Profession</label>
              <input type="text" value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date de naissance</label>
              <input type="date" value={form.dateNaissance} onChange={(e) => setForm({ ...form, dateNaissance: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>
          <button type="submit" className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-500 transition-all cursor-pointer whitespace-nowrap">
            <i className="ri-save-line mr-2" />Sauvegarder les modifications
          </button>
        </form>
      )}

      {activeTab === 'docs' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-file-text-line text-orange-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{doc.nom}</p>
                  <p className="text-xs text-gray-400">{doc.type} • {doc.dateUpload}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${
                  doc.statut === 'valide' ? 'bg-green-100 text-green-700' :
                  doc.statut === 'en_attente' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-600'
                }`}>
                  {doc.statut === 'valide' ? 'Validé' : doc.statut === 'en_attente' ? 'En attente' : 'Rejeté'}
                </span>
              </div>
            ))}
          </div>
          <div className="border-2 border-dashed border-orange-200 rounded-xl p-6 text-center cursor-pointer hover:border-orange-400 transition-colors">
            <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-upload-cloud-line text-orange-500 text-xl" />
            </div>
            <p className="text-sm font-medium text-gray-700">Ajouter un document</p>
            <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG — Max 5 Mo</p>
          </div>
        </div>
      )}

      {activeTab === 'securite' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe actuel</label>
            <input type="password" placeholder="••••••••" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nouveau mot de passe</label>
            <input type="password" placeholder="Minimum 8 caractères" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer le nouveau mot de passe</label>
            <input type="password" placeholder="Répétez le mot de passe" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-500 transition-all cursor-pointer whitespace-nowrap">
            <i className="ri-lock-password-line mr-2" />Changer le mot de passe
          </button>
          <div className="p-4 bg-orange-50 rounded-xl">
            <p className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <i className="ri-shield-check-line text-orange-500" /> Vérification en deux étapes
            </p>
            <p className="text-xs text-gray-500 mb-3">Activez la vérification OTP par SMS pour sécuriser votre compte.</p>
            <button className="px-4 py-2 border border-orange-300 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors cursor-pointer whitespace-nowrap">
              Activer l'OTP
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
