import { useState } from 'react';

export default function ParametresPage() {
  const [activeTab, setActiveTab] = useState('profil');

  const [profil, setProfil] = useState({
    nom: 'Client',
    telephone: '770000000',
  });

  const tabs = [
    { id: 'profil', label: 'Profil', icon: 'ri-user-line' },
    { id: 'securite', label: 'Sécurité', icon: 'ri-lock-line' },
    { id: 'notifications', label: 'Notifications', icon: 'ri-notification-3-line' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/client/connexion';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Paramètres</h2>
        <p className="text-sm text-gray-500">
          Gestion de ton compte et préférences
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
              activeTab === t.id
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <i className={t.icon}></i>
            {t.label}
          </button>
        ))}
      </div>

      {/* ================= PROFIL ================= */}
      {activeTab === 'profil' && (
        <div className="bg-white p-6 rounded-xl space-y-4 border">

          <h3 className="font-semibold text-gray-800">
            Informations personnelles
          </h3>

          <div>
            <label className="text-sm text-gray-500">Nom complet</label>
            <input
              className="w-full border p-2 rounded mt-1"
              value={profil.nom}
              onChange={(e) =>
                setProfil({ ...profil, nom: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Téléphone</label>
            <input
              className="w-full border p-2 rounded mt-1"
              value={profil.telephone}
              onChange={(e) =>
                setProfil({ ...profil, telephone: e.target.value })
              }
            />
          </div>

          <button className="w-full bg-orange-500 text-white py-2 rounded font-semibold hover:bg-orange-600 transition">
            Sauvegarder
          </button>
        </div>
      )}

      {/* ================= SECURITE ================= */}
      {activeTab === 'securite' && (
        <div className="bg-white p-6 rounded-xl space-y-4 border">

          <h3 className="font-semibold text-gray-800">
            Sécurité du compte
          </h3>

          <input
            type="password"
            placeholder="Nouveau mot de passe"
            className="w-full border p-2 rounded"
          />

          <input
            type="password"
            placeholder="Confirmer mot de passe"
            className="w-full border p-2 rounded"
          />

          <button className="w-full bg-orange-500 text-white py-2 rounded font-semibold hover:bg-orange-600 transition">
            Mettre à jour
          </button>

          <p className="text-xs text-gray-400">
            Utilise un mot de passe sécurisé avec chiffres et symboles
          </p>
        </div>
      )}

      {/* ================= NOTIFICATIONS ================= */}
      {activeTab === 'notifications' && (
        <div className="bg-white p-6 rounded-xl space-y-3 border">

          <h3 className="font-semibold text-gray-800">
            Préférences de notifications
          </h3>

          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked />
            Email
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked />
            SMS
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Push notification
          </label>

          <button className="w-full bg-gray-100 py-2 rounded mt-3">
            Enregistrer
          </button>
        </div>
      )}

      {/* ================= COMPTE ================= */}
      <div className="bg-white p-6 rounded-xl border">

        <h3 className="font-semibold text-red-600">
          Zone sensible
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          Actions irréversibles sur ton compte
        </p>

        <button
          onClick={handleLogout}
          className="mt-4 w-full bg-red-500 text-white py-2 rounded font-semibold hover:bg-red-600"
        >
          Se déconnecter
        </button>
      </div>

    </div>
  );
}