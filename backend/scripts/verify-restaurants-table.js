// Verify restaurants table structure in production database
require('dotenv').config();
const { createConnection } = require('../utils/db');

async function verifyRestaurantsTable() {
  console.log('=== Verifying Restaurants Table Structure ===\n');
  
  const conn = await createConnection();
  
  try {
    // Show current database
    const [dbResult] = await conn.execute('SELECT DATABASE() as db');
    console.log('📌 Connected to database:', dbResult[0].db);
    
    // Get all columns in restaurants table
    const [columns] = await conn.execute(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'restaurants'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('\n📋 Restaurants table columns:');
    console.log('─'.repeat(80));
    columns.forEach(col => {
      console.log(`${col.COLUMN_NAME.padEnd(30)} ${col.COLUMN_TYPE.padEnd(20)} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log('─'.repeat(80));
    
    // Check for important columns
    const hasOperatingHours = columns.some(col => col.COLUMN_NAME === 'operating_hours');
    const hasMenu = columns.some(col => col.COLUMN_NAME === 'menu');
    const hasMenuPdfUrl = columns.some(col => col.COLUMN_NAME === 'menu_pdf_url');
    const hasVideoUrl = columns.some(col => col.COLUMN_NAME === 'video_url');
    
    console.log('\n🔍 Column Check:');
    console.log(`   operating_hours: ${hasOperatingHours ? '✅ YES' : '❌ NO'}`);
    console.log(`   menu: ${hasMenu ? '✅ YES' : '❌ NO'}`);
    console.log(`   menu_pdf_url: ${hasMenuPdfUrl ? '✅ YES' : '❌ NO'}`);
    console.log(`   video_url: ${hasVideoUrl ? '✅ YES' : '❌ NO'}`);
    
    // Check restaurant_images table
    console.log('\n📋 Checking restaurant_images table...');
    try {
      const [imgColumns] = await conn.execute(`
        SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'restaurant_images'
        ORDER BY ORDINAL_POSITION
      `);
      
      console.log('─'.repeat(80));
      imgColumns.forEach(col => {
        console.log(`${col.COLUMN_NAME.padEnd(30)} ${col.COLUMN_TYPE.padEnd(20)} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
      console.log('─'.repeat(80));
      
      const hasIsPrimary = imgColumns.some(col => col.COLUMN_NAME === 'is_primary');
      console.log(`\n🔍 is_primary column: ${hasIsPrimary ? '✅ YES' : '❌ NO'}`);
      
    } catch (imgErr) {
      if (imgErr.code === 'ER_NO_SUCH_TABLE') {
        console.log('⚠️  restaurant_images table does not exist');
      } else {
        console.error('❌ Error checking restaurant_images:', imgErr.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
}

verifyRestaurantsTable();
