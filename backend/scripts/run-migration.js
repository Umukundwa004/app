// run-migration.js
const { createConnection } = require('../utils/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    let connection;
    
    try {
        // Create connection
        connection = await createConnection();
        console.log('Connected to database');
        
        // Read migration file
        const migrationPath = path.join(__dirname, 'migration-restaurant-images.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = migrationSQL
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);
        
        console.log(`Executing ${statements.length} migration statements...`);
        
        for (const statement of statements) {
            await connection.query(statement);
            console.log('✓ Statement executed successfully');
        }
        
        console.log('\n✅ Migration completed successfully!');
        console.log('The restaurant_images table has been created.');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

runMigration();
