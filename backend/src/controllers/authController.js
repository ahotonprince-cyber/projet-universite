const UserModel = require('../models/UserModel');
const SessionModel = require('../models/SessionModel');
const { generateToken, generateRefreshToken } = require('../config/jwt');
const { sendCompteBloque, sendVerificationEmail, sendDeblocageEmail, sendResetPassword } = require('../services/emailService');
const crypto = require('crypto');

const MAX_TENTATIVES = 3;

const authController = {

    register: async (req, res) => {
        try {
            const { email, telephone } = req.body;

            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({ error: 'Cet email est déjà utilisé' });
            }

            const existingPhone = await UserModel.findByTelephone(telephone);
            if (existingPhone) {
                return res.status(409).json({ error: 'Ce numéro est déjà utilisé' });
            }

            const userId = await UserModel.create({ ...req.body, role: 'client' });
            const user = await UserModel.findById(userId);

            if (!user) {
                return res.status(500).json({ error: 'Erreur création utilisateur' });
            }

            // Validation automatique — pas besoin d'email de vérification
            await UserModel.markEmailVerified(userId);

            res.status(201).json({
                success: true,
                message: 'Compte créé. Vérifiez votre email pour activer votre compte.',
                user: {
                    id: user.id,
                    nom: user.nom,
                    prenom: user.prenom,
                    email: user.email,
                    role: user.role,
                    statut: user.statut
                }
            });

        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ error: 'Erreur lors de l\'inscription' });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await UserModel.findByEmail(email);

            if (!user) {
                return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
            }

            // Vérification email désactivée — validation automatique à l'inscription

            // Vérifier le statut avant de tester le mot de passe
            if (user.statut === 'bloque') {
                return res.status(401).json({
                    error: 'Votre compte est bloqué. Utilisez le lien reçu par email pour le débloquer.',
                    code: 'COMPTE_BLOQUE'
                });
            }

            if (user.statut === 'inactif') {
                return res.status(401).json({ error: 'Votre compte est inactif.' });
            }

            if (user.statut === 'rejete') {
                return res.status(401).json({
                    error: 'Votre dossier a été rejeté. Contactez le support.',
                    statut: 'rejete'
                });
            }

            const isValid = await UserModel.verifyPassword(user, password);
            if (!isValid) {
                const tentatives = await UserModel.incrementTentatives(user.id);

                if (tentatives >= MAX_TENTATIVES) {
                    await UserModel.bloquerCompte(user.id);
                    // Générer le token de déblocage et envoyer les deux emails
                    const deblocageToken = crypto.randomBytes(32).toString('hex');
                    await UserModel.setDeblocageToken(user.id, deblocageToken);
                    sendCompteBloque(user.email, user.prenom || user.nom).catch(() => {});
                    sendDeblocageEmail(user.email, user.prenom || user.nom, deblocageToken).catch(() => {});
                    return res.status(401).json({
                        error: `Votre compte a été bloqué après ${MAX_TENTATIVES} tentatives échouées. Un lien de déblocage vous a été envoyé par email.`,
                        code: 'COMPTE_BLOQUE'
                    });
                }

                const restantes = MAX_TENTATIVES - tentatives;
                return res.status(401).json({
                    error: `Email ou mot de passe incorrect. ${restantes} tentative${restantes > 1 ? 's' : ''} restante${restantes > 1 ? 's' : ''} avant blocage.`
                });
            }

            // Connexion réussie : réinitialiser le compteur
            await UserModel.resetTentatives(user.id);
            await UserModel.updateLastConnexion(user.id);

            const token = generateToken(user);
            const refreshToken = generateRefreshToken(user);

            await SessionModel.create(user.id, token, req.ip, req.headers['user-agent']);

            res.json({
                success: true,
                user: {
                    id: user.id,
                    nom: user.nom,
                    prenom: user.prenom,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar,
                    statut: user.statut
                },
                token,
                refreshToken
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Erreur lors de la connexion' });
        }
    },

    logout: async (req, res) => {
        try {
            await SessionModel.deleteByToken(req.token);
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur lors de la déconnexion' });
        }
    },

    getMe: async (req, res) => {
        try {
            const user = await UserModel.findById(req.user.id);

            if (!user) {
                return res.status(404).json({ error: 'Utilisateur introuvable' });
            }

            res.json({
                user: {
                    id: user.id,
                    nom: user.nom,
                    prenom: user.prenom,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar,
                    statut: user.statut,        // ← ajouté
                    score_credit: user.score_credit
                }
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur lors du chargement' });
        }
    },

    verifyEmail: async (req, res) => {
        try {
            const { token } = req.query;

            if (!token) {
                return res.status(400).json({ error: 'Token manquant.' });
            }

            const user = await UserModel.findByEmailToken(token);
            if (!user) {
                return res.status(400).json({ error: 'Lien invalide ou expiré.' });
            }

            await UserModel.markEmailVerified(user.id);

            res.json({ success: true, message: 'Email vérifié avec succès. Vous pouvez maintenant vous connecter.' });

        } catch (error) {
            console.error('VerifyEmail error:', error);
            res.status(500).json({ error: 'Erreur lors de la vérification.' });
        }
    },

    resendVerification: async (req, res) => {
        try {
            const { email } = req.body;

            const user = await UserModel.findByEmail(email);
            if (!user) {
                // Réponse neutre pour ne pas révéler l'existence du compte
                return res.json({ success: true, message: 'Si cet email existe, un lien a été envoyé.' });
            }

            if (user.email_verifie) {
                return res.status(400).json({ error: 'Cet email est déjà vérifié.' });
            }

            const emailToken = crypto.randomBytes(32).toString('hex');
            await UserModel.setEmailToken(user.id, emailToken);
            sendVerificationEmail(user.email, user.prenom || user.nom, emailToken).catch(() => {});

            res.json({ success: true, message: 'Email de vérification renvoyé.' });

        } catch (error) {
            console.error('ResendVerification error:', error);
            res.status(500).json({ error: 'Erreur lors du renvoi.' });
        }
    },

    debloquerCompte: async (req, res) => {
        try {
            const { token } = req.query;
            if (!token) {
                return res.status(400).json({ error: 'Token manquant.' });
            }

            const user = await UserModel.findByDeblocageToken(token);
            if (!user) {
                return res.status(400).json({ error: 'Lien invalide ou expiré. Reconnectez-vous pour en recevoir un nouveau.' });
            }

            await UserModel.debloquerCompte(user.id);
            res.json({ success: true, message: 'Votre compte a été débloqué. Vous pouvez maintenant vous connecter.' });

        } catch (error) {
            console.error('DebloquerCompte error:', error);
            res.status(500).json({ error: 'Erreur lors du déblocage.' });
        }
    },

    demanderDeblocage: async (req, res) => {
        try {
            const { email } = req.body;
            const user = await UserModel.findByEmail(email);

            // Réponse neutre même si l'email n'existe pas
            if (!user || user.statut !== 'bloque') {
                return res.json({ success: true, message: 'Si votre compte est bloqué, un lien vous a été envoyé.' });
            }

            const deblocageToken = crypto.randomBytes(32).toString('hex');
            await UserModel.setDeblocageToken(user.id, deblocageToken);
            sendDeblocageEmail(user.email, user.prenom || user.nom, deblocageToken).catch(() => {});

            res.json({ success: true, message: 'Lien de déblocage envoyé. Vérifiez votre boîte mail.' });

        } catch (error) {
            console.error('DemanderDeblocage error:', error);
            res.status(500).json({ error: 'Erreur lors de l\'envoi.' });
        }
    },

    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;

            const user = await UserModel.findByEmail(email);

            // Réponse neutre : ne pas révéler si l'email existe
            if (!user) {
                return res.json({ success: true, message: 'Si cet email existe, un lien de réinitialisation vous a été envoyé.' });
            }

            const token = crypto.randomBytes(32).toString('hex');
            const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures
            await UserModel.setResetToken(email, token, expiry);

            sendResetPassword(email, token, user.prenom || user.nom).catch(() => {});

            res.json({ success: true, message: 'Un lien de réinitialisation vous a été envoyé par email.' });

        } catch (error) {
            console.error('ForgotPassword error:', error);
            res.status(500).json({ error: 'Erreur lors de l\'envoi du lien.' });
        }
    },

    resetPassword: async (req, res) => {
        try {
            const { token, newPassword } = req.body;

            if (!token || !newPassword) {
                return res.status(400).json({ error: 'Token et nouveau mot de passe requis.' });
            }

            const user = await UserModel.findByResetToken(token);
            if (!user) {
                return res.status(400).json({ error: 'Lien invalide ou expiré. Faites une nouvelle demande.' });
            }

            await UserModel.updatePassword(user.id, newPassword);
            await UserModel.clearResetToken(user.id);

            res.json({ success: true, message: 'Mot de passe réinitialisé avec succès. Vous pouvez vous connecter.' });

        } catch (error) {
            console.error('ResetPassword error:', error);
            res.status(500).json({ error: 'Erreur lors de la réinitialisation.' });
        }
    },

    changePassword: async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;

            const user = await UserModel.findByEmail(req.user.email);

            if (!user) {
                return res.status(404).json({ error: 'Utilisateur introuvable' });
            }

            const isValid = await UserModel.verifyPassword(user, currentPassword);

            if (!isValid) {
                return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
            }

            await UserModel.updatePassword(req.user.id, newPassword);

            res.json({ success: true });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur lors du changement' });
        }
    }
};

module.exports = authController;