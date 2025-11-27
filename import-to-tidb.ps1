# Import backup to TiDB Cloud
# Run this script to import the backup.sql to TiDB Cloud

# Find mysql.exe
$cmd = Get-Command mysql.exe -ErrorAction SilentlyContinue
if ($cmd) { 
    $mysql = $cmd.Source 
} else { 
    $mysql = Get-ChildItem "C:\Program Files" -Recurse -Filter mysql.exe -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName 
}

if (-not $mysql) {
    Write-Error "MySQL client not found. Please install MySQL or set the path manually."
    exit 1
}

Write-Host "Using MySQL client: $mysql" -ForegroundColor Green
Write-Host ""

# TiDB Cloud connection details
$dbHost = "gateway01.eu-central-1.prod.aws.tidbcloud.com"
$dbPort = "4000"
$dbUser = "3Nhz53ESuRkZyeE.root"
$dbName = "rwanda_eats_reserve"

# Use UTF-8 backup if it exists, otherwise use original
$backupFile = "backup-utf8.sql"
if (-not (Test-Path $backupFile)) {
    Write-Host "Creating UTF-8 version of backup..." -ForegroundColor Yellow
    (Get-Content backup.sql -Raw) -replace 'SET NAMES cp850;', 'SET NAMES utf8mb4;' | Set-Content $backupFile -Encoding UTF8
    Write-Host "UTF-8 backup created: $backupFile" -ForegroundColor Green
}

Write-Host ""
Write-Host "Importing to TiDB Cloud..." -ForegroundColor Cyan
Write-Host "Host: $dbHost" -ForegroundColor Gray
Write-Host "Port: $dbPort" -ForegroundColor Gray
Write-Host "User: $dbUser" -ForegroundColor Gray
Write-Host "Database: $dbName" -ForegroundColor Gray
Write-Host "File: $backupFile" -ForegroundColor Gray
Write-Host ""
Write-Host "You will be prompted for the database password." -ForegroundColor Yellow
Write-Host ""

# Import using Get-Content piping
Get-Content $backupFile | & $mysql -h $dbHost -P $dbPort -u $dbUser -p --ssl-mode=REQUIRED --default-character-set=utf8mb4 $dbName

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Import completed successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Import failed with exit code: $LASTEXITCODE" -ForegroundColor Red
}
