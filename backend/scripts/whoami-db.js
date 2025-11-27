// whoami-db.js - Detects database vendor/version (TiDB vs MySQL)
const { createConnection } = require('../utils/db');

async function main() {
  let conn;
  try {
    conn = await createConnection();
    const [[dbName]] = await conn.query('SELECT DATABASE() AS db');
    const [[ver]] = await conn.query('SELECT @@version AS version, @@version_comment AS comment');
    let tidb = null;
    try {
      const [[t]] = await conn.query('SELECT tidb_version() AS tidb_version');
      tidb = t.tidb_version || null;
    } catch (_) {
      tidb = null; // Not TiDB or function unavailable
    }

    console.log('Database:', dbName.db);
    console.log('Version :', ver.version);
    console.log('Comment :', ver.comment);
    if (tidb) {
      console.log('TiDB    : YES');
      console.log('Details :', tidb);
    } else {
      console.log('TiDB    : NO');
    }
  } catch (e) {
    console.error('Error:', e.message);
    process.exitCode = 1;
  } finally {
    if (conn) await conn.end();
  }
}

main();
