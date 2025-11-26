# Export Database Script for Rwanda Eats Reserve
# Run this to export your local database before importing to cloud

Write-Host "🗄️ Rwanda Eats Reserve Database Export" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Check if MySQL is available
$mysqlPath = Get-Command mysqldump -ErrorAction SilentlyContinue
if (-not $mysqlPath) {
    Write-Host "❌ mysqldump not found in PATH" -ForegroundColor Red
    Write-Host "Please make sure MySQL is installed and added to PATH" -ForegroundColor Yellow
    Write-Host "Or specify full path to mysqldump.exe" -ForegroundColor Yellow
    exit 1
}

# Set variables
$dbName = "rwanda_eats_reserve"
$username = "root"
$outputFile = "rwanda_eats_backup_$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss').sql"

Write-Host "📊 Database: $dbName" -ForegroundColor Cyan
Write-Host "👤 Username: $username" -ForegroundColor Cyan
Write-Host "📄 Output file: $outputFile" -ForegroundColor Cyan
Write-Host ""

# Prompt for password
$password = Read-Host "Enter MySQL password for user '$username'" -AsSecureString
$plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

Write-Host "🔄 Exporting database..." -ForegroundColor Yellow

try {
    # Export the database
    & mysqldump -u $username -p$plainPassword $dbName | Out-File -FilePath $outputFile -Encoding UTF8
    
    if (Test-Path $outputFile) {
        $fileSize = (Get-Item $outputFile).Length
        Write-Host "✅ Export completed successfully!" -ForegroundColor Green
        Write-Host "📄 File: $outputFile" -ForegroundColor Cyan
        Write-Host "📊 Size: $([math]::Round($fileSize/1KB, 2)) KB" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "🌐 Next steps:" -ForegroundColor Yellow
        Write-Host "1. Create cloud database (PlanetScale/Railway)" -ForegroundColor White
        Write-Host "2. Import this file to your cloud database" -ForegroundColor White
        Write-Host "3. Set environment variables in Vercel" -ForegroundColor White
        Write-Host "4. Redeploy your application" -ForegroundColor White
    } else {
        Write-Host "❌ Export failed - file not created" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Export failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Common issues:" -ForegroundColor Yellow
    Write-Host "- Wrong password" -ForegroundColor White
    Write-Host "- MySQL server not running" -ForegroundColor White
    Write-Host "- Database name doesn't exist" -ForegroundColor White
}

# Clear password from memory
$plainPassword = $null

Write-Host ""
Read-Host "Press Enter to continue"