const ProduitCreditModel = require('../../models/ProduitCreditModel');
const { query } = require('../../config/database');

const CHAMPS_REQUIS = ['nom', 'taux_annuel', 'duree_min', 'duree_max', 'montant_min', 'montant_max'];

const produitCreditController = {
    getAll: async (req, res) => {
        try {
            const produits = await ProduitCreditModel.findAll();
            res.json({ produits });
        } catch (error) {
            console.error('❌ getAll error:', error);
            res.status(500).json({ error: 'Erreur chargement produits' });
        }
    },

    getById: async (req, res) => {
        try {
            const produit = await ProduitCreditModel.findById(req.params.id);
            if (!produit) return res.status(404).json({ error: 'Produit non trouvé' });
            res.json({ produit });
        } catch (error) {
            res.status(500).json({ error: 'Erreur chargement produit' });
        }
    },

    create: async (req, res) => {
        try {
            const data = req.body;

            // Validation champs requis
            for (const champ of CHAMPS_REQUIS) {
                if (data[champ] === undefined || data[champ] === '') {
                    return res.status(400).json({ error: `Champ requis manquant : ${champ}` });
                }
            }

            // Validation cohérence
            if (Number(data.montant_min) >= Number(data.montant_max)) {
                return res.status(400).json({ error: 'Le montant minimum doit être inférieur au montant maximum' });
            }
            if (Number(data.duree_min) >= Number(data.duree_max)) {
                return res.status(400).json({ error: 'La durée minimum doit être inférieure à la durée maximum' });
            }
            if (Number(data.taux_annuel) <= 0) {
                return res.status(400).json({ error: 'Le taux d\'intérêt doit être supérieur à 0' });
            }

            // Vérifier unicité du nom
            const [existant] = await query(
                'SELECT id FROM produit_credit WHERE nom = ?', [data.nom]
            );
            if (existant) {
                return res.status(409).json({ error: 'Un produit avec ce nom existe déjà' });
            }

            const id = await ProduitCreditModel.create(data);
            res.status(201).json({ success: true, id });
        } catch (error) {
            console.error('❌ create error:', error);
            res.status(500).json({ error: 'Erreur création produit: ' + error.message });
        }
    },

    update: async (req, res) => {
        try {
            const data = req.body;
            const { id } = req.params;

            if (data.montant_min !== undefined && data.montant_max !== undefined) {
                if (Number(data.montant_min) >= Number(data.montant_max)) {
                    return res.status(400).json({ error: 'Le montant minimum doit être inférieur au montant maximum' });
                }
            }
            if (data.duree_min !== undefined && data.duree_max !== undefined) {
                if (Number(data.duree_min) >= Number(data.duree_max)) {
                    return res.status(400).json({ error: 'La durée minimum doit être inférieure à la durée maximum' });
                }
            }

            const result = await ProduitCreditModel.update(id, data);
            if (!result) return res.status(404).json({ error: 'Produit non trouvé' });

            res.json({ success: true });
        } catch (error) {
            console.error('❌ update error:', error);
            res.status(500).json({ error: 'Erreur mise à jour produit: ' + error.message });
        }
    },

    delete: async (req, res) => {
        try {
            const result = await ProduitCreditModel.delete(req.params.id);
            if (!result) return res.status(404).json({ error: 'Produit non trouvé' });
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Erreur suppression produit' });
        }
    },

    toggleActif: async (req, res) => {
        try {
            const { actif } = req.body;
            await ProduitCreditModel.toggleActif(req.params.id, actif);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Erreur changement statut' });
        }
    }
};

module.exports = produitCreditController;
