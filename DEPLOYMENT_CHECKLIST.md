# DEPLOYMENT CHECKLIST - Ensure All Data Shows After Deployment

## ✅ PRE-DEPLOYMENT CHECKLIST

### 1. Export & Import Data to TiDB

```powershell
# Step 1: Export local database
.\export-full-backup.ps1

# Step 2: Setup TiDB credentials (if not done)
.\setup-tidb.ps1

# Step 3: Import to TiDB Cloud
node backend/scripts/import-to-tidb.js

# Step 4: Verify TiDB data
node backend/scripts/verify-tidb-data.js
```

**Verify restaurants imported:**
- Login to TiDB Cloud Console
- Run query: `SELECT COUNT(*) FROM restaurants;`
- Should show all your restaurants

### 2. Configure Render Environment Variables

Go to Render Dashboard → Your Service → Environment

**Database (TiDB Cloud):**
```
DB_HOST=gateway01.eu-central-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=your_tidb_username
DB_PASSWORD=your_tidb_password
DB_NAME=rwanda_eats_reserve
DB_SSL=true
```

**Authentication:**
```
SESSION_SECRET=your_session_secret_min_32_chars
JWT_SECRET=your_jwt_secret_min_32_chars
```

**Email (MailerSend):**
```
MAILERSEND_API_KEY=your_mailersend_api_key
MAILERSEND_FROM_EMAIL=noreply@yourdomain.com
MAILERSEND_FROM_NAME=Rwanda Eats Reserve
```

**File Storage (Cloudinary):**
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Base URL:**
```
BASE_URL=https://your-app.onrender.com
NODE_ENV=production
```

### 3. Push Latest Code

```powershell
# Verify all changes committed
git status

# If changes exist, commit them
git add -A
git commit -m "Final deployment preparation"
git push origin main
```

### 4. Deploy to Render

1. Go to Render Dashboard
2. Select your service `rwanda-eats-reserve`
3. Click "Manual Deploy"
4. Select "Clear build cache & deploy"
5. Wait 2-3 minutes for deployment

### 5. Post-Deployment Verification

**Test Registration:**
- URL: `https://your-app.onrender.com/register`
- ✅ Check: 4-digit recovery code field visible
- ✅ Test: Create new account
- ✅ Verify: Account created successfully

**Test Restaurant Display:**
- URL: `https://your-app.onrender.com/`
- ✅ Check: Featured restaurants section loads
- ✅ Check: Restaurant cards display with images
- ✅ Check: All restaurant data visible (name, cuisine, location)
- ✅ Test: Click on restaurant card opens details

**Test Restaurant Discovery:**
- URL: `https://your-app.onrender.com/#restaurants`
- ✅ Check: All restaurants display in grid
- ✅ Check: Search functionality works
- ✅ Test: Filter by cuisine

**Test Reservations:**
- ✅ Login with test account
- ✅ Select a restaurant
- ✅ Make a reservation
- ✅ Check reservation appears in "My Reservations"

**Test System Admin:**
- URL: `https://your-app.onrender.com/login`
- ✅ Login as admin (admin@rwandaeats.com)
- ✅ Check: Dashboard loads
- ✅ Check: Restaurants list shows all restaurants
- ✅ Test: Edit restaurant details
- ✅ Test: View reservations

## 🔍 TROUBLESHOOTING

### Issue: Restaurants Not Showing

**Check 1: Database Connection**
```powershell
# In Render logs, look for:
✅ Database connection OK
```
If you see connection errors, verify TiDB credentials.

**Check 2: TiDB Has Data**
- Login to TiDB Cloud Console
- Run: `SELECT * FROM restaurants LIMIT 5;`
- Should return restaurant data

**Check 3: API Endpoint**
- Test: `https://your-app.onrender.com/api/restaurants`
- Should return JSON array of restaurants

**Fix:**
1. Re-import data to TiDB: `node backend/scripts/import-to-tidb.js`
2. Verify Render env vars match TiDB credentials
3. Clear Render cache and redeploy

### Issue: Images Not Loading

**Check 1: Cloudinary Configured**
- Render → Environment → Check CLOUDINARY_* vars
- All 3 variables must be set

**Check 2: Image URLs in Database**
- TiDB Console: `SELECT image_url FROM restaurants LIMIT 5;`
- URLs should start with `https://res.cloudinary.com/`

**Fix:**
1. Add Cloudinary credentials to Render env vars
2. Redeploy

### Issue: "4-digit recovery code field missing"

**Check 1: Cache Issue**
- Render → Manual Deploy → "Clear build cache & deploy"

**Check 2: File Committed**
```powershell
git show HEAD:frontend/views/register.html | Select-String "recovery-code"
```
Should show the recovery code field.

**Fix:**
1. Force push: 
```powershell
git commit --allow-empty -m "Force redeploy"
git push origin main
```
2. Render → Clear cache & deploy

### Issue: 500 Error on Registration

**Check Render Logs:**
```
# Look for specific error:
- Missing column: verification_token_expires
- Missing column: recovery_code
```

**Fix:**
1. Run migrations on TiDB:
```powershell
node backend/scripts/add-verification-token-expires.js
node backend/scripts/add-recovery-code-column.js
```
2. Or re-import fresh backup with all columns

## 📊 VERIFICATION SCRIPT

Run this before deploying:
```powershell
.\pre-deployment-check.ps1
```

This checks:
- ✅ Local database has data
- ✅ Fresh backup created
- ✅ TiDB configured and accessible
- ✅ All files committed to Git
- ✅ Recovery code field exists
- ✅ Restaurant loading code present
- ✅ Environment variables set

## 🎯 SUCCESS CRITERIA

Your deployment is successful when:

1. ✅ Registration page shows 4-digit recovery code field
2. ✅ Home page displays featured restaurants with images
3. ✅ Restaurants section shows all restaurants in grid
4. ✅ Can create account with recovery code
5. ✅ Can login successfully
6. ✅ Can make reservations
7. ✅ System admin can view/edit restaurants
8. ✅ No 500 errors in Render logs
9. ✅ Database connection established on startup

## 📞 QUICK REFERENCE

**Render Dashboard:** https://dashboard.render.com  
**TiDB Cloud:** https://tidbcloud.com  
**Cloudinary:** https://cloudinary.com/console

**Support Files:**
- `pre-deployment-check.ps1` - Run before deploying
- `verify-deployment.ps1` - Verify local/git sync
- `setup-tidb.ps1` - Configure TiDB
- `export-full-backup.ps1` - Export database
- `backend/scripts/import-to-tidb.js` - Import to TiDB

---

**Last Updated:** {{ current_date }}  
**Current Commit:** Run `git rev-parse --short HEAD`
