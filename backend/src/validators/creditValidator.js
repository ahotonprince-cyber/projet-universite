const Joi = require('joi');

const demandeCreditSchema = Joi.object({
    montant: Joi.number().min(50000).max(10000000).required(),
    duree_mois: Joi.number().min(3).max(60).required(),
    objet: Joi.string().max(255).required(),
    description: Joi.string().max(1000).optional(),
    taux_annuel: Joi.number().min(0).max(50).required()
});

const updateCreditStatutSchema = Joi.object({
    statut: Joi.string().valid('en_attente', 'valide', 'rejete', 'actif', 'solde').required(),
    motif_rejet: Joi.string().max(500).optional()
});

const produitCreditSchema = Joi.object({
    nom: Joi.string().min(3).max(100).required(),
    taux_annuel: Joi.number().min(0).max(50).required(),
    duree_min: Joi.number().min(1).max(60).required(),
    duree_max: Joi.number().min(1).max(60).required(),
    montant_min: Joi.number().min(10000).required(),
    montant_max: Joi.number().min(10000).required(),
    frais_dossier: Joi.number().min(0).optional()
});

module.exports = { demandeCreditSchema, updateCreditStatutSchema, produitCreditSchema };