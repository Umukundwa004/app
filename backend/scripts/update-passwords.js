// scripts/update-passwords.js - Reset demo account passwords to known values
// WARNING: This script contains demo credentials and should NOT be used in production
// Use the password recovery functionality instead
const { createConnection } = require('../utils/db');
const bcrypt = require('bcryptjs');

async function run() {
  let connection;
  try {
    connection = await createConnection();

    console.log('Connected to DB');
    console.log('\n⚠️  WARNING: This script is for development only.');
    console.log('For production, use the password recovery functionality.');
    console.log('\nNo updates performed. Exiting...');
    
    // Demo code removed for security
    // Use password recovery via the web interface instead

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

run();
