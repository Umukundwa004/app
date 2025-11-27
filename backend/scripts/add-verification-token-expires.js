require('dotenv').config();
const mysql = require('mysql2/promise');

async function addVerificationTokenExpiresColumn() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    console.log('🔧 Adding verification_token_expires column to users table...\n');

    try {
        // Check if column already exists
        const [columns] = await connection.execute(
            "SHOW COLUMNS FROM users WHERE Field = 'verification_token_expires'"
        );

        if (columns.length > 0) {
            console.log('✅ Column already exists!');
            await connection.end();
            return;
        }

        // Add the column
        await connection.execute(`
            ALTER TABLE users 
            ADD COLUMN verification_token_expires DATETIME NULL 
            AFTER verification_token
        `);

        console.log('✅ Successfully added verification_token_expires column!');

        // Verify
        const [newColumns] = await connection.execute(
            "SHOW COLUMNS FROM users WHERE Field = 'verification_token_expires'"
        );
        console.log('\nVerification:');
        console.table(newColumns.map(c => ({ Field: c.Field, Type: c.Type, Null: c.Null })));

    } catch (error) {
        console.error('❌ Error adding column:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

addVerificationTokenExpiresColumn().catch(console.error);
