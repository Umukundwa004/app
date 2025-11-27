const { createConnection } = require('../utils/db');

async function checkColumns() {
    const connection = await createConnection();

    try {
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'rwanda_eats_reserve' 
            AND TABLE_NAME = 'restaurants'
            ORDER BY COLUMN_NAME
        `);
        
        console.log('Restaurant table columns:');
        columns.forEach(col => {
            console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
        });
        
        // Check specifically for menu columns
        const hasMenu = columns.some(c => c.COLUMN_NAME === 'menu');
        const hasMenuPdf = columns.some(c => c.COLUMN_NAME === 'menu_pdf');
        const hasMenuPdfUrl = columns.some(c => c.COLUMN_NAME === 'menu_pdf_url');
        
        console.log('\nMenu column checks:');
        console.log(`  menu: ${hasMenu ? '✓ EXISTS' : '✗ MISSING'}`);
        console.log(`  menu_pdf: ${hasMenuPdf ? '✓ EXISTS' : '✗ MISSING'}`);
        console.log(`  menu_pdf_url: ${hasMenuPdfUrl ? '✓ EXISTS' : '✗ MISSING'}`);
        
    } finally {
        await connection.end();
    }
}

checkColumns().catch(console.error);
