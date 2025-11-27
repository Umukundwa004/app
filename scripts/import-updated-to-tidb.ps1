# Import Updated Backup to TiDB Cloud
# This script will prompt for your TiDB Cloud password and import the backup

Write-Host "=== Import Updated Backup to TiDB Cloud ===" -ForegroundColor Cyan
Write-Host ""

# Check if backup file exists
if (-not (Test-Path "backup-updated-utf8.sql")) {
    Write-Host "Error: backup-updated-utf8.sql not found" -ForegroundColor Red
    Write-Host "Creating it now from local database..." -ForegroundColor Yellow
    
    $mysql = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe"
    & $mysql -u root -pvestine004 rwanda_eats_reserve > backup-updated.sql 2>&1
    (Get-Content backup-updated.sql -Raw) -replace 'SET NAMES cp850;', 'SET NAMES utf8mb4;' | Set-Content backup-updated-utf8.sql -Encoding UTF8
    
    Write-Host "Created backup-updated-utf8.sql" -ForegroundColor Green
    Write-Host ""
}

Write-Host "TiDB Cloud Connection Details:" -ForegroundColor Yellow
Write-Host "  Host: gateway01.eu-central-1.prod.aws.tidbcloud.com" -ForegroundColor Gray
Write-Host "  Port: 4000" -ForegroundColor Gray
Write-Host "  User: 3Nhz53ESuRkZyeE.root" -ForegroundColor Gray
Write-Host "  Database: rwanda_eats_reserve" -ForegroundColor Gray
Write-Host ""

# Prompt for TiDB Cloud password
$tidbPassword = Read-Host "Enter your TiDB Cloud password" -AsSecureString
$plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($tidbPassword))

Write-Host ""
Write-Host "Setting environment variables..." -ForegroundColor Yellow
$env:DB_HOST = "gateway01.eu-central-1.prod.aws.tidbcloud.com"
$env:DB_PORT = "4000"
$env:DB_USER = "3Nhz53ESuRkZyeE.root"
$env:DB_PASSWORD = $plainPassword
$env:DB_SSL = "true"

Write-Host "Importing to TiDB Cloud..." -ForegroundColor Yellow
Write-Host ""

node backend/scripts/import-backup-to-tidb.js

# Clear sensitive data
$plainPassword = $null
$tidbPassword = $null
Remove-Item Env:DB_HOST -ErrorAction SilentlyContinue
Remove-Item Env:DB_PORT -ErrorAction SilentlyContinue
Remove-Item Env:DB_USER -ErrorAction SilentlyContinue
Remove-Item Env:DB_PASSWORD -ErrorAction SilentlyContinue
Remove-Item Env:DB_SSL -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Import process completed." -ForegroundColor Green
Write-Host ""
Write-Host "If successful, your TiDB Cloud database now has:" -ForegroundColor Cyan
Write-Host "  - Updated secure admin passwords" -ForegroundColor White
Write-Host "  - All restaurant data" -ForegroundColor White
Write-Host "  - All user accounts" -ForegroundColor White
Write-Host "  - All reservations and reviews" -ForegroundColor White
Write-Host ""
Write-Host "Next: Update Render.com environment variables to use TiDB Cloud" -ForegroundColor Yellow
Write-Host "See: CONNECT_TIDB_TO_RENDER.md" -ForegroundColor Gray
