const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};

const formatMoney = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
};

const generateReference = (prefix = 'REF') => {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
};

module.exports = { formatDate, formatMoney, generateReference, calculateAge };