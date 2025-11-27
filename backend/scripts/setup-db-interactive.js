// Interactive database setup with password prompt
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function setupDatabase() {
    let connection;
    
    try {
        console.log('===============================================');
        console.log('Rwanda Eats Reserve - Database Setup');
        console.log('===============================================\n');

        // Prompt for MySQL password
        const password = await question('Enter your MySQL root password (press Enter if no password): ');
        
        console.log('\nConnecting to MySQL...');

        // Connect to MySQL
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: password,
            multipleStatements: true
        });

        console.log('✓ Connected to MySQL server\n');

        // Create database
        console.log('Creating database...');
        await connection.query('CREATE DATABASE IF NOT EXISTS rwanda_eats_reserve');
        await connection.query('USE rwanda_eats_reserve');
        console.log('✓ Database created/selected\n');

        // Drop existing tables
        console.log('Cleaning up existing tables...');
        await connection.query(`
            SET FOREIGN_KEY_CHECKS = 0;
            DROP TABLE IF EXISTS audit_logs;
            DROP TABLE IF EXISTS notifications;
            DROP TABLE IF EXISTS table_availability;
            DROP TABLE IF EXISTS sms_templates;
            DROP TABLE IF EXISTS email_templates;
            DROP TABLE IF EXISTS menu_items;
            DROP TABLE IF EXISTS reservations;
            DROP TABLE IF EXISTS restaurants;
            DROP TABLE IF EXISTS user_sessions;
            DROP TABLE IF EXISTS users;
            SET FOREIGN_KEY_CHECKS = 1;
        `);
        console.log('✓ Tables cleaned up\n');

        // Create tables
        console.log('Creating tables...');
        const createTables = `
            CREATE TABLE users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                user_type ENUM('customer', 'restaurant_admin', 'system_admin') DEFAULT 'customer',
                email_verified BOOLEAN DEFAULT FALSE,
                phone_verified BOOLEAN DEFAULT FALSE,
                verification_token VARCHAR(100),
                reset_token VARCHAR(100),
                reset_token_expires DATETIME,
                last_login DATETIME,
                login_attempts INT DEFAULT 0,
                account_locked BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );

            CREATE TABLE user_sessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                session_token VARCHAR(255) UNIQUE NOT NULL,
                expires_at DATETIME NOT NULL,
                ip_address VARCHAR(45),
                user_agent TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE restaurants (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                location VARCHAR(255),
                latitude DECIMAL(10, 8),
                longitude DECIMAL(11, 8),
                contact_phone VARCHAR(20),
                contact_email VARCHAR(100),
                opening_time TIME,
                closing_time TIME,
                cuisine_type VARCHAR(50),
                price_range ENUM('1', '2', '3') DEFAULT '2',
                image_url VARCHAR(255),
                video_url VARCHAR(255),
                tables_count INT DEFAULT 10,
                restaurant_admin_id INT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (restaurant_admin_id) REFERENCES users(id)
            );

            CREATE TABLE menu_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                restaurant_id INT,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL,
                category VARCHAR(50),
                image_url VARCHAR(255),
                is_available BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
            );

            CREATE TABLE reservations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                customer_id INT,
                restaurant_id INT,
                reservation_date DATE NOT NULL,
                reservation_time TIME NOT NULL,
                party_size INT NOT NULL,
                occasion VARCHAR(50),
                special_requests TEXT,
                status ENUM('pending', 'confirmed', 'rejected', 'cancelled', 'completed') DEFAULT 'pending',
                notification_sent BOOLEAN DEFAULT FALSE,
                reminder_sent BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
            );

            CREATE TABLE notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'system',
                channel ENUM('in_app', 'email', 'sms') DEFAULT 'in_app',
                related_reservation_id INT,
                is_read BOOLEAN DEFAULT FALSE,
                is_sent BOOLEAN DEFAULT FALSE,
                sent_at DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (related_reservation_id) REFERENCES reservations(id) ON DELETE SET NULL
            );

            CREATE TABLE audit_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                action VARCHAR(100) NOT NULL,
                resource_type VARCHAR(50),
                resource_id INT,
                ip_address VARCHAR(45),
                user_agent TEXT,
                details JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            );

            CREATE TABLE email_templates (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                subject VARCHAR(255) NOT NULL,
                body TEXT NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );

            CREATE TABLE sms_templates (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                message TEXT NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );

            CREATE TABLE table_availability (
                id INT AUTO_INCREMENT PRIMARY KEY,
                restaurant_id INT,
                date DATE NOT NULL,
                time_slot TIME NOT NULL,
                available_tables INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
                UNIQUE KEY unique_slot (restaurant_id, date, time_slot)
            );
        `;

        await connection.query(createTables);
        console.log('✓ Tables created\n');

        // Hash passwords
        console.log('Generating password hashes...');
        const passwordHash = await bcrypt.hash('RwandaEats@2025!Secure', 12);
        console.log('✓ Passwords hashed\n');

        // Insert sample data
        console.log('Inserting sample data...');
        
        await connection.query(`
            INSERT INTO users (name, email, password_hash, phone, user_type, email_verified) VALUES
            ('System Admin', 'admin@rwandaeats.com', ?, '+250788000001', 'system_admin', TRUE),
            ('Hotel des Mille Collines', 'admin@millecollines.rw', ?, '+250788000002', 'restaurant_admin', TRUE),
            ('Heaven Restaurant', 'admin@heaven.rw', ?, '+250788000003', 'restaurant_admin', TRUE),
            ('The Hut', 'admin@thehut.rw', ?, '+250788000004', 'restaurant_admin', TRUE),
            ('John Doe', 'john@example.com', ?, '+250788000005', 'customer', TRUE),
            ('Jane Smith', 'jane@example.com', ?, '+250788000006', 'customer', TRUE)
        `, [passwordHash, passwordHash, passwordHash, passwordHash, passwordHash, passwordHash]);

        await connection.query(`
            INSERT INTO restaurants (name, description, location, contact_phone, contact_email, opening_time, closing_time, cuisine_type, price_range, tables_count, restaurant_admin_id, is_active) VALUES
            ('Hotel des Mille Collines', 'Iconic hotel with exceptional dining experience overlooking Kigali', 'Kigali City Center', '+250788111111', 'reservations@millecollines.rw', '06:00:00', '22:00:00', 'International', '3', 20, 2, TRUE),
            ('Heaven Restaurant', 'Rooftop dining with panoramic views and fusion cuisine', 'Kiyovu, Kigali', '+250788222222', 'info@heaven.rw', '11:00:00', '23:00:00', 'Fusion', '3', 15, 3, TRUE),
            ('The Hut', 'Traditional Rwandan cuisine in a cozy atmosphere', 'Remera, Kigali', '+250788333333', 'bookings@thehut.rw', '10:00:00', '21:00:00', 'Rwandan', '2', 12, 4, TRUE),
            ('Repub Lounge', 'Modern lounge with international dishes and live music', 'Kimihurura, Kigali', '+250788444444', 'contact@republounge.rw', '12:00:00', '23:30:00', 'International', '2', 18, 2, TRUE),
            ('Khana Khazana', 'Authentic Indian cuisine in the heart of Kigali', 'Nyarutarama, Kigali', '+250788555555', 'info@khana.rw', '11:30:00', '22:00:00', 'Indian', '2', 10, 3, TRUE)
        `);

        await connection.query(`
            INSERT INTO menu_items (restaurant_id, name, description, price, category, is_available) VALUES
            (1, 'Grilled Tilapia', 'Fresh lake tilapia with herbs and spices', 18000, 'Main Course', TRUE),
            (1, 'Beef Brochette', 'Grilled beef skewers with vegetables', 15000, 'Main Course', TRUE),
            (1, 'Caesar Salad', 'Classic Caesar with grilled chicken', 12000, 'Appetizer', TRUE),
            (2, 'Goat Cheese Salad', 'Fresh greens with warm goat cheese', 14000, 'Appetizer', TRUE),
            (2, 'Lamb Chops', 'Grilled lamb with rosemary and garlic', 25000, 'Main Course', TRUE),
            (3, 'Ugali with Fish', 'Traditional Rwandan meal with grilled fish', 10000, 'Main Course', TRUE),
            (3, 'Isombe', 'Cassava leaves with peanut sauce', 8000, 'Main Course', TRUE),
            (4, 'Pizza Margherita', 'Classic Italian pizza with fresh basil', 15000, 'Main Course', TRUE),
            (5, 'Butter Chicken', 'Creamy tomato-based chicken curry', 18000, 'Main Course', TRUE),
            (5, 'Biryani', 'Fragrant rice with mixed vegetables or chicken', 16000, 'Main Course', TRUE)
        `);

        await connection.query(`
            INSERT INTO email_templates (name, subject, body, is_active) VALUES
            ('welcome', 'Welcome to Rwanda Eats Reserve!', 
             '<h1>Welcome {{name}}!</h1><p>Thank you for joining Rwanda Eats Reserve. Please verify your email by clicking the link below:</p><p><a href="{{verification_url}}">Verify Email</a></p>', 
             TRUE),
            ('reservation_confirmation', 'Your Reservation is Confirmed!', 
             '<h1>Reservation Confirmed</h1><p>Dear {{customer_name}},</p><p>Your reservation at <strong>{{restaurant_name}}</strong> has been confirmed!</p><p><strong>Date:</strong> {{reservation_date}}<br><strong>Time:</strong> {{reservation_time}}<br><strong>Party Size:</strong> {{party_size}}</p>', 
             TRUE)
        `);

        await connection.query(`
            INSERT INTO sms_templates (name, message, is_active) VALUES
            ('reservation_confirmation_sms', 
             'Your reservation at {{restaurant_name}} is confirmed for {{reservation_date}} at {{reservation_time}} for {{party_size}} people.', 
             TRUE)
        `);

        console.log('✓ Sample data inserted\n');

        console.log('===============================================');
        console.log('✓ DATABASE SETUP COMPLETED SUCCESSFULLY!');
        console.log('===============================================\n');
        console.log('Test Accounts (refer to ADMIN_PASSWORD_UPDATE.md for credentials):');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('System Admin:      admin@rwandaeats.com');
        console.log('Restaurant Admin:  admin@millecollines.rw');
        console.log('Customer:          john@example.com');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        if (password) {
            console.log('⚠ IMPORTANT: Update server.js line 40:');
            console.log(`   password: '${password}',`);
            console.log('');
        }

        console.log('Next step: npm start\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('\n⚠ Wrong password! Please try again with the correct MySQL password.\n');
        }
    } finally {
        if (connection) {
            await connection.end();
        }
        rl.close();
    }
}

setupDatabase();
