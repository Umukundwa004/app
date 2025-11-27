// verify-tidb-sync.js
// Verify all essential data is in TiDB production database
require('dotenv').config();
const { createConnection } = require('../utils/db');

async function verifyTiDBSync() {
  console.log('=== Verifying TiDB Production Database ===\n');
  
  const conn = await createConnection();
  
  try {
    // Check users
    const [[userCount]] = await conn.execute('SELECT COUNT(*) as count FROM users');
    console.log(`✓ Users: ${userCount.count} accounts`);
    
    const [userTypes] = await conn.execute(`
      SELECT user_type, COUNT(*) as count 
      FROM users 
      GROUP BY user_type
    `);
    userTypes.forEach(ut => {
      console.log(`  - ${ut.user_type}: ${ut.count}`);
    });
    
    // Check restaurants
    const [[restCount]] = await conn.execute('SELECT COUNT(*) as count FROM restaurants WHERE is_active = TRUE');
    console.log(`\n✓ Active Restaurants: ${restCount.count}`);
    
    // Check menu items
    const [[menuCount]] = await conn.execute('SELECT COUNT(*) as count FROM menu_items');
    console.log(`✓ Menu Items: ${menuCount.count}`);
    
    // Check reservations
    const [[resCount]] = await conn.execute('SELECT COUNT(*) as count FROM reservations');
    console.log(`✓ Reservations: ${resCount.count}`);
    
    // Check user_favorites table exists
    try {
      const [[favCount]] = await conn.execute('SELECT COUNT(*) as count FROM user_favorites');
      console.log(`✓ User Favorites: ${favCount.count}`);
    } catch (err) {
      console.log(`⚠ User Favorites table missing - run: node backend/scripts/add-user-favorites-table.js`);
    }
    
    // Check for locked accounts
    const [[lockedCount]] = await conn.execute('SELECT COUNT(*) as count FROM users WHERE account_locked = TRUE');
    if (lockedCount.count > 0) {
      console.log(`\n⚠ WARNING: ${lockedCount.count} locked account(s) found`);
      const [locked] = await conn.execute('SELECT email, login_attempts FROM users WHERE account_locked = TRUE');
      locked.forEach(acc => {
        console.log(`  - ${acc.email} (${acc.login_attempts} failed attempts)`);
      });
      console.log(`  Run: node backend/scripts/unlock-all-accounts-tidb.js`);
    } else {
      console.log(`\n✓ No locked accounts`);
    }
    
    // Check email templates
    const [[emailCount]] = await conn.execute('SELECT COUNT(*) as count FROM email_templates');
    console.log(`✓ Email Templates: ${emailCount.count}`);
    
    // Check SMS templates
    const [[smsCount]] = await conn.execute('SELECT COUNT(*) as count FROM sms_templates');
    console.log(`✓ SMS Templates: ${smsCount.count}`);
    
    console.log('\n✅ TiDB verification complete!\n');
    
  } catch (error) {
    console.error('❌ Error verifying TiDB:', error.message);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
}

verifyTiDBSync();
