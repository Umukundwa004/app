// Import latest backup to TiDB Cloud with all schema updates
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');

async function importToTiDB() {
    console.log('\n=== IMPORT TO TIDB CLOUD ===\n');

    // Check for backup file
    let backupFile = 'backup_latest.sql';
    if (!fs.existsSync(backupFile)) {
        // Try other backup files
        const backups = ['backup.sql', 'backup-updated-utf8.sql', 'backup-utf8.sql'];
        backupFile = backups.find(f => fs.existsSync(f));
        
        if (!backupFile) {
            console.error('❌ No backup file found!');
            console.log('\nPlease run: .\\export-full-backup.ps1');
            process.exit(1);
        }
    }

    console.log(`📁 Using backup file: ${backupFile}`);
    const fileSize = (fs.statSync(backupFile).size / 1024).toFixed(2);
    console.log(`   Size: ${fileSize} KB\n`);

    // Create TiDB connection
    const connection = await mysql.createConnection({
        host: process.env.TIDB_HOST || process.env.DB_HOST,
        port: process.env.TIDB_PORT || 4000,
        user: process.env.TIDB_USER || process.env.DB_USER,
        password: process.env.TIDB_PASSWORD || process.env.DB_PASSWORD,
        database: process.env.TIDB_DATABASE || process.env.DB_NAME,
        ssl: {
            minVersion: 'TLSv1.2',
            rejectUnauthorized: true
        },
        multipleStatements: false
    });

    console.log('✅ Connected to TiDB Cloud');
    console.log(`   Host: ${connection.config.host}`);
    console.log(`   Database: ${connection.config.database}\n`);

    // Read and parse SQL file
    console.log('📖 Reading SQL file...');
    let sqlContent = fs.readFileSync(backupFile, 'utf8');

    // Remove MySQL-specific comments
    sqlContent = sqlContent.replace(/\/\*!40\d{3}.*?\*\/;?/gs, '');
    sqlContent = sqlContent.replace(/-- .*$/gm, '');
    
    // Split into statements (handle multi-line statements)
    const statements = sqlContent
        .split(/;\s*$/gm)
        .map(stmt => stmt.trim())
        .filter(stmt => 
            stmt.length > 0 && 
            !stmt.startsWith('--') && 
            !stmt.startsWith('/*') &&
            !stmt.match(/^SET |^LOCK |^UNLOCK |^USE /)
        );

    console.log(`   Found ${statements.length} SQL statements\n`);

    // Execute statements with progress
    console.log('⚙️  Executing SQL statements...\n');
    let executed = 0;
    let skipped = 0;
    let failed = 0;
    const errors = [];

    for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        
        // Progress indicator
        if (i > 0 && i % 50 === 0) {
            const percent = Math.round((i / statements.length) * 100);
            console.log(`   Progress: ${i}/${statements.length} (${percent}%) - ✅ ${executed} | ⚠️  ${skipped} | ❌ ${failed}`);
        }

        try {
            // Skip empty or comment-only statements
            if (!stmt || stmt.length < 5) {
                skipped++;
                continue;
            }

            await connection.query(stmt);
            executed++;

        } catch (error) {
            // Check if error is ignorable
            const ignorableErrors = [
                'ER_TABLE_EXISTS_ERROR',
                'ER_DUP_KEYNAME',
                'ER_CANT_DROP_FIELD_OR_KEY',
                'already exists'
            ];

            const isIgnorable = ignorableErrors.some(err => 
                error.code === err || error.message.includes(err)
            );

            if (isIgnorable) {
                skipped++;
            } else {
                failed++;
                errors.push({
                    statement: stmt.substring(0, 100) + '...',
                    error: error.message
                });

                // Only show first few errors to avoid spam
                if (failed <= 5) {
                    console.error(`   ❌ Error: ${error.message.substring(0, 80)}`);
                }
            }
        }
    }

    console.log(`\n✅ Import completed!\n`);
    console.log(`📊 Summary:`);
    console.log(`   ✅ Executed: ${executed}`);
    console.log(`   ⚠️  Skipped: ${skipped}`);
    console.log(`   ❌ Failed: ${failed}\n`);

    if (errors.length > 0 && errors.length <= 10) {
        console.log('❌ Errors encountered:');
        errors.forEach((err, idx) => {
            console.log(`\n${idx + 1}. ${err.statement}`);
            console.log(`   Error: ${err.error}`);
        });
    }

    // Verify data
    console.log('\n🔍 Verifying imported data...\n');

    const tables = [
        'users',
        'restaurants', 
        'restaurant_images',
        'menu_items',
        'reservations',
        'reviews'
    ];

    for (const table of tables) {
        try {
            const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
            console.log(`   ${table.padEnd(20)} ${rows[0].count} rows`);
        } catch (error) {
            console.log(`   ${table.padEnd(20)} ⚠️  ${error.message}`);
        }
    }

    // Check for required columns
    console.log('\n🔍 Verifying schema updates...\n');

    try {
        const [cols] = await connection.query("SHOW COLUMNS FROM users WHERE Field = 'recovery_code'");
        console.log(`   recovery_code column: ${cols.length > 0 ? '✅ EXISTS' : '❌ MISSING'}`);
    } catch (err) {
        console.log(`   recovery_code column: ❌ ${err.message}`);
    }

    try {
        const [cols] = await connection.query("SHOW COLUMNS FROM users WHERE Field = 'verification_token_expires'");
        console.log(`   verification_token_expires: ${cols.length > 0 ? '✅ EXISTS' : '❌ MISSING'}`);
    } catch (err) {
        console.log(`   verification_token_expires: ❌ ${err.message}`);
    }

    try {
        const [cols] = await connection.query("SHOW COLUMNS FROM restaurant_images WHERE Field = 'is_primary'");
        console.log(`   is_primary column: ${cols.length > 0 ? '✅ EXISTS' : '❌ MISSING'}`);
    } catch (err) {
        console.log(`   is_primary column: ❌ ${err.message}`);
    }

    await connection.end();
    
    console.log('\n✅ TiDB import complete!\n');
    console.log('Next steps:');
    console.log('1. Update .env to use TiDB connection (DB_HOST, DB_PORT, etc.)');
    console.log('2. Set DB_SSL=true');
    console.log('3. Test connection: node backend/scripts/test-tidb-connection.js');
    console.log('4. Deploy to Render with TiDB env vars\n');
}

importToTiDB().catch(error => {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
});
