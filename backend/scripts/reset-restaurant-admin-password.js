// reset-restaurant-admin-password.js
const { createConnection } = require('../utils/db');
const bcrypt = require('bcryptjs');

async function resetPassword() {
    const db = await createConnection();

    try {
        const email = 'admin@heaven.rw';
        const newPassword = 'MilleCollines@2025!Admin';
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
