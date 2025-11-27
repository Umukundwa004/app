# Connecting Deployed Site to TiDB Cloud Database

Your data is now in TiDB Cloud. To access it from your deployed Render.com site, update the environment variables.

## 🔧 Update Environment Variables on Render.com

### Step 1: Get TiDB Cloud Connection Details

From your TiDB Cloud dashboard:
- **Host:** `gateway01.eu-central-1.prod.aws.tidbcloud.com`
- **Port:** `4000`
- **User:** `3Nhz53ESuRkZyeE.root`
- **Password:** (your TiDB Cloud password)
- **Database:** `rwanda_eats_reserve`

### Step 2: Update Render.com Dashboard

1. **Go to Render.com Dashboard**
   - Visit: https://dashboard.render.com/
   - Select your service: `rwanda-eats-reserve`

2. **Navigate to Environment Variables**
   - Click on **Environment** tab (left sidebar)
   - Scroll to **Environment Variables** section

3. **Update These Variables:**

   ```
   DB_HOST=gateway01.eu-central-1.prod.aws.tidbcloud.com
   DB_PORT=4000
   DB_USER=3Nhz53ESuRkZyeE.root
   DB_PASSWORD=<your-tidb-cloud-password>
   DB_NAME=rwanda_eats_reserve
   DB_SSL=true
   ```

4. **Important Settings:**
   - Make sure `DB_SSL=true` is set (TiDB Cloud requires SSL)
   - Keep all other environment variables (JWT_SECRET, SESSION_SECRET, etc.)

### Step 3: Deploy Changes

After updating environment variables:

1. **Option A: Automatic Deploy**
   - Render will automatically redeploy when you save environment variables
   - Wait 2-5 minutes for deployment to complete

2. **Option B: Manual Deploy** (if automatic doesn't trigger)
   - Click **Manual Deploy** button
   - Select **Deploy latest commit**

### Step 4: Verify Connection

After deployment completes:

1. **Check Deploy Logs**
   - Click on **Logs** tab
   - Look for database connection messages
   - Should see: "Connected to database: rwanda_eats_reserve"

2. **Test the Site**
   - Visit your deployed URL: `https://rwanda-eats-reserve.onrender.com`
   - Try logging in with existing users:
     - System Admin: `admin@rwandaeats.com`
     - Restaurant Admin: `admin@millecollines.rw`
     - Customer: `john@example.com`

3. **Verify Data**
   - Check if restaurants appear on the home page
   - Verify menu items load correctly
   - Test making a reservation

## 📊 Your Current Database Content

The TiDB Cloud database now has:
- **9 users** (3 admins, 6 customers)
- **6 restaurants** with details
- **10 menu items**
- **7 reservations**
- **2 restaurant images**
- Plus reviews, cuisines, amenities, etc.

## 🔍 Troubleshooting

### If Connection Fails:

1. **Check TiDB Cloud IP Whitelist**
   - TiDB Cloud may require IP whitelisting
   - Add Render.com's IP ranges or allow all IPs (0.0.0.0/0) for testing

2. **Verify SSL Settings**
   - TiDB Cloud requires SSL: `DB_SSL=true`
   - Our code handles this automatically in `backend/utils/db.js`

3. **Test Connection Locally**
   ```bash
   # Set environment variables temporarily
   $env:DB_HOST = "gateway01.eu-central-1.prod.aws.tidbcloud.com"
   $env:DB_PORT = "4000"
   $env:DB_USER = "3Nhz53ESuRkZyeE.root"
   $env:DB_PASSWORD = "<your-password>"
   $env:DB_NAME = "rwanda_eats_reserve"
   $env:DB_SSL = "true"
   
   # Test connection
   node backend/scripts/test-tidb-connection.js
   ```

4. **Check Render Logs**
   - Look for error messages like:
     - "Access denied" → Wrong password
     - "Unknown host" → Wrong hostname
     - "SSL required" → Missing DB_SSL=true

## 🎯 Quick Commands

### Test TiDB Cloud connection from your machine:
```powershell
$env:DB_HOST = "gateway01.eu-central-1.prod.aws.tidbcloud.com"
$env:DB_PORT = "4000"
node backend/scripts/whoami-db.js
```

### View current environment (local):
```powershell
node backend/scripts/whoami-db.js
```

## ✅ Success Checklist

- [ ] Updated DB_HOST on Render.com
- [ ] Updated DB_PORT to 4000
- [ ] Updated DB_USER
- [ ] Updated DB_PASSWORD
- [ ] Set DB_SSL=true
- [ ] Triggered redeploy
- [ ] Checked deploy logs (no errors)
- [ ] Visited site and data loads correctly
- [ ] Can login with existing users
- [ ] Restaurants and menus display

## 🔐 Security Notes

- **Never commit** TiDB credentials to git
- Keep environment variables in Render.com dashboard only
- TiDB Cloud password should be strong and unique
- Consider setting up IP whitelist in TiDB Cloud for production

## 📞 Need Help?

If issues persist:
1. Check Render.com deploy logs for specific errors
2. Verify TiDB Cloud cluster is running
3. Test connection from local machine first
4. Check TiDB Cloud security settings (IP whitelist, user permissions)
