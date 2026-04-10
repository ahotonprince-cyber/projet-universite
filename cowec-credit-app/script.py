import os

# Racine du projet
base_path = "."

# Liste des dossiers à créer
folders = [
    "src/router",
    "src/components/feature",
    "src/mocks",
    "src/pages/client-auth",
    "src/pages/home/components",
    "src/pages/clients/components",
    "src/pages/credits/components",
    "src/pages/remboursements/components",
    "src/pages/tableau-de-bord",
    "src/pages/notifications",
    "src/pages/espace-client/dashboard",
    "src/pages/espace-client/mes-credits",
    "src/pages/espace-client/demande-credit",
    "src/pages/espace-client/remboursements",
    "src/pages/espace-client/notifications",
    "src/pages/espace-client/profil",
    "src/i18n/local"
]

# Liste des fichiers à créer avec contenu par défaut
files = {
    "src/main.tsx": "",
    "src/App.tsx": "",
    "src/index.css": "",

    "src/router/config.tsx": "",
    "src/router/index.ts": "",

    "src/components/feature/AppLayout.tsx": "",
    "src/components/feature/Sidebar.tsx": "",
    "src/components/feature/TopBar.tsx": "",
    "src/components/feature/ClientLayout.tsx": "",
    "src/components/feature/ClientSidebar.tsx": "",
    "src/components/feature/ClientTopBar.tsx": "",

    "src/mocks/clients.ts": "",
    "src/mocks/credits.ts": "",
    "src/mocks/remboursements.ts": "",
    "src/mocks/notifications.ts": "",
    "src/mocks/clientProfile.ts": "",
    "src/mocks/clientCredits.ts": "",
    "src/mocks/clientNotifications.ts": "",

    "src/pages/client-auth/LoginPage.tsx": "export default function LoginPage(){ return <div>Login</div>; }",
    "src/pages/client-auth/InscriptionPage.tsx": "export default function InscriptionPage(){ return <div>Inscription</div>; }",
    "src/pages/client-auth/MotDePasseOubliePage.tsx": "export default function MotDePasseOubliePage(){ return <div>Mot de passe oublié</div>; }",

    "src/pages/home/page.tsx": "export default function Home(){ return <div>Dashboard Admin</div>; }",
    "src/pages/home/components/StatCard.tsx": "",
    "src/pages/home/components/RecentCredits.tsx": "",
    "src/pages/home/components/AlertesRetard.tsx": "",

    "src/pages/clients/page.tsx": "",
    "src/pages/clients/components/ClientModal.tsx": "",

    "src/pages/credits/page.tsx": "",
    "src/pages/credits/components/CreditModal.tsx": "",

    "src/pages/remboursements/page.tsx": "",
    "src/pages/remboursements/components/PaiementModal.tsx": "",

    "src/pages/tableau-de-bord/page.tsx": "",
    "src/pages/notifications/page.tsx": "",

    "src/pages/espace-client/dashboard/page.tsx": "",
    "src/pages/espace-client/mes-credits/page.tsx": "",
    "src/pages/espace-client/demande-credit/page.tsx": "",
    "src/pages/espace-client/remboursements/page.tsx": "",
    "src/pages/espace-client/notifications/page.tsx": "",
    "src/pages/espace-client/profil/page.tsx": "",

    "src/i18n/index.ts": "",
    "src/i18n/local/index.ts": "",
}

# Création des dossiers
for folder in folders:
    path = os.path.join(base_path, folder)
    os.makedirs(path, exist_ok=True)

# Création des fichiers
for file_path, content in files.items():
    full_path = os.path.join(base_path, file_path)
    
    # Crée le dossier parent si nécessaire
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    
    # Crée le fichier
    if not os.path.exists(full_path):
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content)

print("✅ Structure du projet créée avec succès 🚀")