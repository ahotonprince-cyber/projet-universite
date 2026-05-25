const UserModel = require('../../models/UserModel');
const PreferenceModel = require('../../models/PreferenceModel');

const profileController = {

    getProfile: async (req, res) => {
        try {
            const user = await UserModel.findById(req.user.id);
            const preferences = await PreferenceModel.findByUserId(req.user.id);

            // ✅ sécurisation
            if (!user) {
                return res.status(404).json({ error: 'Utilisateur non trouvé' });
            }

            res.json({
                profile: user,
                preferences: preferences || {} // ou []
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur chargement profil' });
        }
    },

    updateProfile: async (req, res) => {
        try {
            await UserModel.update(req.user.id, req.body);
            res.json({ success: true });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur mise à jour' });
        }
    },

    changePassword: async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;

            const user = await UserModel.findByEmail(req.user.email);

            // ✅ sécurité critique
            if (!user) {
                return res.status(404).json({ error: 'Utilisateur introuvable' });
            }

            const isValid = await UserModel.verifyPassword(user, currentPassword);

            if (!isValid) {
                return res.status(401).json({ error: 'Mot de passe incorrect' });
            }

            await UserModel.updatePassword(req.user.id, newPassword);

            res.json({ success: true });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur changement mot de passe' });
        }
    },

    uploadAvatar: async (req, res) => {
        try {
            if (!req.file) return res.status(400).json({ error: 'Aucun fichier fourni' });

            const avatarPath = `/uploads/avatars/${req.file.filename}`;
            await UserModel.update(req.user.id, { avatar: avatarPath });

            res.json({ success: true, avatar: avatarPath });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur upload avatar' });
        }
    }
};

module.exports = profileController;