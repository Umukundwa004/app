#!/usr/bin/env pwsh
# Export fresh database backup with latest schema changes
Write-Host "=== Exporting Local Database ===" -ForegroundColor Cyan

# Load environment variables
$envFile = ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

$dbHost = $env:DB_HOST
$dbPort = $env:DB_PORT
$dbUser = $env:DB_USER
$dbPassword = $env:DB_PASSWORD
$dbName = $env:DB_NAME

Write-Host "`nDatabase: $dbName" -ForegroundColor Yellow
Write-Host "Host: ${dbHost}:${dbPort}" -ForegroundColor Yellow

# Find MySQL executable
$mysqlDump = $null
$possiblePaths = @(
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe",
    "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqldump.exe",
    "C:\xampp\mysql\bin\mysqldump.exe",
    "C:\wamp64\bin\mysql\mysql8.0.27\bin\mysqldump.exe"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $mysqlDump = $path
        break
    }
}

if (-not $mysqlDump) {
    Write-Host "`n❌ mysqldump not found!" -ForegroundColor Red
    Write-Host "Please install MySQL or update the path in this script." -ForegroundColor Yellow
    exit 1
}

Write-Host "`nUsing: $mysqlDump" -ForegroundColor Green

# Export database
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$outputFile = "backup_full_$timestamp.sql"

Write-Host "`nExporting to: $outputFile" -ForegroundColor Cyan

$arguments = @(
    "-h", $dbHost,
    "-P", $dbPort,
    "-u", $dbUser,
    "-p$dbPassword",
    "--default-character-set=utf8mb4",
    "--single-transaction",
    "--routines",
    "--triggers",
    "--events",
    "--add-drop-table",
    "--extended-insert",
    $dbName
)

try {
    & $mysqlDump @arguments | Out-File -FilePath $outputFile -Encoding UTF8
    
    $fileSize = (Get-Item $outputFile).Length
    $fileSizeKB = [math]::Round($fileSize / 1KB, 2)
    
    Write-Host "`n✅ Export completed!" -ForegroundColor Green
    Write-Host "File: $outputFile ($fileSizeKB KB)" -ForegroundColor White
    
    # Also create a copy as latest backup
    Copy-Item $outputFile "backup_latest.sql" -Force
    Write-Host "Latest backup: backup_latest.sql" -ForegroundColor White
    
    Write-Host "`n=== Ready to Import to TiDB ===" -ForegroundColor Cyan
    Write-Host "Run: node backend/scripts/import-to-tidb.js" -ForegroundColor Yellow
    
} catch {
    Write-Host "`n❌ Export failed: $_" -ForegroundColor Red
    exit 1
}
