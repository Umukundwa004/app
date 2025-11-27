# Unlock Accounts in TiDB Production
# This script unlocks all locked accounts

$env:DB_HOST = "gateway01.eu-central-1.prod.aws.tidbcloud.com"
$env:DB_PORT = "4000"
$env:DB_USER = "3Nhz53ESuRkZyeE.root"
$env:DB_NAME = "test"
$env:DB_SSL = "true"

Write-Host "`n🔓 Unlocking accounts in TiDB Cloud...`n" -ForegroundColor Cyan

# Prompt for TiDB password
$securePassword = Read-Host "Enter TiDB password" -AsSecureString
$env:DB_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))

node backend/scripts/unlock-all-accounts-tidb.js

# Clear password from environment
$env:DB_PASSWORD = $null
