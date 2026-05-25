const Joi = require('joi');

const registerSchema = Joi.object({
    nom: Joi.string().min(2).max(50).required(),
    prenom: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    telephone: Joi.string().pattern(/^[0-9+\s()\-]{8,20}$/).required(),
    password: Joi.string().min(8).required(),
    adresse: Joi.string().max(255).optional(),
    profession: Joi.string().max(100).optional(),
    dateNaissance: Joi.date().iso().optional()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required()
});

const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().min(8).required()
});

module.exports = {
    registerSchema,
    loginSchema,
    changePasswordSchema,
    forgotPasswordSchema,
    resetPasswordSchema
};