-- Fix menu columns in restaurants table
USE rwanda_eats_reserve;

-- Add menu column if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'rwanda_eats_reserve' AND TABLE_NAME = 'restaurants' AND COLUMN_NAME = 'menu';

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE restaurants ADD COLUMN menu TEXT DEFAULT NULL', 
    'SELECT ''menu column already exists'' as message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add menu_pdf column if it doesn't exist (not menu_pdf_url)
SET @col_exists2 = 0;
SELECT COUNT(*) INTO @col_exists2 FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'rwanda_eats_reserve' AND TABLE_NAME = 'restaurants' AND COLUMN_NAME = 'menu_pdf';

SET @query2 = IF(@col_exists2 = 0, 
    'ALTER TABLE restaurants ADD COLUMN menu_pdf VARCHAR(255) DEFAULT NULL', 
    'SELECT ''menu_pdf column already exists'' as message');
PREPARE stmt2 FROM @query2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

SELECT 'Menu columns migration completed' as status;
