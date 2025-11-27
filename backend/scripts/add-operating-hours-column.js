// Add operating_hours column to TiDB Cloud
require('dotenv').config();
const { createConnection } = require('../utils/db');

async function addOperatingHoursColumn() {
  console.log('=== Adding operating_hours Column ===\n');
  
  const conn = await createConnection();
  
  try {
    // Check if column already exists
    const [columns] = await conn.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'restaurants' 
      AND COLUMN_NAME = 'operating_hours'
    `);
    
    if (columns.length > 0) {
      console.log('✓ Column operating_hours already exists');
      return;
    }
    
    // Add the column
    await conn.execute(`
      ALTER TABLE restaurants 
      ADD COLUMN operating_hours JSON NULL AFTER closing_time
    `);
    
    console.log('✓ Column operating_hours added successfully');
    
  } catch (error) {
    console.error('Error adding column:', error.message);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
}

addOperatingHoursColumn();
