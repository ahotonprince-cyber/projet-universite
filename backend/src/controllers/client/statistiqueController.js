const CreditModel = require('../../models/CreditModel');
const OperationModel = require('../../models/OperationModel');

const statistiqueController = {

    getStats: async (req, res) => {
        try {
            const credits = (await CreditModel.findByUser(req.user.id)) || [];
            const operations = (await OperationModel.findByUser(req.user.id)) || [];

            const total_emprunte = credits.reduce(
                (sum, c) => sum + (c.montant_accorde || 0),
                0
            );

            const total_rembourse = credits.reduce(
                (sum, c) => sum + (c.montant_rembourse || 0),
                0
            );

            const credits_actifs = credits.filter(
                c => c.statut === 'actif'
            ).length;

            res.json({
                total_emprunte,
                total_rembourse,
                credits_actifs,
                total_operations: operations.length
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur chargement statistiques' });
        }
    },

    getRevenusByOperateur: async (req, res) => {
        try {
            const operations = (await OperationModel.findByUser(req.user.id)) || [];

            const revenus = {};

            operations.forEach(op => {
                const description = op.description || '';

                const operateur =
                    description.match(/MTN|Moov|Wave/)?.[0] || 'Autre';

                if (!revenus[operateur]) {
                    revenus[operateur] = {
                        total_depot: 0,
                        total_retrait: 0
                    };
                }

                if (op.type_operation === 'depot') {
                    revenus[operateur].total_depot += parseFloat(op.montant) || 0;
                }

                if (op.type_operation === 'retrait') {
                    revenus[operateur].total_retrait += parseFloat(op.montant) || 0;
                }
            });

            const revenusArray = Object.entries(revenus).map(
                ([operateur, data]) => ({
                    operateur,
                    ...data
                })
            );

            res.json({ revenus: revenusArray });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur chargement revenus' });
        }
    }
};

module.exports = statistiqueController;