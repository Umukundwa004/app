-- Add is_primary column to restaurant_images table
-- This allows marking one image as the primary/featured image for a restaurant

ALTER TABLE restaurant_images 
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE 
AFTER image_url;

-- Optionally, set the first image of each restaurant as primary if none exists
-- UPDATE restaurant_images ri1
-- SET is_primary = TRUE
-- WHERE id = (
--     SELECT MIN(id) 
--     FROM restaurant_images ri2 
--     WHERE ri2.restaurant_id = ri1.restaurant_id
-- )
-- AND NOT EXISTS (
--     SELECT 1 
--     FROM restaurant_images ri3 
--     WHERE ri3.restaurant_id = ri1.restaurant_id 
--     AND ri3.is_primary = TRUE
-- );
