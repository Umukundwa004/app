// reset-restaurant-admin-password.js
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function resetPassword() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'vestine004',
        database: 'rwanda_eats_reserve'
    });

    try {
        const email = 'admin@heaven.rw';
        const newPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await db.execute(
            'UPDATE users SET password_hash = ? WHERE email = ?',
            [hashedPassword, email]
        );
        
        console.log('\n✓ Password reset successful!');
        console.log(`Email: ${email}`);
        console.log(`New Password: ${newPassword}`);
        console.log('\nYou can now log in at: http://localhost:9000/login\n');
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await db.end();
    }
}

resetPassword();
