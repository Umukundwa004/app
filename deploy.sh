#!/bin/bash

# Deployment Script for Rwanda Eats Reserve
# This script helps deploy the application to Vercel

echo "🚀 Rwanda Eats Reserve Deployment Script"
echo "========================================"

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "📦 Building CSS..."
npm run build:css

echo "🔍 Checking environment variables..."
echo "Required environment variables for production:"
echo "- DB_HOST (your cloud database host)"
echo "- DB_PORT (usually 3306)"
echo "- DB_USER (database username)"
echo "- DB_PASSWORD (database password)"
echo "- DB_NAME (database name)"
echo "- DB_SSL (true for most cloud providers)"
echo "- JWT_SECRET (secure random string)"
echo "- SESSION_SECRET (secure random string)"
echo "- MAILERSEND_API_KEY (optional, for emails)"
echo "- BREVO_API_KEY (optional, for emails)"

echo ""
echo "🌐 Deploying to Vercel..."
echo "Make sure you've set the environment variables in Vercel dashboard!"
echo "Visit: https://vercel.com/dashboard → Your Project → Settings → Environment Variables"

echo ""
read -p "Have you set up your cloud database and environment variables? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting deployment..."
    vercel --prod
    echo "✅ Deployment initiated!"
    echo ""
    echo "📊 Check your deployment status at:"
    echo "https://vercel.com/dashboard"
    echo ""
    echo "🔧 If you encounter issues:"
    echo "1. Check Vercel function logs"
    echo "2. Test the health endpoint: https://your-domain.vercel.app/api/health"
    echo "3. Verify database connection from your cloud provider"
else
    echo "❌ Please set up your environment first."
    echo "📖 Read PRODUCTION_SETUP.md for detailed instructions."
fi