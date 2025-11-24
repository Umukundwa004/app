-- Enhanced database.sql
CREATE DATABASE IF NOT EXISTS rwanda_eats_reserve;
USE rwanda_eats_reserve;

-- Users table with enhanced authentication fields
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

-- User sessions for authentication
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

-- Restaurants table with enhanced fields
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

-- Menu items table
CREATE TABLE menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    cuisine VARCHAR(50),
    image_url VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Restaurant tables availability
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

-- Reservations table with enhanced fields
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
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- Enhanced notifications table
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('reservation_status', 'new_reservation', 'system', 'verification', 'reminder') DEFAULT 'system',
    channel ENUM('email', 'sms', 'in_app') DEFAULT 'in_app',
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    related_reservation_id INT,
    scheduled_at DATETIME,
    sent_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (related_reservation_id) REFERENCES reservations(id)
);

-- Email templates for notifications
CREATE TABLE email_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    variables JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SMS templates for notifications
CREATE TABLE sms_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    message TEXT NOT NULL,
    variables JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log for security monitoring
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
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert default email templates
INSERT INTO email_templates (name, subject, body, variables) VALUES
('welcome', 'Welcome to Rwanda Eats Reserve!', 
'<h1>Welcome to Rwanda Eats Reserve!</h1>
<p>Dear {{name}},</p>
<p>Thank you for registering with Rwanda Eats Reserve. We are excited to help you discover and book amazing restaurants across Rwanda.</p>
<p>To get started, please verify your email address by clicking the link below:</p>
<p><a href="{{verification_url}}">Verify Email Address</a></p>
<p>If you did not create an account, please ignore this email.</p>
<p>Best regards,<br>Rwanda Eats Reserve Team</p>',
'["name", "verification_url"]'),

('email_verification', 'Verify Your Email Address - Rwanda Eats Reserve',
'<h1>Verify Your Email Address</h1>
<p>Dear {{name}},</p>
<p>Please verify your email address by clicking the link below:</p>
<p><a href="{{verification_url}}">Verify Email Address</a></p>
<p>This link will expire in 24 hours.</p>
<p>If you did not request this verification, please ignore this email.</p>
<p>Best regards,<br>Rwanda Eats Reserve Team</p>',
'["name", "verification_url"]'),

('reservation_confirmation', 'Reservation Confirmed - {{restaurant_name}}',
'<h1>Reservation Confirmed!</h1>
<p>Dear {{customer_name}},</p>
<p>Your reservation at {{restaurant_name}} has been confirmed.</p>
<p><strong>Reservation Details:</strong></p>
<ul>
<li>Date: {{reservation_date}}</li>
<li>Time: {{reservation_time}}</li>
<li>Party Size: {{party_size}} people</li>
<li>Restaurant: {{restaurant_name}}</li>
<li>Location: {{restaurant_location}}</li>
</ul>
<p>We look forward to serving you!</p>
<p>Best regards,<br>{{restaurant_name}} Team</p>',
'["customer_name", "restaurant_name", "reservation_date", "reservation_time", "party_size", "restaurant_location"]'),

('reservation_reminder', 'Upcoming Reservation Reminder - {{restaurant_name}}',
'<h1>Reservation Reminder</h1>
<p>Dear {{customer_name}},</p>
<p>This is a friendly reminder about your upcoming reservation at {{restaurant_name}}.</p>
<p><strong>Reservation Details:</strong></p>
<ul>
<li>Date: {{reservation_date}}</li>
<li>Time: {{reservation_time}}</li>
<li>Party Size: {{party_size}} people</li>
<li>Restaurant: {{restaurant_name}}</li>
<li>Location: {{restaurant_location}}</li>
</ul>
<p>We look forward to seeing you soon!</p>
<p>Best regards,<br>{{restaurant_name}} Team</p>',
'["customer_name", "restaurant_name", "reservation_date", "reservation_time", "party_size", "restaurant_location"]');

-- Insert default SMS templates
INSERT INTO sms_templates (name, message, variables) VALUES
('welcome_sms', 'Welcome to Rwanda Eats Reserve! Verify your email to start booking restaurants. Verification link: {{verification_url}}',
'["verification_url"]'),

('reservation_confirmation_sms', 'Reservation confirmed at {{restaurant_name}} on {{reservation_date}} at {{reservation_time}} for {{party_size}} people. See you soon!',
'["restaurant_name", "reservation_date", "reservation_time", "party_size"]'),

('reservation_reminder_sms', 'Reminder: Reservation at {{restaurant_name}} today at {{reservation_time}} for {{party_size}} people. We look forward to serving you!',
'["restaurant_name", "reservation_time", "party_size"]');

-- Insert sample data
INSERT INTO users (name, email, password_hash, phone, user_type, email_verified) VALUES 
('System Admin', 'admin@rwandaeats.com', '$2b$10$exampleHashedPassword', '+250788000001', 'system_admin', TRUE),
('Restaurant Owner 1', 'owner1@restaurant.rw', '$2b$10$exampleHashedPassword', '+250788000002', 'restaurant_admin', TRUE),
('Restaurant Owner 2', 'owner2@restaurant.rw', '$2b$10$exampleHashedPassword', '+250788000003', 'restaurant_admin', TRUE),
('John Customer', 'customer@example.com', '$2b$10$exampleHashedPassword', '+250788000004', 'customer', TRUE);

-- Insert sample restaurants
INSERT INTO restaurants (name, description, location, contact_phone, contact_email, opening_time, closing_time, cuisine_type, price_range, restaurant_admin_id) VALUES
('Kigali Heights Restaurant', 'Fine dining with panoramic city views offering authentic Rwandan and international cuisine. Perfect for special occasions and business meetings.', 'Kigali Heights, Kigali', '+250788123456', 'info@kigaliheights.rw', '10:00:00', '22:00:00', 'International', '3', 2),
('Nyamirambo Food Hub', 'Authentic Rwandan cuisine in the heart of historic Nyamirambo. Experience traditional flavors in a vibrant atmosphere.', 'Nyamirambo, Kigali', '+250788654321', 'contact@nyamirambofood.rw', '08:00:00', '20:00:00', 'Rwandan', '2', 2),
('Lake Kivu Bistro', 'Seafood and lakeside dining with stunning views of Lake Kivu. Fresh catches daily and romantic sunset dinners.', 'Gisenyi, Rubavu', '+250788789012', 'reservations@lakekivu.rw', '09:00:00', '21:00:00', 'Seafood', '3', 3);

-- Insert sample menu items
INSERT INTO menu_items (restaurant_id, name, description, price, category) VALUES
(1, 'Grilled Tilapia', 'Fresh tilapia grilled with Rwandan spices, served with plantains and vegetables', 12000.00, 'Main Course'),
(1, 'Beef Brochettes', 'Tender beef skewers marinated in traditional spices, served with fries', 8000.00, 'Main Course'),
(2, 'Isombe', 'Cassava leaves with eggplant and spinach, served with ugali', 6000.00, 'Traditional'),
(2, 'Akabenz', 'Pork ribs slow-cooked in banana leaves with local herbs', 10000.00, 'Traditional'),
(3, 'Lake Fish Platter', 'Assorted fresh fish from Lake Kivu, grilled and fried', 15000.00, 'Seafood'),
(3, 'Shrimp Curry', 'Fresh shrimp in coconut curry sauce, served with rice', 13000.00, 'Seafood');
