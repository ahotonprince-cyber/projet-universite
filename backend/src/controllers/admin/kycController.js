const { query, transaction } = require('../../config/database');
const NotificationModel = require('../../models/NotificationModel');
const { sendCompteApprouve, sendCompteRejete } = require('../../services/emailService');
const path = require('path');
const fs = require('fs');

const kycController = {

    // ─── ADMIN : Liste tous les dossiers KYC ───────────────────────────
    getDossiers: async (req, res) => {
        try {
            const { statut } = req.query;
            let sql = `
                SELECT 
                    k.id, k.statut, k.commentaire_admin, k.soumis_le, k.traite_le,
                    u.id as utilisateur_id, u.nom, u.prenom, u.email, u.telephone,
                    COUNT(d.id) as nb_documents,
                    SUM(CASE WHEN d.statut = 'valide' THEN 1 ELSE 0 END) as docs_valides
                FROM kyc_dossiers k
                JOIN utilisateurs u ON k.utilisateur_id = u.id
                LEFT JOIN document d ON d.utilisateur_id = u.id
                WHERE 1=1
            `;
            const params = [];

            if (statut && statut !== 'all') {
                sql += ' AND k.statut = ?';
                params.push(statut);
            }

            sql += ' GROUP BY k.id ORDER BY k.soumis_le DESC';

            const dossiers = await query(sql, params);
            res.json({ dossiers: dossiers || [] });
        } catch (error) {
            console.error('❌ getDossiers error:', error);
            res.status(500).json({ error: 'Erreur chargement dossiers KYC' });
        }
    },

    // ─── ADMIN : Détail d'un dossier avec ses documents ───────────────
    getDossierByUser: async (req, res) => {
        try {
            const { userId } = req.params;

            const [utilisateur] = await query(
                'SELECT id, nom, prenom, email, telephone, statut, profession, adresse FROM utilisateurs WHERE id = ?',
                [userId]
            );

            if (!utilisateur) return res.status(404).json({ error: 'Utilisateur non trouvé' });

            const documents = await query(
                'SELECT * FROM document WHERE utilisateur_id = ? ORDER BY date_upload DESC',
                [userId]
            );

            const [dossier] = await query(
                'SELECT * FROM kyc_dossiers WHERE utilisateur_id = ?',
                [userId]
            );

            res.json({ utilisateur, documents: documents || [], dossier: dossier || null });
        } catch (error) {
            console.error('❌ getDossierByUser error:', error);
            res.status(500).json({ error: 'Erreur chargement dossier' });
        }
    },

    // ─── ADMIN : Nombre de dossiers en attente (pour badge sidebar) ───
    getPendingCount: async (req, res) => {
        try {
            const [result] = await query(
                "SELECT COUNT(*) as count FROM kyc_dossiers WHERE statut = 'en_attente'"
            );
            res.json({ count: result.count || 0 });
        } catch (error) {
            console.error('❌ getPendingCount error:', error);
            res.status(500).json({ error: 'Erreur comptage dossiers' });
        }
    },

    // ─── ADMIN : Approuver ou rejeter un dossier ──────────────────────
    traiterDossier: async (req, res) => {
        try {
            const { userId } = req.params;
            const { statut, commentaire } = req.body; // statut = 'approuve' ou 'rejete'

            if (!['approuve', 'rejete'].includes(statut)) {
                return res.status(400).json({ error: 'Statut invalide. Valeurs acceptées: approuve, rejete' });
            }

            await transaction(async (conn) => {
                // 1. Mettre à jour le dossier KYC
                await conn.execute(
                    `UPDATE kyc_dossiers 
                     SET statut = ?, commentaire_admin = ?, traite_le = NOW(), traite_par = ?
                     WHERE utilisateur_id = ?`,
                    [statut, commentaire || null, req.user.id, userId]
                );

                // 2. Mettre à jour le statut de l'utilisateur
                const nouveauStatutUser = statut === 'approuve' ? 'actif' : 'rejete';
                await conn.execute(
                    'UPDATE utilisateurs SET statut = ? WHERE id = ?',
                    [nouveauStatutUser, userId]
                );

                // 3. Si approuvé → valider tous ses documents
                if (statut === 'approuve') {
                    await conn.execute(
                        `UPDATE document SET statut = 'valide', date_validation = NOW(), valide_par = ?
                         WHERE utilisateur_id = ? AND statut = 'en_attente'`,
                        [req.user.id, userId]
                    );
                }
            });

            // 4. Notifications in-app + email au client
            try {
                const [utilisateur] = await query(
                    'SELECT email, prenom, nom FROM utilisateurs WHERE id = ?',
                    [userId]
                );
                const prenom = utilisateur?.prenom || utilisateur?.nom || 'Client';
                const email = utilisateur?.email;

                if (statut === 'approuve') {
                    await NotificationModel.sendToUser(
                        userId,
                        '✅ Compte activé !',
                        'Votre dossier a été validé. Vous avez maintenant accès à tous les services COWEC.',
                        'validation'
                    );
                    if (email) sendCompteApprouve(email, prenom).catch(() => {});
                } else {
                    await NotificationModel.sendToUser(
                        userId,
                        '❌ Dossier rejeté',
                        commentaire || 'Votre dossier a été rejeté. Contactez le support pour plus d\'informations.',
                        'validation'
                    );
                    if (email) sendCompteRejete(email, prenom, commentaire).catch(() => {});
                }
            } catch (notifErr) {
                console.error('⚠️ Erreur notification (non bloquante):', notifErr.message);
            }

            res.json({ success: true, message: `Dossier ${statut} avec succès` });
        } catch (error) {
            console.error('❌ traiterDossier error:', error);
            res.status(500).json({ error: 'Erreur traitement dossier: ' + error.message });
        }
    },

    // ─── ADMIN : Valider/rejeter un document individuel ───────────────
    validerDocument: async (req, res) => {
        try {
            const { id } = req.params;
            const { statut, motif_rejet } = req.body;

            await query(
                `UPDATE document 
                 SET statut = ?, date_validation = NOW(), valide_par = ?, motif_rejet = ?
                 WHERE id = ?`,
                [statut, req.user.id, motif_rejet || null, id]
            );

            // Bonus score crédit si document validé
            if (statut === 'valide') {
                const docs = await query('SELECT utilisateur_id FROM document WHERE id = ?', [id]);
                if (docs[0]) {
                    const [docsValides] = await query(
                        'SELECT COUNT(*) as count FROM document WHERE utilisateur_id = ? AND statut = "valide"',
                        [docs[0].utilisateur_id]
                    );
                    if (docsValides.count >= 2) {
                        await query(
                            'UPDATE utilisateurs SET score_credit = LEAST(100, score_credit + 10) WHERE id = ?',
                            [docs[0].utilisateur_id]
                        );
                    }
                }
            }

            res.json({ success: true });
        } catch (error) {
            console.error('❌ validerDocument error:', error);
            res.status(500).json({ error: 'Erreur validation document' });
        }
    },

    // ─── CLIENT : Upload de documents ─────────────────────────────────
    uploadDocuments: async (req, res) => {
        try {
            const utilisateur_id = req.user.id;
            const files = req.files; // multer

            if (!files || Object.keys(files).length === 0) {
                return res.status(400).json({ error: 'Aucun fichier reçu' });
            }

            const typesAcceptes = ['cni_recto', 'cni_verso', 'justificatif_revenus', 'justificatif_domicile'];

            await transaction(async (conn) => {
                for (const type of typesAcceptes) {
                    if (files[type] && files[type][0]) {
                        const file = files[type][0];

                        // Supprimer l'ancien document du même type s'il existe
                        await conn.execute(
                            'DELETE FROM document WHERE utilisateur_id = ? AND type = ?',
                            [utilisateur_id, type]
                        );

                        // Insérer le nouveau document
                        await conn.execute(
                            `INSERT INTO document (utilisateur_id, nom, type, url_fichier, statut)
                             VALUES (?, ?, ?, ?, 'en_attente')`,
                            [utilisateur_id, file.originalname, type, `/uploads/kyc/${utilisateur_id}/${file.filename}`]
                        );
                    }
                }

                // Créer ou mettre à jour le dossier KYC
                const [dossierExistant] = await conn.execute(
                    'SELECT id FROM kyc_dossiers WHERE utilisateur_id = ?',
                    [utilisateur_id]
                );

                if (dossierExistant.length > 0) {
                    await conn.execute(
                        `UPDATE kyc_dossiers 
                         SET statut = 'en_attente', soumis_le = NOW(), commentaire_admin = NULL
                         WHERE utilisateur_id = ?`,
                        [utilisateur_id]
                    );
                } else {
                    await conn.execute(
                        'INSERT INTO kyc_dossiers (utilisateur_id, statut) VALUES (?, "en_attente")',
                        [utilisateur_id]
                    );
                }
            });

            // Notifier les admins
            try {
                await NotificationModel.sendToAdmins(
                    '📁 Nouveau dossier KYC',
                    `Un client a soumis ses documents pour validation.`,
                    'validation'
                );
            } catch (e) {
                console.error('⚠️ Erreur notification admins:', e.message);
            }

            res.json({ success: true, message: 'Documents envoyés avec succès' });
        } catch (error) {
            console.error('❌ uploadDocuments error:', error);
            res.status(500).json({ error: 'Erreur upload documents: ' + error.message });
        }
    },

    // ─── CLIENT : Upload d'un document unique suite à demande admin ──
    uploadDocumentUnique: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Aucun fichier reçu' });
            }
            const utilisateur_id = req.user.id;
            const type = req.body.type;
            const typesValides = ['cni_recto', 'cni_verso', 'justificatif_revenus', 'justificatif_domicile', 'autre'];
            if (!type || !typesValides.includes(type)) {
                return res.status(400).json({ error: 'Type de document invalide' });
            }

            const urlFichier = `/uploads/documents/${req.file.filename}`;

            await query(
                `INSERT INTO document (utilisateur_id, nom, type, url_fichier, statut)
                 VALUES (?, ?, ?, ?, 'en_attente')
                 ON DUPLICATE KEY UPDATE nom = VALUES(nom), url_fichier = VALUES(url_fichier), statut = 'en_attente'`,
                [utilisateur_id, req.file.originalname, type, urlFichier]
            );

            try {
                await NotificationModel.sendToAdmins(
                    '📎 Nouveau document soumis',
                    `Un client a soumis un document suite à une demande : ${type.replace(/_/g, ' ')}.`,
                    'document'
                );
            } catch (e) { console.error('⚠️ Erreur notification:', e.message); }

            res.json({ success: true, message: 'Document envoyé avec succès' });
        } catch (error) {
            console.error('❌ uploadDocumentUnique error:', error);
            res.status(500).json({ error: 'Erreur upload: ' + error.message });
        }
    },

    // ─── CLIENT : Voir ses propres documents ──────────────────────────
    getMesDocuments: async (req, res) => {
        try {
            const documents = await query(
                'SELECT * FROM document WHERE utilisateur_id = ? ORDER BY date_upload DESC',
                [req.user.id]
            );

            const [dossier] = await query(
                'SELECT * FROM kyc_dossiers WHERE utilisateur_id = ?',
                [req.user.id]
            );

            res.json({ documents: documents || [], dossier: dossier || null });
        } catch (error) {
            console.error('❌ getMesDocuments error:', error);
            res.status(500).json({ error: 'Erreur chargement documents' });
        }
    },

    // ─── ADMIN : Ancienne méthode conservée pour compatibilité ────────
    getDocuments: async (req, res) => {
        try {
            const documents = await query(`
                SELECT d.*, u.nom, u.prenom, u.email 
                FROM document d
                JOIN utilisateurs u ON d.utilisateur_id = u.id
                ORDER BY d.date_upload DESC
            `);
            res.json({ documents: documents || [] });
        } catch (error) {
            console.error('❌ getDocuments error:', error);
            res.status(500).json({ error: 'Erreur chargement documents' });
        }
    }
};

module.exports = kycController;