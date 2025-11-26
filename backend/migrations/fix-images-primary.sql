-- Add is_primary column to restaurant_images
USE rwanda_eats_reserve;

ALTER TABLE restaurant_images 
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE AFTER is_visible;

-- Set first image as primary for each restaurant if none is set
UPDATE restaurant_images ri1
JOIN (
    SELECT restaurant_id, MIN(id) as first_id
    FROM restaurant_images
    GROUP BY restaurant_id
) ri2 ON ri1.restaurant_id = ri2.restaurant_id AND ri1.id = ri2.first_id
SET ri1.is_primary = TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM restaurant_images 
    WHERE restaurant_id = ri1.restaurant_id AND is_primary = TRUE
);
