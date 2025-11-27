# Add recovery_code column to TiDB Cloud Production Database
Write-Host "=== Add recovery_code to TiDB Cloud Production ===" -ForegroundColor Cyan
Write-Host ""

# Get TiDB credentials
Write-Host "Enter your TiDB Cloud credentials:" -ForegroundColor Yellow
Write-Host "(You can find these at https://tidbcloud.com/ -> Your Cluster -> Connect)" -ForegroundColor Gray
Write-Host ""

$TIDB_HOST = Read-Host "TiDB Host (e.g., gateway01.eu-central-1.prod.aws.tidbcloud.com)"
if ([string]::IsNullOrEmpty($TIDB_HOST)) {
    $TIDB_HOST = "gateway01.eu-central-1.prod.aws.tidbcloud.com"
    Write-Host "Using default: $TIDB_HOST" -ForegroundColor Gray
}

$TIDB_PORT = Read-Host "TiDB Port (default: 4000)"
if ([string]::IsNullOrEmpty($TIDB_PORT)) {
    $TIDB_PORT = "4000"
}

$TIDB_USER = Read-Host "TiDB User"
if ([string]::IsNullOrEmpty($TIDB_USER)) {
    Write-Host "Error: TiDB User is required!" -ForegroundColor Red
    exit 1
}

$TIDB_PASSWORD = Read-Host "TiDB Password" -AsSecureString
$TIDB_PASSWORD_Plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($TIDB_PASSWORD))

$TIDB_DATABASE = Read-Host "TiDB Database (default: rwanda_eats_reserve)"
if ([string]::IsNullOrEmpty($TIDB_DATABASE)) {
    $TIDB_DATABASE = "rwanda_eats_reserve"
}

Write-Host ""
Write-Host "Connecting to TiDB Cloud..." -ForegroundColor Yellow

# Set environment variables temporarily
$env:TIDB_HOST = $TIDB_HOST
$env:TIDB_PORT = $TIDB_PORT
$env:TIDB_USER = $TIDB_USER
$env:TIDB_PASSWORD = $TIDB_PASSWORD_Plain
$env:TIDB_DATABASE = $TIDB_DATABASE

# Run the migration script
node backend/scripts/add-recovery-code-tidb-production.js

# Clear sensitive env vars
$env:TIDB_PASSWORD = $null

Write-Host ""
Write-Host "Done!" -ForegroundColor Green

npm install express multer multer-s3 @aws-sdk/client-s3 mysql2 dotenv
