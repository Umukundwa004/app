-- Migration: Add user_favorites table for per-user favorite restaurants
-- Each user can mark multiple restaurants as favorites
-- Ensures uniqueness of (user_id, restaurant_id)

CREATE TABLE IF NOT EXISTS user_favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    UNIQUE KEY uniq_user_restaurant (user_id, restaurant_id),
    INDEX idx_user (user_id),
    INDEX idx_restaurant (restaurant_id)
);
