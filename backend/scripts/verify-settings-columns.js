// verify-settings-columns.js
const mysql = require('mysql2/promise');

async function verify() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'vestine004',
            database: 'rwanda_eats_reserve'
        });
        
        const [cols] = await connection.query('DESCRIBE restaurants');
        console.log('\n📋 Restaurants table columns:');
        cols.forEach(c => console.log(`  - ${c.Field} (${c.Type})`));
        
        const settingsColumns = ['rating_display', 'reviews_enabled', 'video_enabled', 'gallery_enabled'];
        const hasSettings = cols.filter(c => settingsColumns.includes(c.Field));
        
        console.log(`\n✨ Display settings columns: ${hasSettings.length}/4`);
        hasSettings.forEach(c => console.log(`  ✓ ${c.Field}`));
        
        if (hasSettings.length === 4) {
            console.log('\n✅ All display settings columns are present!');
        } else {
            console.log('\n⚠️ Some display settings columns are missing!');
            const missing = settingsColumns.filter(s => !hasSettings.find(h => h.Field === s));
            missing.forEach(m => console.log(`  ✗ ${m}`));
        }
        
        await connection.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

verify();
