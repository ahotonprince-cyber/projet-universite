const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.id, 
            email: user.email, 
            nom: user.nom, 
            prenom: user.prenom, 
            role: user.role,
            statut: user.statut  // ← ajouter le statut
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );
};

const verifyToken = (token) => {
    try { return jwt.verify(token, process.env.JWT_SECRET); } 
    catch (error) { return null; }
};

const verifyRefreshToken = (token) => {
    try { return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET); } 
    catch (error) { return null; }
};

module.exports = { generateToken, generateRefreshToken, verifyToken, verifyRefreshToken };