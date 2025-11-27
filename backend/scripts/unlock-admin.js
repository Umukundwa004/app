// unlock-admin.js - Unlock admin account
const { createConnection } = require('../utils/db');

async function unlockAdmin() {
    let connection;
    
    try {
        connection = await createConnection();

        console.log('Connected to database');

        // Unlock all accounts and reset login attempts
        await connection.execute(
            'UPDATE users SET account_locked = FALSE, login_attempts = 0'
        );

        console.log('✅ All accounts unlocked successfully!');
        
        // Show admin accounts
        const [admins] = await connection.execute(
            'SELECT email, user_type, account_locked, login_attempts FROM users WHERE user_type IN ("system_admin", "restaurant_admin")'
        );
        
        console.log('\nAdmin Accounts Status:');
        admins.forEach(admin => {
            console.log(`- ${admin.email} (${admin.user_type})`);
            console.log(`  Locked: ${admin.account_locked}, Attempts: ${admin.login_attempts}`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

unlockAdmin();
