// check-admin-users.js
const { createConnection } = require('../utils/db');

async function checkUsers() {
    const db = await createConnection();

    console.log('Checking admin users in database...\n');

    const [users] = await db.execute(
        'SELECT id, name, email, user_type FROM users WHERE user_type IN ("restaurant_admin", "system_admin")'
    );

    console.log('Admin Users:');
    console.table(users);

    // Also check if restaurant admin exists
    const [restaurantAdmins] = await db.execute(
        'SELECT id, name, email, user_type FROM users WHERE email = ?',
        ['admin@millecollines.rw']
    );

    console.log('\nRestaurant Admin (admin@millecollines.rw):');
    console.table(restaurantAdmins);




    // Alter restaurants table to add operating_hours column
    await db.execute(
        'ALTER TABLE restaurants ADD COLUMN operating_hours JSON NULL AFTER closing_time'
    );
    console.log('Table restaurants altered: operating_hours column added.');

    // Check if operating_hours column exists
    const [restaurantColumns] = await db.execute(
        "SHOW COLUMNS FROM restaurants LIKE 'operating_hours'"
    );

    if (restaurantColumns.length > 0) {
        console.log("operating_hours column exists in restaurants table.");
    } else {
        console.log("operating_hours column does not exist in restaurants table.");
    }

    await db.end();
}

checkUsers().catch(console.error);

// To run this script, use the following command:
// mysql -u your_db_user -p -h your_db_host your_db_name < backend/migrations/add-recovery-code.sql
