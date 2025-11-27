const { createConnection } = require('../utils/db');

async function addMultipleCuisineSupport() {
    const conn = await createConnection();

    console.log('✅ Connected to database\n');

    // Add cuisines column (JSON array to support multiple cuisines)
    try {
        await conn.query(`ALTER TABLE restaurants ADD COLUMN cuisines JSON`);
        console.log('✅ Added cuisines column to restaurants');
    } catch (e) {
        if (!e.message.includes('Duplicate column')) {
            console.log('⚠️  cuisines column:', e.message);
        }
    }

    // Migrate existing cuisine_type data to cuisines array
    try {
        await conn.query(`
            UPDATE restaurants 
            SET cuisines = JSON_ARRAY(cuisine_type) 
            WHERE cuisine_type IS NOT NULL AND (cuisines IS NULL OR JSON_LENGTH(cuisines) = 0)
        `);
        console.log('✅ Migrated existing cuisine_type to cuisines array');
    } catch (e) {
        console.log('⚠️  migration:', e.message);
    }

    // Create restaurant_cuisines table (alternative approach for better querying)
    try {
        await conn.query(`
            CREATE TABLE IF NOT EXISTS restaurant_cuisines (
                id INT AUTO_INCREMENT PRIMARY KEY,
                restaurant_id INT NOT NULL,
                cuisine_name VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
                UNIQUE KEY unique_restaurant_cuisine (restaurant_id, cuisine_name),
                INDEX idx_cuisine (cuisine_name)
            )
        `);
        console.log('✅ restaurant_cuisines table created');
    } catch (e) {
        console.log('⚠️  restaurant_cuisines:', e.message);
    }

    // Populate restaurant_cuisines from existing data
    try {
        await conn.query(`
            INSERT IGNORE INTO restaurant_cuisines (restaurant_id, cuisine_name)
            SELECT id, cuisine_type
            FROM restaurants
            WHERE cuisine_type IS NOT NULL AND cuisine_type != ''
        `);
        console.log('✅ Populated restaurant_cuisines table');
    } catch (e) {
        console.log('⚠️  populating cuisines:', e.message);
    }

    await conn.end();
    console.log('\n✅ Multiple cuisines migration complete!');
}

addMultipleCuisineSupport().catch(console.error);
