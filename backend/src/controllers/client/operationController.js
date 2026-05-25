const OperationModel = require('../../models/OperationModel');

const operationController = {

    getOperations: async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 50;

            const operations = await OperationModel.findByUser(req.user.id, { limit });

            // ✅ sécurisation
            res.json({
                operations: operations || []
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur chargement opérations' });
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