// Add recovery_code column to TiDB Cloud
require('dotenv').config();
const { createConnection } = require('../utils/db');

async function addRecoveryCodeColumn() {
  console.log('=== Adding recovery_code Column ===\n');
  
  const conn = await createConnection();
  
  try {
    // Check if column already exists
    const [columns] = await conn.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'recovery_code'
    `);
    
    if (columns.length > 0) {
      console.log('✓ Column recovery_code already exists');
      return;
    }
    
    // Add the column
    await conn.execute(`
      ALTER TABLE users 
      ADD COLUMN recovery_code VARCHAR(4) NULL AFTER password_hash
    `);
    
    console.log('✓ Column recovery_code added successfully');
    
  } catch (error) {
    console.error('Error adding column:', error.message);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
}

addRecoveryCodeColumn();
