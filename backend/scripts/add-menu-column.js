const mysql = require('mysql2/promise');

async function addMenuColumn() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'vestine004',
        database: 'rwanda_eats_reserve'
    });

    try {
        console.log('Checking if menu column exists...');
        
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'rwanda_eats_reserve' 
            AND TABLE_NAME = 'restaurants'
            AND COLUMN_NAME = 'menu'
        `);
        
        if (columns.length > 0) {
            console.log('✓ menu column already exists');
        } else {
            console.log('Adding menu column...');
            await connection.execute(`
                ALTER TABLE restaurants 
                ADD COLUMN menu TEXT NULL
                AFTER cuisines
            `);
            console.log('✓ menu column added successfully');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

addMenuColumn()
    .then(() => {
        console.log('\n✓ Migration completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n✗ Migration failed:', error);
        process.exit(1);
    });
