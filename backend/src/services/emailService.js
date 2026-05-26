const nodemailer = require('nodemailer');

// Priorité : Brevo SMTP > Gmail SMTP (local)
const useBrevo = !!process.env.BREVO_SMTP_KEY;

const createTransport = () => {
    if (useBrevo) {
        return nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.BREVO_LOGIN,   // votre email de compte Brevo
                pass: process.env.BREVO_SMTP_KEY  // clé xsmtpsib-...
            }
        });
    }
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: false,
        requireTLS: true,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        tls: { rejectUnauthorized: false }
    });
};

const transport = createTransport();
const FROM = useBrevo
    ? `"COWEC Microfinance" <${process.env.BREVO_LOGIN}>`
    : `"COWEC Microfinance" <${process.env.SMTP_USER}>`;

const sendEmail = async (to, subject, html) => {
    try {
        const info = await transport.sendMail({ from: FROM, to, subject, html });
        console.log(`[EMAIL] Envoyé à ${to} — "${subject}" (${useBrevo ? 'Brevo' : 'Gmail'})`);
        return true;
    } catch (error) {
        console.error(`[EMAIL] Échec envoi à ${to} — "${subject}" — ${error.message}`);
        return false;
    }
};

const sendResetPassword = async (email, token, prenom) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #2c3e50; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">COWEC Microfinance</h1>
            </div>
            <div style="padding: 30px; background-color: #f9f9f9;">
                <p>Bonjour <strong>${prenom}</strong>,</p>
                <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #2c3e50; color: white; padding: 14px 28px;
                       text-decoration: none; border-radius: 4px; font-size: 16px;">
                        Réinitialiser mon mot de passe
                    </a>
                </p>
                <p style="color: #e74c3c;"><strong>Ce lien expire dans 24 heures.</strong></p>
            </div>
        </div>`;
    return sendEmail(email, 'Réinitialisation de mot de passe - COWEC', html);
};

const sendVerificationEmail = async (email, prenom, token) => {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #2c3e50; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">COWEC Microfinance</h1>
            </div>
            <div style="padding: 30px; background-color: #f9f9f9;">
                <p>Bonjour <strong>${prenom}</strong>,</p>
                <p>Merci de vous être inscrit sur COWEC. Confirmez votre adresse email :</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="${verifyUrl}" style="background-color: #27ae60; color: white; padding: 14px 28px;
                       text-decoration: none; border-radius: 4px; font-size: 16px;">
                        ✅ Vérifier mon email
                    </a>
                </p>
                <p style="color: #e74c3c;"><strong>Ce lien expire dans 24 heures.</strong></p>
            </div>
        </div>`;
    return sendEmail(email, '✅ Confirmez votre adresse email - COWEC', html);
};

const sendDeblocageEmail = async (email, prenom, token) => {
    const deblocageUrl = `${process.env.FRONTEND_URL}/debloquer-compte?token=${token}`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #2c3e50; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">COWEC Microfinance</h1>
            </div>
            <div style="padding: 30px; background-color: #f9f9f9;">
                <p>Bonjour <strong>${prenom}</strong>,</p>
                <p>Votre compte a été bloqué suite à plusieurs tentatives échouées. Cliquez pour le <strong>débloquer</strong> :</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="${deblocageUrl}" style="background-color: #e67e22; color: white; padding: 14px 28px;
                       text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: bold;">
                        🔓 Débloquer mon compte
                    </a>
                </p>
                <p>Ou copiez ce lien :</p>
                <p style="word-break: break-all; color: #555; font-size: 13px;">${deblocageUrl}</p>
                <p style="color: #e74c3c;"><strong>Ce lien expire dans 24 heures.</strong></p>
            </div>
        </div>`;
    return sendEmail(email, '🔓 Débloquez votre compte COWEC', html);
};

const sendCompteBloque = async (email, prenom) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #c0392b; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">⚠️ Compte bloqué</h1>
            </div>
            <div style="padding: 30px; background-color: #f9f9f9;">
                <p>Bonjour <strong>${prenom}</strong>,</p>
                <p>Votre compte COWEC a été <strong>bloqué automatiquement</strong> après <strong>3 tentatives échouées</strong>.</p>
                <p>Vérifiez votre boîte mail pour le lien de déblocage envoyé séparément.</p>
                <p style="color: #888; font-size: 12px;">Date : ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Porto-Novo' })}</p>
            </div>
        </div>`;
    return sendEmail(email, '⚠️ Compte bloqué - COWEC Microfinance', html);
};

const sendCompteApprouve = async (email, prenom) => {
    const loginUrl = `${process.env.FRONTEND_URL}/client/connexion`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #27ae60; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">✅ Compte activé</h1>
            </div>
            <div style="padding: 30px; background-color: #f9f9f9;">
                <p>Bonjour <strong>${prenom}</strong>,</p>
                <p>Votre dossier a été <strong>validé</strong>. Votre compte COWEC est maintenant <strong>actif</strong>.</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="${loginUrl}" style="background-color: #27ae60; color: white; padding: 14px 28px;
                       text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: bold;">
                        🚀 Accéder à mon espace
                    </a>
                </p>
            </div>
        </div>`;
    return sendEmail(email, '✅ Votre compte COWEC est activé !', html);
};

const sendCompteRejete = async (email, prenom, motif) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #c0392b; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">❌ Dossier non validé</h1>
            </div>
            <div style="padding: 30px; background-color: #f9f9f9;">
                <p>Bonjour <strong>${prenom}</strong>,</p>
                <p>Nous ne sommes pas en mesure de valider votre compte pour le moment.</p>
                ${motif ? `<div style="background-color: #fdf2f2; border-left: 4px solid #e74c3c; padding: 12px 16px; margin: 16px 0;">
                    <p style="margin: 0; color: #c0392b;"><strong>Motif :</strong> ${motif}</p>
                </div>` : ''}
                <p>Contactez notre support : <a href="mailto:support@cowec.com">support@cowec.com</a></p>
            </div>
        </div>`;
    return sendEmail(email, '❌ Votre dossier COWEC n\'a pas été validé', html);
};

const sendConfirmationDemandeCredit = async (email, prenom, numeroCredit, montant, dureeMois) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #2c3e50; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">COWEC Microfinance</h1>
            </div>
            <div style="padding: 30px; background-color: #f9f9f9;">
                <p>Bonjour <strong>${prenom}</strong>,</p>
                <p>Votre demande de crédit a bien été enregistrée et est en cours d'examen.</p>
                <div style="background-color: #eaf4fb; border-left: 4px solid #2980b9; padding: 16px; margin: 20px 0;">
                    <p style="margin: 4px 0;"><strong>Référence :</strong> ${numeroCredit}</p>
                    <p style="margin: 4px 0;"><strong>Montant demandé :</strong> ${Number(montant).toLocaleString('fr-FR')} FCFA</p>
                    <p style="margin: 4px 0;"><strong>Durée :</strong> ${dureeMois} mois</p>
                </div>
                <p>Vous recevrez une notification dès que votre dossier sera traité.</p>
            </div>
        </div>`;
    return sendEmail(email, `Demande de crédit reçue — ${numeroCredit}`, html);
};

module.exports = {
    sendEmail,
    sendResetPassword,
    sendVerificationEmail,
    sendCompteBloque,
    sendDeblocageEmail,
    sendCompteApprouve,
    sendCompteRejete,
    sendConfirmationDemandeCredit
};
