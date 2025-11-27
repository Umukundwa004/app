// Script: add-user-favorites-table.js
// Purpose: Create user_favorites table if it does not exist
require('dotenv').config();
const { createConnection } = require('../utils/db');

async function ensureUserFavoritesTable() {
  console.log('=== Ensuring user_favorites Table ===');
  const conn = await createConnection();
  try {
    // Check if table exists
    const [tables] = await conn.execute(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_favorites'
    `);

    if (tables.length > 0) {
      console.log('✓ Table user_favorites already exists');
      return;
    }

    // Create table
    await conn.execute(`
      CREATE TABLE user_favorites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        restaurant_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
        UNIQUE KEY uniq_user_restaurant (user_id, restaurant_id),
        INDEX idx_user (user_id),
        INDEX idx_restaurant (restaurant_id)
      )
    `);

    console.log('✓ Table user_favorites created successfully');
  } catch (error) {
    console.error('Error creating user_favorites table:', error.message);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
}

ensureUserFavoritesTable();
