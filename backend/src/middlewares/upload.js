const multer = require('multer');
const path = require('path');
const fs = require('fs');

const getDestination = (req, file) => {
    if (file.fieldname === 'avatar') {
        return path.join(__dirname, '../../uploads/avatars');
    }
    if (['cni_recto', 'cni_verso', 'justificatif_revenus', 'justificatif_domicile'].includes(file.fieldname)) {
        return path.join(__dirname, `../../uploads/kyc/${req.user.id}`);
    }
    return path.join(__dirname, '../../uploads/documents');
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = getDestination(req, file);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${unique}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non autorisé'), false);
    }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// ✅ UN SEUL module.exports
module.exports = {
    uploadSingle:   upload.single('file'),
    uploadAvatar:   upload.single('avatar'),
    uploadDocument: upload.single('document'),
    uploadMultiple: upload.array('documents', 5),
    uploadKYC: upload.fields([
        { name: 'cni_recto',                maxCount: 1 },
        { name: 'cni_verso',                maxCount: 1 },
        { name: 'justificatif_revenus',     maxCount: 1 },
        { name: 'justificatif_domicile',    maxCount: 1 }
    ])
};