// scripts/update-passwords.js - Reset demo account passwords to known values
const { createConnection } = require('../utils/db');
const bcrypt = require('bcryptjs');

async function run() {
  let connection;
  try {
    connection = await createConnection();

    console.log('Connected to DB');

    const updates = [
      { email: 'admin@rwandaeats.com', password: 'admin123' },
      { email: 'admin@millecollines.rw', password: 'restaurant123' },
      { email: 'admin@heaven.rw', password: 'restaurant123' },
      { email: 'admin@thehut.rw', password: 'restaurant123' },
      { email: 'john@example.com', password: 'customer123' },
      { email: 'jane@example.com', password: 'customer123' }
    ];

    for (const u of updates) {
      const hash = await bcrypt.hash(u.password, 12);
      await connection.execute('UPDATE users SET password_hash = ?, login_attempts = 0, account_locked = 0 WHERE email = ?', [hash, u.email]);
      console.log(`Updated ${u.email}`);
    }

    console.log('All demo passwords reset.');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

run();
