// test-admin-login.js - Test admin login credentials
const { createConnection } = require('../utils/db');
const bcrypt = require('bcryptjs');

async function testLogin() {
    let connection;
    
    try {
        connection = await createConnection();

        console.log('✅ Connected to database\n');

        // Test credentials
        const testAccounts = [
            { email: 'admin@rwandaeats.com', password: 'admin123', expectedType: 'system_admin' },
            { email: 'admin@millecollines.rw', password: 'restaurant123', expectedType: 'restaurant_admin' },
            { email: 'john@example.com', password: 'customer123', expectedType: 'customer' }
        ];

        for (const account of testAccounts) {
            console.log(`\n🔍 Testing: ${account.email}`);
            console.log(`   Password: ${account.password}`);
            
            const [users] = await connection.execute(
                'SELECT id, name, email, password_hash, user_type, account_locked, login_attempts FROM users WHERE email = ?',
                [account.email]
            );

            if (users.length === 0) {
                console.log('   ❌ User not found in database!');
                continue;
            }

            const user = users[0];
            console.log(`   User Type: ${user.user_type}`);
            console.log(`   Locked: ${user.account_locked ? 'Yes' : 'No'}`);
            console.log(`   Login Attempts: ${user.login_attempts}`);

            // Test password
            const isValid = await bcrypt.compare(account.password, user.password_hash);
            
            if (isValid) {
                console.log(`   ✅ Password CORRECT - Login should work!`);
            } else {
                console.log(`   ❌ Password INCORRECT - Login will fail!`);
                console.log(`   Hash in DB: ${user.password_hash.substring(0, 20)}...`);
            }

            if (user.user_type !== account.expectedType) {
                console.log(`   ⚠️  Expected type: ${account.expectedType}, Got: ${user.user_type}`);
            }
        }

        console.log('\n\n📋 Summary:');
        console.log('=' .repeat(50));
        console.log('Use these credentials to login:');
        console.log('\nSystem Admin:');
        console.log('  Email: admin@rwandaeats.com');
        console.log('  Password: admin123');
        console.log('  Redirects to: /admin → system-admin.html');
        console.log('\nRestaurant Admin:');
        console.log('  Email: admin@millecollines.rw');
        console.log('  Password: restaurant123');
        console.log('  Redirects to: /admin → restaurant-admin.html');
        console.log('\nCustomer:');
        console.log('  Email: john@example.com');
        console.log('  Password: customer123');
        console.log('  Redirects to: / → customer.html');
        console.log('=' .repeat(50));

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

testLogin();
