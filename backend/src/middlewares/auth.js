const { verifyToken } = require('../config/jwt');
const { query } = require('../config/database');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token manquant ou invalide' });
        }
        
        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        
        if (!decoded) {
            return res.status(401).json({ error: 'Token invalide ou expiré' });
        }
        
        const sessions = await query(
            'SELECT * FROM session WHERE token = ? AND date_expiration > NOW()',
            [token]
        );
        
        if (sessions.length === 0 && process.env.NODE_ENV !== 'test') {
            return res.status(401).json({ error: 'Session expirée' });
        }
        
        const users = await query(
            'SELECT id, nom, prenom, email, role, statut FROM utilisateurs WHERE id = ?',
            [decoded.id]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Utilisateur non trouvé' });
        }

        // ✅ Gérer chaque statut séparément
        if (users[0].statut === 'bloque') {
            return res.status(401).json({ error: 'Votre compte est bloqué. Contactez le support.' });
        }

        if (users[0].statut === 'inactif') {
            return res.status(401).json({ error: 'Votre compte est inactif.' });
        }

        if (users[0].statut === 'rejete') {
            return res.status(401).json({ 
                error: 'Votre dossier a été rejeté. Contactez le support.',
                statut: 'rejete'
            });
        }

        // ✅ 'en_attente' et 'actif' → autorisés à passer
        req.user = {
            id: users[0].id,
            nom: users[0].nom,
            prenom: users[0].prenom,
            email: users[0].email,
            role: users[0].role,
            statut: users[0].statut  // ← ajouté pour que ProtectedClientRoute puisse le lire
        };
        req.token = token;
        
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ error: 'Erreur d\'authentification' });
    }
};

const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Non authentifié' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: `Accès refusé. Rôle requis: ${roles.join(' ou ')}` });
        }
        next();
    };
};

module.exports = { authMiddleware, requireRole };