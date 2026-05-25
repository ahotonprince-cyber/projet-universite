import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ROUTES_LIBRES = [
  '/espace-client/documents',
  '/espace-client/profil',
  '/espace-client/notifications',
  '/espace-client/support',
];

export default function ProtectedClientRoute() {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [statut, setStatut] = useState<string | null>(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      setChecking(false);
      return;
    }

    // ✅ Toujours vérifier depuis l'API pour avoir le statut frais
    const fetchStatut = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setStatut(null);
          return;
        }

        const data = await res.json();
        const user = data.user;

        // ✅ Mettre à jour localStorage avec statut frais depuis BDD
        localStorage.setItem('user', JSON.stringify(user));
        setStatut(user?.statut || 'en_attente');

      } catch (err) {
        // Si API indisponible → fallback localStorage
        const userLocal = JSON.parse(localStorage.getItem('user') || '{}');
        setStatut(userLocal?.statut || 'en_attente');
      } finally {
        setChecking(false);
      }
    };

    fetchStatut();
  }, [token]);

  // Pas de token → login
  if (!token) return <Navigate to="/client/connexion" replace />;

  // Chargement → spinner
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-orange-500 text-4xl" />
          <p className="text-gray-500 mt-3 text-sm">Vérification du compte...</p>
        </div>
      </div>
    );
  }

  // Pas de statut → login
  if (!statut) return <Navigate to="/client/connexion" replace />;

  // Compte rejeté
  if (statut === 'rejete') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl p-10 max-w-md text-center shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-close-circle-line text-red-500 text-3xl" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Compte rejeté</h2>
          <p className="text-gray-500 text-sm mb-6">
            Votre dossier n'a pas été validé. Contactez notre support pour plus d'informations.
          </p>
          <a href="/espace-client/support"
            className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition">
            Contacter le support
          </a>
        </div>
      </div>
    );
  }

  // Compte en_attente → routes limitées
  if (statut === 'en_attente') {
    const routeAutorisee = ROUTES_LIBRES.some(r => location.pathname.startsWith(r));
    if (!routeAutorisee) {
      return <Navigate to="/espace-client/documents" replace />;
    }
  }

  return <Outlet />;
}