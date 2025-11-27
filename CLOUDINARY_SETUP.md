# Cloudinary Setup Guide for Rwanda Eats Reserve

## Why Cloudinary?

Cloudinary is a cloud-based file storage service that's essential for TiDB Cloud deployments because:
- ✅ TiDB Cloud doesn't support local file storage
- ✅ Files are stored in the cloud, not on the server
- ✅ Automatic image optimization and transformations
- ✅ Video hosting and streaming support
- ✅ PDF and document storage
- ✅ Fast CDN delivery worldwide
- ✅ Free tier available (25GB storage, 25GB bandwidth/month)

## Step 1: Create a Cloudinary Account

1. Go to https://cloudinary.com/
2. Click "Sign Up For Free"
3. Fill in your details:
   - Email
   - Password
   - Company name (can use "Rwanda Eats Reserve")
4. Verify your email address

## Step 2: Get Your Cloudinary Credentials

After signing up and logging in:

1. Go to your Cloudinary Dashboard: https://console.cloudinary.com/
2. You'll see your account credentials:
   ```
   Cloud Name: your_cloud_name
   API Key: 123456789012345
   API Secret: abcdef1234567890ABCDEF
   ```

## Step 3: Update Your .env File

Add these credentials to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Example:**
```env
CLOUDINARY_CLOUD_NAME=rwanda-eats-demo
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

## Step 4: Restart Your Server

After adding the credentials:

```bash
# Stop current server (Ctrl+C)
# Then restart:
node backend/server.js
```

You should see:
```
Cloudinary configured successfully
```

## Step 5: Test File Uploads

### Test Image Upload
1. Login as system admin
2. Go to Restaurants section
3. Edit a restaurant
4. Upload an image
5. The image should upload to Cloudinary and return a URL like:
   ```
   https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/rwanda-eats-restaurants/images/image-1234567890.jpg
   ```

### Test Video Upload
1. Edit a restaurant
2. Upload a video file (.mp4, .webm, etc.)
3. The video should upload to Cloudinary:
   ```
   https://res.cloudinary.com/your-cloud-name/video/upload/v1234567890/rwanda-eats-restaurants/videos/video-1234567890.mp4
   ```

### Test PDF Upload
1. Go to restaurant settings
2. Upload a menu PDF
3. The PDF should upload to Cloudinary:
   ```
   https://res.cloudinary.com/your-cloud-name/raw/upload/v1234567890/rwanda-eats-restaurants/documents/menu_pdf-1234567890.pdf
   ```

## Step 6: Deploy to Render.com

When deploying to Render.com, add these environment variables:

1. Go to your Render.com dashboard
2. Select your web service
3. Go to "Environment" tab
4. Add these variables:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

## How It Works

### File Organization in Cloudinary

All files are organized in folders:

```
rwanda-eats-restaurants/
├── images/           # Restaurant photos, food images
│   ├── image-1234567890.jpg
│   ├── image-1234567891.jpg
│   └── ...
├── videos/           # Restaurant promotional videos
│   ├── video-1234567890.mp4
│   ├── video-1234567891.webm
│   └── ...
└── documents/        # PDFs, certificates, menus
    ├── menu_pdf-1234567890.pdf
    ├── certificate-1234567891.pdf
    └── ...
```

### File URLs

When a file is uploaded, Cloudinary returns a URL:

**Images:**
```
https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/rwanda-eats-restaurants/images/image-1234567890.jpg
```

**Videos:**
```
https://res.cloudinary.com/YOUR_CLOUD_NAME/video/upload/v1234567890/rwanda-eats-restaurants/videos/video-1234567890.mp4
```

**PDFs:**
```
https://res.cloudinary.com/YOUR_CLOUD_NAME/raw/upload/v1234567890/rwanda-eats-restaurants/documents/menu_pdf-1234567890.pdf
```

These URLs are stored in your TiDB Cloud database and served to users.

## Image Transformations

Cloudinary automatically optimizes images:

**Original URL:**
```
https://res.cloudinary.com/.../image-123.jpg
```

**Transformed (resized to 800x600):**
```
https://res.cloudinary.com/.../w_800,h_600,c_fill/image-123.jpg
```

Our app automatically applies:
- Width: 1200px
- Height: 800px
- Crop: Fill
- Quality: Auto (optimized for web)

## Free Tier Limits

Cloudinary's free tier includes:
- **Storage:** 25 GB
- **Bandwidth:** 25 GB/month
- **Transformations:** 25,000/month
- **Videos:** Up to 500 MB per video

This is sufficient for:
- ~5,000 restaurant images (at ~5MB each)
- ~50 restaurant videos (at ~10MB each)
- ~1,000 PDF menus (at ~500KB each)

## Upgrading Cloudinary

If you exceed free tier limits:

**Plus Plan ($99/month):**
- 170 GB storage
- 170 GB bandwidth
- 170,000 transformations

**Advanced Plan ($249/month):**
- 340 GB storage
- 340 GB bandwidth
- 340,000 transformations

## Troubleshooting

### Issue: "Cloudinary not configured"
**Solution:** Add credentials to .env file and restart server

### Issue: "Upload failed"
**Solution:** 
1. Check your Cloudinary credentials are correct
2. Check file size (max 50MB)
3. Check file type is supported
4. Check Cloudinary account quota

### Issue: "Images not displaying"
**Solution:**
1. Check the URL in database
2. Verify URL format: `https://res.cloudinary.com/...`
3. Check Cloudinary dashboard for uploaded files
4. Ensure CORS is enabled (Cloudinary does this by default)

### Issue: "Video upload slow"
**Solution:**
1. Cloudinary uploads large files in chunks
2. This is normal for videos over 10MB
3. Consider compressing videos before upload
4. Recommended video format: MP4 (H.264)

## Migration from Local Storage

If you have existing files in `/uploads/` folder:

### Manual Migration (Small Number of Files)
1. Login to Cloudinary
2. Go to Media Library
3. Click "Upload"
4. Select files from your local `frontend/public/uploads/` folder
5. Update database URLs manually

### Automated Migration (Many Files)
Run this script:

```javascript
// backend/scripts/migrate-to-cloudinary.js
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const db = require('../utils/db');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function migrateFiles() {
    const uploadsDir = path.join(__dirname, '../../frontend/public/uploads/restaurants');
    const files = fs.readdirSync(uploadsDir);
    
    for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'rwanda-eats-restaurants/images',
            public_id: file.split('.')[0]
        });
        
        console.log(`Uploaded: ${file} -> ${result.secure_url}`);
        
        // Update database
        await db.execute(
            'UPDATE restaurant_images SET image_url = ? WHERE image_url LIKE ?',
            [result.secure_url, `%${file}%`]
        );
    }
}

migrateFiles();
```

## Security Best Practices

1. **Never commit .env file** to Git
   - Add `.env` to `.gitignore`
   - Keep credentials secret

2. **Use environment variables** in production
   - Render.com: Environment tab
   - Vercel: Environment Variables
   - AWS: Secrets Manager

3. **Rotate credentials** periodically
   - Generate new API key every 6 months
   - Update in all deployment environments

4. **Restrict upload sizes**
   - Current limit: 50MB per file
   - Adjust in `backend/server.js` if needed

5. **Monitor usage**
   - Check Cloudinary dashboard monthly
   - Set up usage alerts
   - Plan for upgrades before hitting limits

## Production Checklist

Before deploying to production:

- [ ] Cloudinary account created
- [ ] Credentials added to .env (local)
- [ ] Credentials added to Render.com environment variables
- [ ] Server restarts successfully with Cloudinary configured
- [ ] Test image upload works
- [ ] Test video upload works
- [ ] Test PDF upload works
- [ ] Database stores Cloudinary URLs
- [ ] Images display correctly on frontend
- [ ] Videos play correctly
- [ ] PDFs download correctly
- [ ] Monitor Cloudinary usage dashboard

## Support

**Cloudinary Documentation:**
- https://cloudinary.com/documentation

**Node.js SDK:**
- https://cloudinary.com/documentation/node_integration

**Upload API:**
- https://cloudinary.com/documentation/upload_images

**Video Upload:**
- https://cloudinary.com/documentation/video_upload_api_reference

**Contact Cloudinary Support:**
- https://support.cloudinary.com/

---

**Last Updated:** November 27, 2025  
**Version:** 1.0  
**For:** Rwanda Eats Reserve - TiDB Cloud Deployment
