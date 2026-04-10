import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Comptes de démonstration
const DEMO_ACCOUNTS = [
  { email: 'admin@cowec.com', password: 'admin123', role: 'admin', name: 'Administrateur' },
  { email: 'agent@cowec.com', password: 'agent123', role: 'agent', name: 'Agent COWEC' },
  { email: 'client@cowec.com', password: 'client123', role: 'client', name: 'Client' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const account = DEMO_ACCOUNTS.find(
        (a) => a.email === form.email && a.password === form.password
      );
      if (!account) {
        setError('Email ou mot de passe incorrect. Consultez les comptes de démonstration ci-dessous.');
        setShowDemoAccounts(true);
        return;
      }
      if (account.role === 'admin' || account.role === 'agent') {
        navigate('/');
      } else {
        navigate('/espace-client');
      }
    }, 1200);
  };

  const fillDemo = (email: string, password: string) => {
    setForm({ email, password });
    setShowDemoAccounts(false);
    setError('');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://readdy.ai/api/search-image?query=modern%20african%20city%20financial%20district%20buildings%20with%20warm%20orange%20sunset%20light%2C%20professional%20business%20environment%2C%20vibrant%20urban%20scene%20with%20people%20walking%2C%20fintech%20digital%20overlay%20elements%2C%20warm%20tones&width=800&height=900&seq=login-bg-01&orientation=portrait"
          alt="COWEC Microfinance"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/80 via-orange-500/60 to-orange-900/80" />
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <i className="ri-bank-line text-orange-500 text-2xl" />
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold">COWEC</h1>
              <p className="text-orange-100 text-sm">Microfinance</p>
            </div>
          </div>
          <div>
            <h2 className="text-white text-4xl font-bold leading-tight mb-4">
              Gérez vos crédits<br />en toute simplicité
            </h2>
            <p className="text-orange-100 text-lg mb-8">
              Accédez à votre espace personnel pour suivre vos prêts, effectuer vos remboursements et gérer votre profil.
            </p>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-white text-2xl font-bold">2 500+</p>
                <p className="text-orange-200 text-sm">Clients actifs</p>
              </div>
              <div className="w-px bg-orange-400/50" />
              <div className="text-center">
                <p className="text-white text-2xl font-bold">98%</p>
                <p className="text-orange-200 text-sm">Satisfaction</p>
              </div>
              <div className="w-px bg-orange-400/50" />
              <div className="text-center">
                <p className="text-white text-2xl font-bold">15 ans</p>
                <p className="text-orange-200 text-sm">D'expérience</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <i className="ri-bank-line text-white text-xl" />
            </div>
            <div>
              <h1 className="text-gray-900 text-xl font-bold">COWEC</h1>
              <p className="text-orange-500 text-xs">Microfinance</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h2>
            <p className="text-gray-500">Accédez à votre espace client</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                <i className="ri-error-warning-line text-red-500" />
              </div>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {showDemoAccounts && (
            <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-orange-700 text-xs font-semibold mb-3 uppercase tracking-wide">Comptes de démonstration</p>
              <div className="space-y-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => fillDemo(acc.email, acc.password)}
                    className="w-full flex items-center justify-between p-2.5 bg-white border border-orange-100 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${acc.role === 'admin' ? 'bg-red-500' : acc.role === 'agent' ? 'bg-orange-500' : 'bg-green-500'}`}>
                        {acc.role === 'admin' ? 'A' : acc.role === 'agent' ? 'G' : 'C'}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-semibold text-gray-800">{acc.name}</p>
                        <p className="text-xs text-gray-500">{acc.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${acc.role === 'admin' ? 'bg-red-100 text-red-600' : acc.role === 'agent' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                        {acc.role === 'admin' ? 'Admin' : acc.role === 'agent' ? 'Agent' : 'Client'}
                      </span>
                      <div className="w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <i className="ri-arrow-right-line text-orange-500 text-xs" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-orange-500 text-xs mt-2 text-center">Cliquez sur un compte pour le sélectionner</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse email</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                  <i className="ri-mail-line text-gray-400 text-sm" />
                </div>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="votre@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                  <i className="ri-lock-line text-gray-400 text-sm" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center cursor-pointer"
                >
                  <i className={`${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-gray-400 text-sm`} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-orange-500" />
                <span className="text-sm text-gray-600">Se souvenir de moi</span>
              </label>
              <Link to="/client/mot-de-passe-oublie" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-500 transition-all disabled:opacity-70 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
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

          <div className="mt-6">
            <div className="relative flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">OU</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-smartphone-line text-orange-500 text-sm" />
                </div>
                <span className="text-sm text-gray-600 font-medium">MTN Money</span>
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-smartphone-line text-orange-400 text-sm" />
                </div>
                <span className="text-sm text-gray-600 font-medium">Moov Money</span>
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            Pas encore de compte ?{' '}
            <Link to="/client/inscription" className="text-orange-500 hover:text-orange-600 font-semibold">
              Créer un compte
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-gray-400">
            Vous êtes un agent ou administrateur ?{' '}
            <Link to="/" className="text-gray-500 hover:text-gray-700 underline">
              Accès administration
            </Link>
          </p>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
              className="text-xs text-orange-400 hover:text-orange-600 underline cursor-pointer transition-colors"
            >
              {showDemoAccounts ? 'Masquer les comptes démo' : 'Voir les comptes de démonstration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
