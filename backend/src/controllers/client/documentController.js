const multer = require('multer');
const path = require('path');
const fs = require('fs');
const DocumentModel = require('../../models/DocumentModel');

// Configuration multer pour l'upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../../uploads/documents');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `doc-${req.user.id}-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non autorisé'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilter
});

const documentController = {
    getDocuments: async (req, res) => {
        try {
            const documents = await DocumentModel.findByUser(req.user.id);
            res.json({ documents: documents || [] });
        } catch (error) {
            console.error('❌ getDocuments error:', error);
            res.status(500).json({ error: 'Erreur chargement documents' });
        }
    },

    uploadDocument: async (req, res) => {
        const uploadSingle = upload.single('document');
        
        uploadSingle(req, res, async (err) => {
            if (err) {
                console.error('❌ Upload error:', err);
                return res.status(400).json({ error: err.message });
            }

            if (!req.file) {
                return res.status(400).json({ error: 'Aucun fichier uploadé' });
            }

            try {
                const documentData = {
                    utilisateur_id: req.user.id,
                    nom: req.file.originalname,
                    type: path.extname(req.file.originalname).substring(1).toUpperCase(),
                    url_fichier: `/uploads/documents/${req.file.filename}`,
                    statut: 'en_attente'
                };

                const documentId = await DocumentModel.create(documentData);
                
                res.status(201).json({ 
                    success: true, 
                    document: { id: documentId, ...documentData }
                });
            } catch (error) {
                console.error('❌ Save document error:', error);
                res.status(500).json({ error: 'Erreur sauvegarde document' });
            }
        });
    },

    deleteDocument: async (req, res) => {
        try {
            const document = await DocumentModel.findById(req.params.id);
            
            if (!document || document.utilisateur_id !== req.user.id) {
                return res.status(404).json({ error: 'Document non trouvé' });
            }

            // Supprimer le fichier physique
            const filePath = path.join(__dirname, '../../..', document.url_fichier);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            await DocumentModel.delete(req.params.id);
            
            res.json({ success: true });
        } catch (error) {
            console.error('❌ deleteDocument error:', error);
            res.status(500).json({ error: 'Erreur suppression document' });
        }
    }
};

module.exports = documentController;