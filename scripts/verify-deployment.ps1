#!/usr/bin/env pwsh
# Quick script to verify deployed vs local file differences

Write-Host "`n=== DEPLOYMENT VERIFICATION ===" -ForegroundColor Cyan

# Check if register.html has recovery code field
Write-Host "`n1. Checking register.html for recovery code field..." -ForegroundColor Yellow
$registerContent = Get-Content "frontend/views/register.html" -Raw
if ($registerContent -match 'id="recovery-code"') {
    Write-Host "   ✅ Recovery code field EXISTS in local file" -ForegroundColor Green
} else {
    Write-Host "   ❌ Recovery code field MISSING in local file" -ForegroundColor Red
}

# Check if it's in Git
Write-Host "`n2. Checking if recovery code is committed to Git..." -ForegroundColor Yellow
$gitContent = git show HEAD:frontend/views/register.html 2>$null
if ($gitContent -match 'id="recovery-code"') {
    Write-Host "   ✅ Recovery code field IN Git (will deploy)" -ForegroundColor Green
} else {
    Write-Host "   ❌ Recovery code field NOT in Git" -ForegroundColor Red
}

# Check customer.js for restaurant loading
Write-Host "`n3. Checking customer.js for restaurant loading..." -ForegroundColor Yellow
$customerContent = Get-Content "frontend/public/js/customer.js" -Raw
if ($customerContent -match 'loadFeaturedRestaurants|displayFeaturedRestaurants') {
    Write-Host "   ✅ Restaurant loading functions exist" -ForegroundColor Green
} else {
    Write-Host "   ❌ Restaurant loading functions missing" -ForegroundColor Red
}

# Check current commit
Write-Host "`n4. Current Git status:" -ForegroundColor Yellow
$currentCommit = git rev-parse --short HEAD
$branch = git branch --show-current
Write-Host "   Branch: $branch" -ForegroundColor White
Write-Host "   Commit: $currentCommit" -ForegroundColor White
Write-Host "   Last 3 commits:" -ForegroundColor White
git log --oneline -3

# Check if push is needed
Write-Host "`n5. Checking if local is ahead of remote..." -ForegroundColor Yellow
$status = git status -sb
if ($status -match 'ahead') {
    Write-Host "   ⚠️  Local is AHEAD - need to push!" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ Local and remote are in sync" -ForegroundColor Green
}

Write-Host "`n=== NEXT STEPS ===" -ForegroundColor Cyan
Write-Host "1. Go to your Render dashboard" -ForegroundColor White
Write-Host "2. Select 'rwanda-eats-reserve' service" -ForegroundColor White
Write-Host "3. Click 'Manual Deploy' → 'Clear build cache & deploy'" -ForegroundColor White
Write-Host "4. Wait 2-3 minutes for deployment" -ForegroundColor White
Write-Host "5. Test: https://your-app.onrender.com/register" -ForegroundColor White
Write-Host "6. Verify recovery code field appears" -ForegroundColor White
Write-Host "7. Test: https://your-app.onrender.com/ (restaurants should load)" -ForegroundColor White

Write-Host "`n=== DONE ===" -ForegroundColor Green
