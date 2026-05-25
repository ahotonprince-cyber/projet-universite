const TontineModel = require('../../models/TontineModel');
const { query } = require('../../config/database');
const NotificationModel = require('../../models/NotificationModel');
const OperationModel = require('../../models/OperationModel');
const CompteModel = require('../../models/CompteModel');
const { generateTransactionReference } = require('../../utils/generateNumber');

const tontineController = {

    getMesGroupes: async (req, res) => {
        try {
            const groupes = await TontineModel.getMesGroupes(req.user.id);
            res.json({ groupes: groupes || [] });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur chargement mes groupes' });
        }
    },

    // ✅ Tous les groupes actifs (pour rejoindre)
    getTousGroupes: async (req, res) => {
        try {
            const groupes = await query(
                `SELECT tg.*, 
                        tm.statut as mon_statut,
                        tm.montant_total_paye as mon_total_paye
                 FROM tontine_groupe tg
                 LEFT JOIN tontine_membre tm 
                    ON tg.id = tm.groupe_id AND tm.utilisateur_id = ?
                 WHERE tg.statut = 'actif'
                 ORDER BY tg.date_creation DESC`,
                [req.user.id]
            );
            res.json({ groupes: groupes || [] });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur chargement groupes' });
        }
    },

    // ✅ Cycles — retourne les groupes avec périodicité et infos de tour
    getCycles: async (req, res) => {
        try {
            const cycles = await query(
                `SELECT tg.id, tg.nom, tg.montant_part, tg.periodicite,
                        tg.nombre_membres, tg.statut, tg.cycle_actuel,
                        tm.id as membre_id, tm.date_adhesion, tm.montant_total_paye,
                        tm.ordre_passage, tm.a_recu
                 FROM tontine_groupe tg
                 JOIN tontine_membre tm ON tg.id = tm.groupe_id
                 WHERE tm.utilisateur_id = ? AND tm.statut = 'actif'
                 ORDER BY tg.periodicite, tg.nom`,
                [req.user.id]
            );
            res.json({ cycles: cycles || [] });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur chargement cycles' });
        }
    },

    getGroupeDetails: async (req, res) => {
        try {
            const groupe = await TontineModel.findGroupeById(req.params.id);
            const membres = await TontineModel.getMembres(req.params.id);
            if (!groupe) return res.status(404).json({ error: 'Groupe non trouvé' });
            res.json({ groupe, membres: membres || [] });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur chargement groupe' });
        }
    },

    adherer: async (req, res) => {
        try {
            // Vérifier si déjà membre
            const dejaMembre = await query(
                'SELECT id FROM tontine_membre WHERE groupe_id = ? AND utilisateur_id = ?',
                [req.params.id, req.user.id]
            );
            if (dejaMembre.length > 0) {
                return res.status(409).json({ error: 'Vous êtes déjà membre de ce groupe' });
            }

            await TontineModel.ajouterMembre(req.params.id, req.user.id);
            res.json({ success: true, message: 'Adhésion réussie !' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur adhésion' });
        }
    },

    payerCotisation: async (req, res) => {
        try {
            const { groupeId } = req.params;
            const { operateur, telephone, montant } = req.body;

            if (!operateur || !telephone || !montant || montant <= 0) {
                return res.status(400).json({ error: 'operateur, telephone et montant requis' });
            }

            // Vérifier que le client est bien membre actif du groupe
            const [membre] = await query(
                `SELECT tm.id, tm.montant_total_paye, tg.nom as groupe_nom, tg.montant_part, tg.statut
                 FROM tontine_membre tm
                 JOIN tontine_groupe tg ON tm.groupe_id = tg.id
                 WHERE tm.groupe_id = ? AND tm.utilisateur_id = ? AND tm.statut = 'actif'`,
                [groupeId, req.user.id]
            );

            if (!membre) {
                return res.status(404).json({ error: 'Vous n\'êtes pas membre actif de ce groupe' });
            }

            if (membre.statut === 'cloture') {
                return res.status(400).json({ error: 'Cette tontine est clôturée' });
            }

            // Mettre à jour le montant total payé
            await query(
                'UPDATE tontine_membre SET montant_total_paye = montant_total_paye + ? WHERE id = ?',
                [montant, membre.id]
            );

            // Créer une opération pour traçabilité (sur le compte TONTINE ou COURANT)
            try {
                const comptes = await CompteModel.findByUser(req.user.id);
                const compte = comptes?.find(c => c.type_code === 'TONTINE') || comptes?.find(c => c.type_code === 'COURANT');
                if (compte) {
                    await OperationModel.create(
                        compte.id,
                        'cotisation_tontine',
                        montant,
                        `Cotisation tontine "${membre.groupe_nom}" via ${operateur.toUpperCase()}`,
                        generateTransactionReference()
                    );
                }
            } catch (_) {}

            // Notifier les admins
            await NotificationModel.sendToAdmins(
                '💰 Cotisation tontine reçue',
                `Un membre a payé ${Number(montant).toLocaleString('fr-FR')} FCFA pour le groupe "${membre.groupe_nom}" via ${operateur.toUpperCase()}.`,
                'paiement'
            ).catch(() => {});

            // Confirmer au client
            await NotificationModel.sendToUser(
                req.user.id,
                '✅ Cotisation enregistrée',
                `Votre cotisation de ${Number(montant).toLocaleString('fr-FR')} FCFA pour "${membre.groupe_nom}" a été enregistrée.`,
                'paiement'
            ).catch(() => {});

            res.json({ success: true, message: `Cotisation de ${Number(montant).toLocaleString('fr-FR')} FCFA enregistrée avec succès.` });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur paiement cotisation : ' + error.message });
        }
    },

    getMesCotisations: async (req, res) => {
        try {
            const cotisations = await query(
                `SELECT tm.id, tm.date_adhesion, tm.statut, tm.montant_total_paye,
                        tm.ordre_passage, tm.a_recu,
                        tg.nom as groupe_nom, tg.montant_part, tg.periodicite,
                        tg.nombre_membres, tg.cycle_actuel
                 FROM tontine_membre tm
                 JOIN tontine_groupe tg ON tm.groupe_id = tg.id
                 WHERE tm.utilisateur_id = ?
                 ORDER BY tm.date_adhesion DESC`,
                [req.user.id]
            );
            res.json({ cotisations: cotisations || [] });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur chargement cotisations' });
        }
    }
};

module.exports = tontineController;