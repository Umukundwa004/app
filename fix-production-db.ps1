# Quick fix: Add missing columns to production TiDB database
Write-Host "=== Fix Restaurant Update Error - Add Missing Columns ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will add missing columns to your production TiDB database." -ForegroundColor Yellow
Write-Host ""

# Pre-filled TiDB credentials from your documentation
$TIDB_HOST = "gateway01.eu-central-1.prod.aws.tidbcloud.com"
$TIDB_PORT = "4000"
$TIDB_USER = "3Nhz53ESuRkZyeE.root"
$TIDB_DATABASE = "rwanda_eats_reserve"

Write-Host "TiDB Connection Details:" -ForegroundColor Green
Write-Host "  Host: $TIDB_HOST"
Write-Host "  Port: $TIDB_PORT"
Write-Host "  User: $TIDB_USER"
Write-Host "  Database: $TIDB_DATABASE"
Write-Host ""

# Only ask for password
Write-Host "Please enter your TiDB Cloud password:" -ForegroundColor Yellow
$TIDB_PASSWORD = Read-Host "Password" -AsSecureString
$TIDB_PASSWORD_Plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($TIDB_PASSWORD))

if ([string]::IsNullOrEmpty($TIDB_PASSWORD_Plain)) {
    Write-Host "Error: Password is required!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Connecting to TiDB Cloud and adding missing columns..." -ForegroundColor Yellow
Write-Host ""

# Set environment variables temporarily
$env:TIDB_HOST = $TIDB_HOST
$env:TIDB_PORT = $TIDB_PORT
$env:TIDB_USER = $TIDB_USER
$env:TIDB_PASSWORD = $TIDB_PASSWORD_Plain
$env:TIDB_DATABASE = $TIDB_DATABASE

# Run the migration script
node backend/scripts/sync-all-columns-to-production.js

$exitCode = $LASTEXITCODE

# Clear sensitive env vars
$env:TIDB_PASSWORD = $null

if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "✨ SUCCESS! Columns added to production database." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Go to: https://dashboard.render.com/" -ForegroundColor White
    Write-Host "  2. Find your service" -ForegroundColor White
    Write-Host "  3. Click 'Manual Deploy' → 'Clear build cache & deploy'" -ForegroundColor White
    Write-Host "  4. Wait ~2-3 minutes for deployment" -ForegroundColor White
    Write-Host "  5. Test editing a restaurant - it should work now!" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "⚠️ Migration failed. Please check the errors above." -ForegroundColor Red
    Write-Host ""
}
