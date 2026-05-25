import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

type Status = 'loading' | 'success' | 'error' | 'resend';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('resend');
      return;
    }

    fetch(`/api/auth/verify-email?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.error || 'Lien invalide ou expiré.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Impossible de contacter le serveur.');
      });
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendLoading(true);
    setResendMessage('');
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setResendMessage(data.message || 'Email envoyé.');
    } catch {
      setResendMessage('Erreur lors de l\'envoi. Réessayez.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900/50 via-black/30 to-orange-800/40" />

      <div className="relative z-10 w-full max-w-md bg-black/40 backdrop-blur-lg border border-white/15 rounded-2xl p-8 shadow-2xl text-center">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-white/30 backdrop-blur-sm border border-white/40 rounded-xl flex items-center justify-center">
            <i className="ri-bank-line text-white text-xl" />
          </div>
          <div className="text-left">
            <h1 className="text-white text-xl font-bold">COWEC</h1>
            <p className="text-orange-200 text-xs">Microfinance</p>
          </div>
        </div>

        {/* Loading */}
        {status === 'loading' && (
          <>
            <i className="ri-loader-4-line animate-spin text-4xl text-orange-300 mb-4" />
            <p className="text-white/80">Vérification en cours...</p>
          </>
        )}

        {/* Success */}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-500/20 border border-green-400/40 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-checkbox-circle-line text-green-300 text-3xl" />
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">Email vérifié !</h2>
            <p className="text-white/70 text-sm mb-6">{message}</p>
            <Link
              to="/client/connexion"
              className="inline-flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-500 transition-all shadow-lg shadow-orange-500/40"
            >
              <i className="ri-login-box-line" />
              Se connecter
            </Link>
          </>
        )}

        {/* Error — lien expiré */}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500/20 border border-red-400/40 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-error-warning-line text-red-300 text-3xl" />
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">Lien invalide</h2>
            <p className="text-white/70 text-sm mb-6">{message}</p>

            <p className="text-white/60 text-sm mb-3">Entrez votre email pour recevoir un nouveau lien :</p>
            {resendMessage ? (
              <p className="text-green-300 text-sm font-medium mb-4">{resendMessage}</p>
            ) : (
              <form onSubmit={handleResend} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/25 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <button
                  type="submit"
                  disabled={resendLoading}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-500 transition-all disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {resendLoading ? (
                    <><i className="ri-loader-4-line animate-spin" /> Envoi...</>
                  ) : (
                    <><i className="ri-mail-send-line" /> Renvoyer le lien</>
                  )}
                </button>
              </form>
            )}
          </>
        )}

        {/* Resend — pas de token dans l'URL */}
        {status === 'resend' && (
          <>
            <div className="w-16 h-16 bg-yellow-500/20 border border-yellow-400/40 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-mail-lock-line text-yellow-300 text-3xl" />
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">Vérifiez votre email</h2>
            <p className="text-white/70 text-sm mb-6">
              Entrez votre adresse email pour recevoir un lien de vérification.
            </p>
            {resendMessage ? (
              <p className="text-green-300 text-sm font-medium mb-4">{resendMessage}</p>
            ) : (
              <form onSubmit={handleResend} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/25 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <button
                  type="submit"
                  disabled={resendLoading}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-500 transition-all disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {resendLoading ? (
                    <><i className="ri-loader-4-line animate-spin" /> Envoi...</>
                  ) : (
                    <><i className="ri-mail-send-line" /> Envoyer le lien</>
                  )}
                </button>
              </form>
            )}
          </>
        )}

        <Link to="/client/connexion" className="mt-6 inline-block text-sm text-white/50 hover:text-white/80 transition-colors">
          ← Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
