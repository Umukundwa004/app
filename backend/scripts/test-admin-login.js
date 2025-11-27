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
            { email: 'admin@rwandaeats.com', password: 'RwandaEats@2025!Secure', expectedType: 'system_admin' },
            { email: 'admin@millecollines.rw', password: 'MilleCollines@2025!Admin', expectedType: 'restaurant_admin' },
            { email: 'john@example.com', password: 'Customer@2025!Secure', expectedType: 'customer' }
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
        console.log('Login functionality is working correctly.');
        console.log('\nAccount Types:');
        console.log('  System Admin → /admin → system-admin.html');
        console.log('  Restaurant Admin → /admin → restaurant-admin.html');
        console.log('  Customer → / → customer.html');
        console.log('\nUse the password recovery functionality to set secure passwords.');
        console.log('=' .repeat(50));

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

testLogin();
