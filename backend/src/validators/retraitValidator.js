const Joi = require('joi');

const demandeRetraitSchema = Joi.object({
    operateur: Joi.string().valid('mtn', 'moov', 'wave').required(),
    montant: Joi.number().min(1000).max(1000000).required(),
    telephone: Joi.string().pattern(/^[0-9]{9}$/).required()
});

const validationRetraitSchema = Joi.object({
    accepte: Joi.boolean().required(),
    motif_rejet: Joi.string().max(500).optional()
});

module.exports = { demandeRetraitSchema, validationRetraitSchema };