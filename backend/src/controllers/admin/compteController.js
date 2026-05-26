const CompteModel = require('../../models/CompteModel');

const compteController = {
    getByClient: async (req, res) => {
        try {
            const { clientId } = req.params;
            console.log('📥 getByClient - clientId:', clientId);
            
            const comptes = await CompteModel.findByClient(clientId);
            console.log('✅ Comptes trouvés:', comptes.length);
            
            res.json({ comptes });
        } catch (error) {
            console.error('❌ getByClient error:', error);
            res.status(500).json({ error: 'Erreur chargement comptes' });
        }
    },
    
    create: async (req, res) => {
        try {
            const { clientId } = req.params;
            const { type_compte_id } = req.body;
            
            console.log('📥 create compte - clientId:', clientId, 'type_compte_id:', type_compte_id);
            
            const numeroCompte = `CPT${String(clientId).padStart(8, '0')}${String(type_compte_id).padStart(2, '0')}`;
            
            const compteId = await CompteModel.create(clientId, type_compte_id, numeroCompte);
            console.log('✅ Compte créé avec ID:', compteId);
            
            res.status(201).json({ success: true, compte_id: compteId, numero_compte: numeroCompte });
        } catch (error) {
            console.error('❌ create compte error:', error);
            res.status(500).json({ error: 'Erreur création compte' });
        }
    },
    
    updateSolde: async (req, res) => {
        try {
            const { id } = req.params;
            const { montant, operation } = req.body;
            
            console.log('📥 updateSolde - compteId:', id, 'montant:', montant, 'operation:', operation);
            
            if (!montant || montant <= 0) {
                return res.status(400).json({ error: 'Montant invalide' });
            }
            
            if (operation !== 'depot' && operation !== 'retrait') {
                return res.status(400).json({ error: 'Opération invalide' });
            }
            
            await CompteModel.updateSolde(id, montant, operation);
            console.log('✅ Solde mis à jour');
            
            res.json({ success: true });
        } catch (error) {
            console.error('❌ updateSolde error:', error);
            res.status(500).json({ error: 'Erreur modification solde' });
        }
    },
    
    toggleStatut: async (req, res) => {
        try {
            const { id } = req.params;
            const { statut } = req.body;
            
            console.log('📥 toggleStatut - compteId:', id, 'statut:', statut);
            
            await CompteModel.updateStatut(id, statut);
            console.log('✅ Statut mis à jour');
            
            res.json({ success: true });
        } catch (error) {
            console.error('❌ toggleStatut error:', error);
            res.status(500).json({ error: 'Erreur changement statut' });
        }
    },
    
    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const compte = await CompteModel.findById(id);
            if (!compte) return res.status(404).json({ error: 'Compte introuvable' });
            res.json({ compte });
        } catch (error) {
            console.error('❌ getById error:', error);
            res.status(500).json({ error: 'Erreur chargement compte' });
        }
    },

    getOperations: async (req, res) => {
        try {
            const { id } = req.params;
            const limit = parseInt(req.query.limit) || 50;
            
            console.log('📥 getOperations - compteId:', id, 'limit:', limit);
            
            const operations = await CompteModel.getOperations(id, limit);
            console.log('✅ Opérations trouvées:', operations.length);
            
            res.json({ operations });
        } catch (error) {
            console.error('❌ getOperations error:', error.code, error.message);
            res.status(500).json({ error: 'Erreur chargement opérations: ' + error.message });
        }
    }
};

module.exports = compteController;