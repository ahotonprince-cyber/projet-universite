const UserModel = require('../../models/UserModel');
const { generateCreditNumber } = require('../../utils/generateNumber');
const { sendCompteApprouve, sendCompteRejete } = require('../../services/emailService');

const userController = {
    getAll: async (req, res) => {
        try {
            const { role, statut, search, limit } = req.query;
            const users = await UserModel.findAll({ role, statut, search, limit: limit ? parseInt(limit) : null });
            res.json({ utilisateurs: users });
        } catch (error) {
            console.error('❌ getAll error:', error);
            res.status(500).json({ error: 'Erreur chargement utilisateurs' });
        }
    },
    
    getById: async (req, res) => {
        try {
            const user = await UserModel.findById(req.params.id);
            if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
            res.json({ utilisateur: user });
        } catch (error) {
            console.error('❌ getById error:', error);
            res.status(500).json({ error: 'Erreur chargement utilisateur' });
        }
    },
    
    create: async (req, res) => {
        try {
            console.log('📥 create - Données reçues:', req.body);
            const { email, telephone } = req.body;
            const existingEmail = await UserModel.findByEmail(email);
            if (existingEmail) return res.status(409).json({ error: 'Email déjà utilisé' });
            
            const existingPhone = await UserModel.findByTelephone(telephone);
            if (existingPhone) return res.status(409).json({ error: 'Téléphone déjà utilisé' });
            
            const userId = await UserModel.create(req.body);
            const user = await UserModel.findById(userId);
            console.log('✅ Utilisateur créé:', userId);
            res.status(201).json({ success: true, utilisateur: user });
        } catch (error) {
            console.error('❌ create error:', error.message);
            console.error('📚 Stack:', error.stack);
            res.status(500).json({ error: 'Erreur création utilisateur: ' + error.message });
        }
    },
    
    update: async (req, res) => {
        try {
            await UserModel.update(req.params.id, req.body);
            res.json({ success: true });
        } catch (error) {
            console.error('❌ update error:', error);
            res.status(500).json({ error: 'Erreur mise à jour' });
        }
    },
    
    delete: async (req, res) => {
        try {
            await UserModel.delete(req.params.id);
            res.json({ success: true });
        } catch (error) {
            console.error('❌ delete error:', error);
            res.status(500).json({ error: 'Erreur suppression' });
        }
    },
    
    toggleStatut: async (req, res) => {
        try {
            const { statut, motif } = req.body;
            const statutsValides = ['actif', 'inactif', 'bloque', 'en_attente', 'rejete'];
            if (!statutsValides.includes(statut)) {
                return res.status(400).json({ error: 'Statut invalide' });
            }

            const user = await UserModel.findById(req.params.id);
            if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

            const ancienStatut = user.statut;

            // Déblocage admin : restaurer le statut d'avant le blocage (peut être en_attente)
            if (statut === 'actif' && ancienStatut === 'bloque') {
                await UserModel.debloquerCompte(req.params.id);
            } else {
                await UserModel.updateStatut(req.params.id, statut);
            }

            // Envoyer email selon la transition
            if (ancienStatut !== statut) {
                if (statut === 'actif' && ancienStatut === 'en_attente') {
                    sendCompteApprouve(user.email, user.prenom || user.nom)
                        .catch(e => console.error('[EMAIL] sendCompteApprouve:', e.message));
                } else if (statut === 'rejete') {
                    sendCompteRejete(user.email, user.prenom || user.nom, motif || null)
                        .catch(e => console.error('[EMAIL] sendCompteRejete:', e.message));
                }
            }

            res.json({ success: true });
        } catch (error) {
            console.error('❌ toggleStatut error:', error);
            res.status(500).json({ error: 'Erreur changement statut' });
        }
    },
    
    changeRole: async (req, res) => {
        try {
            const { role } = req.body;
            await UserModel.updateRole(req.params.id, role);
            res.json({ success: true });
        } catch (error) {
            console.error('❌ changeRole error:', error);
            res.status(500).json({ error: 'Erreur changement rôle' });
        }
    },
    
    getClients: async (req, res) => {
        try {
            const users = await UserModel.findAll({ role: 'client' });
            res.json({ clients: users });
        } catch (error) {
            console.error('❌ getClients error:', error);
            res.status(500).json({ error: 'Erreur chargement clients' });
        }
    },
    
    getClientById: async (req, res) => {
        try {
            const user = await UserModel.findById(req.params.id);
            if (!user || user.role !== 'client') return res.status(404).json({ error: 'Client non trouvé' });
            res.json({ client: user });
        } catch (error) {
            console.error('❌ getClientById error:', error);
            res.status(500).json({ error: 'Erreur chargement client' });
        }
    },
    
    createClient: async (req, res) => {
        try {
            console.log('📥 createClient - Données reçues:', JSON.stringify(req.body, null, 2));
            
            // Vérifier si email existe déjà
            const existingEmail = await UserModel.findByEmail(req.body.email);
            if (existingEmail) {
                console.log('⚠️ Email déjà utilisé:', req.body.email);
                return res.status(409).json({ error: 'Email déjà utilisé' });
            }
            
            // Vérifier si téléphone existe déjà
            const existingPhone = await UserModel.findByTelephone(req.body.telephone);
            if (existingPhone) {
                console.log('⚠️ Téléphone déjà utilisé:', req.body.telephone);
                return res.status(409).json({ error: 'Téléphone déjà utilisé' });
            }
            
            const userId = await UserModel.create({ ...req.body, role: 'client' });
            console.log('✅ Client créé avec ID:', userId);
            
            const user = await UserModel.findById(userId);
            res.status(201).json({ success: true, client: user });
        } catch (error) {
            console.error('❌ createClient error:', error.message);
            console.error('📚 Stack complet:', error.stack);
            res.status(500).json({ error: 'Erreur création client: ' + error.message });
        }
    },
    
    updateClient: async (req, res) => {
        try {
            console.log('📥 updateClient - ID:', req.params.id, 'Données:', req.body);
            await UserModel.update(req.params.id, req.body);
            res.json({ success: true });
        } catch (error) {
            console.error('❌ updateClient error:', error);
            res.status(500).json({ error: 'Erreur mise à jour client' });
        }
    },
    
    deleteClient: async (req, res) => {
        try {
            await UserModel.delete(req.params.id);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Erreur suppression client' });
        }
    },

    updateScore: async (req, res) => {
        try {
            const score = parseInt(req.body.score);
            if (isNaN(score) || score < 0 || score > 100) {
                return res.status(400).json({ error: 'Score invalide (0-100)' });
            }
            await UserModel.updateScoreCredit(req.params.id, score);
            res.json({ success: true, score });
        } catch (error) {
            res.status(500).json({ error: 'Erreur mise à jour score' });
        }
    },

    getClientStats: async (req, res) => {
        try {
            const { query: dbQuery } = require('../../config/database');
            const clientId = req.params.id;

            const [credits, echeances, operations, comptes] = await Promise.all([
                dbQuery(`SELECT * FROM credit WHERE utilisateur_id = ?`, [clientId]),
                dbQuery(`SELECT * FROM echeance e JOIN credit c ON e.credit_id = c.id WHERE c.utilisateur_id = ?`, [clientId]),
                dbQuery(`SELECT o.* FROM operation o JOIN compte_bancaire cb ON o.compte_id = cb.id WHERE cb.utilisateur_id = ? ORDER BY o.date_operation DESC LIMIT 20`, [clientId]),
                dbQuery(`SELECT cb.*, tc.nom as type_nom, tc.code as type_code FROM compte_bancaire cb JOIN type_compte tc ON cb.type_compte_id = tc.id WHERE cb.utilisateur_id = ?`, [clientId]),
            ]);

            const totalEmprunte   = credits.reduce((s, c) => s + parseFloat(c.montant_accorde || 0), 0);
            const totalRembourse  = credits.reduce((s, c) => s + parseFloat(c.montant_rembourse || 0), 0);
            const creditsActifs   = credits.filter(c => c.statut === 'actif').length;
            const creditsSoldes   = credits.filter(c => c.statut === 'solde').length;
            const echeancesRetard = echeances.filter(e => e.statut === 'en_retard').length;
            const totalDepots     = operations.filter(o => ['depot','depot_mobile'].includes(o.type_operation)).reduce((s, o) => s + parseFloat(o.montant || 0), 0);
            const totalRetraits   = operations.filter(o => ['retrait','retrait_mobile'].includes(o.type_operation)).reduce((s, o) => s + parseFloat(o.montant || 0), 0);

            res.json({
                stats: { totalEmprunte, totalRembourse, creditsActifs, creditsSoldes, totalCredits: credits.length, echeancesRetard, totalDepots, totalRetraits },
                comptes,
                recentOperations: operations.slice(0, 10),
                credits: credits.map(c => ({ ...c, statut: (!c.statut || c.statut === 'termine') ? 'solde' : c.statut }))
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur statistiques client' });
        }
    },

    demanderDocument: async (req, res) => {
        try {
            const { document_type, message } = req.body;
            const NotificationModel = require('../../models/NotificationModel');
            await NotificationModel.sendToUser(
                req.params.id,
                `Document requis : ${document_type}`,
                message || `Merci de déposer votre ${document_type} dans votre espace Documents.`,
                'alerte'
            );
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Erreur envoi demande' });
        }
    }
};

module.exports = userController;