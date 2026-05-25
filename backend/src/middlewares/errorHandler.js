const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    
    if (err.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Token invalide' });
    if (err.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token expiré' });
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Cette entrée existe déjà' });
    if (err.code === 'ER_NO_REFERENCED_ROW') return res.status(400).json({ error: 'Référence invalide' });
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'Fichier trop volumineux' });
    
    const status = err.status || 500;
    const message = err.message || 'Erreur interne du serveur';
    
    res.status(status).json({ error: message, ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) });
};

module.exports = { errorHandler };