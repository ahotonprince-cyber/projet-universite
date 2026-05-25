const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate, schemas } = require('../middlewares/validation');
const { authMiddleware } = require('../middlewares/auth');

router.post('/register', validate(schemas.register), authController.register);
router.post('/login', validate(schemas.login), authController.login);
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.get('/debloquer', authController.debloquerCompte);
router.post('/demander-deblocage', authController.demanderDeblocage);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.getMe);
router.post('/change-password', authMiddleware, validate(schemas.changePassword), authController.changePassword);

module.exports = router;