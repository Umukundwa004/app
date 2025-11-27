// Add unique constraint to restaurant name
const { createConnection } = require('../utils/db');

async function addUniqueConstraint() {
    let connection;
    try {
        connection = await createConnection();
        console.log('Connected to database');

        // Check if unique constraint already exists
        const [constraints] = await connection.execute(`
            SELECT CONSTRAINT_NAME 
            FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'restaurants' 
            AND CONSTRAINT_TYPE = 'UNIQUE'
            AND CONSTRAINT_NAME = 'unique_restaurant_name'
        `);

        if (constraints.length > 0) {
            console.log('✅ Unique constraint on restaurant name already exists');
            return;
        }

        // Check for duplicate restaurant names before adding constraint
        const [duplicates] = await connection.execute(`
            SELECT name, COUNT(*) as count 
            FROM restaurants 
            GROUP BY name 
            HAVING count > 1
        `);

        if (duplicates.length > 0) {
            console.log('\n⚠️  WARNING: Found duplicate restaurant names:');
            duplicates.forEach(dup => {
                console.log(`   - "${dup.name}" appears ${dup.count} times`);
            });
            console.log('\n❌ Cannot add unique constraint until duplicates are resolved.');
            console.log('Please rename duplicate restaurants before running this migration.\n');
            return;
        }

        // Add unique constraint
        await connection.execute(`
            ALTER TABLE restaurants 
            ADD UNIQUE KEY unique_restaurant_name (name)
        `);

        console.log('✅ Successfully added unique constraint to restaurant name');
        console.log('✅ No two restaurants can now have the same name');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 'ER_DUP_KEYNAME') {
            console.log('ℹ️  Unique constraint already exists');
        }
    } finally {
        if (connection) await connection.end();
    }
}

addUniqueConstraint();
