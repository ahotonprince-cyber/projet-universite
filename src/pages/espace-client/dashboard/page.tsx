import { useNavigate } from 'react-router-dom';
import { clientCredits } from '@/mocks/clientCredits';
import { clientNotifications } from '@/mocks/clientNotifications';
import { clientProfile } from '@/mocks/clientProfile';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const unread = clientNotifications.filter((n) => !n.lu).length;
  const creditEnCours = clientCredits.find((c) => c.statut === 'en_cours');
  const creditEnAttente = clientCredits.find((c) => c.statut === 'en_attente');

  const scoreColor = clientProfile.scoreCredit >= 80 ? 'text-green-600' : clientProfile.scoreCredit >= 60 ? 'text-orange-500' : 'text-red-500';
  const scoreBg = clientProfile.scoreCredit >= 80 ? 'bg-green-50' : clientProfile.scoreCredit >= 60 ? 'bg-orange-50' : 'bg-red-50';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden">
        <img
          src="https://readdy.ai/api/search-image?query=abstract%20orange%20gradient%20financial%20technology%20background%20with%20geometric%20shapes%2C%20modern%20fintech%20banner%2C%20warm%20orange%20tones%2C%20professional%20business%20design&width=1200&height=200&seq=dash-banner-01&orientation=landscape"
          alt="Banner"
          className="w-full h-40 object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 to-orange-400/70" />
        <div className="absolute inset-0 flex items-center px-8 justify-between">
          <div>
            <p className="text-orange-100 text-sm mb-1">Bonjour,</p>
            <h2 className="text-white text-2xl font-bold">{clientProfile.prenom} {clientProfile.nom} 👋</h2>
            <p className="text-orange-100 text-sm mt-1">Bienvenue dans votre espace personnel COWEC</p>
          </div>
          <div className="hidden md:flex flex-col items-end gap-2">
            <div className={`flex items-center gap-2 px-4 py-2 ${scoreBg} rounded-xl`}>
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-star-fill text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Score de crédit</p>
                <p className={`text-lg font-bold ${scoreColor}`}>{clientProfile.scoreCredit}/100</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">Crédit en cours</p>
            <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
              <i className="ri-bank-card-line text-orange-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{creditEnCours ? (creditEnCours.montant / 1000).toFixed(0) + 'K' : '—'} <span className="text-sm font-normal text-gray-400">FCFA</span></p>
          <p className="text-xs text-gray-400 mt-1">{creditEnCours ? creditEnCours.objet : 'Aucun crédit actif'}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">Reste à payer</p>
            <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
              <i className="ri-money-dollar-circle-line text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{creditEnCours ? (creditEnCours.resteAPayer / 1000).toFixed(0) + 'K' : '0'} <span className="text-sm font-normal text-gray-400">FCFA</span></p>
          <p className="text-xs text-gray-400 mt-1">{creditEnCours ? `Échéance : ${creditEnCours.prochainePecheance}` : 'Aucune échéance'}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">Prochaine mensualité</p>
            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="ri-calendar-check-line text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{creditEnCours ? (creditEnCours.mensualite / 1000).toFixed(1) + 'K' : '—'} <span className="text-sm font-normal text-gray-400">FCFA</span></p>
          <p className="text-xs text-orange-500 mt-1 font-medium">{creditEnCours ? `Le ${creditEnCours.prochainePecheance}` : '—'}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">Notifications</p>
            <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
              <i className="ri-notification-3-line text-orange-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{unread}</p>
          <p className="text-xs text-gray-400 mt-1">message{unread > 1 ? 's' : ''} non lu{unread > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Credit Progress */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-800">Mes crédits actifs</h3>
            <button onClick={() => navigate('/espace-client/mes-credits')} className="text-sm text-orange-500 hover:text-orange-600 font-medium cursor-pointer whitespace-nowrap">
              Voir tout <i className="ri-arrow-right-line" />
            </button>
          </div>
          <div className="space-y-4">
            {clientCredits.filter((c) => c.statut === 'en_cours' || c.statut === 'en_attente').map((credit) => (
              <div key={credit.id} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{credit.objet}</p>
                    <p className="text-xs text-gray-400">{credit.id} • {credit.duree} mois</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${
                    credit.statut === 'en_cours' ? 'bg-green-100 text-green-700' :
                    credit.statut === 'en_attente' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {credit.statut === 'en_cours' ? 'En cours' : credit.statut === 'en_attente' ? 'En attente' : credit.statut}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>Remboursé : {(credit.montantRembourse / 1000).toFixed(0)}K FCFA</span>
                  <span className="font-semibold text-gray-700">{credit.progression}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full transition-all"
                    style={{ width: `${credit.progression}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-gray-400">Total : {(credit.montant / 1000).toFixed(0)}K FCFA</span>
                  <span className="text-orange-600 font-medium">Reste : {(credit.resteAPayer / 1000).toFixed(0)}K FCFA</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions + Notifications */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Actions rapides</h3>
            <div className="space-y-2">
              <button onClick={() => navigate('/espace-client/demande-credit')} className="w-full flex items-center gap-3 p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors cursor-pointer text-left">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-add-line text-white text-sm" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Demander un crédit</p>
                  <p className="text-xs text-gray-400">Simulation instantanée</p>
                </div>
              </button>
              <button onClick={() => navigate('/espace-client/remboursements')} className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors cursor-pointer text-left">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-money-dollar-circle-line text-white text-sm" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Effectuer un paiement</p>
                  <p className="text-xs text-gray-400">Mobile Money disponible</p>
                </div>
              </button>
              <button onClick={() => navigate('/espace-client/profil')} className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer text-left">
                <div className="w-8 h-8 bg-gray-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-user-settings-line text-white text-sm" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Mon profil</p>
                  <p className="text-xs text-gray-400">Gérer mes informations</p>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Dernières alertes</h3>
              <button onClick={() => navigate('/espace-client/notifications')} className="text-xs text-orange-500 cursor-pointer whitespace-nowrap">Tout voir</button>
            </div>
            <div className="space-y-3">
              {clientNotifications.filter((n) => !n.lu).slice(0, 3).map((notif) => (
                <div key={notif.id} className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    notif.type === 'rappel' ? 'bg-orange-100' : notif.type === 'paiement' ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <i className={`text-xs ${
                      notif.type === 'rappel' ? 'ri-alarm-line text-orange-500' :
                      notif.type === 'paiement' ? 'ri-check-line text-green-500' : 'ri-information-line text-blue-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{notif.titre}</p>
                    <p className="text-xs text-gray-400">{notif.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
