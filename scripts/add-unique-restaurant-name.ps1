# Add Unique Restaurant Name Constraint
Write-Host "Adding unique constraint to restaurant names..." -ForegroundColor Cyan

try {
    node backend/scripts/add-unique-restaurant-name.js
    Write-Host "`n✅ Migration completed!" -ForegroundColor Green
} catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
