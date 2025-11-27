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
Write-Host "New Credentials:" -ForegroundColor Cyan
Write-Host "  System Admin:" -ForegroundColor White
Write-Host "    Email: admin@rwandaeats.com" -ForegroundColor Gray
Write-Host "    Password: RwandaEats@2025!Secure" -ForegroundColor Gray
Write-Host ""
Write-Host "  Restaurant Admin:" -ForegroundColor White
Write-Host "    Email: admin@millecollines.rw" -ForegroundColor Gray
Write-Host "    Password: MilleCollines@2025!Admin" -ForegroundColor Gray
Write-Host ""
Write-Host "  Test Customer:" -ForegroundColor White
Write-Host "    Email: john@example.com" -ForegroundColor Gray
Write-Host "    Password: Customer@2025!Secure" -ForegroundColor Gray
Write-Host ""
Write-Host "These passwords are secure and won't trigger Chrome's breach warning." -ForegroundColor Green
