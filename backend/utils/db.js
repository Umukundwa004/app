require('dotenv').config();
const mysql = require('mysql2/promise');

function isTiDB() {
  const host = process.env.DB_HOST || '';
  const port = process.env.DB_PORT || '';
  const url = process.env.DATABASE_URL || '';
  return host.includes('tidbcloud.com') || url.includes('tidbcloud.com') || port === '4000';
}

function sslConfig() {
  if (process.env.DB_SSL === 'true' || isTiDB()) {
    return { minVersion: 'TLSv1.2', rejectUnauthorized: true };
  }
  return undefined;
}

function getDiscreteConfig() {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : (isTiDB() ? 4000 : 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rwanda_eats_reserve',
    ssl: sslConfig(),
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONN_LIMIT || '10', 10),
    queueLimit: 0
  };
}

async function createPool() {
  if (process.env.DATABASE_URL) {
    return mysql.createPool(process.env.DATABASE_URL, {
      ssl: sslConfig(),
      waitForConnections: true,
      connectionLimit: parseInt(process.env.DB_CONN_LIMIT || '10', 10),
      queueLimit: 0
    });
  }
  return mysql.createPool(getDiscreteConfig());
}

async function createConnection() {
  if (process.env.DATABASE_URL) {
    return mysql.createConnection(process.env.DATABASE_URL + (isTiDB() ? '?ssl=true' : ''), {
      ssl: sslConfig()
    });
  }
  return mysql.createConnection(getDiscreteConfig());
}

module.exports = {
  createPool,
  createConnection,
  getConfig: getDiscreteConfig
};
