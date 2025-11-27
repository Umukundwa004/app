#!/usr/bin/env pwsh
# Interactive script to set up TiDB credentials

Write-Host "`n=== TiDB Cloud Setup Wizard ===" -ForegroundColor Cyan
Write-Host "This will help you configure TiDB Cloud connection.`n" -ForegroundColor White

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env file first." -ForegroundColor Yellow
    exit 1
}

Write-Host "Please enter your TiDB Cloud connection details:" -ForegroundColor Yellow
Write-Host "(You can find these in TiDB Cloud Console → Connect)`n" -ForegroundColor Gray

# Collect inputs
$tidbHost = Read-Host "TiDB Host (e.g., gateway01.eu-central-1.prod.aws.tidbcloud.com)"
$tidbPort = Read-Host "TiDB Port (default: 4000)"
$tidbUser = Read-Host "TiDB Username"
$tidbPassword = Read-Host "TiDB Password" -AsSecureString
$tidbDatabase = Read-Host "Database Name (default: rwanda_eats_reserve)"

# Convert secure string to plain text
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($tidbPassword)
$tidbPasswordPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Set defaults
if (-not $tidbPort) { $tidbPort = "4000" }
if (-not $tidbDatabase) { $tidbDatabase = "rwanda_eats_reserve" }

# Prepare env additions
$tidbConfig = @"

# TiDB Cloud Configuration (Added $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
TIDB_HOST=$tidbHost
TIDB_PORT=$tidbPort
TIDB_USER=$tidbUser
TIDB_PASSWORD=$tidbPasswordPlain
TIDB_DATABASE=$tidbDatabase
"@

# Check if TIDB_HOST already exists
$envContent = Get-Content ".env" -Raw
if ($envContent -match "TIDB_HOST") {
    Write-Host "`n⚠️  TiDB configuration already exists in .env" -ForegroundColor Yellow
    $overwrite = Read-Host "Overwrite? (y/n)"
    
    if ($overwrite -eq 'y') {
        # Remove old TIDB_ lines
        $envLines = Get-Content ".env"
        $envLines = $envLines | Where-Object { $_ -notmatch "^TIDB_" }
        $envLines | Set-Content ".env"
        Add-Content ".env" $tidbConfig
        Write-Host "✅ TiDB configuration updated!" -ForegroundColor Green
    } else {
        Write-Host "❌ Cancelled" -ForegroundColor Red
        exit 0
    }
} else {
    # Add new configuration
    Add-Content ".env" $tidbConfig
    Write-Host "`n✅ TiDB configuration added to .env!" -ForegroundColor Green
}

# Test connection
Write-Host "`n=== Testing Connection ===" -ForegroundColor Cyan
Write-Host "Running: node backend/scripts/test-tidb-connection.js`n" -ForegroundColor Gray

try {
    node backend/scripts/test-tidb-connection.js
    
    Write-Host "`n=== Next Steps ===" -ForegroundColor Cyan
    Write-Host "1. Import data: node backend/scripts/import-to-tidb.js" -ForegroundColor White
    Write-Host "2. Verify data: node backend/scripts/verify-tidb-data.js" -ForegroundColor White
    Write-Host "3. Update Render env vars to use TiDB" -ForegroundColor White
    
} catch {
    Write-Host "`n❌ Connection test failed!" -ForegroundColor Red
    Write-Host "Please check your credentials and try again." -ForegroundColor Yellow
}
