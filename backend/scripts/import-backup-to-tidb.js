// Import backup.sql to TiDB Cloud using Node.js
const fs = require('fs');
const { createConnection } = require('../utils/db');

async function importBackup() {
  const backupFile = 'backup-utf8.sql';
  
  console.log('=== TiDB Cloud Import ===\n');
  
  // Check if UTF-8 backup exists, create if needed
  if (!fs.existsSync(backupFile)) {
    console.log('Creating UTF-8 version of backup.sql...');
    const originalContent = fs.readFileSync('backup.sql', 'utf8');
    const utf8Content = originalContent.replace(/SET NAMES cp850;/g, 'SET NAMES utf8mb4;');
    fs.writeFileSync(backupFile, utf8Content, 'utf8');
    console.log('✓ UTF-8 backup created\n');
  }

  console.log(`Reading ${backupFile}...`);
  const sqlContent = fs.readFileSync(backupFile, 'utf8');
  
  // Split by semicolons, but be careful with stored procedures and functions
  const statements = sqlContent
    .split(/;(?=(?:[^']*'[^']*')*[^']*$)/) // Split on semicolons not inside quotes
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));

  console.log(`Found ${statements.length} SQL statements\n`);

  let conn;
  try {
    console.log('Connecting to TiDB Cloud...');
    conn = await createConnection();
    console.log('✓ Connected\n');

    console.log('Executing SQL statements...');
    let executed = 0;
    let errors = 0;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      
      // Show progress every 100 statements
      if (i > 0 && i % 100 === 0) {
        console.log(`  Progress: ${i}/${statements.length} (${Math.round(i/statements.length*100)}%)`);
      }

      try {
        await conn.query(stmt);
        executed++;
      } catch (error) {
        errors++;
        // Only log errors that aren't "table already exists" or similar
        if (!error.message.includes('already exists') && 
            !error.message.includes('Duplicate entry') &&
            !error.message.includes('Unknown database')) {
          console.error(`  Error at statement ${i}: ${error.message.substring(0, 100)}`);
        }
      }
    }

    console.log('\n=== Import Summary ===');
    console.log(`  Total statements: ${statements.length}`);
    console.log(`  Executed successfully: ${executed}`);
    console.log(`  Errors (skipped): ${errors}`);
    
    // Verify tables
    console.log('\n=== Verification ===');
    const [tables] = await conn.query('SHOW TABLES');
    console.log(`  Tables in database: ${tables.length}`);
    
    if (tables.length > 0) {
      console.log('\n  Table counts:');
      for (const tableRow of tables) {
        const tableName = Object.values(tableRow)[0];
        const [[count]] = await conn.query(`SELECT COUNT(*) as cnt FROM ${tableName}`);
        console.log(`    ${tableName.padEnd(20)} -> ${count.cnt}`);
      }
    }

    console.log('\n✓ Import completed successfully!');

  } catch (error) {
    console.error('\n✗ Import failed:');
    console.error(`  Error: ${error.message}`);
    process.exitCode = 1;
  } finally {
    if (conn) {
      await conn.end();
      console.log('\nConnection closed.');
    }
  }
}

importBackup();
