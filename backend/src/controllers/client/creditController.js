const CreditModel = require('../../models/CreditModel');
const EcheanceModel = require('../../models/EcheanceModel');
const NotificationModel = require('../../models/NotificationModel');
const { sendConfirmationDemandeCredit } = require('../../services/emailService');
const { generateCreditNumber } = require('../../utils/generateNumber');

const creditController = {

    getMesCredits: async (req, res) => {
        try {
            const credits = await CreditModel.findByUser(req.user.id);

            res.json({
                credits: credits || [] // ✅ jamais null
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur chargement crédits' });
        }
    },

    getCreditById: async (req, res) => {
        try {
            const credit = await CreditModel.findById(req.params.id);

            if (!credit || credit.utilisateur_id !== req.user.id) {
                return res.status(404).json({ error: 'Crédit non trouvé' });
            }

            res.json({ credit });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur chargement crédit' });
        }
    },

    demanderCredit: async (req, res) => {
        try {
            const { montant, duree_mois, objet, description, taux_annuel } = req.body;

            const hasActive = await CreditModel.hasActiveCredit(req.user.id);
            if (hasActive) {
                return res.status(400).json({ error: 'Vous avez déjà un crédit en cours' });
            }

            const numero_credit = generateCreditNumber();

            const creditId = await CreditModel.create({
                utilisateur_id: req.user.id,
                numero_credit,
                montant_accorde: montant,
                duree_mois,
                taux_annuel,
                objet,
                description,
                statut: 'en_attente'
            });

            await NotificationModel.sendToAdmins(
                'Nouvelle demande de crédit',
                `${req.user.prenom} ${req.user.nom} demande ${montant.toLocaleString()} FCFA`,
                'validation',
                creditId
            );

            // Confirmation par email au client
            sendConfirmationDemandeCredit(
                req.user.email,
                req.user.prenom || req.user.nom,
                numero_credit,
                montant,
                duree_mois
            ).catch(() => {});

            res.status(201).json({
                success: true,
                credit_id: creditId,
                numero_credit
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur lors de la demande' });
        }
    },

    getEcheances: async (req, res) => {
        try {
            const credit = await CreditModel.findById(req.params.id);

            if (!credit || credit.utilisateur_id !== req.user.id) {
                return res.status(404).json({ error: 'Crédit non trouvé' });
            }

            const echeances = await EcheanceModel.findByCredit(req.params.id);

            res.json({
                echeances: echeances || [] // ✅ jamais null
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur chargement échéances' });
        }
    }
};

module.exports = creditController;