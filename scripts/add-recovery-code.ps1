# PowerShell script to add recovery_code column if missing
Write-Host "Adding recovery_code column to users table..." -ForegroundColor Cyan

try {
    node backend/scripts/add-recovery-code-column.js
    Write-Host "`n✅ Recovery code column added successfully!" -ForegroundColor Green
    Write-Host "`nYou can now use the 4-digit recovery code feature for password recovery." -ForegroundColor Cyan
} catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nPlease ensure:" -ForegroundColor Yellow
    Write-Host "  1. MySQL/Database server is running" -ForegroundColor Yellow
    Write-Host "  2. Database credentials in .env are correct" -ForegroundColor Yellow
    Write-Host "  3. Node.js is installed" -ForegroundColor Yellow
}
