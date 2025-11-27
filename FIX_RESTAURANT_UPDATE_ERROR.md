# Fix Restaurant Update 500 Error

## Problem

When trying to edit/update a restaurant in the system admin panel, you're getting:
```
PUT https://app-1btz.onrender.com/api/system-admin/restaurants/19 500 (Internal Server Error)
```

## Root Cause

Your production TiDB Cloud database is **missing several columns** that exist in your local database:
- `recovery_code` in `users` table
- `operating_hours`, `menu`, `menu_pdf_url`, `video_url`, `certificate_url` in `restaurants` table  
- `is_primary` in `restaurant_images` table

When the backend tries to update these columns, it fails because they don't exist in production.

---

## Solution: Run Migration Script

### Step 1: Add TiDB Credentials to .env

1. Open your `.env` file
2. Find the TiDB section (around lines 7-13)
3. Uncomment and fill in your TiDB credentials:

```env
# TiDB Cloud Production Database
TIDB_HOST=gateway01.eu-central-1.prod.aws.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=your_tidb_username
TIDB_PASSWORD=your_tidb_password
TIDB_DATABASE=rwanda_eats_reserve
```

**Get your TiDB credentials:**
- Go to https://tidbcloud.com/
- Sign in and select your cluster
- Click "Connect" button
- Copy the connection details

### Step 2: Run the Sync Script

```powershell
node backend/scripts/sync-all-columns-to-production.js
```

This script will:
- Connect to your TiDB Cloud production database
- Check for missing columns
- Add all missing columns automatically
- Show you a summary of what was added

### Step 3: Restart Your Render Service

After the migration completes:

1. Go to https://dashboard.render.com/
2. Find your web service
3. Click **"Manual Deploy"** → **"Clear build cache & deploy"**
4. Wait for deployment to complete (~2-3 minutes)

### Step 4: Test

1. Go to your app: https://app-1btz.onrender.com
2. Log in as system admin
3. Try editing a restaurant
4. Click "Save Changes"
5. ✅ Should save successfully without errors!

---

## What Gets Fixed

After running the migration, your production database will have:

### Users Table
- ✅ `recovery_code` column for password recovery

### Restaurants Table
- ✅ `operating_hours` column (JSON) for flexible hours
- ✅ `menu` column (TEXT) for menu text
- ✅ `menu_pdf_url` column for PDF menu uploads
- ✅ `video_url` column for restaurant videos
- ✅ `certificate_url` column for certificates

### Restaurant Images Table
- ✅ `is_primary` column to mark primary image

---

## Cancel Button

The cancel button should already be working. It:
- Closes the modal
- Clears the form
- Resets body scroll

If it's not working, check the browser console for JavaScript errors.

---

## Alternative: Manual SQL Execution

If you prefer to run SQL manually in TiDB Cloud:

```sql
-- Add missing columns
ALTER TABLE users ADD COLUMN recovery_code VARCHAR(4) NULL AFTER password_hash;
ALTER TABLE restaurants ADD COLUMN operating_hours JSON NULL AFTER closing_time;
ALTER TABLE restaurants ADD COLUMN menu TEXT NULL;
ALTER TABLE restaurants ADD COLUMN menu_pdf_url VARCHAR(255) NULL;
ALTER TABLE restaurants ADD COLUMN video_url VARCHAR(255) NULL;
ALTER TABLE restaurants ADD COLUMN certificate_url VARCHAR(255) NULL;
ALTER TABLE restaurant_images ADD COLUMN is_primary TINYINT(1) DEFAULT 0 AFTER image_url;
```

---

## Troubleshooting

### "Unable to connect to TiDB Cloud"
- Check your TiDB credentials are correct in `.env`
- Verify your IP is whitelisted in TiDB Cloud settings
- Ensure the TiDB cluster is running

### "Access denied"
- Double-check your TIDB_USER and TIDB_PASSWORD
- Make sure the user has ALTER TABLE permissions

### Still getting 500 errors after migration
- Check Render logs for specific error message
- Verify the migration completed successfully
- Try clearing Render's build cache and redeploying

---

## Prevention

To avoid this in the future:

1. Always run migrations on **both** local and production databases
2. Keep a migration checklist
3. Test on production after any schema changes
4. Use the `verify-restaurants-table.js` script to check schema

---

## Quick Commands Reference

```powershell
# Verify local database structure
node backend/scripts/verify-restaurants-table.js

# Sync columns to production
node backend/scripts/sync-all-columns-to-production.js

# Verify users table
node backend/scripts/verify-users-table.js
```
