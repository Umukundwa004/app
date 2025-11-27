#!/usr/bin/env pwsh
# Quick deployment workflow - Run this to deploy everything

Write-Host @"

╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║        RWANDA EATS - DEPLOYMENT WORKFLOW                       ║
║        Ensure All Data Shows After Deployment                  ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

$step = 1

# Step 1: Export Data
Write-Host "[$step] EXPORT LOCAL DATA" -ForegroundColor Yellow
Write-Host "    Exporting fresh backup with all restaurants and data..." -ForegroundColor Gray
$step++

try {
    .\export-full-backup.ps1 | Select-String -Pattern "Export completed|File:" | ForEach-Object {
        Write-Host "    $_" -ForegroundColor Green
    }
} catch {
    Write-Host "    ❌ Export failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Check TiDB Setup
Write-Host "[$step] CHECK TIDB CONFIGURATION" -ForegroundColor Yellow
$step++

$envContent = Get-Content ".env" -Raw
if ($envContent -match "TIDB_HOST" -and $envContent -match "TIDB_PASSWORD") {
    Write-Host "    ✅ TiDB credentials found" -ForegroundColor Green
    
    $proceed = Read-Host "`n    Import data to TiDB now? (y/n)"
    if ($proceed -eq 'y') {
        Write-Host "`n    Importing to TiDB Cloud..." -ForegroundColor Gray
        node backend/scripts/import-to-tidb.js
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n    ✅ TiDB import completed!" -ForegroundColor Green
        } else {
            Write-Host "`n    ❌ TiDB import failed!" -ForegroundColor Red
            Write-Host "    Check your TiDB credentials and try again." -ForegroundColor Yellow
            exit 1
        }
    } else {
        Write-Host "    ⚠️  Skipped TiDB import" -ForegroundColor Yellow
        Write-Host "    Run manually: node backend/scripts/import-to-tidb.js" -ForegroundColor Gray
    }
} else {
    Write-Host "    ⚠️  TiDB not configured" -ForegroundColor Yellow
    $setup = Read-Host "`n    Run TiDB setup wizard now? (y/n)"
    if ($setup -eq 'y') {
        .\setup-tidb.ps1
    } else {
        Write-Host "    Run later: .\setup-tidb.ps1" -ForegroundColor Gray
    }
}

Write-Host ""

# Step 3: Git Status
Write-Host "[$step] CHECK GIT STATUS" -ForegroundColor Yellow
$step++

$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "    ⚠️  Uncommitted changes:" -ForegroundColor Yellow
    $gitStatus | Select-Object -First 5 | ForEach-Object { Write-Host "       $_" -ForegroundColor Gray }
    
    $commit = Read-Host "`n    Commit and push now? (y/n)"
    if ($commit -eq 'y') {
        git add -A
        $message = Read-Host "    Commit message (or press Enter for default)"
        if (-not $message) {
            $message = "Update for deployment - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        }
        git commit -m $message
        git push origin main
        Write-Host "    ✅ Pushed to GitHub" -ForegroundColor Green
    }
} else {
    Write-Host "    ✅ All changes committed and pushed" -ForegroundColor Green
}

Write-Host ""

# Step 4: Render Environment Variables
Write-Host "[$step] RENDER ENVIRONMENT VARIABLES" -ForegroundColor Yellow
$step++

Write-Host @"
    
    Make sure these are set in Render Dashboard:
    
    DATABASE (TiDB):
    ├─ DB_HOST=<your_tidb_host>
    ├─ DB_PORT=4000
    ├─ DB_USER=<your_tidb_user>
    ├─ DB_PASSWORD=<your_tidb_password>
    ├─ DB_NAME=rwanda_eats_reserve
    └─ DB_SSL=true
    
    FILE STORAGE:
    ├─ CLOUDINARY_CLOUD_NAME=<your_cloud_name>
    ├─ CLOUDINARY_API_KEY=<your_api_key>
    └─ CLOUDINARY_API_SECRET=<your_api_secret>
    
    EMAIL:
    ├─ MAILERSEND_API_KEY=<your_api_key>
    ├─ MAILERSEND_FROM_EMAIL=noreply@yourdomain.com
    └─ MAILERSEND_FROM_NAME=Rwanda Eats Reserve
    
    SECURITY:
    ├─ SESSION_SECRET=<min_32_chars>
    └─ JWT_SECRET=<min_32_chars>
    
"@ -ForegroundColor Gray

$envSet = Read-Host "    Have you set all Render environment variables? (y/n)"

if ($envSet -ne 'y') {
    Write-Host "`n    ⚠️  Please set environment variables in Render before deploying!" -ForegroundColor Yellow
    Write-Host "    https://dashboard.render.com" -ForegroundColor Cyan
    exit 0
}

Write-Host ""

# Step 5: Deployment
Write-Host "[$step] TRIGGER DEPLOYMENT" -ForegroundColor Yellow
$step++

Write-Host @"
    
    Go to Render Dashboard and:
    
    1. Select service: rwanda-eats-reserve
    2. Click: "Manual Deploy"
    3. Select: "Clear build cache & deploy"
    4. Wait: 2-3 minutes for deployment
    
"@ -ForegroundColor Gray

$deployed = Read-Host "    Press Enter when deployment starts..."

Write-Host ""

# Step 6: Verification
Write-Host "[$step] POST-DEPLOYMENT VERIFICATION" -ForegroundColor Yellow
$step++

Write-Host @"
    
    After deployment completes, test these:
    
    ✓ Registration Page:
      https://your-app.onrender.com/register
      → Check: 4-digit recovery code field visible
      → Test: Create new account
    
    ✓ Home Page:
      https://your-app.onrender.com/
      → Check: Featured restaurants display
      → Check: Restaurant cards show images
      → Check: All restaurant data visible
    
    ✓ Restaurants Section:
      https://your-app.onrender.com/#restaurants
      → Check: All restaurants in grid
      → Test: Search and filter
    
    ✓ Make Reservation:
      → Login with test account
      → Select restaurant
      → Create reservation
      → Check "My Reservations"
    
    ✓ System Admin:
      https://your-app.onrender.com/login
      → Login as admin
      → Check: Restaurants list
      → Test: Edit restaurant
    
"@ -ForegroundColor Gray

Write-Host @"

╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║  ✅ DEPLOYMENT WORKFLOW COMPLETE!                              ║
║                                                                ║
║  Your app should now be live with all data showing.            ║
║                                                                ║
║  If restaurants don't show, check:                             ║
║  • Render logs for DB connection errors                        ║
║  • TiDB Cloud has data (SELECT COUNT(*) FROM restaurants)      ║
║  • Environment variables are correct                           ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Green

Write-Host "For detailed checklist, see: DEPLOYMENT_CHECKLIST.md" -ForegroundColor Cyan
Write-Host ""
