import { credits } from '@/mocks/credits';

const statutConfig = {
  en_attente: { label: 'En attente', cls: 'bg-yellow-50 text-yellow-700' },
  valide: { label: 'Validé', cls: 'bg-sky-50 text-sky-700' },
  rejete: { label: 'Rejeté', cls: 'bg-red-50 text-red-700' },
  en_cours: { label: 'En cours', cls: 'bg-green-50 text-green-700' },
  solde: { label: 'Soldé', cls: 'bg-gray-100 text-gray-600' },
};

export default function RecentCredits() {
  const recent = credits.slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">Crédits récents</h3>
        <a href="/credits" className="text-xs text-orange-500 hover:text-orange-600 font-medium cursor-pointer">
          Voir tout
        </a>
      </div>
      <div className="divide-y divide-gray-50">
        {recent.map((credit) => {
          const pct = credit.montant > 0 ? Math.round((credit.montantRembourse / credit.montant) * 100) : 0;
          const cfg = statutConfig[credit.statut];
          return (
            <div key={credit.id} className="flex items-center gap-4 px-5 py-3 hover:bg-orange-50/30 transition-colors">
              <div className="w-9 h-9 flex items-center justify-center rounded-full bg-orange-100 flex-shrink-0">
                <i className="ri-bank-card-line text-orange-500 text-base" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {credit.clientPrenom} {credit.clientNom}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{pct}%</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-gray-900">
                  {credit.montant.toLocaleString('fr-FR')} F
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.cls}`}>
                  {cfg.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
