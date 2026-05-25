const rateLimit = require('express-rate-limit');

// Limite générale API - AUGMENTÉE pour le développement
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute (au lieu de 15 minutes)
    max: 300, // 300 requêtes par minute (au lieu de 100)
    message: { error: 'Trop de requêtes, veuillez réessayer plus tard.' },
    standardHeaders: true,
    legacyHeaders: false,
    // Pas de limite en développement (optionnel)
    skip: (req) => process.env.NODE_ENV === 'development'
});

// Limite pour l'authentification - AUGMENTÉE
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 tentatives (au lieu de 5)
    message: { error: 'Trop de tentatives, veuillez réessayer dans 15 minutes.' },
    skipSuccessfulRequests: true,
});

module.exports = { apiLimiter, authLimiter };