// run-fix-images.js
const mysql = require('mysql2/promise');
const fs = require('fs');

async function runFix() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'vestine004',
            database: 'rwanda_eats_reserve',
            multipleStatements: true
        });
        
        console.log('✅ Connected to database');
        
        const sql = fs.readFileSync('fix-images-primary.sql', 'utf8');
        await connection.query(sql);
        
        console.log('✅ is_primary column added successfully!');
        
        const [cols] = await connection.query('DESCRIBE restaurant_images');
        const hasPrimary = cols.find(c => c.Field === 'is_primary');
        if (hasPrimary) {
            console.log('✓ is_primary column verified');
        }
        
        await connection.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

runFix();
