-- Migration: Add restaurant_images table for multiple images
-- Run this to add support for multiple restaurant images

USE rwanda_eats_reserve;

-- Create restaurant_images table
CREATE TABLE IF NOT EXISTS restaurant_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_restaurant_id (restaurant_id),
    INDEX idx_primary (restaurant_id, is_primary)
);
