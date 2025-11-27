// verify-tidb-data.js
// Verifies that expected data exists in the target database (TiDB or MySQL per env)
const { createConnection } = require('../utils/db');

async function main() {
  let conn;
  try {
    conn = await createConnection();

    const [[dbInfo]] = await conn.query('SELECT DATABASE() AS db');
    console.log('Connected to database:', dbInfo.db);

    const tables = ['users', 'restaurants', 'menu_items', 'reservations', 'restaurant_images'];
    for (const t of tables) {
      try {
        const [[row]] = await conn.query(`SELECT COUNT(*) AS cnt FROM ${t}`);
        console.log(`${t.padEnd(20)} -> ${row.cnt}`);
      } catch (e) {
        console.log(`${t.padEnd(20)} -> (missing) ${e.code || e.message}`);
      }
    }

    // Check for known records
    try {
      const [admins] = await conn.query(
        `SELECT email, user_type FROM users WHERE email IN ('admin@rwandaeats.com','admin@millecollines.rw','john@example.com') ORDER BY email`
      );
      console.log('\nKey users present:');
      admins.forEach(a => console.log(` - ${a.email} (${a.user_type})`));
      if (admins.length === 0) console.log(' - none found');
    } catch (e) {
      console.log('\nKey users check failed:', e.message);
    }

    console.log('\nDone.');
  } catch (e) {
    console.error('Verification failed:', e.message);
    process.exitCode = 1;
  } finally {
    if (conn) await conn.end();
  }
}

main();
