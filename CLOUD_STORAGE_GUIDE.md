# Cloud Storage Configuration Guide

This application has been updated to use cloud storage for all data persistence to ensure proper deployment on Render and other cloud platforms.

## ✅ What's Been Updated

### 1. **File Uploads** - Now using Cloudinary
- ❌ **Before**: Files stored in local `frontend/public/uploads/` folder (lost on deployment restarts)
- ✅ **After**: Files stored on Cloudinary cloud storage (persistent across deployments)

### 2. **Session Storage** - Now using MySQL database
- ❌ **Before**: Sessions stored in server memory (lost on server restarts)
- ✅ **After**: Sessions stored in MySQL database (persistent across server restarts)

### 3. **Database** - Already configured for cloud
- ✅ **Already**: Using cloud MySQL/TiDB with SSL support

## 🔧 Required Environment Variables for Production

### Database (Required)
```
DB_HOST=your-database-host
DB_USER=your-database-username  
DB_PASSWORD=your-database-password
DB_NAME=rwanda_eats_reserve
DB_PORT=3306
DB_SSL=true
```

### Cloudinary (Required for file uploads)
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Security (Required)
```
JWT_SECRET=your-random-jwt-secret
SESSION_SECRET=your-random-session-secret
NODE_ENV=production
```

## 📋 Setup Steps for Render Deployment

### 1. Set up Cloudinary (Free tier available)
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard
3. Copy your Cloud Name, API Key, and API Secret
4. Add these to your Render environment variables

### 2. Configure Environment Variables in Render
In your Render service dashboard:
1. Go to Environment tab
2. Add all required environment variables listed above
3. Make sure `NODE_ENV=production`

### 3. Verify Database Configuration
- Ensure your database supports external connections
- Database should have SSL enabled (`DB_SSL=true`)
- Test connection from Render's IP ranges

## 🔍 How to Test

### Local Testing (with cloud storage)
1. Copy `.env.example` to `.env`
2. Fill in your Cloudinary credentials
3. Set your database credentials
4. Run `npm start`
5. Upload test images to verify Cloudinary integration

### Production Testing
1. Deploy to Render with all environment variables set
2. Test file upload functionality
3. Verify session persistence across server restarts
4. Check database connections

## 🚨 Important Notes

- **File uploads will fail** if Cloudinary is not configured
- **Sessions will work** but fallback to memory store if database connection fails
- **Database must be accessible** from Render's servers
- **All uploaded files** will now be served from Cloudinary URLs
- **Sessions table** will be automatically created in your database

## 🔧 Fallback Behavior

- If Cloudinary is not configured, uploads will use memory storage (not recommended for production)
- If MySQL session store fails, it falls back to memory store
- Database connection is required for core functionality

## ✅ Benefits of Cloud Storage

1. **Scalability**: Files and sessions persist across multiple server instances
2. **Reliability**: No data loss on server restarts or deployments  
3. **Performance**: CDN delivery for uploaded images
4. **Backup**: Automatic backups with cloud providers
5. **Cost**: Pay only for what you use

Your application is now fully configured for cloud deployment! 🚀