import { useState } from 'react';

export default function SecuritePage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur lors du changement de mot de passe.');

      setMessage('Mot de passe modifié avec succès.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      <div>
        <h2 className="text-xl font-bold text-gray-900">Sécurité</h2>
        <p className="text-sm text-gray-500">Gérez le mot de passe de votre compte</p>
      </div>

      <form onSubmit={handleChangePassword} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 flex items-start gap-2">
            <i className="ri-error-warning-line mt-0.5" />
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200 flex items-center gap-2">
            <i className="ri-check-double-line" />
            {message}
          </div>
        )}

        {/* Mot de passe actuel */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Mot de passe actuel
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <i className="ri-lock-line text-gray-400 text-sm" />
            </div>
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <i className={showCurrent ? 'ri-eye-off-line' : 'ri-eye-line'} />
            </button>
          </div>
        </div>

        {/* Nouveau mot de passe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nouveau mot de passe
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <i className="ri-lock-password-line text-gray-400 text-sm" />
            </div>
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <i className={showNew ? 'ri-eye-off-line' : 'ri-eye-line'} />
            </button>
          </div>
          {newPassword && newPassword.length < 8 && (
            <p className="text-xs text-red-500 mt-1">Minimum 8 caractères</p>
          )}
        </div>

        {/* Confirmer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Confirmer le nouveau mot de passe
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <i className="ri-lock-password-line text-gray-400 text-sm" />
            </div>
            <input
              type={showNew ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
            />
          </div>
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
          )}
          {confirmPassword && newPassword === confirmPassword && newPassword.length >= 8 && (
            <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
              <i className="ri-check-line" /> Mots de passe identiques
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-500 transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><i className="ri-loader-4-line animate-spin" /> Modification en cours...</>
          ) : (
            <><i className="ri-save-line" /> Modifier le mot de passe</>
          )}
        </button>
      </form>

      <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg text-sm text-orange-700 flex items-start gap-2">
        <i className="ri-shield-check-line text-lg mt-0.5" />
        <span>Conseil : utilisez un mot de passe fort avec des majuscules, chiffres et symboles (ex: Mon#Passe8).</span>
      </div>

    </div>
  );
}
