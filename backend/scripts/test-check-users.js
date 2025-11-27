// test-check-users.js - Check what users exist
const { createConnection } = require('../utils/db');

async function checkUsers() {
    const db = await createConnection();

    try {
        const [users] = await db.execute(
            'SELECT id, email, name, user_type FROM users ORDER BY user_type, email'
        );
        
        console.log('\n=== All Users in Database ===\n');
        console.log('ID\tType\t\t\tEmail\t\t\t\tName');
        console.log('-'.repeat(80));
        
        users.forEach(user => {
            console.log(`${user.id}\t${user.user_type.padEnd(20)}\t${user.email.padEnd(30)}\t${user.name}`);
        });
        
        console.log('\n=== Restaurant Admins ===\n');
        const [restaurantAdmins] = await db.execute(
            `SELECT u.id, u.email, u.name, COUNT(r.id) as restaurant_count 
             FROM users u 
             LEFT JOIN restaurants r ON u.id = r.restaurant_admin_id 
             WHERE u.user_type = 'restaurant_admin' 
             GROUP BY u.id`
        );
        
        if (restaurantAdmins.length === 0) {
            console.log('No restaurant admin accounts found!');
        } else {
            restaurantAdmins.forEach(admin => {
                console.log(`${admin.email} - ${admin.name} (${admin.restaurant_count} restaurants)`);
            });
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await db.end();
    }
}

checkUsers();
