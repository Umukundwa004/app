# Force Redeploy Script for Rwanda Eats Reserve
# This script helps force a fresh deployment on Vercel

Write-Host "🚀 Force Redeploy - Rwanda Eats Reserve" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

Write-Host "Current issue: Vercel is still using old code" -ForegroundColor Yellow
Write-Host "Expected: New error logs should show database config details" -ForegroundColor Yellow
Write-Host ""

# Check if vercel CLI is available
$vercelCmd = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelCmd) {
    Write-Host "❌ Vercel CLI not found" -ForegroundColor Red
    Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

Write-Host "🔍 Checking current deployment status..." -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 Latest commit: $(git log --oneline -1)" -ForegroundColor Cyan
Write-Host ""

Write-Host "🌐 Options to force redeploy:" -ForegroundColor Yellow
Write-Host "1. Trigger redeploy via Vercel CLI" -ForegroundColor White
Write-Host "2. Go to Vercel dashboard and click 'Redeploy'" -ForegroundColor White
Write-Host "3. Make a small commit to trigger auto-deploy" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Choose option (1, 2, or 3)"

switch ($choice) {
    "1" {
        Write-Host "🚀 Triggering redeploy via CLI..." -ForegroundColor Green
        vercel --prod --force
        Write-Host "✅ Redeploy initiated!" -ForegroundColor Green
        Write-Host "Monitor at: https://vercel.com/dashboard" -ForegroundColor Cyan
    }
    "2" {
        Write-Host "🌐 Please follow these steps:" -ForegroundColor Yellow
        Write-Host "1. Go to https://vercel.com/dashboard" -ForegroundColor White
        Write-Host "2. Click on your project" -ForegroundColor White
        Write-Host "3. Go to Deployments tab" -ForegroundColor White
        Write-Host "4. Click the 3-dots menu on latest deployment" -ForegroundColor White
        Write-Host "5. Click 'Redeploy'" -ForegroundColor White
        Start-Process "https://vercel.com/dashboard"
    }
    "3" {
        Write-Host "📝 Creating trigger commit..." -ForegroundColor Green
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        "# Last updated: $timestamp" | Out-File -FilePath "LAST_DEPLOY.md" -Encoding UTF8
        git add LAST_DEPLOY.md
        git commit -m "chore: force redeploy - $timestamp"
        git push
        Write-Host "✅ Trigger commit pushed!" -ForegroundColor Green
        Write-Host "Vercel should auto-deploy the latest code now" -ForegroundColor Cyan
    }
    default {
        Write-Host "❌ Invalid option" -ForegroundColor Red
    }
}
}

Write-Host ""
Write-Host "🔍 After redeployment, check these:" -ForegroundColor Yellow
Write-Host "1. Visit: https://app-b2uf07zl3-vestines-projects.vercel.app/api/health" -ForegroundColor White
Write-Host "2. Check Vercel function logs for new error format" -ForegroundColor White
Write-Host "3. Look for 'Database Configuration:' in logs" -ForegroundColor White
Write-Host "4. Verify environment variables are set in Vercel dashboard" -ForegroundColor White

Write-Host ""
Write-Host "⚠️ REMEMBER: You still need to:" -ForegroundColor Red
Write-Host "1. Set up cloud database (PlanetScale/Railway)" -ForegroundColor White
Write-Host "2. Add environment variables to Vercel" -ForegroundColor White
Write-Host "3. The new logs will help confirm what's happening" -ForegroundColor White

Read-Host "Press Enter to continue"