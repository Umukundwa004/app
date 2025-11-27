-- Add recovery_code column to users table for password recovery
ALTER TABLE users 
ADD COLUMN recovery_code VARCHAR(4) NULL AFTER password_hash;
