# Connection Test Script
# Tests all file connections in the Rwanda Eats Reserve app

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Rwanda Eats Reserve - Connection Test" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# Test 1: Check if server files exist
Write-Host "[1/8] Checking backend files..." -ForegroundColor Yellow
if (Test-Path "backend\server.js") {
    Write-Host "  ✅ server.js exists" -ForegroundColor Green
} else {
    Write-Host "  ❌ server.js missing" -ForegroundColor Red
}

if (Test-Path "backend\config\config.js") {
    Write-Host "  ✅ config.js exists" -ForegroundColor Green
} else {
    Write-Host "  ❌ config.js missing" -ForegroundColor Red
}

# Test 2: Check frontend structure
Write-Host "`n[2/8] Checking frontend structure..." -ForegroundColor Yellow
if (Test-Path "frontend\public") {
    Write-Host "  ✅ frontend/public exists" -ForegroundColor Green
} else {
    Write-Host "  ❌ frontend/public missing" -ForegroundColor Red
}

if (Test-Path "frontend\views") {
    Write-Host "  ✅ frontend/views exists" -ForegroundColor Green
} else {
    Write-Host "  ❌ frontend/views missing" -ForegroundColor Red
}

# Test 3: Check JavaScript files
Write-Host "`n[3/8] Checking JavaScript files..." -ForegroundColor Yellow
$jsFiles = @("customer.js", "restaurant-admin.js", "system-admin.js", "splash.js", "pwa.js")
foreach ($file in $jsFiles) {
    if (Test-Path "frontend\public\js\$file") {
        Write-Host "  ✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file missing" -ForegroundColor Red
    }
}

# Test 4: Check HTML views
Write-Host "`n[4/8] Checking HTML views..." -ForegroundColor Yellow
$htmlFiles = @("customer.html", "login.html", "register.html", "verify-email.html", 
               "customer-profile.html", "system-admin.html", "restaurant-admin.html")
foreach ($file in $htmlFiles) {
    if (Test-Path "frontend\views\$file") {
        Write-Host "  ✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file missing" -ForegroundColor Red
    }
}

# Test 5: Check PWA files
Write-Host "`n[5/8] Checking PWA files..." -ForegroundColor Yellow
if (Test-Path "frontend\public\manifest.json") {
    Write-Host "  ✅ manifest.json exists" -ForegroundColor Green
} else {
    Write-Host "  ❌ manifest.json missing" -ForegroundColor Red
}

if (Test-Path "frontend\public\service-worker.js") {
    Write-Host "  ✅ service-worker.js exists" -ForegroundColor Green
} else {
    Write-Host "  ❌ service-worker.js missing" -ForegroundColor Red
}

# Test 6: Check upload directory
Write-Host "`n[6/8] Checking upload directories..." -ForegroundColor Yellow
if (Test-Path "frontend\public\uploads") {
    Write-Host "  ✅ uploads directory exists" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  uploads directory will be created on first upload" -ForegroundColor Yellow
}

# Test 7: Check CSS
Write-Host "`n[7/8] Checking CSS files..." -ForegroundColor Yellow
if (Test-Path "frontend\public\css\output.css") {
    Write-Host "  ✅ output.css exists" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  output.css missing - run 'npm run build:css'" -ForegroundColor Yellow
}

# Test 8: Check server paths in server.js
Write-Host "`n[8/8] Checking server.js path configuration..." -ForegroundColor Yellow
$serverContent = Get-Content "backend\server.js" -Raw
if ($serverContent -match "frontend.*public") {
    Write-Host "  ✅ Static paths configured correctly" -ForegroundColor Green
} else {
    Write-Host "  ❌ Static paths may need fixing" -ForegroundColor Red
}

if ($serverContent -match "frontend.*views") {
    Write-Host "  ✅ Views paths configured correctly" -ForegroundColor Green
} else {
    Write-Host "  ❌ Views paths may need fixing" -ForegroundColor Red
}

# Summary
Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

Write-Host "To start the server, run:" -ForegroundColor White
Write-Host "  cd backend" -ForegroundColor Yellow
Write-Host "  node server.js`n" -ForegroundColor Yellow

Write-Host "Or use npm:" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor Yellow
Write-Host "  npm run dev`n" -ForegroundColor Yellow
