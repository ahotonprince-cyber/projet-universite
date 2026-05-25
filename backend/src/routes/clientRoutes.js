const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middlewares/auth');

router.use(authMiddleware, requireRole('client'));

// Profil
const profileController = require('../controllers/client/profileController');
const { uploadAvatar } = require('../middlewares/upload');
router.get('/profile', profileController.getProfile);
router.put('/profile', profileController.updateProfile);
router.post('/change-password', profileController.changePassword);
router.post('/avatar', uploadAvatar, profileController.uploadAvatar);

// Préférences
const preferenceController = require('../controllers/client/preferenceController');
router.get('/preferences', preferenceController.getPreferences);
router.put('/preferences', preferenceController.updatePreferences);

// Comptes et opérations
const compteController = require('../controllers/client/compteController');
const operationController = require('../controllers/client/operationController');
router.get('/comptes', compteController.getComptes);
router.get('/solde', compteController.getSolde);
router.get('/operations', operationController.getOperations);

// Produits crédit (catalogue pour le client)
const { query: dbQuery } = require('../config/database');
router.get('/produits-credit', async (req, res) => {
    try {
        const produits = await dbQuery('SELECT * FROM produit_credit WHERE actif = 1 ORDER BY montant_min ASC');
        res.json({ produits: produits || [] });
    } catch (e) { res.status(500).json({ error: 'Erreur chargement produits' }); }
});

// Crédits
const creditController = require('../controllers/client/creditController');
router.get('/credits', creditController.getMesCredits);
router.post('/demande-credit', creditController.demanderCredit);

// Remboursements
const remboursementController = require('../controllers/client/remboursementController');
router.get('/remboursements', remboursementController.getMesRemboursements);
router.post('/remboursements/payer', remboursementController.payerEcheance);
router.get('/echeances', remboursementController.getEcheances);
router.post('/paiement', remboursementController.effectuerPaiement);

// Mobile Money
const mobileMoneyController = require('../controllers/client/mobileMoneyController');
router.post('/depot-mobile', mobileMoneyController.depotMobile);
router.post('/retrait-mobile', mobileMoneyController.retraitMobile);

// Notifications
const notificationController = require('../controllers/client/notificationController');
router.get('/notifications', notificationController.getNotifications);
router.put('/notifications/:id/read', notificationController.markAsRead);
router.post('/notifications/read-all', notificationController.markAllAsRead);
router.delete('/notifications/:id', notificationController.deleteNotification);

// Documents KYC
const documentController = require('../controllers/client/documentController');
const { uploadKYC, uploadDocument } = require('../middlewares/upload');
const kycController = require('../controllers/admin/kycController');

router.get('/documents', documentController.getDocuments);
router.delete('/documents/:id', documentController.deleteDocument);
router.post('/documents/upload-demande', (req, res, next) => {
    uploadDocument(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'Fichier trop volumineux. Taille maximale : 5 Mo.' });
            }
            return res.status(400).json({ error: err.message || "Erreur lors de l'upload" });
        }
        next();
    });
}, kycController.uploadDocumentUnique);
router.post('/documents/upload', (req, res, next) => {
    uploadKYC(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'Fichier trop volumineux. Taille maximale : 5 Mo par fichier.' });
            }
            return res.status(400).json({ error: err.message || "Erreur lors de l'upload" });
        }
        next();
    });
}, kycController.uploadDocuments);
router.get('/documents/mes-documents', kycController.getMesDocuments);

// Tontine
// Tontine
const tontineController = require('../controllers/client/tontineController');
router.get('/tontine/mes-groupes',      tontineController.getMesGroupes);
router.get('/tontine/groupes',          tontineController.getTousGroupes);    // ← ajouter
router.get('/tontine/cycles',           tontineController.getCycles);         // ← ajouter
router.get('/tontine/mes-cotisations',  tontineController.getMesCotisations); // ← ajouter
router.post('/tontine/:id/adhesion',    tontineController.adherer);
router.post('/tontine/:groupeId/payer', tontineController.payerCotisation);
// Statistiques
const statistiqueController = require('../controllers/client/statistiqueController');
router.get('/statistiques', statistiqueController.getStats);
router.get('/revenus-operateur', statistiqueController.getRevenusByOperateur);

// Support
const clientSupportController = require('../controllers/client/supportController');
router.post('/support',      clientSupportController.create);
router.get('/support',       clientSupportController.getMesTickets);

module.exports = router;