# Vercel Deployment Troubleshooting Guide

## Current Error: Database Connection Failed

Your deployment is failing with:
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

This means the application is trying to connect to a local MySQL database that doesn't exist in Vercel's serverless environment.

## Quick Fix Steps

### 1. Set Up Cloud Database (Choose One)

#### Option A: PlanetScale (Recommended)
- Go to [planetscale.com](https://planetscale.com)
- Create free account and database
- Get connection details
- No credit card required

#### Option B: Railway
- Go to [railway.app](https://railway.app)
- Create MySQL service
- Free tier available

#### Option C: Aiven
- Go to [aiven.io](https://aiven.io)
- Create MySQL service
- 1 month free trial

### 2. Configure Vercel Environment Variables

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add these variables with your cloud database details:

```
DB_HOST=your-cloud-db-host
DB_PORT=3306
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=your-database-name
DB_SSL=true
JWT_SECRET=your-secret-key
SESSION_SECRET=your-session-secret
```

### 3. Test the Fix

1. Redeploy your project
2. Check the health endpoint: `https://your-app.vercel.app/api/health`
3. Look for "Database connection OK" in Vercel logs

## Common Issues & Solutions

### Issue: "Database not available" Error
- **Cause**: Environment variables not set correctly
- **Fix**: Double-check all DB_* variables in Vercel dashboard

### Issue: SSL Connection Error
- **Cause**: Cloud database requires SSL
- **Fix**: Set `DB_SSL=true` in environment variables

### Issue: Connection Timeout
- **Cause**: Database connection limits or firewall
- **Fix**: Check database provider's connection limits and whitelist settings

### Issue: 500 Internal Server Error
- **Cause**: Various potential issues
- **Fix**: Check Vercel function logs for specific error details

## Database Migration

After setting up cloud database:

1. Export your local database:
```bash
mysqldump -u root -p rwanda_eats_reserve > database_backup.sql
```

2. Import to cloud database using your provider's tools or:
```bash
mysql -h YOUR_CLOUD_HOST -u YOUR_USER -p YOUR_DB_NAME < database_backup.sql
```

## Verification Steps

1. **Test Health Endpoint**: Visit `https://your-app.vercel.app/api/health`
2. **Check Database**: Should show `"database": "connected"`
3. **Test Login**: Try logging into the application
4. **Check Logs**: Monitor Vercel function logs for any errors

## Getting Help

1. **Vercel Logs**: Check your project's function logs in Vercel dashboard
2. **Database Provider**: Check your cloud database provider's status page
3. **Local Testing**: Ensure the app works locally with your cloud database

## Environment Variables Template

Copy this template and fill in your values:

```env
# Database (Cloud - Required for Vercel)
DB_HOST=
DB_PORT=3306
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_SSL=true

# Security (Required)
JWT_SECRET=
SESSION_SECRET=

# Email Services (Optional)
MAILERSEND_API_KEY=
BREVO_API_KEY=

# Application
NODE_ENV=production
```