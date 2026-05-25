const generateCreditNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CR-${year}-${random}`;
};

const generateAccountNumber = (userId, typeId) => {
    return `CPT${String(userId).padStart(8, '0')}${String(typeId).padStart(2, '0')}`;
};

const generateTransactionReference = () => {
    return `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

module.exports = { generateCreditNumber, generateAccountNumber, generateTransactionReference };