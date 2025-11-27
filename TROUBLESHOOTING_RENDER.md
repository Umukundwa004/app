# Quick Troubleshooting for Render Deployment

## After Deployment, Check These in Order:

### 1. Check Render Logs (MOST IMPORTANT!)
Go to your Render dashboard → rwanda-eats-reserve → Logs

Look for these messages:

✅ **GOOD SIGNS:**
```
🔧 Database Configuration:
   Host: your-db-host.com
   ...
🔌 Attempting database connection...
✅ Database connection OK
📧 Email Service Status:
   MailerSend: ✅ Active (or ❌ Not configured - OK if you don't have it)
Server running on port XXXX
```

❌ **BAD SIGNS:**
```
❌ Failed to connect to the database
🚨 PRODUCTION ERROR: You need to set up a cloud database!
Database not available. Please try again shortly.
```

### 2. Test the Login Endpoint Directly

Open browser console (F12) and run:

```javascript
fetch('https://app-1btz.onrender.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@example.com', password: 'test123' }),
  credentials: 'include'
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**Expected responses:**

- `{ error: "Invalid credentials" }` - ✅ GOOD! Means database is working
- `{ error: "Database not available" }` - ❌ BAD! Database not connected
- `503 Service Unavailable` - ❌ BAD! DB_READY is false
- `500 Internal Server Error` - ❌ BAD! Check logs for actual error

### 3. Common Issues & Fixes

#### Issue: Login returns 503
**Cause:** Database connection failed during startup
**Fix:** 
1. Check environment variables in Render dashboard
2. Verify DB_HOST, DB_USER, DB_PASSWORD, DB_NAME are all set
3. Test database connection from your local machine:
   ```bash
   mysql -h YOUR_DB_HOST -u YOUR_DB_USER -p
   ```

#### Issue: Login returns 500 with "Database query failed"
**Cause:** Database connected but query failed (table doesn't exist)
**Fix:**
1. You forgot to run database.sql!
2. Connect to your database and run:
   ```bash
   mysql -h YOUR_DB_HOST -u YOUR_DB_USER -p YOUR_DB_NAME < backend/migrations/database.sql
   ```

#### Issue: Login succeeds but doesn't redirect
**Cause:** Session cookies not being set
**Fix:**
1. Check browser console for cookie errors
2. Make sure you're accessing via HTTPS (not HTTP)
3. Clear browser cookies and try again

#### Issue: "ENOTFOUND" or "ETIMEDOUT" in logs
**Cause:** Can't reach database server
**Fix:**
1. Database firewall blocking Render IPs
2. Wrong DB_HOST value
3. Database server is down

### 4. Verify Environment Variables

In Render dashboard, check these are ALL set:

**Required:**
- ✅ DB_HOST
- ✅ DB_USER  
- ✅ DB_PASSWORD
- ✅ DB_NAME
- ✅ DB_SSL=true
- ✅ JWT_SECRET
- ✅ SESSION_SECRET
- ✅ NODE_ENV=production

**Optional (but recommended):**
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- MAILERSEND_API_KEY
- BASE_URL

### 5. Check Build Succeeded

In Render logs, look for:
```
npm install && npm run build:css
...
✓ Built in XXXms
```

If build failed, check for:
- Missing dependencies in package.json
- Tailwind config errors

### 6. Still Not Working?

Look in Render logs for these NEW debug messages:

```
🔐 Login attempt for: user@example.com
📊 Querying database for user...
✅ User found: user@example.com Type: customer
🔑 Verifying password...
✅ Password verified for: user@example.com
✅ Session created for: user@example.com
🎉 Login successful for: user@example.com
```

The logs will tell you EXACTLY where it's failing!

### 7. Emergency: Bypass Login for Testing

If you need to test without login, you can temporarily add a test user:

Connect to your database and run:
```sql
INSERT INTO users (name, email, password_hash, user_type, email_verified) 
VALUES ('Test User', 'test@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5vVmVArzH.Vei', 'customer', TRUE);
```

Password is: `password123`

Then try logging in with:
- Email: test@example.com
- Password: password123

## Quick Win Checklist

- [ ] Deployment shows "Live" in Render
- [ ] Build logs show no errors
- [ ] Database.sql was run on cloud database
- [ ] All environment variables are set
- [ ] Logs show "✅ Database connection OK"
- [ ] Test login endpoint returns proper JSON (not HTML)
- [ ] Can create test user and login successfully
