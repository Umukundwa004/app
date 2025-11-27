# TiDB Cloud Configuration Guide

## Add These to Your .env File

To import data to TiDB Cloud, add these environment variables:

```env
# TiDB Cloud Connection (Production Database)
TIDB_HOST=gateway01.eu-central-1.prod.aws.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=your_tidb_username
TIDB_PASSWORD=your_tidb_password
TIDB_DATABASE=rwanda_eats_reserve
```

## How to Get TiDB Credentials

1. **Login to TiDB Cloud**
   - Go to https://tidbcloud.com/
   - Sign in to your account

2. **Find Your Cluster**
   - Select your cluster (e.g., "rwanda-eats-reserve")
   - Click "Connect"

3. **Copy Connection Details**
   - Host: Usually `gateway01.{region}.prod.aws.tidbcloud.com`
   - Port: `4000` (default)
   - User: Your TiDB username
   - Password: Your TiDB password
   - Database: `rwanda_eats_reserve` (or your database name)

4. **Update .env File**
   - Open `.env` in your editor
   - Add the TIDB_* variables above
   - Save the file

## Quick Setup Commands

```powershell
# After adding TIDB_* to .env, run:

# 1. Test connection
node backend/scripts/test-tidb-connection.js

# 2. Import data
node backend/scripts/import-to-tidb.js

# 3. Verify data
node backend/scripts/verify-tidb-data.js
```

## Alternative: Update Existing DB_ Variables

If you want to import directly using your current DB_* variables:

```env
# Comment out local MySQL
# DB_HOST=localhost
# DB_PORT=3306

# Use TiDB instead
DB_HOST=gateway01.eu-central-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=your_tidb_username
DB_PASSWORD=your_tidb_password
DB_NAME=rwanda_eats_reserve
DB_SSL=true
```

Then run:
```powershell
node backend/scripts/import-to-tidb.js
```

## Next Steps After Import

1. ✅ Verify data imported correctly
2. 🔧 Update Render deployment env vars to use TiDB
3. 🚀 Deploy and test production site
