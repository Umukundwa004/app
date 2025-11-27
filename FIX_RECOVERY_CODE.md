# Fix recovery_code Column in Production Database

## Problem

Your Render deployment is showing this error:
```
Error: Unknown column 'recovery_code' in 'field list'
```

This means your **production TiDB Cloud database** doesn't have the `recovery_code` column, even though your local database does.

## Solution

You need to add the `recovery_code` column to your **production TiDB Cloud database**.

---

## Option 1: Run Migration Script (Recommended)

### Step 1: Add TiDB Credentials to .env

1. Open `.env` file
2. Find the TiDB section (around line 7-12)
3. Uncomment and fill in your TiDB Cloud credentials:

```env
# TiDB Cloud Production Database
TIDB_HOST=gateway01.eu-central-1.prod.aws.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=3Nhz53ESuRkZyeE.root
TIDB_PASSWORD=your_actual_password_here
TIDB_DATABASE=rwanda_eats_reserve
```

**Where to find these credentials:**
- Go to https://tidbcloud.com/
- Select your cluster
- Click "Connect"
- Copy the connection details

### Step 2: Run the Migration Script

```powershell
node backend/scripts/add-recovery-code-tidb-production.js
```

### Step 3: Verify Success

You should see:
```
✅ Connected to TiDB Cloud
✅ Column recovery_code added successfully to production!
```

### Step 4: Restart Your Render Service

1. Go to https://dashboard.render.com/
2. Find your service
3. Click "Manual Deploy" → "Clear build cache & deploy"

---

## Option 2: Use PowerShell Interactive Script

If you don't want to edit `.env`, run this script which will prompt you for credentials:

```powershell
.\scripts\add-recovery-code-production.ps1
```

It will ask you for:
- TiDB Host
- TiDB Port
- TiDB User
- TiDB Password
- TiDB Database

---

## Option 3: Manual SQL Execution

If you prefer to run the SQL manually:

1. Connect to your TiDB Cloud database using a MySQL client
2. Run this SQL command:

```sql
ALTER TABLE users 
ADD COLUMN recovery_code VARCHAR(4) NULL AFTER password_hash;
```

You can use:
- TiDB Cloud Web SQL Editor
- MySQL Workbench
- Any MySQL client with SSL support

---

## Verify the Fix

After adding the column, your registration endpoint should work without errors. Test by:

1. Going to your app: https://app-1btz.onrender.com
2. Try registering a new user
3. Should complete successfully without the "Unknown column" error

---

## Why This Happened

- Your **local database** has the `recovery_code` column (added by previous migrations)
- Your **production TiDB database** does not have this column yet
- The backend code expects this column to exist when inserting new users
- This migration adds the missing column to production

---

## Next Steps

After fixing this:

1. ✅ All new user registrations will work
2. ✅ Password recovery using recovery codes will function
3. 🔄 Consider running all pending migrations on production to ensure consistency

To check for other missing columns, you can run:
```powershell
node backend/scripts/verify-users-table.js
```

---

## Need Help?

If you encounter issues:

1. **Connection errors**: Verify your IP is whitelisted in TiDB Cloud
2. **Authentication errors**: Double-check your username/password
3. **SSL errors**: Make sure you're using port 4000 and SSL is enabled

Check the logs in `backend/scripts/add-recovery-code-tidb-production.js` for detailed error messages.
