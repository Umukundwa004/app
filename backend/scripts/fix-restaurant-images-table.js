// Fix restaurant_images table - add is_primary column
const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixRestaurantImagesTable() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'rwanda_eats_reserve'
    });

    try {
        console.log('✓ Connected to database');
        
        // Check current columns
        const [columns] = await connection.execute('SHOW COLUMNS FROM restaurant_images');
        console.log('\nCurrent columns:');
        columns.forEach(col => console.log(`  - ${col.Field} (${col.Type})`));
        
        // Check if is_primary exists
        const hasPrimary = columns.some(col => col.Field === 'is_primary');
        
        if (!hasPrimary) {
            console.log('\n Adding is_primary column...');
            await connection.execute(`
                ALTER TABLE restaurant_images 
                ADD COLUMN is_primary BOOLEAN DEFAULT FALSE 
                AFTER image_url
            `);
            console.log('✓ Added is_primary column');
        } else {
            console.log('\n✓ is_primary column already exists');
        }
        
        // Verify the fix
        console.log('\nVerifying table structure...');
        const [newColumns] = await connection.execute('SHOW COLUMNS FROM restaurant_images');
        console.log('Updated columns:');
        newColumns.forEach(col => console.log(`  - ${col.Field} (${col.Type})`));
        
        console.log('\n✅ Table structure fixed successfully!');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

fixRestaurantImagesTable();
