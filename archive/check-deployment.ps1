# Monitor Deployment Script
# This script helps you check when the new deployment is live

Write-Host "🔍 Checking Deployment Status" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green

$healthUrl = "https://app-git-main-vestines-projects.vercel.app/api/health"
$homeUrl = "https://app-git-main-vestines-projects.vercel.app/"

Write-Host "Latest commit: $(git log --oneline -1)" -ForegroundColor Cyan
Write-Host ""

Write-Host "🌐 Testing endpoints..." -ForegroundColor Yellow
Write-Host "Health: $healthUrl" -ForegroundColor Cyan
Write-Host "Home: $homeUrl" -ForegroundColor Cyan
Write-Host ""

Write-Host "⏱️ Waiting for new deployment (this may take 2-3 minutes)..." -ForegroundColor Yellow

$maxAttempts = 10
$attempt = 1

do {
    Write-Host "Attempt $attempt/$maxAttempts..." -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $healthUrl -TimeoutSec 10 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $content = $response.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
            if ($content.database -eq "connected") {
                Write-Host "✅ SUCCESS: Database is connected!" -ForegroundColor Green
                Write-Host "Response: $($response.Content)" -ForegroundColor Green
                break
            } elseif ($content.database -eq "disconnected") {
                Write-Host "⚠️ New deployment detected, but database not connected" -ForegroundColor Yellow
                Write-Host "This means the new code is live but you need to set environment variables" -ForegroundColor Yellow
                break
            }
        } elseif ($response.StatusCode -eq 503) {
            Write-Host "⚠️ Service unavailable (expected if DB not configured)" -ForegroundColor Yellow
            $content = $response.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
            if ($content.status -eq "degraded") {
                Write-Host "✅ New deployment detected! Database connection failed (as expected)" -ForegroundColor Green
                Write-Host "Next step: Set up cloud database and environment variables" -ForegroundColor Yellow
                break
            }
        }
    } catch {
        Write-Host "❌ Error accessing health endpoint: $($_.Exception.Message)" -ForegroundColor Red
        
        # Check if it's still the old error pattern
        try {
            $homeResponse = Invoke-WebRequest -Uri $homeUrl -TimeoutSec 10 -ErrorAction SilentlyContinue
        } catch {
            if ($_.Exception.Message -like "*500*") {
                Write-Host "Still getting 500 errors - deployment may not be complete yet" -ForegroundColor Gray
            }
        }
    }
    
    if ($attempt -lt $maxAttempts) {
        Start-Sleep 30  # Wait 30 seconds between attempts
    }
    $attempt++
} while ($attempt -le $maxAttempts)

if ($attempt -gt $maxAttempts) {
    Write-Host "⏰ Timeout reached. Deployment may still be in progress." -ForegroundColor Yellow
    Write-Host "Manual check: Visit $healthUrl in your browser" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. If new deployment detected: Set up cloud database (PlanetScale/Railway)" -ForegroundColor White
Write-Host "2. Add environment variables in Vercel dashboard" -ForegroundColor White
Write-Host "3. Check that logs show 'Database Configuration:' section" -ForegroundColor White
Write-Host "4. Verify health endpoint returns database: connected" -ForegroundColor White

Read-Host "`nPress Enter to continue"