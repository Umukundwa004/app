# Deployment Script for Rwanda Eats Reserve
# This script helps deploy the application to Vercel

Write-Host "🚀 Rwanda Eats Reserve Deployment Script" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Check if vercel CLI is installed
try {
    vercel --version | Out-Null
} catch {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
}

Write-Host "📦 Building CSS..." -ForegroundColor Yellow
npm run build:css

Write-Host "🔍 Environment Variables Check..." -ForegroundColor Yellow
Write-Host "Required environment variables for production:" -ForegroundColor White
Write-Host "- DB_HOST (your cloud database host)" -ForegroundColor Cyan
Write-Host "- DB_PORT (usually 3306)" -ForegroundColor Cyan
Write-Host "- DB_USER (database username)" -ForegroundColor Cyan
Write-Host "- DB_PASSWORD (database password)" -ForegroundColor Cyan
Write-Host "- DB_NAME (database name)" -ForegroundColor Cyan
Write-Host "- DB_SSL (true for most cloud providers)" -ForegroundColor Cyan
Write-Host "- JWT_SECRET (secure random string)" -ForegroundColor Cyan
Write-Host "- SESSION_SECRET (secure random string)" -ForegroundColor Cyan
Write-Host "- MAILERSEND_API_KEY (optional, for emails)" -ForegroundColor Cyan
Write-Host "- BREVO_API_KEY (optional, for emails)" -ForegroundColor Cyan

Write-Host ""
Write-Host "🌐 Ready to deploy to Vercel..." -ForegroundColor Yellow
Write-Host "Make sure you've set the environment variables in Vercel dashboard!" -ForegroundColor Yellow
Write-Host "Visit: https://vercel.com/dashboard → Your Project → Settings → Environment Variables" -ForegroundColor Blue

Write-Host ""
$response = Read-Host "Have you set up your cloud database and environment variables? (y/n)"
if ($response -eq "y" -or $response -eq "Y") {
    Write-Host "🚀 Starting deployment..." -ForegroundColor Green
    vercel --prod
    Write-Host "✅ Deployment initiated!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Check your deployment status at:" -ForegroundColor Yellow
    Write-Host "https://vercel.com/dashboard" -ForegroundColor Blue
    Write-Host ""
    Write-Host "🔧 If you encounter issues:" -ForegroundColor Yellow
    Write-Host "1. Check Vercel function logs" -ForegroundColor White
    Write-Host "2. Test the health endpoint: https://your-domain.vercel.app/api/health" -ForegroundColor White
    Write-Host "3. Verify database connection from your cloud provider" -ForegroundColor White
} else {
    Write-Host "❌ Please set up your environment first." -ForegroundColor Red
    Write-Host "📖 Read PRODUCTION_SETUP.md for detailed instructions." -ForegroundColor Blue
}