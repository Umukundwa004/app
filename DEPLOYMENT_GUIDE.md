# Deployment Checklist for Render.com

## 🚀 Quick Deployment Steps

### 1. Database Setup (CRITICAL - Do This First!)

Your app needs a cloud MySQL database. Choose one of these providers:

#### Option A: PlanetScale (Recommended - Free Tier Available)
1. Go to https://planetscale.com/
2. Sign up and create a new database
3. Name it: `rwanda_eats_reserve`
4. Get connection details from the dashboard
5. Copy the following environment variables:
   - `DB_HOST` (looks like: xxx.planetscale.com)
   - `DB_USER` (looks like: xxxxx)
   - `DB_PASSWORD` (long random string)
   - `DB_NAME` (rwanda_eats_reserve)
   - Set `DB_SSL=true`

#### Option B: AWS RDS MySQL
1. Go to AWS Console → RDS
2. Create MySQL 8.0 database
3. Set publicly accessible to "Yes"
4. Note the endpoint and credentials

#### Option C: DigitalOcean Managed Database
1. Go to DigitalOcean → Databases
2. Create MySQL database
3. Get connection details

### 2. Initialize Database Schema

**IMPORTANT:** After creating your database, you MUST run the initialization script:

```bash
# Connect to your cloud database using MySQL client
mysql -h YOUR_DB_HOST -u YOUR_DB_USER -p YOUR_DB_PASSWORD

# Then run the database.sql file
source backend/migrations/database.sql
```

OR use a GUI tool like MySQL Workbench or TablePlus to run `backend/migrations/database.sql`

### 3. Set Up Render.com

1. **Connect GitHub Repository**
   - Go to https://render.com/
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select your `app` repository

2. **Configure Build Settings**
   - **Name:** rwanda-eats-reserve
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build:css`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (or paid for better performance)

3. **Set Environment Variables** (Critical!)

Click "Advanced" → "Add Environment Variable" and add ALL of these:

#### Required Database Variables:
```
DB_HOST=your-database-host.com
DB_PORT=3306
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=rwanda_eats_reserve
DB_SSL=true
NODE_ENV=production
```

#### Required Security Variables:
```
JWT_SECRET=your-random-secret-key-here-make-it-long-and-random
SESSION_SECRET=another-random-secret-key-different-from-jwt
```

#### Required Cloudinary (for image uploads):
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Optional Email (MailerSend):
```
MAILERSEND_API_KEY=your-mailersend-api-key
MAILERSEND_FROM_EMAIL=noreply@yourdomain.com
MAILERSEND_FROM_NAME=Rwanda Eats Reserve
```

#### App URL:
```
BASE_URL=https://your-app-name.onrender.com
```

### 4. Deploy!

1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Check logs for any errors

## ✅ Verification Steps

After deployment:

1. **Check Database Connection**
   - Look for "✅ Database connection OK" in logs
   - If you see "❌ Failed to connect to the database", your DB credentials are wrong

2. **Test Registration**
   - Go to your app URL
   - Try to register a new account
   - Should succeed even without email configured

3. **Test Login**
   - Use the account you just created
   - Should redirect to customer dashboard

4. **Check for Missing Tables Error**
   - If you see errors about missing tables, you forgot to run `database.sql`
   - Connect to your DB and run the schema file

## 🐛 Troubleshooting

### "Database not available"
- Check that all DB environment variables are set correctly
- Verify your database is accessible from the internet
- Check database firewall rules allow connections from Render IPs

### "audit_logs table doesn't exist"
- You forgot to run the database.sql initialization script
- Connect to your database and run it now

### "503 Service Unavailable"
- App is still starting up (wait 2-3 minutes)
- Database connection failed (check logs and DB credentials)

### Login returns 500 error
- Check if `login_attempts` and `account_locked` columns exist in users table
- If not, database.sql wasn't run properly
- Re-run the database initialization

### Tailwind CSS not working
- The build command should include `npm run build:css`
- Check that `frontend/public/css/output.css` was generated
- Look for build errors in Render logs

## 📝 Important Notes

1. **Never commit sensitive credentials to Git**
2. **Always use environment variables on Render**
3. **Database MUST be initialized before the app starts**
4. **Free Render instances sleep after 15 minutes of inactivity**
5. **First request after sleep takes 30-60 seconds to wake up**

## 🔐 Security Checklist

- [ ] Changed default JWT_SECRET
- [ ] Changed default SESSION_SECRET  
- [ ] Database password is strong
- [ ] DB_SSL is set to "true"
- [ ] Cloudinary credentials are set
- [ ] Email credentials are set (optional but recommended)
- [ ] BASE_URL points to your actual Render URL

## 📧 Support

If you encounter issues:
1. Check Render logs first
2. Verify all environment variables are set
3. Ensure database.sql was run successfully
4. Check that database allows remote connections
