# Production Database Setup for Vercel Deployment

## Current Issue
Your Vercel deployment is failing because it's trying to connect to `localhost:3306` (local MySQL), which doesn't exist in Vercel's serverless environment.

## Solution: Use a Cloud Database

### Option 1: PlanetScale (Recommended - Free tier available)
1. Go to [planetscale.com](https://planetscale.com) and create a free account
2. Create a new database called `rwanda-eats-reserve`
3. Get your connection string from the dashboard
4. In Vercel dashboard, go to your project settings → Environment Variables
5. Add these variables:

```
DB_HOST=aws.connect.psdb.cloud
DB_PORT=3306
DB_USER=your_planetscale_username
DB_PASSWORD=your_planetscale_password
DB_NAME=rwanda_eats_reserve
DB_SSL=true
```

### Option 2: Railway (Also free tier)
1. Go to [railway.app](https://railway.app)
2. Create a MySQL database
3. Get connection details and set in Vercel:

```
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=6543
DB_USER=root
DB_PASSWORD=your_railway_password
DB_NAME=railway
DB_SSL=false
```

### Option 3: Aiven MySQL
1. Go to [aiven.io](https://aiven.io) (1 month free)
2. Create MySQL service
3. Download SSL certificate and configure:

```
DB_HOST=mysql-xxxxx.aivencloud.com
DB_PORT=23966
DB_USER=avnadmin
DB_PASSWORD=your_aiven_password
DB_NAME=defaultdb
DB_SSL=true
```

## Setting Environment Variables in Vercel

1. Go to [vercel.com](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add all the DB_* variables listed above
5. Also add your email service variables:

```
MAILERSEND_API_KEY=your_mailersend_key
BREVO_API_KEY=your_brevo_key
JWT_SECRET=your_secure_jwt_secret
SESSION_SECRET=your_secure_session_secret
```

## Database Migration

After setting up your cloud database, you need to run your SQL migrations:

1. Connect to your cloud database using MySQL Workbench or command line
2. Run the SQL files in this order:
   - `backend/migrations/init-database.sql`
   - `backend/migrations/database.sql`
   - All other migration files in chronological order

## Testing the Fix

1. Set environment variables in Vercel
2. Redeploy your application
3. Check the Vercel function logs for "Database connection OK"
4. Test your API endpoints

## Local Development

For local development, keep using your local MySQL. Create a `.env` file:

```env
# Local development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<YOUR_LOCAL_PASSWORD>
DB_NAME=rwanda_eats_reserve
DB_SSL=false

# Add your other environment variables here
MAILERSEND_API_KEY=your_key
BREVO_API_KEY=your_key
JWT_SECRET=your_secret
SESSION_SECRET=your_session_secret
```

The application will automatically use the appropriate database based on the environment.