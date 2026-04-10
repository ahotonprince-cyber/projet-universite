import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import AppLayout from "../components/feature/AppLayout";
import Home from "../pages/home/page";
import ClientsPage from "../pages/clients/page";
import CreditsPage from "../pages/credits/page";
import RemboursementsPage from "../pages/remboursements/page";
import TableauDeBordPage from "../pages/tableau-de-bord/page";
import NotificationsPage from "../pages/notifications/page";
import ClientLayout from "../components/feature/ClientLayout";
import LoginPage from "../pages/client-auth/LoginPage";
import InscriptionPage from "../pages/client-auth/InscriptionPage";
import MotDePasseOubliePage from "../pages/client-auth/MotDePasseOubliePage";
import ClientDashboard from "../pages/espace-client/dashboard/page";
import MesCreditsPage from "../pages/espace-client/mes-credits/page";
import DemandeCreditPage from "../pages/espace-client/demande-credit/page";
import RemboursementsClientPage from "../pages/espace-client/remboursements/page";
import NotificationsClientPage from "../pages/espace-client/notifications/page";
import ProfilClientPage from "../pages/espace-client/profil/page";
import { Navigate } from "react-router-dom";

const routes: RouteObject[] = [
  { path: "/", element: <Navigate to="/client/connexion" replace /> },
{
  path: "/admin",
  element: <AppLayout />,
  children: [
    { index: true, element: <Home /> },
    { path: "clients", element: <ClientsPage /> },
    { path: "credits", element: <CreditsPage /> },
    { path: "remboursements", element: <RemboursementsPage /> },
    { path: "tableau-de-bord", element: <TableauDeBordPage /> },
    { path: "notifications", element: <NotificationsPage /> },
  ],
},
  { path: "/client/connexion", element: <LoginPage /> },
  { path: "/client/inscription", element: <InscriptionPage /> },
  { path: "/client/mot-de-passe-oublie", element: <MotDePasseOubliePage /> },
  {
    path: "/espace-client",
    element: <ClientLayout />,
    children: [
      { index: true, element: <ClientDashboard /> },
      { path: "mes-credits", element: <MesCreditsPage /> },
      { path: "demande-credit", element: <DemandeCreditPage /> },
      { path: "remboursements", element: <RemboursementsClientPage /> },
      { path: "notifications", element: <NotificationsClientPage /> },
      { path: "profil", element: <ProfilClientPage /> },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
