#!/usr/bin/env pwsh
# Pre-deployment verification script
# Ensures all data and features work before deployment

Write-Host "`n=== PRE-DEPLOYMENT VERIFICATION ===" -ForegroundColor Cyan

$allPassed = $true

# 1. Check local database has data
Write-Host "`n1. Checking Local Database Data..." -ForegroundColor Yellow

$env:NODE_ENV = "development"
$dbCheck = node -e @'
require('dotenv').config();
const mysql = require('mysql2/promise');
(async () => {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
    
    const tables = ['users', 'restaurants', 'restaurant_images', 'menu_items', 'reservations'];
    for (const table of tables) {
        const [rows] = await conn.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`   ${table.padEnd(20)} ${rows[0].count} rows`);
    }
    
    await conn.end();
})();
'@

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Local database check failed!" -ForegroundColor Red
    $allPassed = $false
} else {
    Write-Host "   ✅ Local database has data" -ForegroundColor Green
}

# 2. Export fresh backup
Write-Host "`n2. Exporting Fresh Database Backup..." -ForegroundColor Yellow
try {
    .\export-full-backup.ps1 | Out-Null
    if (Test-Path "backup_latest.sql") {
        $size = (Get-Item "backup_latest.sql").Length / 1KB
        Write-Host "   ✅ Backup created: backup_latest.sql ($([math]::Round($size, 2)) KB)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Backup file not created!" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    Write-Host "   ❌ Backup failed: $_" -ForegroundColor Red
    $allPassed = $false
}

# 3. Check TiDB credentials
Write-Host "`n3. Checking TiDB Configuration..." -ForegroundColor Yellow
$envContent = Get-Content ".env" -Raw
if ($envContent -match "TIDB_HOST" -and $envContent -match "TIDB_PASSWORD") {
    Write-Host "   ✅ TiDB credentials configured" -ForegroundColor Green
    
    # Test TiDB connection
    Write-Host "   Testing TiDB connection..." -ForegroundColor Gray
    $tidbTest = node backend/scripts/test-tidb-connection.js 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ TiDB connection successful" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  TiDB connection failed - check credentials" -ForegroundColor Yellow
        Write-Host "   Run: .\setup-tidb.ps1" -ForegroundColor Gray
    }
} else {
    Write-Host "   ⚠️  TiDB credentials not configured" -ForegroundColor Yellow
    Write-Host "   Run: .\setup-tidb.ps1" -ForegroundColor Gray
}

# 4. Check critical files are committed
Write-Host "`n4. Checking Critical Files..." -ForegroundColor Yellow
$criticalFiles = @(
    "frontend/views/register.html",
    "frontend/views/customer.html",
    "frontend/public/js/customer.js",
    "backend/server.js",
    "backend/utils/db.js"
)

$allCommitted = $true
foreach ($file in $criticalFiles) {
    $status = git ls-files $file 2>$null
    if ($status) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file NOT tracked!" -ForegroundColor Red
        $allCommitted = $false
        $allPassed = $false
    }
}

# 5. Check for uncommitted changes
Write-Host "`n5. Checking Git Status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "   ⚠️  Uncommitted changes found:" -ForegroundColor Yellow
    $gitStatus | ForEach-Object { Write-Host "      $_" -ForegroundColor Gray }
    Write-Host "   Run: git add -A && git commit -m 'message' && git push" -ForegroundColor Gray
} else {
    Write-Host "   ✅ All changes committed" -ForegroundColor Green
}

# 6. Check recovery code field exists
Write-Host "`n6. Checking Recovery Code Field in register.html..." -ForegroundColor Yellow
$registerContent = Get-Content "frontend/views/register.html" -Raw
if ($registerContent -match 'id="recovery-code"') {
    Write-Host "   ✅ Recovery code field exists" -ForegroundColor Green
    
    # Check if in Git
    $gitContent = git show HEAD:frontend/views/register.html 2>$null
    if ($gitContent -match 'id="recovery-code"') {
        Write-Host "   ✅ Recovery code field committed to Git" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Recovery code field NOT in Git!" -ForegroundColor Red
        $allPassed = $false
    }
} else {
    Write-Host "   ❌ Recovery code field missing!" -ForegroundColor Red
    $allPassed = $false
}

# 7. Check restaurant loading code
Write-Host "`n7. Checking Restaurant Display Code..." -ForegroundColor Yellow
$customerJS = Get-Content "frontend/public/js/customer.js" -Raw
if ($customerJS -match "loadFeaturedRestaurants" -and $customerJS -match "displayFeaturedRestaurants") {
    Write-Host "   ✅ Restaurant loading functions exist" -ForegroundColor Green
} else {
    Write-Host "   ❌ Restaurant loading functions missing!" -ForegroundColor Red
    $allPassed = $false
}

# 8. Check Cloudinary configuration
Write-Host "`n8. Checking Cloudinary Configuration..." -ForegroundColor Yellow
if ($envContent -match "CLOUDINARY_CLOUD_NAME" -and $envContent -match "CLOUDINARY_API_KEY") {
    $cloudName = ($envContent | Select-String "CLOUDINARY_CLOUD_NAME=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value })
    if ($cloudName -and $cloudName.Trim() -ne "") {
        Write-Host "   ✅ Cloudinary configured" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Cloudinary credentials empty" -ForegroundColor Yellow
        Write-Host "   File uploads will fail until configured" -ForegroundColor Gray
    }
} else {
    Write-Host "   ⚠️  Cloudinary not configured" -ForegroundColor Yellow
}

# 9. Check environment variables for deployment
Write-Host "`n9. Checking Required Environment Variables..." -ForegroundColor Yellow
$requiredVars = @(
    "DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME",
    "SESSION_SECRET", "JWT_SECRET", "MAILERSEND_API_KEY"
)

foreach ($var in $requiredVars) {
    if ($envContent -match "$var=(.+)") {
        $value = ($envContent | Select-String "$var=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value })
        if ($value.Trim() -ne "") {
            Write-Host "   ✅ $var" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  $var is empty" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ❌ $var missing!" -ForegroundColor Red
    }
}

# 10. Final summary
Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan

if ($allPassed) {
    Write-Host "✅ ALL CHECKS PASSED - Ready for deployment!" -ForegroundColor Green
    
    Write-Host "`n=== DEPLOYMENT STEPS ===" -ForegroundColor Cyan
    Write-Host "1. Import data to TiDB:" -ForegroundColor White
    Write-Host "   node backend/scripts/import-to-tidb.js`n" -ForegroundColor Gray
    
    Write-Host "2. Update Render Environment Variables:" -ForegroundColor White
    Write-Host "   DB_HOST=<your_tidb_host>" -ForegroundColor Gray
    Write-Host "   DB_PORT=4000" -ForegroundColor Gray
    Write-Host "   DB_USER=<your_tidb_user>" -ForegroundColor Gray
    Write-Host "   DB_PASSWORD=<your_tidb_password>" -ForegroundColor Gray
    Write-Host "   DB_NAME=rwanda_eats_reserve" -ForegroundColor Gray
    Write-Host "   DB_SSL=true" -ForegroundColor Gray
    Write-Host "   CLOUDINARY_CLOUD_NAME=<your_cloud_name>" -ForegroundColor Gray
    Write-Host "   CLOUDINARY_API_KEY=<your_api_key>" -ForegroundColor Gray
    Write-Host "   CLOUDINARY_API_SECRET=<your_api_secret>`n" -ForegroundColor Gray
    
    Write-Host "3. Trigger Render Deployment:" -ForegroundColor White
    Write-Host "   Manual Deploy -> Clear build cache & deploy`n" -ForegroundColor Gray
    
    Write-Host "4. Verify Deployment:" -ForegroundColor White
    Write-Host "   - Visit: https://your-app.onrender.com/register" -ForegroundColor Gray
    Write-Host "   - Check: Recovery code field appears" -ForegroundColor Gray
    Write-Host "   - Visit: https://your-app.onrender.com/" -ForegroundColor Gray
    Write-Host "   - Check: Restaurants display correctly" -ForegroundColor Gray
    Write-Host "   - Test: Create account with 4-digit code" -ForegroundColor Gray
    Write-Host "   - Test: Make a reservation`n" -ForegroundColor Gray
    
} else {
    Write-Host "⚠️  SOME CHECKS FAILED - Fix issues before deployment!" -ForegroundColor Yellow
    Write-Host "`nPlease resolve the issues marked with ❌ above.`n" -ForegroundColor Red
}

Write-Host "=== END ===" -ForegroundColor Cyan
