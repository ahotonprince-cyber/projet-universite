const Joi = require('joi');

const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error } = schema.validate(req[property], {
            abortEarly: false,
            allowUnknown: false,
            stripUnknown: true
        });
        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path[0],
                message: detail.message
            }));
            return res.status(400).json({ errors });
        }
        next();
    };
};

const schemas = {
    register: Joi.object({
        nom: Joi.string().min(2).max(50).required(),
        prenom: Joi.string().min(2).max(50).required(),
        email: Joi.string().email().required(),
        telephone: Joi.string().pattern(/^[0-9+\s()\-]{8,20}$/).required()
            .messages({ 'string.pattern.base': 'Format de téléphone invalide (ex: +229 97 000 000)' }),
        password: Joi.string().min(8).required(),
        adresse: Joi.string().max(255).optional().allow(''),
        profession: Joi.string().max(100).optional().allow(''),
        dateNaissance: Joi.date().iso().optional().allow('', null)
    }),
    
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),
    
    demandeCredit: Joi.object({
        montant: Joi.number().min(50000).max(10000000).required(),
        duree_mois: Joi.number().min(3).max(60).required(),
        objet: Joi.string().max(255).required(),
        description: Joi.string().max(1000).optional(),
        taux_annuel: Joi.number().min(0).max(50).required()
    }),
    
    depotMobile: Joi.object({
        operateur: Joi.string().valid('mtn', 'moov', 'wave').required(),
        montant: Joi.number().min(500).max(1000000).required(),
        telephone: Joi.string().pattern(/^[0-9]{9}$/).required()
    }),
    
    changePassword: Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().min(8).required()
    })
};

module.exports = { validate, schemas };