const mysql = require('mysql2/promise');

async function createTables() {
    const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'vestine004',
        database: 'rwanda_eats_reserve'
    });

    console.log('✅ Connected to database\n');

    // Create reviews table
    try {
        await conn.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                restaurant_id INT NOT NULL,
                customer_id INT NOT NULL,
                rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                is_visible BOOLEAN DEFAULT FALSE,
                admin_notes TEXT,
                reviewed_by INT,
                reviewed_at DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
                FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_restaurant_status (restaurant_id, status),
                INDEX idx_visible (is_visible, created_at)
            )
        `);
        console.log('✅ reviews table created');
    } catch (e) {
        console.log('⚠️  reviews:', e.message);
    }

    // Create restaurant_amenities table
    try {
        await conn.query(`
            CREATE TABLE IF NOT EXISTS restaurant_amenities (
                id INT AUTO_INCREMENT PRIMARY KEY,
                restaurant_id INT NOT NULL,
                amenity_type ENUM(
                    'wifi',
                    'parking',
                    'outdoor_seating',
                    'vegetarian',
                    'halal',
                    'delivery',
                    'takeout',
                    'reservation',
                    'air_conditioning',
                    'live_music',
                    'pet_friendly',
                    'wheelchair_accessible'
                ) NOT NULL,
                is_visible BOOLEAN DEFAULT TRUE,
                added_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
                FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL,
                UNIQUE KEY unique_restaurant_amenity (restaurant_id, amenity_type),
                INDEX idx_visible (restaurant_id, is_visible)
            )
        `);
        console.log('✅ restaurant_amenities table created');
    } catch (e) {
        console.log('⚠️  restaurant_amenities:', e.message);
    }

    // Create restaurant_images table
    try {
        await conn.query(`
            CREATE TABLE IF NOT EXISTS restaurant_images (
                id INT AUTO_INCREMENT PRIMARY KEY,
                restaurant_id INT NOT NULL,
                image_url VARCHAR(255) NOT NULL,
                image_type ENUM('gallery', 'menu', 'interior', 'exterior', 'food') DEFAULT 'gallery',
                caption VARCHAR(255),
                display_order INT DEFAULT 0,
                is_visible BOOLEAN DEFAULT TRUE,
                uploaded_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
                FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
                INDEX idx_restaurant_visible (restaurant_id, is_visible, display_order)
            )
        `);
        console.log('✅ restaurant_images table created');
    } catch (e) {
        console.log('⚠️  restaurant_images:', e.message);
    }

    // Add additional columns to restaurants table
    try {
        await conn.query(`ALTER TABLE restaurants ADD COLUMN amenities JSON`);
        console.log('✅ Added amenities column to restaurants');
    } catch (e) {
        if (!e.message.includes('Duplicate column')) {
            console.log('⚠️  amenities column:', e.message);
        }
    }

    try {
        await conn.query(`ALTER TABLE restaurants ADD COLUMN rating_display BOOLEAN DEFAULT TRUE`);
        console.log('✅ Added rating_display column to restaurants');
    } catch (e) {
        if (!e.message.includes('Duplicate column')) {
            console.log('⚠️  rating_display column:', e.message);
        }
    }

    try {
        await conn.query(`ALTER TABLE restaurants ADD COLUMN reviews_enabled BOOLEAN DEFAULT TRUE`);
        console.log('✅ Added reviews_enabled column to restaurants');
    } catch (e) {
        if (!e.message.includes('Duplicate column')) {
            console.log('⚠️  reviews_enabled column:', e.message);
        }
    }

    try {
        await conn.query(`ALTER TABLE restaurants ADD COLUMN video_enabled BOOLEAN DEFAULT TRUE`);
        console.log('✅ Added video_enabled column to restaurants');
    } catch (e) {
        if (!e.message.includes('Duplicate column')) {
            console.log('⚠️  video_enabled column:', e.message);
        }
    }

    try {
        await conn.query(`ALTER TABLE restaurants ADD COLUMN gallery_enabled BOOLEAN DEFAULT TRUE`);
        console.log('✅ Added gallery_enabled column to restaurants');
    } catch (e) {
        if (!e.message.includes('Duplicate column')) {
            console.log('⚠️  gallery_enabled column:', e.message);
        }
    }

    // Insert sample data
    try {
        await conn.query(`
            INSERT IGNORE INTO restaurant_amenities (restaurant_id, amenity_type, is_visible, added_by) 
            VALUES (1, 'wifi', TRUE, 1), (1, 'parking', TRUE, 1), (1, 'air_conditioning', TRUE, 1)
        `);
        console.log('✅ Sample amenities inserted');
    } catch (e) {
        console.log('⚠️  sample amenities:', e.message);
    }

    try {
        await conn.query(`
            INSERT IGNORE INTO reviews (restaurant_id, customer_id, rating, comment, status, is_visible)
            VALUES 
            (1, 4, 5, 'Amazing food and excellent service! The ambiance is perfect for special occasions.', 'approved', TRUE),
            (2, 4, 4, 'Authentic Rwandan cuisine. The Isombe was delicious!', 'approved', TRUE)
        `);
        console.log('✅ Sample reviews inserted');
    } catch (e) {
        console.log('⚠️  sample reviews:', e.message);
    }

    await conn.end();
    console.log('\n✅ Migration complete!');
}

createTables().catch(console.error);
