# Verify TiDB Sync
# Check all data is properly synced to TiDB production

$env:DB_HOST = "gateway01.eu-central-1.prod.aws.tidbcloud.com"
$env:DB_PORT = "4000"
$env:DB_USER = "3Nhz53ESuRkZyeE.root"
$env:DB_NAME = "test"
$env:DB_SSL = "true"

Write-Host "`n🔍 Verifying TiDB Production Database...`n" -ForegroundColor Cyan

# Prompt for TiDB password
$securePassword = Read-Host "Enter TiDB password" -AsSecureString
$env:DB_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))

node backend/scripts/verify-tidb-sync.js

# Clear password from environment
$env:DB_PASSWORD = $null

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
