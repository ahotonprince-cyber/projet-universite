const OperateurMobileModel = require('../../models/OperateurMobileModel');

const operateurController = {
    getAll: async (req, res) => {
        try {
            const operateurs = await OperateurMobileModel.findAll();
            res.json({ operateurs });
        } catch (error) {
            console.error('❌ getAll error:', error);
            res.status(500).json({ error: 'Erreur chargement opérateurs' });
        }
    },
    
    getById: async (req, res) => {
        try {
            const operateur = await OperateurMobileModel.findById(req.params.id);
            if (!operateur) return res.status(404).json({ error: 'Opérateur non trouvé' });
            res.json({ operateur });
        } catch (error) {
            console.error('❌ getById error:', error);
            res.status(500).json({ error: 'Erreur chargement opérateur' });
        }
    },
    
    create: async (req, res) => {
        try {
            const { nom, code, frais_transaction } = req.body;

            if (!nom || !code) {
                return res.status(400).json({ error: 'Nom et code requis' });
            }

            const id = await OperateurMobileModel.create({ nom, code, frais_transaction: frais_transaction || 0 });
            res.status(201).json({ success: true, id });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: `Le code "${req.body.code}" est déjà utilisé par un autre opérateur.` });
            }
            console.error('❌ create error:', error);
            res.status(500).json({ error: 'Erreur création opérateur: ' + error.message });
        }
    },
    
    update: async (req, res) => {
        try {
            console.log('📥 update operateur - ID:', req.params.id, 'données:', req.body);
            
            const { nom, code, frais_transaction, actif } = req.body;
            
            // 🔧 Construire l'objet update avec les valeurs par défaut
            const updateData = {
                nom: nom || null,
                code: code || null,
                frais_transaction: frais_transaction !== undefined ? frais_transaction : 0,
                actif: actif !== undefined ? actif : true
            };
            
            const result = await OperateurMobileModel.update(req.params.id, updateData);
            
            if (!result) {
                return res.status(404).json({ error: 'Opérateur non trouvé' });
            }
            
            console.log('✅ Opérateur mis à jour');
            res.json({ success: true });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: `Le code "${req.body.code}" est déjà utilisé par un autre opérateur.` });
            }
            console.error('❌ update error:', error);
            res.status(500).json({ error: 'Erreur mise à jour opérateur: ' + error.message });
        }
    },
    
    delete: async (req, res) => {
        try {
            console.log('📥 delete operateur - ID:', req.params.id);
            
            const result = await OperateurMobileModel.delete(req.params.id);
            
            if (!result) {
                return res.status(404).json({ error: 'Opérateur non trouvé' });
            }
            
            res.json({ success: true });
        } catch (error) {
            console.error('❌ delete error:', error);
            res.status(500).json({ error: 'Erreur suppression opérateur' });
        }
    },
    
    toggleActif: async (req, res) => {
        try {
            console.log('📥 toggleActif - ID:', req.params.id, 'actif:', req.body.actif);
            
            const { actif } = req.body;
            await OperateurMobileModel.toggleActif(req.params.id, actif);
            
            res.json({ success: true });
        } catch (error) {
            console.error('❌ toggleActif error:', error);
            res.status(500).json({ error: 'Erreur changement statut' });
        }
    }
};

module.exports = operateurController;