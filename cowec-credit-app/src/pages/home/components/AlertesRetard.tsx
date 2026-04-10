import { remboursements } from '@/mocks/remboursements';

export default function AlertesRetard() {
  const retards = remboursements.filter((r) => r.statut === 'en_retard');

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center">
            <i className="ri-alarm-warning-line text-red-500" />
          </div>
          <h3 className="font-semibold text-gray-800">Alertes de retard</h3>
          <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {retards.length}
          </span>
        </div>
        <a href="/remboursements" className="text-xs text-orange-500 hover:text-orange-600 font-medium cursor-pointer">
          Gérer
        </a>
      </div>
      <div className="divide-y divide-gray-50">
        {retards.length === 0 ? (
          <div className="px-5 py-8 text-center text-gray-400 text-sm">
            <div className="w-8 h-8 flex items-center justify-center mx-auto mb-2">
              <i className="ri-checkbox-circle-line text-green-400 text-2xl" />
            </div>
            Aucun retard de paiement
          </div>
        ) : (
          retards.map((r) => (
            <div key={r.id} className="flex items-center gap-3 px-5 py-3 hover:bg-red-50/30 transition-colors">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 flex-shrink-0">
                <i className="ri-time-line text-red-500 text-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {r.clientPrenom} {r.clientNom}
                </p>
                <p className="text-xs text-gray-400">Crédit #{r.creditId}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-red-600">
                  {r.montantEcheance.toLocaleString('fr-FR')} F
                </p>
                <p className="text-xs text-red-400">En retard</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
