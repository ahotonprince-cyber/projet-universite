const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middlewares/auth');

// Accès de base : admin ET agent
router.use(authMiddleware, requireRole('admin', 'agent'));

// Middleware réservé aux admins uniquement (opérations sensibles)
const adminOnly = requireRole('admin');

const kycController        = require('../controllers/admin/kycController');
const transactionController = require('../controllers/admin/transactionController');
const logController        = require('../controllers/admin/logController');

// ── Utilisateurs ─────────────────────────────────────────────
const userController = require('../controllers/admin/userController');
router.get('/utilisateurs',              userController.getAll);
router.get('/utilisateurs/:id',          userController.getById);
router.post('/utilisateurs', adminOnly,  userController.create);
router.put('/utilisateurs/:id',          userController.update);
router.delete('/utilisateurs/:id', adminOnly, userController.delete);
router.patch('/utilisateurs/:id/statut', adminOnly, userController.toggleStatut);
router.patch('/utilisateurs/:id/role',   adminOnly, userController.changeRole);

// Clients (agents peuvent créer/modifier, seul admin peut supprimer)
router.get('/clients',           userController.getClients);
router.get('/clients/:id',       userController.getClientById);
router.post('/clients',          userController.createClient);
router.put('/clients/:id',       userController.updateClient);
router.delete('/clients/:id', adminOnly, userController.deleteClient);

// ── Types de compte (admin uniquement) ───────────────────────
const typeCompteController = require('../controllers/admin/typeCompteController');
router.get('/types-compte',              typeCompteController.getAll);
router.post('/types-compte',   adminOnly, typeCompteController.create);
router.put('/types-compte/:id', adminOnly, typeCompteController.update);
router.delete('/types-compte/:id', adminOnly, typeCompteController.delete);

// ── Comptes bancaires ─────────────────────────────────────────
const compteController = require('../controllers/admin/compteController');
router.get('/clients/:clientId/comptes',    compteController.getByClient);
router.post('/clients/:clientId/comptes',   compteController.create);
router.get('/comptes/:id',                  compteController.getById);
router.put('/comptes/:id/solde',            compteController.updateSolde);
router.patch('/comptes/:id/statut', adminOnly, compteController.toggleStatut);
router.get('/comptes/:id/operations',       compteController.getOperations);

// ── Crédits ───────────────────────────────────────────────────
const creditController = require('../controllers/admin/creditController');
router.get('/credits',              creditController.getAll);
router.get('/credits/recent',       creditController.getRecent);
router.get('/credits/alertes',      creditController.getAlertes);
router.put('/credits/:id/statut',   creditController.updateStatut);
router.post('/credits/:id/decaisser', creditController.decaisser);
router.post('/credits',             creditController.create);
router.put('/credits/:id',          creditController.update);

// ── Remboursements ────────────────────────────────────────────
const remboursementController = require('../controllers/admin/remboursementController');
router.get('/remboursements',          remboursementController.getAll);
router.post('/remboursements/payer',   remboursementController.enregistrerPaiement);

// ── Tontines ──────────────────────────────────────────────────
const tontineController = require('../controllers/admin/tontineController');
router.get('/tontines',                          tontineController.getAll);
router.post('/tontines',                         tontineController.create);
// Static sub-routes must come before /:id to avoid param capture
router.get('/tontines/cotisations',              tontineController.getAllCotisations);
router.post('/tontines/cotisations/enregistrer', tontineController.enregistrerCotisation);
router.get('/tontines/:id',                      tontineController.getById);
router.get('/tontines/:id/detail',               tontineController.getDetail);
router.put('/tontines/:id',                      tontineController.update);
router.delete('/tontines/:id', adminOnly,        tontineController.delete);
router.get('/tontines/:id/membres',              tontineController.getMembres);
router.post('/tontines/:id/membres',             tontineController.ajouterMembre);
router.delete('/tontines/:id/membres/:membreId', tontineController.retirerMembre);
router.post('/tontines/:id/ordres',              tontineController.assignerOrdres);
router.post('/tontines/:id/valider-cycle',       tontineController.validerCycle);

// ── Demandes de retrait ───────────────────────────────────────
const retraitController = require('../controllers/admin/retraitController');
router.get('/retraits',              retraitController.getAll);
router.put('/retraits/:id/valider',  retraitController.valider);

// ── Produits crédit (admin uniquement pour modifier) ──────────
const produitCreditController = require('../controllers/admin/produitCreditController');
router.get('/produits-credit',              produitCreditController.getAll);
router.post('/produits-credit', adminOnly,  produitCreditController.create);
router.put('/produits-credit/:id', adminOnly, produitCreditController.update);
router.delete('/produits-credit/:id', adminOnly, produitCreditController.delete);
router.patch('/produits-credit/:id/toggle', adminOnly, produitCreditController.toggleActif);

// ── Opérateurs mobile (admin uniquement pour modifier) ────────
const operateurController = require('../controllers/admin/operateurController');
router.get('/operateurs-mobile',              operateurController.getAll);
router.post('/operateurs-mobile',             operateurController.create);
router.put('/operateurs-mobile/:id',          operateurController.update);
router.delete('/operateurs-mobile/:id', adminOnly, operateurController.delete);
router.patch('/operateurs-mobile/:id/toggle', operateurController.toggleActif);

// ── Notifications ─────────────────────────────────────────────
const notificationController = require('../controllers/admin/notificationController');
router.get('/notifications',                    notificationController.getAll);
router.put('/notifications/:id/read',           notificationController.update);
router.post('/notifications/read-all',          notificationController.readAll);
router.delete('/notifications/:id',             notificationController.delete);
router.post('/notifications/broadcast', adminOnly, notificationController.broadcast);

// ── Statistiques ──────────────────────────────────────────────
const statistiqueController = require('../controllers/admin/statistiqueController');
router.get('/statistiques/kpi',                     statistiqueController.getKPI);
router.get('/statistiques/evolution',               statistiqueController.getEvolution);
router.get('/statistiques/top-clients',             statistiqueController.getTopClients);
router.get('/statistiques/remboursements-mensuels', statistiqueController.getRemboursementsMensuels);

// ── KYC (statiques avant dynamiques) ─────────────────────────
router.get('/kyc',                          kycController.getDossiers);
router.get('/kyc/pending-count',            kycController.getPendingCount);
router.get('/kyc/documents',               kycController.getDocuments);
router.put('/kyc/validate/:id',            kycController.validerDocument);
router.patch('/kyc/document/:id',          kycController.validerDocument);
router.get('/kyc/:userId',                 kycController.getDossierByUser);
router.patch('/kyc/:userId/statut', adminOnly, kycController.traiterDossier);

// ── Transactions ──────────────────────────────────────────────
router.get('/transactions', transactionController.getAll);

// ── Logs (admin uniquement) ───────────────────────────────────
router.get('/logs', adminOnly, logController.getAll);

// ── Rapports (admin uniquement) ───────────────────────────────
const rapportController = require('../controllers/admin/rapportController');
router.get('/rapports/credits',      adminOnly, rapportController.getCredits);
router.get('/rapports/transactions', adminOnly, rapportController.getTransactions);
router.get('/rapports/clients',      adminOnly, rapportController.getClients);
router.get('/rapports/retards',      adminOnly, rapportController.getRetards);

// ── Support tickets ───────────────────────────────────────────
const supportController = require('../controllers/admin/supportController');
router.get('/support',                  supportController.getAll);
router.get('/support/:id',              supportController.getById);
router.post('/support/:id/repondre',    supportController.repondre);
router.patch('/support/:id/statut',     supportController.updateStatut);

// ── Dépôts ───────────────────────────────────────────────────
const depotController = require('../controllers/admin/depotController');
router.get('/depots',       depotController.getAll);
router.get('/depots/stats', depotController.getStats);

// ── Score crédit client ───────────────────────────────────────
router.patch('/clients/:id/score',         userController.updateScore);
router.get('/clients/:id/stats',           userController.getClientStats);
router.post('/clients/:id/demande-document', userController.demanderDocument);

module.exports = router;