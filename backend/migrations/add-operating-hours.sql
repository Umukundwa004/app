-- Add operating_hours column to restaurants table
ALTER TABLE restaurants 
ADD COLUMN operating_hours JSON NULL AFTER closing_time;
