import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="ri-lock-password-line text-orange-500 text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Mot de passe oublié</h1>
          <p className="text-gray-500 text-sm">
            Entrez votre adresse email et nous vous enverrons un lien de réinitialisation.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse email</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                    <i className="ri-mail-line text-gray-400 text-sm" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-500 transition-all disabled:opacity-60 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><i className="ri-loader-4-line animate-spin" /> Envoi en cours...</>
                ) : (
                  <><i className="ri-send-plane-line" /> Envoyer le lien</>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-mail-check-line text-green-500 text-2xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Email envoyé !</h3>
              <p className="text-gray-500 text-sm mb-6">
                Un lien de réinitialisation a été envoyé à <strong>{email}</strong>. Vérifiez votre boîte de réception.
              </p>
              <div className="p-3 bg-orange-50 rounded-lg text-sm text-orange-700 mb-4">
                <i className="ri-information-line mr-1" />
                Le lien expire dans 30 minutes.
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/client/connexion" className="text-sm text-gray-500 hover:text-orange-500 flex items-center justify-center gap-1 transition-colors">
              <i className="ri-arrow-left-line" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
