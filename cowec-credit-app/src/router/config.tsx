import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import NotFound from "../pages/NotFound";
import AppLayout from "../components/feature/AppLayout";
import Home from "../pages/home/page";
import ClientsPage from "../pages/clients/page";
import CreditsPage from "../pages/credits/page";
import RemboursementsPage from "../pages/remboursements/page";
import TableauDeBordPage from "../pages/tableau-de-bord/page";
import NotificationsPage from "../pages/admin/notifications/page";
import ClientLayout from "../components/feature/ClientLayout";
import LoginPage from "../pages/client-auth/LoginPage";
import InscriptionPage from "../pages/client-auth/InscriptionPage";
import MotDePasseOubliePage from "../pages/client-auth/MotDePasseOubliePage";
import ResetPasswordPage from "../pages/client-auth/ResetPasswordPage";
import VerifyEmailPage from "../pages/client-auth/VerifyEmailPage";
import DeblocagePage from "../pages/client-auth/DeblocagePage";
import ClientDashboard from "../pages/espace-client/dashboard/page";
import MesCreditsPage from "../pages/espace-client/mes-credits/page";
import DemandeCreditPage from "../pages/espace-client/demande-credit/page";
import RemboursementsClientPage from "../pages/espace-client/remboursements/page";
import NotificationsClientPage from "../pages/espace-client/notifications/page";
import ProfilClientPage from "../pages/espace-client/profil/page";
import ComptesAdminPage from "../pages/admin/comptes/page";
import RetraitsAdminPage from "../pages/admin/retraits/page";
import HistoriquePage from "../pages/espace-client/historique/page";
import TontinesAdminPage from "../pages/admin/tontines/page";
import AdminTontineDetailPage from "../pages/admin/tontines/detail/page";
import ProduitsCreditPage from "../pages/admin/produits-credit/page";
import OperateursMobilePage from "../pages/admin/operateurs-mobile/page";
import HabilitationsPage from "../pages/admin/habilitations/page";
import SoldePage from "../pages/espace-client/solde/page";
import DepotMobilePage from "../pages/espace-client/depot-mobile/page";
import RetraitMobilePage from "../pages/espace-client/retrait-mobile/page";
import TontinePage from "../pages/espace-client/tontine/page";
import SecuritePage from '../pages/espace-client/securite/page';
import StatistiquesClientPage from '../pages/espace-client/statistiques/page';
import SupportClientPage from '../pages/espace-client/support/page';
import KycPage from "../pages/admin/kyc/page";
import TransactionsPage from "../pages/admin/transactions/page";
import StatistiquesAdminPage from "../pages/admin/statistiques/page";
import LogsPage from "../pages/admin/logs/page";
import UtilisateursPage from "../pages/admin/utilisateurs/page";
import RisquesPage from "../pages/admin/risques/page";
import ProfilAdminPage from "../pages/admin/profil/page";
import ProtectedClientRoute from "../components/feature/ProtectedClientRoute";
import DocumentsUploadPage from "../pages/espace-client/documents/page";
import AdminSupportPage from "../pages/admin/support/page";
import AdminDepotsPage from "../pages/admin/depots/page";
import AdminCotisationsTontinePage from "../pages/admin/cotisations-tontine/page";
import AdminFicheClientPage from "../pages/admin/fiche-client/page";
import CompteOperationsPage from "../pages/admin/comptes/detail/operations";

const routes: RouteObject[] = [
  { path: "/", element: <Navigate to="/client/connexion" replace /> },
  { path: "/client/connexion", element: <LoginPage /> },
  { path: "/client/inscription", element: <InscriptionPage /> },
  { path: "/client/mot-de-passe-oublie", element: <MotDePasseOubliePage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  { path: "/verify-email", element: <VerifyEmailPage /> },
  { path: "/debloquer-compte", element: <DeblocagePage /> },

  // ============ ADMIN ============
  {
    path: "/admin",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/admin/tableau-de-bord" replace /> },
      { path: "clients", element: <HabilitationsPage initialRoleFilter="client" /> },
      { path: "credits", element: <CreditsPage /> },
      { path: "remboursements", element: <RemboursementsPage /> },
      { path: "tableau-de-bord", element: <TableauDeBordPage /> },
      { path: "notifications", element: <NotificationsPage /> },
      { path: "tontines", element: <TontinesAdminPage /> },
      { path: "tontines/:id", element: <AdminTontineDetailPage /> },
      { path: "produits-credit", element: <ProduitsCreditPage /> },
      { path: "operateurs-mobile", element: <OperateursMobilePage /> },
      { path: "habilitations", element: <HabilitationsPage initialRoleFilter="all" /> },
      { path: "comptes", element: <ComptesAdminPage /> },
      { path: "comptes/:id/operations", element: <CompteOperationsPage /> },
      { path: "retraits", element: <RetraitsAdminPage /> },
      { path: "kyc", element: <KycPage /> },
      { path: "transactions", element: <TransactionsPage /> },
      { path: "statistiques", element: <StatistiquesAdminPage /> },
      { path: "logs", element: <LogsPage /> },
      { path: "utilisateurs", element: <UtilisateursPage /> },
      { path: "risques", element: <RisquesPage /> },
      { path: "profil", element: <ProfilAdminPage /> },
      { path: "support", element: <AdminSupportPage /> },
      { path: "depots", element: <AdminDepotsPage /> },
      { path: "cotisations-tontine", element: <AdminCotisationsTontinePage /> },
      { path: "clients/:id", element: <AdminFicheClientPage /> },
    ],
  },

  // ============ ESPACE CLIENT (PROTÉGÉ) ============
  {
    path: "/espace-client",
    element: <ProtectedClientRoute />,
    children: [
      {
        element: <ClientLayout />,
        children: [
          { index: true, element: <ClientDashboard /> },
          { path: "documents", element: <DocumentsUploadPage /> },
          { path: "mes-credits", element: <MesCreditsPage /> },
          { path: "demande-credit", element: <DemandeCreditPage /> },
          { path: "remboursements", element: <RemboursementsClientPage /> },
          { path: "notifications", element: <NotificationsClientPage /> },
          { path: "profil", element: <ProfilClientPage /> },
          { path: "solde", element: <SoldePage /> },
          { path: "depot-mobile", element: <DepotMobilePage /> },
          { path: "retrait-mobile", element: <RetraitMobilePage /> },
          { path: "tontine", element: <TontinePage /> },
          { path: "historique", element: <HistoriquePage /> },
          { path: "securite", element: <SecuritePage /> },
          { path: "statistiques", element: <StatistiquesClientPage /> },
          { path: "support", element: <SupportClientPage /> },
          { path: "parametres", element: <Navigate to="/espace-client/profil" replace /> },
        ],
      },
    ],
  },

  { path: "*", element: <NotFound /> },
];

export default routes;