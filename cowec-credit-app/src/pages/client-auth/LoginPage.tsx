import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailNonVerifie, setEmailNonVerifie] = useState(false);
  const [compteBloque, setCompteBloque] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailNonVerifie(false);
    setCompteBloque(false);
    setResendMessage('');
    if (!form.email || !form.password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password })
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.code === 'EMAIL_NOT_VERIFIED') setEmailNonVerifie(true);
        if (data.code === 'COMPTE_BLOQUE') setCompteBloque(true);
        throw new Error(data.error || 'Erreur de connexion');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'admin' || data.user.role === 'agent') {
        navigate('/admin');
      } else {
        navigate('/espace-client');
      }
    } catch (err: any) {
      setError(err.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage('');
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email })
      });
      const data = await response.json();
      setResendMessage(data.message || 'Email envoyé.');
    } catch {
      setResendMessage('Erreur lors de l\'envoi. Réessayez.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex flex-col"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay orange/sombre léger */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900/50 via-black/30 to-orange-800/40" />

      {/* Contenu */}
      <div className="relative z-10 flex flex-col min-h-screen p-6 md:p-10">

        {/* Header : Logo + Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/30 backdrop-blur-sm border border-white/40 rounded-xl flex items-center justify-center">
              <i className="ri-bank-line text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold tracking-wide drop-shadow-md">COWEC</h1>
              <p className="text-orange-200 text-sm drop-shadow">Microfinance</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 sm:gap-8">
            <div className="text-center">
              <p className="text-white text-xl font-bold drop-shadow-md">2 500+</p>
              <p className="text-orange-100 text-xs drop-shadow">Clients actifs</p>
            </div>
            <div className="w-px bg-white/30" />
            <div className="text-center">
              <p className="text-white text-xl font-bold drop-shadow-md">98%</p>
              <p className="text-orange-100 text-xs drop-shadow">Satisfaction</p>
            </div>
            <div className="w-px bg-white/30" />
            <div className="text-center">
              <p className="text-white text-xl font-bold drop-shadow-md">15 ans</p>
              <p className="text-orange-100 text-xs drop-shadow">D'expérience</p>
            </div>
          </div>
        </div>

        {/* Formulaire centré */}
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md bg-black/40 backdrop-blur-lg border border-white/15 rounded-2xl p-8 shadow-2xl">

            {/* Titre */}
            <div className="mb-7">
              <h2 className="text-3xl font-bold text-white mb-1 drop-shadow">Connexion</h2>
              <p className="text-white/70 text-sm">Accédez à votre espace client</p>
            </div>

            {/* Erreur */}
            {error && (
              <div className="mb-5 p-3 bg-red-500/20 border border-red-400/40 rounded-lg flex items-start gap-2">
                <i className="ri-error-warning-line text-red-300 mt-0.5" />
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Compte bloqué */}
            {compteBloque && (
              <div className="mb-5 p-4 bg-red-500/20 border border-red-400/40 rounded-lg">
                <div className="flex items-start gap-2 mb-3">
                  <i className="ri-lock-line text-red-300 mt-0.5 text-lg" />
                  <p className="text-red-200 text-sm">
                    Votre compte est bloqué. Un lien de déblocage vous a été envoyé par email.
                  </p>
                </div>
                <Link
                  to="/debloquer-compte"
                  className="w-full py-2 bg-red-500/30 hover:bg-red-500/50 border border-red-400/50 text-red-200 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className="ri-lock-unlock-line" /> Débloquer mon compte
                </Link>
              </div>
            )}

            {/* Email non vérifié */}
            {emailNonVerifie && (
              <div className="mb-5 p-4 bg-yellow-500/20 border border-yellow-400/40 rounded-lg">
                <div className="flex items-start gap-2 mb-3">
                  <i className="ri-mail-lock-line text-yellow-300 mt-0.5 text-lg" />
                  <p className="text-yellow-200 text-sm">
                    Votre email n'a pas encore été vérifié. Consultez votre boîte mail ou renvoyez le lien.
                  </p>
                </div>
                {resendMessage ? (
                  <p className="text-green-300 text-sm font-medium">{resendMessage}</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="w-full py-2 bg-yellow-500/30 hover:bg-yellow-500/50 border border-yellow-400/50 text-yellow-200 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {resendLoading ? (
                      <><i className="ri-loader-4-line animate-spin" /> Envoi en cours...</>
                    ) : (
                      <><i className="ri-mail-send-line" /> Renvoyer l'email de vérification</>
                    )}
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1.5">
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                    <i className="ri-mail-line text-white/60 text-sm" />
                  </div>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="votre@email.com"
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/25 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                    <i className="ri-lock-line text-white/60 text-sm" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/25 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer"
                  >
                    <i className={`${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-white/60 text-sm`} />
                  </button>
                </div>
              </div>

              {/* Se souvenir + Mot de passe oublié */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-orange-400" />
                  <span className="text-sm text-white/80">Se souvenir de moi</span>
                </label>
                <Link
                  to="/client/mot-de-passe-oublie"
                  className="text-sm text-orange-300 hover:text-orange-200 font-medium transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              {/* Bouton connexion */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-500 transition-all disabled:opacity-70 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-orange-500/40"
              >
                {loading ? (
                  <>
                    <i className="ri-loader-4-line animate-spin" />
                    <span>Connexion en cours...</span>
                  </>
                ) : (
                  <>
                    <i className="ri-login-box-line" />
                    <span>Se connecter</span>
                  </>
                )}
              </button>
            </form>

            {/* Liens bas */}
            <p className="mt-6 text-center text-sm text-white/70">
              Pas encore de compte ?{' '}
              <Link to="/client/inscription" className="text-orange-300 hover:text-orange-200 font-semibold transition-colors">
                Créer un compte
              </Link>
            </p>

            <p className="mt-3 text-center text-xs text-white/50">
              Vous êtes un agent ou administrateur ?{' '}
              <Link to="/admin" className="text-white/70 hover:text-white underline transition-colors">
                Accès administration
              </Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}