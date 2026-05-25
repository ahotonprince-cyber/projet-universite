const twilio = require('twilio');

let client = null;

const initTwilio = () => {
    if (!client && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
};

const sendSMS = async (to, message) => {
    try {
        initTwilio();
        if (!client) {
            console.log('SMS non envoyé (Twilio non configuré):', to, message);
            return false;
        }
        
        const result = await client.messages.create({
            body: message,
            to: to,
            from: process.env.TWILIO_PHONE_NUMBER
        });
        
        return result.sid;
    } catch (error) {
        console.error('SMS error:', error);
        return false;
    }
};

const sendNotificationSMS = async (telephone, prenom, message) => {
    const fullMessage = `COWEC - Bonjour ${prenom}, ${message}`;
    return sendSMS(telephone, fullMessage);
};

const sendCreditValideSMS = async (telephone, prenom, montant) => {
    return sendNotificationSMS(telephone, prenom, `Votre crédit de ${montant.toLocaleString()} FCFA a été validé.`);
};

const sendPaiementRecuSMS = async (telephone, prenom, montant) => {
    return sendNotificationSMS(telephone, prenom, `Nous avons bien reçu votre paiement de ${montant.toLocaleString()} FCFA.`);
};

module.exports = { sendSMS, sendNotificationSMS, sendCreditValideSMS, sendPaiementRecuSMS };