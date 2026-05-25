const Joi = require('joi');

const createUserSchema = Joi.object({
    nom: Joi.string().min(2).max(50).required(),
    prenom: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    telephone: Joi.string().pattern(/^[0-9+\s()\-]{8,20}$/).required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('admin', 'agent', 'client').required(),
    adresse: Joi.string().max(255).optional(),
    profession: Joi.string().max(100).optional(),
    dateNaissance: Joi.date().iso().optional()
});

const updateUserSchema = Joi.object({
    nom: Joi.string().min(2).max(50).optional(),
    prenom: Joi.string().min(2).max(50).optional(),
    email: Joi.string().email().optional(),
    telephone: Joi.string().pattern(/^[0-9+\s()\-]{8,20}$/).optional(),
    adresse: Joi.string().max(255).optional(),
    profession: Joi.string().max(100).optional(),
    dateNaissance: Joi.date().iso().optional()
});

const updateUserRoleSchema = Joi.object({
    role: Joi.string().valid('admin', 'agent', 'client').required()
});

const updateUserStatutSchema = Joi.object({
    statut: Joi.string().valid('actif', 'inactif', 'bloque').required()
});

module.exports = { createUserSchema, updateUserSchema, updateUserRoleSchema, updateUserStatutSchema };