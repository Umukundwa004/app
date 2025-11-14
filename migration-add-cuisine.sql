-- Migration: Add cuisine column to menu_items table
-- Run this if your database already exists

USE rwanda_eats_reserve;

-- Add cuisine column to menu_items table if it doesn't exist
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS cuisine VARCHAR(50) AFTER category;
