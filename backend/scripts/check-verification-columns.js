require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkColumns() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const [cols] = await connection.execute(
        'SHOW COLUMNS FROM users WHERE Field IN ("verification_token", "verification_token_expires")'
    );
    
    console.log('Verification columns:');
    console.table(cols.map(c => ({ Field: c.Field, Type: c.Type, Null: c.Null })));
    
    await connection.end();
}

checkColumns().catch(console.error);
