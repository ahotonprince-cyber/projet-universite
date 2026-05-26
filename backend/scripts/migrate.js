const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function migrate() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'cowec_microfinance',
        multipleStatements: true,
    });

    console.log('✅ Connexion MySQL OK');

    const files = [
        'cowec_microfinance.sql',
        'migration_produit_credit.sql',
        'migration_statut_solde.sql',
        'migration_blocage_compte.sql',
        'migration_kyc_dossiers.sql',
        'migration_tontine_cycles.sql',
        'migration_support_tickets.sql',
        'migration_statut_avant_blocage.sql',
        'migration_statut_utilisateur.sql',
    ];

    for (const file of files) {
        const filePath = path.join(__dirname, file);
        if (!fs.existsSync(filePath)) continue;

        let sql = fs.readFileSync(filePath, 'utf8');
        // Supprimer CREATE DATABASE et USE car Railway gère déjà la DB
        sql = sql.replace(/CREATE DATABASE.*?;/gis, '');
        sql = sql.replace(/USE\s+`?\w+`?\s*;/gi, '');

        try {
            await conn.query(sql);
            console.log(`✅ ${file} executé`);
        } catch (e) {
            // Table déjà existante ou colonne déjà ajoutée = migration déjà appliquée
            if (e.code === 'ER_TABLE_EXISTS_ERROR' || e.errno === 1050 ||
                e.code === 'ER_DUP_FIELDNAME'     || e.errno === 1060) {
                console.log(`⏭  ${file} déjà appliqué`);
            } else {
                console.error(`❌ Erreur ${file}:`, e.message);
            }
        }
    }

    await conn.end();
    console.log('✅ Migrations terminées');
}

migrate().catch(err => {
    console.error('❌ Migration échouée:', err.message);
    // Ne pas bloquer le démarrage du serveur
    process.exit(0);
});
