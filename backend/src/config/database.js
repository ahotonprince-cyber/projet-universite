const mysql = require('mysql2/promise');
require('dotenv').config();

let pool = null;

const initializePool = () => {
    if (!pool) {
        pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'cowec_microfinance',
            waitForConnections: true,
            connectionLimit: parseInt(process.env.DB_POOL_LIMIT) || 10,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
            dateStrings: true,
            timezone: '+00:00'
        });
        console.log('✅ Database connection pool initialized');
    }
    return pool;
};

const query = async (sql, params = []) => {
    const pool = initializePool();
    const [rows] = await pool.execute(sql, params);
    return rows;
};

const transaction = async (callback) => {
    const pool = initializePool();
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = { initializePool, query, transaction, get pool() { return initializePool(); } };