const { query } = require('../../config/database');

const typeCompteController = {
    getAll: async (req, res) => {
        try {
            const types = await query('SELECT * FROM type_compte WHERE actif = 1 ORDER BY id');
            res.json({ types });
        } catch (error) {
            res.status(500).json({ error: 'Erreur chargement types de compte' });
        }
    },
    
    create: async (req, res) => {
        try {
            const { nom, code, taux_interet, frais_tenue } = req.body;
            const result = await query(
                'INSERT INTO type_compte (nom, code, taux_interet, frais_tenue) VALUES (?, ?, ?, ?)',
                [nom, code, taux_interet || 0, frais_tenue || 0]
            );
            res.status(201).json({ success: true, id: result.insertId });
        } catch (error) {
            res.status(500).json({ error: 'Erreur création type de compte' });
        }
    },
    
    update: async (req, res) => {
        try {
            const { nom, code, taux_interet, frais_tenue, actif } = req.body;
            await query(
                'UPDATE type_compte SET nom = ?, code = ?, taux_interet = ?, frais_tenue = ?, actif = ? WHERE id = ?',
                [nom, code, taux_interet, frais_tenue, actif, req.params.id]
            );
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Erreur mise à jour type de compte' });
        }
    },
    
    delete: async (req, res) => {
        try {
            await query('DELETE FROM type_compte WHERE id = ?', [req.params.id]);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Erreur suppression type de compte' });
        }
    }
};

module.exports = typeCompteController;