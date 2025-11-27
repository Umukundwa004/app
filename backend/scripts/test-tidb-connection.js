// test-tidb-connection.js
const { createConnection } = require('../utils/db');

async function main() {
  let conn;
  try {
    conn = await createConnection();
    const [[now]] = await conn.query('SELECT NOW() AS now');
    const [[db]] = await conn.query('SELECT DATABASE() AS db');
    console.log('Connected. NOW() =', now.now, '| DATABASE() =', db.db);
  } catch (e) {
    console.error('Connection failed:', e.message);
    process.exitCode = 1;
  } finally {
    if (conn) await conn.end();
  }
}

main();
