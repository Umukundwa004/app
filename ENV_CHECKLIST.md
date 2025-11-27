# Environment Variables Checklist for Vercel Deployment

## 🚨 CRITICAL: Set These in Vercel Dashboard

### Required Database Variables
- [ ] EITHER set a single `DATABASE_URL` (preferred for TiDB/managed MySQL)
   - Example: `mysql://username:password@host.tidbcloud.com:4000/rwanda_eats_reserve`
- [ ] OR set discrete vars:
   - `DB_HOST` - Your cloud database host (NOT localhost)
   - `DB_PORT` - 4000 for TiDB Cloud, 3306 for MySQL
   - `DB_USER` - Database username
   - `DB_PASSWORD` - Database password  
   - `DB_NAME` - Database name (rwanda_eats_reserve)
   - `DB_SSL` - Set to "true" for cloud databases

### Required Security Variables
- [ ] `JWT_SECRET` - Random secure string for JWT tokens
- [ ] `SESSION_SECRET` - Random secure string for sessions
- [ ] `NODE_ENV` - Set to "production"

### Optional Email Variables
- [ ] `MAILERSEND_API_KEY` - For MailerSend email service
- [ ] `BREVO_API_KEY` - For Brevo email service

## How to Set Environment Variables in Vercel

### Method 1: Vercel Dashboard (Recommended)
1. Go to https://vercel.com/dashboard
2. Click your project name
3. Click "Settings" tab
4. Click "Environment Variables" in sidebar
5. Add each variable:
   - Name: DB_HOST
   - Value: your-database-host.com
   - Environment: Production, Preview, Development
   - Click "Save"

### Method 2: Vercel CLI
```bash
vercel env add DB_HOST
# Enter value when prompted
# Repeat for each variable
```

## Sample Environment Variables

### For PlanetScale:
```
DB_HOST=aws.connect.psdb.cloud
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=pscale_pw_xxx
DB_NAME=rwanda_eats_reserve
DB_SSL=true
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-super-secret-session-key-here
```

### For Railway:
### For TiDB Cloud:
```
# Option A: Single connection URL (recommended)
DATABASE_URL=mysql://<username>:<password>@<cluster-host>.tidbcloud.com:4000/rwanda_eats_reserve

# Option B: Discrete variables
DB_HOST=<cluster-host>.tidbcloud.com
DB_PORT=4000
DB_USER=<username>
DB_PASSWORD=<password>
DB_NAME=rwanda_eats_reserve
DB_SSL=true

NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-super-secret-session-key-here
```

```
DB_HOST=containers-us-west-xyz.railway.app
DB_PORT=6543
DB_USER=root
DB_PASSWORD=railway_password_here
DB_NAME=railway
DB_SSL=false
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-super-secret-session-key-here
```

## Verification Steps

### 1. Check Deployment Logs
- Go to Vercel Dashboard → Deployments → View Function Logs
- Look for: "🔧 Database Configuration:" section
- Should show your cloud database host, NOT localhost

### 2. Test Health Endpoint
- Visit: `https://your-app.vercel.app/api/health`
- Should return: `{"status": "ok", "database": "connected"}`

### 3. Test Application
- Visit your app homepage
- Try logging in
- Check that features work properly

## Common Mistakes

❌ **Wrong:**
```
DB_HOST=localhost          # This won't work on Vercel!
DB_HOST=127.0.0.1         # This won't work on Vercel!
DB_SSL=false              # Most cloud databases need SSL
```

✅ **Correct:**
```
DB_HOST=your-cloud-db.com  # Actual cloud database host
DB_SSL=true               # Enable SSL for cloud databases
```

## Need Help?

1. **Check logs** for "Database Configuration" section
2. **Visit health endpoint** to see current status
3. **Verify all environment variables** are set in Vercel
4. **Test database connection** from your cloud provider's tools

## Quick Cloud Database Setup

### PlanetScale (Free, Recommended):
1. https://planetscale.com → Sign up
2. Create database → Get connection string
3. Add to Vercel environment variables

### Railway (Free):
1. https://railway.app → Sign up  
2. Create MySQL service → Get connection details
3. Add to Vercel environment variables

### Aiven (Free trial):
1. https://aiven.io → Sign up
2. Create MySQL service → Download SSL cert
3. Add to Vercel environment variables