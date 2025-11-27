# DEPLOYMENT SYNC CHECKLIST

## Issue: Local vs Deployed Differences
The registration page shows 4-digit recovery code field locally but NOT on deployed site.

## Root Cause Analysis

### ✅ Files ARE in GitHub
```bash
# Verified register.html contains recovery code field
git show origin/main:frontend/views/register.html | grep "recovery-code"
# Result: Field EXISTS in GitHub repo
```

### ⚠️ Likely Issues

1. **DEPLOYMENT CACHE** - Render/Vercel may be serving cached old version
2. **BUILD ARTIFACTS** - CSS might not be rebuilding
3. **STATIC FILE SERVING** - Frontend files may not be redeploying

## Solution Steps

### For Render Deployment:

1. **Force Clear Build Cache**
   - Go to Render dashboard
   - Select your service `rwanda-eats-reserve`
   - Click "Manual Deploy" → "Clear build cache & deploy"

2. **Verify Environment Variables**
   - Check all env vars are set (especially DB_* and CLOUDINARY_*)
   - Missing vars can cause partial deployment

3. **Check Build Logs**
   - Look for `npm run build:css` success
   - Verify no errors in build output

4. **Trigger Hard Redeploy**
   ```bash
   # Option 1: Force push (creates new commit)
   git commit --allow-empty -m "Force redeploy: Sync registration form"
   git push origin main
   
   # Option 2: Manual deploy from Render dashboard
   ```

### For Vercel Deployment (if using):

1. **Clear Cache**
   - Go to Vercel dashboard
   - Settings → Domains → Redeploy
   - Check "Force clear cache"

2. **Verify Build Settings**
   - Build Command: `npm install && npm run build:css`
   - Output Directory: Leave blank (uses root)
   - Install Command: `npm install`

## Files to Verify After Deployment

### Registration Page
- URL: `https://your-app.onrender.com/register`
- Check for: `<input id="recovery-code"` in page source (View Page Source)
- Should have: 4-digit recovery code field between password confirm and terms checkbox

### Customer Restaurant Display
- URL: `https://your-app.onrender.com/`
- Check: Featured restaurants section
- Should show: Restaurant cards with images

## Immediate Action Required

Run this to force a new deployment:
```bash
git commit --allow-empty -m "Force rebuild: Ensure all frontend files deploy"
git push origin main
```

Then in Render dashboard:
1. Go to your service
2. Click "Manual Deploy"
3. Select "Clear build cache & deploy"
4. Wait for deployment to complete
5. Test registration page

## Environment Variables Needed

Make sure these are set in Render:
- `DB_HOST` (TiDB Cloud hostname)
- `DB_PORT` (4000)
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_SSL=true`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `MAILERSEND_API_KEY`
- `SESSION_SECRET`
- `JWT_SECRET`

## Current Git State
- Latest commit: `f2874fa` (Cloudinary deletion)
- Previous: `6133d87` (Reservations UI + registration fixes)
- Branch: `main` 
- Remote: Up to date with origin/main

All files ARE committed and pushed correctly.
The issue is DEPLOYMENT CACHING, not missing code.
