// Sync all missing columns to TiDB Cloud production database
require('dotenv').config();
const mysql = require('mysql2/promise');

async function syncAllColumnsToProduction() {
  console.log('=== Syncing All Columns to TiDB Cloud Production ===\n');
  
  // TiDB Cloud production connection
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
  console.log(`   Database: ${config.database}\n`);
  
  let conn;
  try {
    conn = await mysql.createConnection(config);
    console.log('✅ Connected to TiDB Cloud\n');
    
    // Migrations to run
    const migrations = [
      {
        table: 'restaurants',
        column: 'operating_hours',
        sql: 'ALTER TABLE restaurants ADD COLUMN operating_hours JSON NULL AFTER closing_time',
        description: 'Add operating_hours to restaurants table'
      },
      {
        table: 'restaurants',
        column: 'menu',
        sql: 'ALTER TABLE restaurants ADD COLUMN menu TEXT NULL',
        description: 'Add menu to restaurants table'
      },
      {
        table: 'restaurants',
        column: 'menu_pdf_url',
        sql: 'ALTER TABLE restaurants ADD COLUMN menu_pdf_url VARCHAR(255) NULL',
        description: 'Add menu_pdf_url to restaurants table'
      },
      {
        table: 'restaurants',
        column: 'video_url',
        sql: 'ALTER TABLE restaurants ADD COLUMN video_url VARCHAR(255) NULL',
        description: 'Add video_url to restaurants table'
      },
      {
        table: 'restaurants',
        column: 'certificate_url',
        sql: 'ALTER TABLE restaurants ADD COLUMN certificate_url VARCHAR(255) NULL',
        description: 'Add certificate_url to restaurants table'
      },
      {
        table: 'restaurant_images',
        column: 'is_primary',
        sql: 'ALTER TABLE restaurant_images ADD COLUMN is_primary TINYINT(1) DEFAULT 0 AFTER image_url',
        description: 'Add is_primary to restaurant_images table'
      }
    ];
    
    let addedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const migration of migrations) {
      try {
        // Check if column already exists
        const [columns] = await conn.execute(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = ? 
          AND COLUMN_NAME = ?
        `, [migration.table, migration.column]);
        
        if (columns.length > 0) {
          console.log(`⏭️  ${migration.description}: Already exists`);
          skippedCount++;
        } else {
          console.log(`⚙️  ${migration.description}...`);
          await conn.execute(migration.sql);
          console.log(`✅ ${migration.description}: Added successfully`);
          addedCount++;
        }
      } catch (err) {
        if (err.code === 'ER_NO_SUCH_TABLE') {
          console.log(`⚠️  ${migration.description}: Table doesn't exist (skipping)`);
          skippedCount++;
        } else {
          console.error(`❌ ${migration.description}: Failed`);
          console.error(`   Error: ${err.message}`);
          errorCount++;
        }
      }
    }
    
    console.log('\n' + '─'.repeat(80));
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Added: ${addedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('─'.repeat(80));
    
    if (errorCount === 0) {
      console.log('\n✨ All migrations completed successfully!');
      console.log('\n💡 Next steps:');
      console.log('   1. Go to Render dashboard: https://dashboard.render.com/');
      console.log('   2. Find your service');
      console.log('   3. Click "Manual Deploy" → "Clear build cache & deploy"');
      console.log('   4. Wait for deployment to complete');
      console.log('   5. Test editing a restaurant');
    } else {
      console.log('\n⚠️  Some migrations failed. Please review the errors above.');
    }
    
  } catch (error) {
    console.error('❌ Connection Error:', error.message);
    if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Unable to connect to TiDB Cloud. Please:');
      console.error('   1. Verify your TiDB credentials in .env');
      console.error('   2. Check your IP is whitelisted in TiDB Cloud');
      console.error('   3. Ensure the TiDB cluster is running');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Access denied. Check your username and password.');
    }
    process.exitCode = 1;
  } finally {
    if (conn) {
      await conn.end();
      console.log('\n🔌 Disconnected from TiDB Cloud');
    }
  }
}

syncAllColumnsToProduction();
