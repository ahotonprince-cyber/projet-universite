const fs = require("fs");
const path = require("path");

// 📁 Dossiers à créer
const folders = [
  "src/config",
  "src/middlewares",
  "src/models",
  "src/controllers/client",
  "src/controllers/admin",
  "src/services",
  "src/routes",
  "src/validators",
  "src/utils",
  "uploads/documents",
  "uploads/avatars",
  "logs"
];

// 📄 Fichiers à créer
const files = [
  "src/config/database.js",
  "src/config/jwt.js",
  "src/config/redis.js",
  "src/config/constants.js",

  "src/middlewares/auth.js",
  "src/middlewares/role.js",
  "src/middlewares/validation.js",
  "src/middlewares/rateLimit.js",
  "src/middlewares/upload.js",
  "src/middlewares/logger.js",
  "src/middlewares/errorHandler.js",

  "src/models/UserModel.js",
  "src/models/CompteModel.js",
  "src/models/OperationModel.js",
  "src/models/CreditModel.js",
  "src/models/EcheanceModel.js",
  "src/models/NotificationModel.js",
  "src/models/TontineModel.js",
  "src/models/RetraitModel.js",
  "src/models/DocumentModel.js",
  "src/models/ProduitCreditModel.js",
  "src/models/OperateurMobileModel.js",
  "src/models/PreferenceModel.js",

  "src/controllers/authController.js",

  "src/controllers/client/profileController.js",
  "src/controllers/client/compteController.js",
  "src/controllers/client/operationController.js",
  "src/controllers/client/creditController.js",
  "src/controllers/client/remboursementController.js",
  "src/controllers/client/tontineController.js",
  "src/controllers/client/mobileMoneyController.js",
  "src/controllers/client/notificationController.js",
  "src/controllers/client/documentController.js",

  "src/controllers/admin/userController.js",
  "src/controllers/admin/creditController.js",
  "src/controllers/admin/remboursementController.js",
  "src/controllers/admin/tontineController.js",
  "src/controllers/admin/retraitController.js",
  "src/controllers/admin/produitCreditController.js",
  "src/controllers/admin/operateurController.js",
  "src/controllers/admin/notificationController.js",
  "src/controllers/admin/typeCompteController.js",
  "src/controllers/admin/statistiqueController.js",

  "src/services/emailService.js",
  "src/services/smsService.js",
  "src/services/mobileMoneyService.js",
  "src/services/creditScoreService.js",
  "src/services/notificationService.js",
  "src/services/echeanceService.js",
  "src/services/auditService.js",

  "src/routes/index.js",
  "src/routes/authRoutes.js",
  "src/routes/clientRoutes.js",
  "src/routes/adminRoutes.js",

  "src/validators/authValidator.js",
  "src/validators/userValidator.js",
  "src/validators/creditValidator.js",
  "src/validators/retraitValidator.js",
  "src/validators/tontineValidator.js",

  "src/utils/helpers.js",
  "src/utils/constants.js",
  "src/utils/generateNumber.js",

  "src/app.js",
  "server.js",
  ".env",
  ".env.example",
  ".gitignore",
  "package.json"
];

// 📁 Création dossiers
function createFolder(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log("📁 Créé :", folderPath);
  } else {
    console.log("⚠ Déjà existant :", folderPath);
  }
}

// 📄 Création fichiers
function createFile(filePath) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "");
    console.log("📄 Fichier créé :", filePath);
  } else {
    console.log("⚠ Fichier existant :", filePath);
  }
}

console.log("\n🚀 Création complète du backend...\n");

// créer dossiers
folders.forEach((folder) => {
  createFolder(path.join(__dirname, folder));
});

// créer fichiers
files.forEach((file) => {
  createFile(path.join(__dirname, file));
});

console.log("\n✅ Structure complète créée sans écraser les fichiers existants !");