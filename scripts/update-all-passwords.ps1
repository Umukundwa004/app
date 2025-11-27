# Update passwords in both local and TiDB Cloud databases
Write-Host "=== Updating Passwords in Local and TiDB Cloud ===" -ForegroundColor Cyan
Write-Host ""

# Update local database
Write-Host "Step 1: Updating LOCAL database..." -ForegroundColor Yellow
node backend/scripts/update-secure-passwords.js

Write-Host ""
Write-Host "Step 2: Updating TIDB CLOUD database..." -ForegroundColor Yellow
$env:DB_HOST = "gateway01.eu-central-1.prod.aws.tidbcloud.com"
$env:DB_PORT = "4000"
$env:DB_USER = "3Nhz53ESuRkZyeE.root"
$env:DB_SSL = "true"
node backend/scripts/update-secure-passwords.js

# Reset environment variables
Remove-Item Env:DB_HOST -ErrorAction SilentlyContinue
Remove-Item Env:DB_PORT -ErrorAction SilentlyContinue
Remove-Item Env:DB_USER -ErrorAction SilentlyContinue
Remove-Item Env:DB_SSL -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "=== PASSWORD UPDATE COMPLETE ===" -ForegroundColor Green
Write-Host ""
Write-Host "Passwords have been updated. Use the password recovery functionality to set new passwords as needed." -ForegroundColor Cyan
