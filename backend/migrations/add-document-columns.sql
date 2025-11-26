-- Add document columns to restaurants table
USE rwanda_eats_reserve;

-- Check and add menu_pdf_url column
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'rwanda_eats_reserve' AND TABLE_NAME = 'restaurants' AND COLUMN_NAME = 'menu_pdf_url';

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE restaurants ADD COLUMN menu_pdf_url VARCHAR(255) DEFAULT NULL', 
    'SELECT ''menu_pdf_url already exists'' as message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add certificate_url column
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'rwanda_eats_reserve' AND TABLE_NAME = 'restaurants' AND COLUMN_NAME = 'certificate_url';

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE restaurants ADD COLUMN certificate_url VARCHAR(255) DEFAULT NULL', 
    'SELECT ''certificate_url already exists'' as message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
