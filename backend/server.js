const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { errorHandler } = require('./src/middlewares/errorHandler');
const { loggerMiddleware } = require('./src/middlewares/logger');

const app = express();

// ============ SECURITY MIDDLEWARES ============
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());

// CORS configuration
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    process.env.FRONTEND_URL,
].filter(Boolean);

const localNetworkRegex = /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/;
const vercelRegex = /^https:\/\/[\w-]+\.vercel\.app$/;

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        if (vercelRegex.test(origin)) return callback(null, true);
        if (process.env.NODE_ENV !== 'production' && localNetworkRegex.test(origin)) {
            return callback(null, true);
        }
        callback(new Error(`CORS bloqué pour l'origine: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
if (process.env.NODE_ENV === 'production') {
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 500,
        message: { error: 'Trop de requêtes, veuillez réessayer plus tard.' },
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use('/api/', limiter);
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging
app.use(loggerMiddleware);

// ============ ROUTES ============
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/client', require('./src/routes/clientRoutes'));
app.use('/api/agent', require('./src/routes/agentRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

// Test email endpoint (diagnostic — à supprimer après vérification)
app.get('/health/email-test', async (req, res) => {
    const { sendEmail } = require('./src/services/emailService');
    const to = req.query.to || process.env.BREVO_LOGIN || process.env.SMTP_USER;
    const provider = process.env.BREVO_SMTP_KEY ? 'Brevo API HTTPS' : 'Gmail SMTP';
    const ok = await sendEmail(to, `Test COWEC (${provider})`, `<h2>${provider} fonctionne !</h2><p>Envoyé à : ${to}</p>`);
    if (ok) res.json({ success: true, provider, to });
    else res.status(500).json({ success: false, provider, error: 'Voir logs Railway' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

// Error handling middleware (last)
app.use(errorHandler);

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 API URL: http://localhost:${PORT}/api`);
    console.log(`🌐 Network:   http://192.168.100.7:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

module.exports = app;