// Update admin passwords to secure values
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { createConnection } = require('../utils/db');

async function updateAdminPasswords() {
  console.log('=== Updating Admin Passwords ===\n');
  
  const conn = await createConnection();
  
  try {
    // Generate strong passwords
    const systemAdminPassword = 'RwandaEats@2025!Secure';
    const restaurantAdminPassword = 'MilleCollines@2025!Admin';
    
    // Hash the passwords
    const systemAdminHash = await bcrypt.hash(systemAdminPassword, 12);
    const restaurantAdminHash = await bcrypt.hash(restaurantAdminPassword, 12);
    
    // Update system admin password
    await conn.execute(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [systemAdminHash, 'admin@rwandaeats.com']
    );
    console.log('✓ Updated system admin password');
    console.log('  Email: admin@rwandaeats.com');
    console.log(`  New Password: ${systemAdminPassword}`);
    console.log('');
    
    // Update restaurant admin password
    await conn.execute(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [restaurantAdminHash, 'admin@millecollines.rw']
    );
    console.log('✓ Updated restaurant admin password');
    console.log('  Email: admin@millecollines.rw');
    console.log(`  New Password: ${restaurantAdminPassword}`);
    console.log('');
    
    // Also update customer password for testing
    const customerPassword = 'Customer@2025!Secure';
    const customerHash = await bcrypt.hash(customerPassword, 12);
    await conn.execute(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [customerHash, 'john@example.com']
    );
    console.log('✓ Updated customer test account password');
    console.log('  Email: john@example.com');
    console.log(`  New Password: ${customerPassword}`);
    console.log('');
    
    console.log('=== Password Update Summary ===');
    console.log('All passwords have been updated to secure values.');
    console.log('Please save these credentials in a secure location.');
    console.log('');
    console.log('IMPORTANT: Update these passwords in TiDB Cloud too!');
    console.log('Run this script with TiDB Cloud credentials:');
    console.log('  $env:DB_HOST = "gateway01.eu-central-1.prod.aws.tidbcloud.com"');
    console.log('  $env:DB_PORT = "4000"');
    console.log('  node backend/scripts/update-secure-passwords.js');
    
  } catch (error) {
    console.error('Error updating passwords:', error);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
}

updateAdminPasswords();
