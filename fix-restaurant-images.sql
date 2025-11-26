-- Fix restaurant_images table structure
-- Add is_visible column if it doesn't exist

USE rwanda_eats_reserve;

-- Check if restaurant_images table exists, create if not
CREATE TABLE IF NOT EXISTS restaurant_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_restaurant_id (restaurant_id),
    INDEX idx_primary (restaurant_id, is_primary)
);

-- Add is_visible column if it doesn't exist (for existing tables)
SET @dbname = DATABASE();
SET @tablename = 'restaurant_images';
SET @columnname = 'is_visible';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' BOOLEAN DEFAULT TRUE')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Make sure all existing images are visible by default
UPDATE restaurant_images SET is_visible = TRUE WHERE is_visible IS NULL;
