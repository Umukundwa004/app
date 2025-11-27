// Add is_primary column to TiDB Cloud restaurant_images table
const mysql = require('mysql2/promise');
require('dotenv').config();

async function addIsPrimaryToTiDB() {
    // TiDB Cloud connection
    const connection = await mysql.createConnection({
        host: process.env.TIDB_HOST || 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
        port: parseInt(process.env.TIDB_PORT || '4000'),
        user: process.env.TIDB_USER || '3Nhz53ESuRkZyeE.root',
        password: process.env.TIDB_PASSWORD,
        database: process.env.TIDB_DATABASE || 'rwanda_eats',
        ssl: {
            minVersion: 'TLSv1.2',
            rejectUnauthorized: true
        }
    });

    try {
        console.log('✓ Connected to TiDB Cloud');
        
        // Check current columns
        const [columns] = await connection.execute('SHOW COLUMNS FROM restaurant_images');
        console.log('\nCurrent columns in TiDB:');
        columns.forEach(col => console.log(`  - ${col.Field} (${col.Type})`));
        
        // Check if is_primary exists
        const hasPrimary = columns.some(col => col.Field === 'is_primary');
        
        if (!hasPrimary) {
            console.log('\n Adding is_primary column to TiDB...');
            await connection.execute(`
                ALTER TABLE restaurant_images 
                ADD COLUMN is_primary BOOLEAN DEFAULT FALSE 
                AFTER image_url
            `);
            console.log('✓ Added is_primary column to TiDB');
        } else {
            console.log('\n✓ is_primary column already exists in TiDB');
        }
        
        // Verify the fix
        console.log('\nVerifying TiDB table structure...');
        const [newColumns] = await connection.execute('SHOW COLUMNS FROM restaurant_images');
        console.log('Updated columns:');
        newColumns.forEach(col => console.log(`  - ${col.Field} (${col.Type})`));
        
        console.log('\n✅ TiDB table structure fixed successfully!');
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 'ER_NO_SUCH_TABLE') {
            console.log('\n⚠️  restaurant_images table does not exist in TiDB Cloud');
            console.log('   You may need to run the full migration first');
        }
        process.exit(1);
    } finally {
        await connection.end();
    }
}

addIsPrimaryToTiDB();
