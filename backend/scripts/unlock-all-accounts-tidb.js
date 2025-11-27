// unlock-all-accounts-tidb.js
// Script to unlock all locked accounts in TiDB production database
require('dotenv').config();
const { createConnection } = require('../utils/db');

async function unlockAllAccounts() {
  console.log('=== Unlocking All Locked Accounts in TiDB ===\n');
  
  const conn = await createConnection();
  
  try {
    // Check for locked accounts
    const [lockedAccounts] = await conn.execute(`
      SELECT id, email, name, user_type, login_attempts, account_locked 
      FROM users 
      WHERE account_locked = TRUE
    `);
    
    if (lockedAccounts.length === 0) {
      console.log('✓ No locked accounts found');
      return;
    }
    
    console.log(`Found ${lockedAccounts.length} locked account(s):\n`);
    lockedAccounts.forEach(acc => {
      console.log(`  - ${acc.email} (${acc.user_type}) - ${acc.login_attempts} failed attempts`);
    });
    
    // Unlock all accounts and reset login attempts
    const [result] = await conn.execute(`
      UPDATE users 
      SET account_locked = FALSE, login_attempts = 0 
      WHERE account_locked = TRUE
    `);
    
    console.log(`\n✓ Unlocked ${result.affectedRows} account(s) successfully`);
    console.log('✓ Reset all login attempt counters to 0\n');
    
  } catch (error) {
    console.error('❌ Error unlocking accounts:', error.message);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
}

unlockAllAccounts();
