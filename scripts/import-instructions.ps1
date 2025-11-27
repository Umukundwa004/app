# Quick Import to TiDB Cloud
# This script provides the exact command to run manually

Write-Host "=== TiDB Cloud Import Instructions ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Step 1: Ensure the UTF-8 backup exists" -ForegroundColor Yellow
if (Test-Path "backup-utf8.sql") {
    Write-Host "  ✓ backup-utf8.sql exists" -ForegroundColor Green
} else {
    Write-Host "  Creating backup-utf8.sql..." -ForegroundColor Yellow
    (Get-Content backup.sql -Raw) -replace 'SET NAMES cp850;', 'SET NAMES utf8mb4;' | Set-Content backup-utf8.sql -Encoding UTF8
    Write-Host "  ✓ backup-utf8.sql created" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 2: Set mysql variable" -ForegroundColor Yellow
Write-Host '  Run this command:' -ForegroundColor Gray
Write-Host '  $mysql = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"' -ForegroundColor White
Write-Host ""

Write-Host "Step 3: Run the import" -ForegroundColor Yellow
Write-Host '  Copy and run this command:' -ForegroundColor Gray
Write-Host ""
Write-Host '  Get-Content backup-utf8.sql | & $mysql -h gateway01.eu-central-1.prod.aws.tidbcloud.com -P 4000 -u 3Nhz53ESuRkZyeE.root -p --ssl-mode=REQUIRED --default-character-set=utf8mb4 rwanda_eats_reserve' -ForegroundColor White
Write-Host ""
Write-Host "  When prompted, enter your TiDB Cloud database password" -ForegroundColor Gray
Write-Host ""
Write-Host "Step 4: Verify the import" -ForegroundColor Yellow
Write-Host '  After import completes, verify locally with:' -ForegroundColor Gray
Write-Host '  node backend/scripts/verify-tidb-data.js' -ForegroundColor White
Write-Host ""
