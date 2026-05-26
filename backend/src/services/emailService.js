const https = require('https');
const nodemailer = require('nodemailer');

// Brevo HTTP API (port 443) — fonctionne sur Railway
// Fallback : nodemailer Gmail (local uniquement)
const useBrevo = !!process.env.BREVO_SMTP_KEY;

const sendViaBrevoAPI = (to, subject, html) => new Promise((resolve, reject) => {
    const sender = process.env.BREVO_LOGIN || process.env.EMAIL_FROM || 'ahotonprince@gmail.com';
    const body = JSON.stringify({
        sender: { name: 'COWEC Microfinance', email: sender },
        to: [{ email: to }],
        subject,
        htmlContent: html
    });
    const req = https.request({
        hostname: 'api.brevo.com',
        path: '/v3/smtp/email',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.BREVO_SMTP_KEY,
            'Content-Length': Buffer.byteLength(body)
        }
    }, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve(JSON.parse(data));
            } else {
                reject(new Error(`Brevo HTTP ${res.statusCode}: ${data}`));
            }
        });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
});

const nodemailerTransport = !useBrevo ? nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    requireTLS: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    tls: { rejectUnauthorized: false }
}) : null;

const sendEmail = async (to, subject, html) => {
    try {
        if (useBrevo) {
            await sendViaBrevoAPI(to, subject, html);
        } else {
            await nodemailerTransport.sendMail({
                from: `"COWEC Microfinance" <${process.env.SMTP_USER}>`,
                to, subject, html
            });
        }
        console.log(`[EMAIL OK] ${to} — "${subject}"`);
        return true;
    } catch (err) {
        console.error(`[EMAIL FAIL] ${to} — "${subject}" — ${err.message}`);
        return false;
    }
};

const sendResetPassword = async (email, token, prenom) => {
    const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    return sendEmail(email, 'Réinitialisation de mot de passe - COWEC', `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#2c3e50;padding:20px;text-align:center"><h1 style="color:white;margin:0">COWEC Microfinance</h1></div>
            <div style="padding:30px;background:#f9f9f9">
                <p>Bonjour <strong>${prenom}</strong>,</p>
                <p>Cliquez ci-dessous pour réinitialiser votre mot de passe :</p>
                <p style="text-align:center;margin:30px 0">
                    <a href="${url}" style="background:#2c3e50;color:white;padding:14px 28px;text-decoration:none;border-radius:4px;font-size:16px">Réinitialiser mon mot de passe</a>
                </p>
                <p style="color:#e74c3c"><strong>Ce lien expire dans 24 heures.</strong></p>
            </div>
        </div>`);
};

const sendVerificationEmail = async (email, prenom, token) => {
    const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    return sendEmail(email, '✅ Confirmez votre adresse email - COWEC', `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#2c3e50;padding:20px;text-align:center"><h1 style="color:white;margin:0">COWEC Microfinance</h1></div>
            <div style="padding:30px;background:#f9f9f9">
                <p>Bonjour <strong>${prenom}</strong>,</p>
                <p>Confirmez votre adresse email :</p>
                <p style="text-align:center;margin:30px 0">
                    <a href="${url}" style="background:#27ae60;color:white;padding:14px 28px;text-decoration:none;border-radius:4px;font-size:16px">✅ Vérifier mon email</a>
                </p>
                <p style="color:#e74c3c"><strong>Ce lien expire dans 24 heures.</strong></p>
            </div>
        </div>`);
};

const sendDeblocageEmail = async (email, prenom, token) => {
    const url = `${process.env.FRONTEND_URL}/debloquer-compte?token=${token}`;
    return sendEmail(email, '🔓 Débloquez votre compte COWEC', `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#2c3e50;padding:20px;text-align:center"><h1 style="color:white;margin:0">COWEC Microfinance</h1></div>
            <div style="padding:30px;background:#f9f9f9">
                <p>Bonjour <strong>${prenom}</strong>,</p>
                <p>Votre compte a été bloqué après plusieurs tentatives. Cliquez pour le <strong>débloquer</strong> :</p>
                <p style="text-align:center;margin:30px 0">
                    <a href="${url}" style="background:#e67e22;color:white;padding:14px 28px;text-decoration:none;border-radius:4px;font-size:16px;font-weight:bold">🔓 Débloquer mon compte</a>
                </p>
                <p>Ou copiez ce lien : <span style="word-break:break-all;color:#555;font-size:13px">${url}</span></p>
                <p style="color:#e74c3c"><strong>Ce lien expire dans 24 heures.</strong></p>
            </div>
        </div>`);
};

const sendCompteBloque = async (email, prenom) => {
    return sendEmail(email, '⚠️ Compte bloqué - COWEC Microfinance', `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#c0392b;padding:20px;text-align:center"><h1 style="color:white;margin:0">⚠️ Compte bloqué</h1></div>
            <div style="padding:30px;background:#f9f9f9">
                <p>Bonjour <strong>${prenom}</strong>,</p>
                <p>Votre compte COWEC a été <strong>bloqué automatiquement</strong> après <strong>3 tentatives échouées</strong>.</p>
                <p>Vérifiez votre boîte mail pour le lien de déblocage envoyé séparément.</p>
                <p style="color:#888;font-size:12px">Date : ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Porto-Novo' })}</p>
            </div>
        </div>`);
};

const sendCompteApprouve = async (email, prenom) => {
    const url = `${process.env.FRONTEND_URL}/client/connexion`;
    return sendEmail(email, '✅ Votre compte COWEC est activé !', `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#27ae60;padding:20px;text-align:center"><h1 style="color:white;margin:0">✅ Compte activé</h1></div>
            <div style="padding:30px;background:#f9f9f9">
                <p>Bonjour <strong>${prenom}</strong>,</p>
                <p>Votre dossier a été <strong>validé</strong>. Votre compte est maintenant <strong>actif</strong>.</p>
                <p style="text-align:center;margin:30px 0">
                    <a href="${url}" style="background:#27ae60;color:white;padding:14px 28px;text-decoration:none;border-radius:4px;font-size:16px;font-weight:bold">🚀 Accéder à mon espace</a>
                </p>
            </div>
        </div>`);
};

const sendCompteRejete = async (email, prenom, motif) => {
    return sendEmail(email, '❌ Votre dossier COWEC n\'a pas été validé', `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#c0392b;padding:20px;text-align:center"><h1 style="color:white;margin:0">❌ Dossier non validé</h1></div>
            <div style="padding:30px;background:#f9f9f9">
                <p>Bonjour <strong>${prenom}</strong>,</p>
                <p>Nous ne sommes pas en mesure de valider votre compte pour le moment.</p>
                ${motif ? `<div style="background:#fdf2f2;border-left:4px solid #e74c3c;padding:12px 16px;margin:16px 0"><p style="margin:0;color:#c0392b"><strong>Motif :</strong> ${motif}</p></div>` : ''}
                <p>Contactez notre support : <a href="mailto:support@cowec.com">support@cowec.com</a></p>
            </div>
        </div>`);
};

const sendConfirmationDemandeCredit = async (email, prenom, numeroCredit, montant, dureeMois) => {
    return sendEmail(email, `Demande de crédit reçue — ${numeroCredit}`, `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#2c3e50;padding:20px;text-align:center"><h1 style="color:white;margin:0">COWEC Microfinance</h1></div>
            <div style="padding:30px;background:#f9f9f9">
                <p>Bonjour <strong>${prenom}</strong>,</p>
                <p>Votre demande de crédit a été enregistrée et est en cours d'examen.</p>
                <div style="background:#eaf4fb;border-left:4px solid #2980b9;padding:16px;margin:20px 0">
                    <p style="margin:4px 0"><strong>Référence :</strong> ${numeroCredit}</p>
                    <p style="margin:4px 0"><strong>Montant :</strong> ${Number(montant).toLocaleString('fr-FR')} FCFA</p>
                    <p style="margin:4px 0"><strong>Durée :</strong> ${dureeMois} mois</p>
                </div>
                <p>Vous serez notifié dès que votre dossier sera traité.</p>
            </div>
        </div>`);
};

module.exports = {
    sendEmail, sendResetPassword, sendVerificationEmail,
    sendCompteBloque, sendDeblocageEmail, sendCompteApprouve,
    sendCompteRejete, sendConfirmationDemandeCredit
};
