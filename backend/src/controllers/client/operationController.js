const OperationModel = require('../../models/OperationModel');

const operationController = {

    getOperations: async (req, res) => {
        try {
            const limit  = parseInt(req.query.limit)  || 20;
            const page   = parseInt(req.query.page)   || 1;
            const offset = (page - 1) * limit;

            const operations = await OperationModel.findByUser(req.user.id, { limit, offset });

            res.json({ operations: operations || [] });

        } catch (error) {
            console.error('❌ getOperations client:', error.code, error.message);
            res.status(500).json({ error: 'Erreur chargement opérations: ' + error.message });
        }
    },

    getOperationById: async (req, res) => {
        try {
            const operations = await OperationModel.findByUser(req.user.id);

            // ✅ sécurisation
            const operationsSafe = operations || [];

            const operation = operationsSafe.find(
                o => o.id === parseInt(req.params.id)
            );

            // ✅ gestion si non trouvé
            if (!operation) {
                return res.status(404).json({ error: 'Opération non trouvée' });
            }

            res.json({ operation });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur chargement opération' });
        }
    }
};

module.exports = operationController;