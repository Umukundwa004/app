// Verify users table structure in production database
require('dotenv').config();
const { createConnection } = require('../utils/db');

async function verifyUsersTable() {
  console.log('=== Verifying Users Table Structure ===\n');
  
  const conn = await createConnection();
  
  try {
    // Show current database
    const [dbResult] = await conn.execute('SELECT DATABASE() as db');
    console.log('📌 Connected to database:', dbResult[0].db);
    
    // Get all columns in users table
    const [columns] = await conn.execute(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('\n📋 Users table columns:');
    console.log('─'.repeat(80));
    columns.forEach(col => {
      console.log(`${col.COLUMN_NAME.padEnd(30)} ${col.COLUMN_TYPE.padEnd(20)} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log('─'.repeat(80));
    
    // Check specifically for recovery_code
    const hasRecoveryCode = columns.some(col => col.COLUMN_NAME === 'recovery_code');
    console.log('\n🔍 recovery_code column exists:', hasRecoveryCode ? '✅ YES' : '❌ NO');
    
    if (!hasRecoveryCode) {
      console.log('\n⚠️  Adding recovery_code column...');
      await conn.execute(`
        ALTER TABLE users 
        ADD COLUMN recovery_code VARCHAR(4) NULL AFTER password_hash
      `);
      console.log('✅ recovery_code column added successfully!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
}

verifyUsersTable();
