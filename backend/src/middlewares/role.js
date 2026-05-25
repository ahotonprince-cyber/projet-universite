const { ROLES } = require('../utils/constants');

const requireAdmin = (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Non authentifié' });
    if (req.user.role !== ROLES.ADMIN) {
        return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }
    next();
};

const requireAgent = (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Non authentifié' });
    if (req.user.role !== ROLES.ADMIN && req.user.role !== ROLES.AGENT) {
        return res.status(403).json({ error: 'Accès réservé aux agents' });
    }
    next();
};

const requireClient = (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Non authentifié' });
    if (req.user.role !== ROLES.CLIENT) {
        return res.status(403).json({ error: 'Accès réservé aux clients' });
    }
    next();
};

const checkOwnership = (getResourceUserId) => {
    return async (req, res, next) => {
        try {
            const resourceUserId = await getResourceUserId(req);
            if (req.user.role === ROLES.ADMIN) return next();
            if (req.user.id !== resourceUserId) {
                return res.status(403).json({ error: 'Accès non autorisé' });
            }
            next();
        } catch (error) {
            res.status(500).json({ error: 'Erreur de vérification' });
        }
    };
};

module.exports = { requireAdmin, requireAgent, requireClient, checkOwnership };