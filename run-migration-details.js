// run-migration-details.js - Run restaurant details migration
const mysql = require('mysql2/promise');
const fs = require('fs');

async function runMigration() {
    let connection;
    
    try {
        // Connect to database - use password from .env
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'vestine004',
            database: 'rwanda_eats_reserve',
            multipleStatements: true
        });
        console.log('✅ Connected to database');
        
        // Read migration file
        const migrationSQL = fs.readFileSync('migration-restaurant-details.sql', 'utf8');
        
        // Split into individual statements
        const statements = migrationSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.match(/^\/\*/));
        
        console.log(`\n📝 Executing ${statements.length} SQL statements...\n`);
        
        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement) {
                try {
                    await connection.query(statement);
                    console.log(`✓ Statement ${i + 1}/${statements.length} executed`);
                } catch (error) {
                    if (error.code === 'ER_DUP_ENTRY' || error.code === 'ER_TABLE_EXISTS_ERROR') {
                        console.log(`⚠️ Statement ${i + 1}/${statements.length} - Already exists (skipped)`);
                    } else {
                        console.log(`⚠️ Statement ${i + 1}/${statements.length} - ${error.message}`);
                    }
                }
            }
        }
        
        console.log('\n✅ Migration completed successfully!');
        
        // Verify tables were created
        const [tables] = await connection.query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = 'rwanda_eats_reserve' 
            AND TABLE_NAME IN ('reviews', 'restaurant_amenities', 'restaurant_images')
        `);
        
        console.log('\n📊 Verification:');
        tables.forEach(table => {
            console.log(`   ✓ Table '${table.TABLE_NAME}' exists`);
        });
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Database connection closed');
        }
    }
}

runMigration();
