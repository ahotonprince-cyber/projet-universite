const CompteModel = require('../../models/CompteModel');

const compteController = {
    getComptes: async (req, res) => {
        try {
            const comptes = await CompteModel.findByUser(req.user.id);
            res.json({ comptes });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur chargement comptes' });
        }
    },

    getSolde: async (req, res) => {
        try {
            const solde = await CompteModel.getSoldeClient(req.user.id);

            // ✅ Sécurisation des données
            const soldeSecurise = {
                solde_epargne: solde?.solde_epargne || 0,
                solde_courant: solde?.solde_courant || 0,
                solde_tontine: solde?.solde_tontine || 0
            };

            res.json(soldeSecurise);

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur chargement solde' });
        }
    }
};

module.exports = compteController;