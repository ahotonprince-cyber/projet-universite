import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white p-6">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-gray-100 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-error-warning-line text-red-500 text-3xl" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Lien invalide</h2>
          <p className="text-gray-500 text-sm mb-6">
            Ce lien de réinitialisation est manquant ou invalide.
          </p>
          <Link
            to="/client/mot-de-passe-oublie"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition"
          >
            <i className="ri-refresh-line" /> Nouvelle demande
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur lors de la réinitialisation.');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white p-6">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-gray-100 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-check-double-line text-green-500 text-3xl" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Mot de passe modifié !</h2>
          <p className="text-gray-500 text-sm mb-6">
            Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.
          </p>
          <button
            onClick={() => navigate('/client/connexion')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-500 transition shadow-lg shadow-orange-500/30"
          >
            <i className="ri-login-box-line" /> Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white p-6">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="ri-lock-password-line text-orange-500 text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Nouveau mot de passe</h1>
          <p className="text-gray-500 text-sm">Choisissez un mot de passe sécurisé (minimum 8 caractères).</p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
                <i className="ri-error-warning-line mt-0.5" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <i className="ri-lock-line text-gray-400 text-sm" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <i className="ri-lock-line text-gray-400 text-sm" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
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
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-500 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><i className="ri-loader-4-line animate-spin" /> Réinitialisation...</>
              ) : (
                <><i className="ri-save-line" /> Enregistrer le mot de passe</>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/client/connexion" className="text-sm text-gray-500 hover:text-orange-500 flex items-center justify-center gap-1 transition-colors">
              <i className="ri-arrow-left-line" /> Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
