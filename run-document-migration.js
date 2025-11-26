// run-document-migration.js
const mysql = require('mysql2/promise');
const fs = require('fs');

async function runMigration() {
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
        
        const sql = fs.readFileSync('add-document-columns.sql', 'utf8');
        await connection.query(sql);
        
        console.log('✅ Document columns added successfully!');
        
        // Verify
        const [cols] = await connection.query('DESCRIBE restaurants');
        const hasMenuPdf = cols.find(c => c.Field === 'menu_pdf_url');
        const hasCertificate = cols.find(c => c.Field === 'certificate_url');
        
        if (hasMenuPdf) console.log('✓ menu_pdf_url column verified');
        if (hasCertificate) console.log('✓ certificate_url column verified');
        
        await connection.end();
        console.log('\n🔌 Database connection closed');
    } catch (error) {
        console.error('Error:', error.message);
        if (connection) await connection.end();
    }
}

runMigration();
