const Joi = require('joi');

const createTontineSchema = Joi.object({
    nom: Joi.string().min(3).max(100).required(),
    montant_part: Joi.number().min(1000).max(1000000).required(),
    periodicite: Joi.string().valid('hebdo', 'mensuel').required()
});

const updateTontineSchema = Joi.object({
    nom: Joi.string().min(3).max(100).optional(),
    montant_part: Joi.number().min(1000).max(1000000).optional(),
    periodicite: Joi.string().valid('hebdo', 'mensuel').optional(),
    statut: Joi.string().valid('actif', 'cloture').optional()
});

const ajouterMembreSchema = Joi.object({
    utilisateur_id: Joi.number().integer().positive().required()
});

module.exports = { createTontineSchema, updateTontineSchema, ajouterMembreSchema };