// Add recovery_code column directly to TiDB Cloud production database
require('dotenv').config();
const mysql = require('mysql2/promise');

async function addRecoveryCodeToProduction() {
  console.log('=== Adding recovery_code to TiDB Cloud Production ===\n');
  
  // TiDB Cloud production connection
  // You need to set these in your environment or replace with actual values
  const config = {
    host: process.env.TIDB_HOST || 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
    port: parseInt(process.env.TIDB_PORT || '4000'),
    user: process.env.TIDB_USER || process.env.DB_USER,
    password: process.env.TIDB_PASSWORD || process.env.DB_PASSWORD,
    database: process.env.TIDB_DATABASE || process.env.DB_NAME || 'rwanda_eats_reserve',
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true
    }
  };
  
  console.log('📌 Connecting to TiDB Cloud:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Database: ${config.database}`);
  console.log();
  
  let conn;
  try {
    conn = await mysql.createConnection(config);
    console.log('✅ Connected to TiDB Cloud\n');
    
    // Verify current database
    const [dbResult] = await conn.execute('SELECT DATABASE() as db');
    console.log('📌 Current database:', dbResult[0].db);
    
    // Check if column already exists
    const [columns] = await conn.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'recovery_code'
    `);
    
    if (columns.length > 0) {
      console.log('✅ Column recovery_code already exists in production');
      
      // Show all user table columns for verification
      const [allColumns] = await conn.execute(`
        SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users'
        ORDER BY ORDINAL_POSITION
      `);
      
      console.log('\n📋 Current users table structure:');
      console.log('─'.repeat(70));
      allColumns.forEach(col => {
        console.log(`${col.COLUMN_NAME.padEnd(30)} ${col.COLUMN_TYPE.padEnd(25)} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
      console.log('─'.repeat(70));
      
      return;
    }
    
    // Add the column
    console.log('\n⚙️  Adding recovery_code column to production database...');
    await conn.execute(`
      ALTER TABLE users 
      ADD COLUMN recovery_code VARCHAR(4) NULL AFTER password_hash
    `);
    
    console.log('✅ Column recovery_code added successfully to production!\n');
    
    // Verify the column was added
    const [verify] = await conn.execute(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'recovery_code'
    `);
    
    if (verify.length > 0) {
      console.log('✅ Verification: recovery_code column confirmed in production');
      console.log(`   Type: ${verify[0].COLUMN_TYPE}, Nullable: ${verify[0].IS_NULLABLE}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Unable to connect to TiDB Cloud. Please verify:');
      console.error('   1. Your TiDB credentials are correct');
      console.error('   2. Your IP is whitelisted in TiDB Cloud');
      console.error('   3. The TiDB cluster is running');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Access denied. Please check your username and password.');
    } else {
      console.error('Full error:', error);
    }
    process.exitCode = 1;
  } finally {
    if (conn) {
      await conn.end();
      console.log('\n🔌 Disconnected from TiDB Cloud');
    }
  }
}

addRecoveryCodeToProduction();
