-- Add unique constraint to restaurant name column
-- This ensures no two restaurants can have the same name

ALTER TABLE restaurants 
ADD UNIQUE KEY unique_restaurant_name (name);
