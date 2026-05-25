const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middlewares/auth');

router.use(authMiddleware, requireRole('agent', 'admin'));

// Clients
const userController = require('../controllers/admin/userController');
router.get('/clients',          userController.getClients);
router.get('/clients/:id',      userController.getClientById);
router.post('/clients',         userController.createClient);
router.put('/clients/:id',      userController.updateClient);

// Remboursements
const remboursementController = require('../controllers/admin/remboursementController');
router.get('/remboursements',           remboursementController.getAll);
router.post('/remboursements/payer',    remboursementController.enregistrerPaiement);

// Tontines
const tontineController = require('../controllers/admin/tontineController');
router.get('/tontines',                         tontineController.getAll);
router.get('/tontines/:id',                     tontineController.getById);
router.post('/tontines',                        tontineController.create);
router.put('/tontines/:id',                     tontineController.update);
router.get('/tontines/:id/membres',             tontineController.getMembres);
router.post('/tontines/:id/membres',            tontineController.ajouterMembre);
router.delete('/tontines/:id/membres/:membreId', tontineController.retirerMembre);

// Historique des transactions
const transactionController = require('../controllers/admin/transactionController');
router.get('/transactions', transactionController.getAll);

// Comptes bancaires
const compteController = require('../controllers/admin/compteController');
router.get('/clients/:clientId/comptes',    compteController.getByClient);
router.get('/comptes/:id/operations',       compteController.getOperations);

// Crédits (consultation + validation)
const creditController = require('../controllers/admin/creditController');
router.get('/credits',              creditController.getAll);
router.put('/credits/:id/statut',   creditController.updateStatut);

// Personnel (lecture seule pour l'agent)
router.get('/personnel', userController.getAll);

module.exports = router;
