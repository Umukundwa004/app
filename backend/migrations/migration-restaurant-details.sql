-- Migration: Add restaurant details management tables
-- Date: 2025-11-25

USE rwanda_eats_reserve;

-- Table for customer reviews
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
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_restaurant_status (restaurant_id, status),
    INDEX idx_visible (is_visible, created_at)
);

-- Table for restaurant amenities
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
);

-- Table for restaurant images (if not exists)
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
);

-- Add additional fields to restaurants table if not exists
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS amenities JSON,
ADD COLUMN IF NOT EXISTS rating_display BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS reviews_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS video_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS gallery_enabled BOOLEAN DEFAULT TRUE;

-- Create view for restaurant statistics
CREATE OR REPLACE VIEW restaurant_stats AS
SELECT 
    r.id AS restaurant_id,
    r.name AS restaurant_name,
    COUNT(DISTINCT rev.id) AS total_reviews,
    COUNT(DISTINCT CASE WHEN rev.status = 'approved' AND rev.is_visible = TRUE THEN rev.id END) AS approved_reviews,
    COUNT(DISTINCT CASE WHEN rev.status = 'pending' THEN rev.id END) AS pending_reviews,
    AVG(CASE WHEN rev.status = 'approved' AND rev.is_visible = TRUE THEN rev.rating END) AS average_rating,
    COUNT(DISTINCT ra.id) AS total_amenities,
    COUNT(DISTINCT CASE WHEN ra.is_visible = TRUE THEN ra.id END) AS visible_amenities,
    COUNT(DISTINCT ri.id) AS total_images,
    COUNT(DISTINCT CASE WHEN ri.is_visible = TRUE THEN ri.id END) AS visible_images
FROM restaurants r
LEFT JOIN reviews rev ON r.id = rev.restaurant_id
LEFT JOIN restaurant_amenities ra ON r.id = ra.restaurant_id
LEFT JOIN restaurant_images ri ON r.id = ri.restaurant_id
GROUP BY r.id, r.name;

-- Insert sample data for testing
INSERT INTO restaurant_amenities (restaurant_id, amenity_type, is_visible, added_by) 
SELECT 1, 'wifi', TRUE, 1 WHERE NOT EXISTS (SELECT 1 FROM restaurant_amenities WHERE restaurant_id = 1 AND amenity_type = 'wifi');

INSERT INTO restaurant_amenities (restaurant_id, amenity_type, is_visible, added_by) 
SELECT 1, 'parking', TRUE, 1 WHERE NOT EXISTS (SELECT 1 FROM restaurant_amenities WHERE restaurant_id = 1 AND amenity_type = 'parking');

INSERT INTO restaurant_amenities (restaurant_id, amenity_type, is_visible, added_by) 
SELECT 1, 'air_conditioning', TRUE, 1 WHERE NOT EXISTS (SELECT 1 FROM restaurant_amenities WHERE restaurant_id = 1 AND amenity_type = 'air_conditioning');

-- Sample reviews
INSERT INTO reviews (restaurant_id, customer_id, rating, comment, status, is_visible)
SELECT 1, 4, 5, 'Amazing food and excellent service! The ambiance is perfect for special occasions.', 'approved', TRUE
WHERE NOT EXISTS (SELECT 1 FROM reviews WHERE restaurant_id = 1 AND customer_id = 4);

INSERT INTO reviews (restaurant_id, customer_id, rating, comment, status, is_visible)
SELECT 2, 4, 4, 'Authentic Rwandan cuisine. The Isombe was delicious!', 'approved', TRUE
WHERE NOT EXISTS (SELECT 1 FROM reviews WHERE restaurant_id = 2 AND customer_id = 4);
