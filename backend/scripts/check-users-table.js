require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkUsersTable() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    console.log('📊 Checking users table structure...\n');

    // Show columns
    const [columns] = await connection.execute('SHOW COLUMNS FROM users');
    console.log('Users table columns:');
    console.table(columns.map(col => ({
        Field: col.Field,
        Type: col.Type,
        Null: col.Null,
        Key: col.Key,
        Default: col.Default
    })));

    // Check for recovery_code column specifically
    const hasRecoveryCode = columns.some(col => col.Field === 'recovery_code');
    console.log(`\n✓ recovery_code column exists: ${hasRecoveryCode ? 'YES ✅' : 'NO ❌'}`);

    if (!hasRecoveryCode) {
        console.log('\n⚠️  ISSUE FOUND: recovery_code column is missing!');
        console.log('This will cause registration to fail with a 500 error.');
        console.log('\nTo fix, run:');
        console.log('node backend/scripts/add-recovery-code-column.js');
    }

    await connection.end();
}

checkUsersTable().catch(console.error);
