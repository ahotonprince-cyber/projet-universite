const TontineModel = require('../../models/TontineModel');
const { query } = require('../../config/database');
const NotificationModel = require('../../models/NotificationModel');

const tontineController = {

    getAll: async (req, res) => {
        try {
            const { statut, periodicite } = req.query;
            const groupes = await TontineModel.findAllGroupes({ statut, periodicite });
            res.json({ groupes });
        } catch (error) {
            res.status(500).json({ error: 'Erreur chargement tontines' });
        }
    },

    getById: async (req, res) => {
        try {
            const groupe = await TontineModel.findGroupeById(req.params.id);
            if (!groupe) return res.status(404).json({ error: 'Tontine non trouvée' });
            res.json({ groupe });
        } catch (error) {
            res.status(500).json({ error: 'Erreur chargement tontine' });
        }
    },

    // ── Détail complet : groupe + membres avec cycle ─────────────
    getDetail: async (req, res) => {
        try {
            const { id } = req.params;
            const groupe = await TontineModel.findGroupeById(id);
            if (!groupe) return res.status(404).json({ error: 'Tontine non trouvée' });

            const membres = await query(
                `SELECT tm.id, tm.utilisateur_id, tm.statut as membre_statut,
                        tm.date_adhesion, tm.montant_total_paye,
                        tm.ordre_passage, tm.a_recu,
                        u.nom, u.prenom, u.email, u.telephone
                 FROM tontine_membre tm
                 JOIN utilisateurs u ON tm.utilisateur_id = u.id
                 WHERE tm.groupe_id = ?
                 ORDER BY tm.ordre_passage ASC, tm.date_adhesion ASC`,
                [id]
            );

            res.json({ groupe, membres: membres || [] });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur chargement détail tontine' });
        }
    },

    create: async (req, res) => {
        try {
            const { nom, montant_part, periodicite } = req.body;
            const id = await TontineModel.createGroupe({ nom, montant_part, periodicite });
            res.status(201).json({ success: true, id });
        } catch (error) {
            res.status(500).json({ error: 'Erreur création tontine' });
        }
    },

    update: async (req, res) => {
        try {
            await TontineModel.updateGroupe(req.params.id, req.body);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Erreur mise à jour tontine' });
        }
    },

    delete: async (req, res) => {
        try {
            await TontineModel.deleteGroupe(req.params.id);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Erreur suppression tontine' });
        }
    },

    getMembres: async (req, res) => {
        try {
            const membres = await TontineModel.getMembres(req.params.id);
            res.json({ membres });
        } catch (error) {
            res.status(500).json({ error: 'Erreur chargement membres' });
        }
    },

    ajouterMembre: async (req, res) => {
        try {
            const { utilisateur_id } = req.body;
            await TontineModel.ajouterMembre(req.params.id, utilisateur_id);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Erreur ajout membre' });
        }
    },

    retirerMembre: async (req, res) => {
        try {
            await query(
                'UPDATE tontine_membre SET statut = "inactif" WHERE id = ? AND groupe_id = ?',
                [req.params.membreId, req.params.id]
            );
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Erreur retrait membre' });
        }
    },

    // ── Assigner les ordres de passage ────────────────────────────
    // body: { ordres: [{membre_id, ordre}] }
    assignerOrdres: async (req, res) => {
        try {
            const { id } = req.params;
            const { ordres } = req.body;

            if (!Array.isArray(ordres) || ordres.length === 0) {
                return res.status(400).json({ error: 'ordres requis' });
            }

            for (const { membre_id, ordre } of ordres) {
                await query(
                    'UPDATE tontine_membre SET ordre_passage = ? WHERE id = ? AND groupe_id = ?',
                    [ordre || null, membre_id, id]
                );
            }

            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur assignation ordres' });
        }
    },

    // ── Valider le cycle actuel (bénéficiaire a reçu → avancer) ──
    validerCycle: async (req, res) => {
        try {
            const { id } = req.params;
            const groupe = await TontineModel.findGroupeById(id);

            if (!groupe) return res.status(404).json({ error: 'Tontine non trouvée' });
            if (groupe.statut === 'cloture') {
                return res.status(400).json({ error: 'Tontine déjà clôturée' });
            }

            const cycleActuel = groupe.cycle_actuel || 1;

            // Vérifier qu'un membre a ce numéro d'ordre
            const [beneficiaire] = await query(
                `SELECT tm.id, tm.utilisateur_id, u.prenom, u.nom
                 FROM tontine_membre tm
                 JOIN utilisateurs u ON tm.utilisateur_id = u.id
                 WHERE tm.groupe_id = ? AND tm.ordre_passage = ? AND tm.statut = 'actif'`,
                [id, cycleActuel]
            );

            if (!beneficiaire) {
                return res.status(400).json({
                    error: `Aucun membre avec l'ordre ${cycleActuel}. Assignez d'abord les ordres de passage.`
                });
            }

            // Marquer le bénéficiaire comme ayant reçu
            await query(
                'UPDATE tontine_membre SET a_recu = 1 WHERE groupe_id = ? AND ordre_passage = ?',
                [id, cycleActuel]
            );

            // Notifier le bénéficiaire actuel
            await NotificationModel.sendToUser(
                beneficiaire.utilisateur_id,
                '💰 Pot de tontine reçu',
                `Vous avez reçu le pot du cycle ${cycleActuel} du groupe "${groupe.nom}".`,
                'paiement'
            ).catch(() => {});

            const nouveauCycle = cycleActuel + 1;

            if (nouveauCycle > groupe.nombre_membres) {
                // Tous les membres ont reçu → clôturer
                await query(
                    "UPDATE tontine_groupe SET cycle_actuel = ?, statut = 'cloture', date_cloture = CURDATE() WHERE id = ?",
                    [nouveauCycle, id]
                );

                // Notifier tous les membres
                const membres = await query(
                    'SELECT utilisateur_id FROM tontine_membre WHERE groupe_id = ? AND statut = "actif"',
                    [id]
                );
                for (const m of membres) {
                    await NotificationModel.sendToUser(
                        m.utilisateur_id,
                        '🎉 Tontine terminée',
                        `La tontine "${groupe.nom}" est clôturée. Tous les membres ont reçu leur tour !`,
                        'paiement'
                    ).catch(() => {});
                }

                return res.json({ success: true, termine: true, message: 'Tontine clôturée avec succès !' });
            }

            // Avancer au cycle suivant
            await query('UPDATE tontine_groupe SET cycle_actuel = ? WHERE id = ?', [nouveauCycle, id]);

            // Notifier le prochain bénéficiaire
            const [prochain] = await query(
                `SELECT tm.utilisateur_id, u.prenom FROM tontine_membre tm
                 JOIN utilisateurs u ON tm.utilisateur_id = u.id
                 WHERE tm.groupe_id = ? AND tm.ordre_passage = ?`,
                [id, nouveauCycle]
            );
            if (prochain) {
                await NotificationModel.sendToUser(
                    prochain.utilisateur_id,
                    '🔔 Votre tour arrive !',
                    `C'est votre tour au cycle ${nouveauCycle} dans le groupe "${groupe.nom}". Préparez-vous à recevoir le pot !`,
                    'paiement'
                ).catch(() => {});
            }

            res.json({ success: true, termine: false, cycle_actuel: nouveauCycle });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur validation cycle : ' + error.message });
        }
    },

    getAllCotisations: async (req, res) => {
        try {
            const rows = await query(`
                SELECT tm.id as membre_id, tm.montant_total_paye, tm.date_adhesion,
                       tm.statut as membre_statut, tm.ordre_passage, tm.a_recu,
                       u.id as utilisateur_id, u.nom, u.prenom, u.email, u.telephone,
                       tg.id as groupe_id, tg.nom as groupe_nom, tg.montant_part,
                       tg.periodicite, tg.cycle_actuel, tg.nombre_membres
                FROM tontine_membre tm
                JOIN utilisateurs u  ON tm.utilisateur_id = u.id
                JOIN tontine_groupe tg ON tm.groupe_id = tg.id
                ORDER BY tg.nom, u.nom
            `);
            res.json({ cotisations: rows });
        } catch (error) {
            res.status(500).json({ error: 'Erreur chargement cotisations' });
        }
    },

    enregistrerCotisation: async (req, res) => {
        try {
            const { membre_id, montant } = req.body;

            if (!membre_id || !montant || montant <= 0) {
                return res.status(400).json({ error: 'membre_id et montant requis' });
            }

            await query(
                'UPDATE tontine_membre SET montant_total_paye = montant_total_paye + ? WHERE id = ?',
                [montant, membre_id]
            );

            const [membre] = await query(
                `SELECT tm.utilisateur_id, tg.nom as groupe_nom
                 FROM tontine_membre tm
                 JOIN tontine_groupe tg ON tm.groupe_id = tg.id
                 WHERE tm.id = ?`,
                [membre_id]
            );

            if (membre) {
                await NotificationModel.sendToUser(
                    membre.utilisateur_id,
                    '✅ Cotisation enregistrée',
                    `Votre cotisation de ${Number(montant).toLocaleString('fr-FR')} FCFA pour "${membre.groupe_nom}" a été enregistrée.`,
                    'paiement'
                ).catch(() => {});
            }

            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur enregistrement cotisation' });
        }
    }
};

module.exports = tontineController;
