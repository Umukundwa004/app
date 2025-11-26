// check-admin-users.js
const mysql = require('mysql2/promise');

async function checkUsers() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'vestine004',
        database: 'rwanda_eats_reserve'
    });

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

    await db.end();
}

checkUsers().catch(console.error);
