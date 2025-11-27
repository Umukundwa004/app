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

    // Alter table to add recovery_code column
    await db.execute(
        'ALTER TABLE users ADD COLUMN recovery_code VARCHAR(4) NULL AFTER password_hash'
    );
    console.log('\nTable users altered: recovery_code column added.');

    await db.end();
}

checkUsers().catch(console.error);

// To run this script, use the following command:
// mysql -u your_db_user -p -h your_db_host your_db_name < backend/migrations/add-recovery-code.sql
