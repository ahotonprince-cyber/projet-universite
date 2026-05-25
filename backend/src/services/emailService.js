const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html
        });
        return true;
    } catch (error) {
        console.error('Email error:', error);
        return false;
    }
};

const sendResetPassword = async (email, token, prenom) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const html = `
        <h1>Réinitialisation de mot de passe</h1>
        <p>Bonjour ${prenom},</p>
        <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Ce lien expire dans 1 heure.</p>
    `;
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
                <p>Merci de vous être inscrit sur COWEC. Veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="${verifyUrl}"
                       style="background-color: #27ae60; color: white; padding: 14px 28px;
                              text-decoration: none; border-radius: 4px; font-size: 16px;">
                        ✅ Vérifier mon email
                    </a>
                </p>
                <p>Ou copiez ce lien dans votre navigateur :</p>
                <p style="word-break: break-all; color: #555; font-size: 13px;">${verifyUrl}</p>
                <p style="color: #e74c3c;"><strong>Ce lien expire dans 24 heures.</strong></p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #888; font-size: 12px;">
                    Si vous n'avez pas créé de compte, ignorez cet email.
                </p>
            </div>
        </div>
    `;
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
                <p>
                    Votre compte a été bloqué suite à plusieurs tentatives de connexion échouées.
                    Cliquez sur le bouton ci-dessous pour le <strong>débloquer</strong> :
                </p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="${deblocageUrl}"
                       style="background-color: #e67e22; color: white; padding: 14px 28px;
                              text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: bold;">
                        🔓 Débloquer mon compte
                    </a>
                </p>
                <p>Ou copiez ce lien dans votre navigateur :</p>
                <p style="word-break: break-all; color: #555; font-size: 13px;">${deblocageUrl}</p>
                <p style="color: #e74c3c;"><strong>Ce lien expire dans 24 heures.</strong></p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #888; font-size: 12px;">
                    Si vous n'êtes pas à l'origine de cette demande, ignorez cet email et contactez le support.
                </p>
            </div>
        </div>
    `;
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
                <p>
                    Votre compte COWEC a été <strong>bloqué automatiquement</strong> suite à
                    <strong>3 tentatives de connexion échouées</strong> consécutives.
                </p>
                <p>
                    Si c'est vous qui avez tenté de vous connecter, veuillez contacter notre
                    support pour débloquer votre compte :
                </p>
                <p style="text-align: center; margin: 25px 0;">
                    <a href="mailto:support@cowec.com"
                       style="background-color: #2c3e50; color: white; padding: 12px 24px;
                              text-decoration: none; border-radius: 4px;">
                        Contacter le support
                    </a>
                </p>
                <p>
                    Si vous n'êtes pas à l'origine de ces tentatives, votre compte est en sécurité.
                    Contactez-nous immédiatement.
                </p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #888; font-size: 12px;">
                    Cet email a été envoyé automatiquement par le système de sécurité COWEC.
                    Date : ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Porto-Novo' })}
                </p>
            </div>
        </div>
    `;
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
                <p>
                    Excellente nouvelle ! Votre dossier a été <strong>validé</strong> par notre équipe.
                    Votre compte COWEC est maintenant <strong>actif</strong> et vous pouvez accéder à tous nos services.
                </p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="${loginUrl}"
                       style="background-color: #27ae60; color: white; padding: 14px 28px;
                              text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: bold;">
                        🚀 Accéder à mon espace
                    </a>
                </p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #888; font-size: 12px;">
                    Bienvenue dans la famille COWEC Microfinance.
                </p>
            </div>
        </div>
    `;
    return sendEmail(email, '✅ Votre compte COWEC est activé !', html);
};

const sendCompteRejete = async (email, prenom, motif) => {
    const supportUrl = `${process.env.FRONTEND_URL}/espace-client/support`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #c0392b; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">❌ Dossier non validé</h1>
            </div>
            <div style="padding: 30px; background-color: #f9f9f9;">
                <p>Bonjour <strong>${prenom}</strong>,</p>
                <p>
                    Après examen de votre dossier, nous ne sommes pas en mesure de valider votre compte pour le moment.
                </p>
                ${motif ? `
                <div style="background-color: #fdf2f2; border-left: 4px solid #e74c3c; padding: 12px 16px; margin: 16px 0;">
                    <p style="margin: 0; color: #c0392b;"><strong>Motif :</strong> ${motif}</p>
                </div>
                ` : ''}
                <p>
                    Si vous pensez qu'il s'agit d'une erreur ou souhaitez soumettre de nouveaux documents,
                    veuillez contacter notre équipe support.
                </p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="mailto:support@cowec.com"
                       style="background-color: #2c3e50; color: white; padding: 12px 24px;
                              text-decoration: none; border-radius: 4px;">
                        Contacter le support
                    </a>
                </p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #888; font-size: 12px;">
                    Cet email a été envoyé automatiquement par COWEC Microfinance.
                </p>
            </div>
        </div>
    `;
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
                <p>Votre demande de crédit a bien été enregistrée et est en cours d'examen par notre équipe.</p>
                <div style="background-color: #eaf4fb; border-left: 4px solid #2980b9; padding: 16px; margin: 20px 0;">
                    <p style="margin: 4px 0;"><strong>Référence :</strong> ${numeroCredit}</p>
                    <p style="margin: 4px 0;"><strong>Montant demandé :</strong> ${Number(montant).toLocaleString('fr-FR')} FCFA</p>
                    <p style="margin: 4px 0;"><strong>Durée :</strong> ${dureeMois} mois</p>
                </div>
                <p>Vous recevrez une notification dès que votre dossier sera traité.</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #888; font-size: 12px;">COWEC Microfinance — Ne pas répondre à cet email.</p>
            </div>
        </div>
    `;
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