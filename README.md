# Rwanda Eats Reserve — Food Delivery & Reservation System

A comprehensive food delivery and reservation platform built with Node.js, Express, MySQL/TiDB Cloud, and Tailwind CSS. Features multi-role dashboards, real-time notifications, secure authentication, and cloud-based file storage.

---

## 📑 Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Complete Setup Guide](#complete-setup-guide)
   - [Local Development Setup](#local-development-setup)
   - [Database Configuration](#database-configuration)
   - [Cloudinary Setup (File Storage)](#cloudinary-setup-file-storage)
   - [Email Services Setup](#email-services-setup)
6. [Running the Application](#running-the-application)
7. [Production Deployment](#production-deployment)
   - [Deploy to Render.com](#deploy-to-rendercom)
   - [TiDB Cloud Setup](#tidb-cloud-setup)
8. [Testing & Troubleshooting](#testing--troubleshooting)
9. [API Documentation](#api-documentation)
10. [Additional Guides](#additional-guides)

---

## 🎯 Project Overview

Rwanda Eats Reserve is a full-featured food reservation and delivery system with three distinct user roles:

- **Customers**: Browse restaurants, make reservations, manage profiles
- **Restaurant Admins**: Manage restaurant details, menus, reservations
- **System Admins**: Oversee all restaurants, users, and system operations

### Key Capabilities

- 🍽️ Multi-image restaurant galleries with cloud storage
- 📅 Real-time reservation management system
- 📧 Email notifications (MailerSend/Brevo integration)
- 🔐 JWT-based authentication with password recovery
- 📱 Progressive Web App (PWA) support
- ☁️ Cloud-ready architecture (TiDB Cloud, Cloudinary)
- 🎨 Modern UI with Tailwind CSS

---

## ✨ Features

- **Authentication System**
  - 4-digit recovery code for password reset
  - JWT tokens and session management
  - Optional rate limiting (no account lockout)

- **Restaurant Management**
  - Multi-image galleries with primary image selection
  - Video and PDF document support (menus, certificates)
  - Operating hours and cuisine type management
  - Real-time availability tracking

- **Reservation System**
  - Date and time-based booking
  - Party size management
  - Status tracking (pending, confirmed, cancelled)
  - Customer and admin dashboards

- **Cloud Integration**
  - Cloudinary for file storage (images, videos, PDFs)
  - TiDB Cloud / MySQL database support
  - SSL/TLS encrypted connections
  - Persistent sessions in database

---

## 📁 Project Structure

```
Delivery-app/
├── backend/                    # Server-side code
│   ├── server.js              # Main Express server
│   ├── config/                # Configuration files
│   │   └── config.js          # Database and app config
│   ├── controllers/           # Business logic (empty - ready for use)
│   ├── middleware/            # Auth, validation middleware (empty)
│   ├── models/                # Database models (empty)
│   ├── routes/                # API routes (empty)
│   ├── utils/                 # Helper functions (empty)
│   ├── migrations/            # Database SQL files
│   │   ├── database.sql       # Main database schema
│   │   ├── init-database.sql  # Initial setup
│   │   └── *.sql             # Feature migrations
│   └── scripts/               # Utility scripts
│       ├── setup-database.js  # Database initialization
│       ├── import-to-tidb.js  # TiDB import
│       └── *.js              # Various utilities
│
├── frontend/                   # Client-side code
│   ├── public/                # Static assets
│   │   ├── css/               # Compiled CSS
│   │   │   └── output.css     # Tailwind compiled output
│   │   ├── js/                # JavaScript files
│   │   │   ├── customer.js
│   │   │   ├── restaurant-admin.js
│   │   │   └── system-admin.js
│   │   ├── uploads/           # User uploads (local dev)
│   │   ├── manifest.json      # PWA manifest
│   │   └── service-worker.js  # PWA service worker
│   ├── src/                   # Source files
│   │   └── input.css          # Tailwind input
│   └── views/                 # HTML templates
│       ├── customer.html
│       ├── system-admin.html
│       ├── restaurant-admin.html
│       ├── login.html
│       ├── register.html
│       └── *.html
│
└── (root)                      # Configuration
    ├── package.json           # Dependencies and scripts
    ├── tailwind.config.js     # Tailwind configuration
    ├── .env                   # Environment variables
    ├── README.md              # This file
    └── *.md                   # Additional documentation
```

**📖 Detailed Structure:** See [`PROJECT_STRUCTURE.md`](PROJECT_STRUCTURE.md)

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v14 or higher ([Download](https://nodejs.org/))
- **MySQL** v5.7+ or **TiDB Cloud** account ([TiDB Cloud](https://tidbcloud.com/))
- **npm** or **yarn** (comes with Node.js)
- **Git** (for version control)
- **Code Editor** (VS Code recommended)

---

## 🚀 Complete Setup Guide

### Step 1: Local Development Setup

#### 1.1 Clone the Repository

```bash
git clone <your-repository-url>
cd Delivery-app
```

#### 1.2 Install Dependencies

```bash
npm install
```

This installs all required packages:
- Express.js - Web framework
- MySQL2 - Database driver
- Bcryptjs - Password hashing
- JWT - Authentication tokens
- Cloudinary - File storage
- MailerSend/Brevo - Email services
- Tailwind CSS - Styling
- And more...

#### 1.3 Create Environment File

Create a `.env` file in the root directory:

**`.env` Template:**

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
# For Local MySQL:
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=rwanda_eats_reserve
DB_SSL=false

# ============================================
# SECURITY KEYS (REQUIRED)
# ============================================
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SESSION_SECRET=your-super-secret-session-key-different-from-jwt

# ============================================
# CLOUDINARY (FILE STORAGE)
# ============================================
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ============================================
# EMAIL SERVICES (OPTIONAL BUT RECOMMENDED)
# ============================================
# MailerSend
MAILERSEND_API_KEY=your_mailersend_api_key
MAILERSEND_FROM_EMAIL=noreply@yourdomain.com
MAILERSEND_FROM_NAME=Rwanda Eats Reserve

# Brevo (Alternative)
BREVO_API_KEY=your_brevo_api_key

# ============================================
# APPLICATION SETTINGS
# ============================================
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000
```

**📖 Complete Checklist:** See [`ENV_CHECKLIST.md`](ENV_CHECKLIST.md)

---

### Step 2: Database Configuration

#### 2.1 Install MySQL Locally (Option A)

**Windows:**
1. Download MySQL Installer from [mysql.com](https://dev.mysql.com/downloads/installer/)
2. Run installer and choose "Developer Default"
3. Set root password during installation
4. Complete installation

**Mac (using Homebrew):**
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

#### 2.2 Create Database and Tables

Run the setup script to automatically create the database and all tables:

```bash
node backend/scripts/setup-database.js
```

This script will:
- ✅ Create `rwanda_eats_reserve` database
- ✅ Create all required tables (users, restaurants, reservations, etc.)
- ✅ Insert sample data (admin users, restaurants, menu items)
- ✅ Set up audit logging
- ✅ Configure session storage

**Expected Output:**
```
✅ Database created successfully
✅ Tables created successfully
✅ Sample data inserted
✅ Setup complete!
```

#### 2.3 Verify Database

Login to MySQL and check:

```bash
mysql -u root -p
```

```sql
SHOW DATABASES;
USE rwanda_eats_reserve;
SHOW TABLES;

-- Should display these tables:
-- users, restaurants, restaurant_images, reservations,
-- menu_items, audit_logs, sessions, user_favorites, etc.

-- Check sample data
SELECT * FROM users WHERE user_type = 'system_admin';
SELECT * FROM restaurants LIMIT 5;
```

---

### Step 3: Cloudinary Setup (File Storage)

**Why Cloudinary?** 
Cloud storage is required for production deployment (Render, Vercel, etc.) because uploaded files don't persist on serverless platforms.

#### 3.1 Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Click "Sign Up For Free"
3. Verify your email
4. Login to dashboard

#### 3.2 Get Credentials

From your Cloudinary Dashboard:

1. Find **Account Details** section
2. Copy these values:
   - **Cloud Name**: `your_cloud_name`
   - **API Key**: `123456789012345`
   - **API Secret**: `abcdefghijklmnopqrstuvwxyz`

#### 3.3 Add to .env File

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### 3.4 Test File Upload

1. Start the server: `npm run dev`
2. Login as system admin
3. Go to Restaurants → Edit Restaurant
4. Upload an image
5. Verify URL starts with `https://res.cloudinary.com/`

**Expected Console Output:**
```
Cloudinary configured successfully
```

**📖 Detailed Guide:** See [`CLOUDINARY_SETUP.md`](CLOUDINARY_SETUP.md)

---

### Step 4: Email Services Setup (Optional)

Email services enable:
- Email verification during registration
- Password reset emails
- Reservation confirmations
- Notification system

#### Option A: MailerSend (Recommended)

1. Sign up at [mailersend.com](https://www.mailersend.com/)
2. Verify your domain (or use their test domain)
3. Create API token
4. Add to `.env`:

```env
MAILERSEND_API_KEY=your_api_key
MAILERSEND_FROM_EMAIL=noreply@yourdomain.com
MAILERSEND_FROM_NAME=Rwanda Eats Reserve
```

#### Option B: Brevo (Alternative)

1. Sign up at [brevo.com](https://www.brevo.com/)
2. Go to SMTP & API settings
3. Create API key
4. Add to `.env`:

```env
BREVO_API_KEY=your_brevo_api_key
```

**Note:** App works without email services, but verification features will be disabled.

---

### Step 5: Build Tailwind CSS

Compile Tailwind CSS before running the app:

```bash
npm run build:css
```

This creates `frontend/public/css/output.css` from `frontend/src/input.css`.

For development with auto-rebuild:

```bash
npm run watch:css
```

**Expected Output:**
```
Rebuilding...
Done in 245ms.
```

**📖 Tailwind Configuration:** See [`TAILWIND.md`](TAILWIND.md)

---

## ▶️ Running the Application

### Development Mode (with auto-restart)

```bash
npm run dev
```

Server starts at: **http://localhost:3000**

Features:
- Auto-restart on file changes (using nodemon)
- Detailed error logs
- Hot reload

### Production Mode

```bash
npm start
```

Features:
- Optimized performance
- Minimal logging
- No auto-restart

### Test Accounts

After running `setup-database.js`, test accounts will be created with secure passwords. Use the password reset functionality to set your own passwords.

### Access Points

- **Homepage**: http://localhost:3000/
- **Login**: http://localhost:3000/login
- **Register**: http://localhost:3000/register
- **Customer Dashboard**: http://localhost:3000/customer
- **System Admin**: http://localhost:3000/system-admin
- **Restaurant Admin**: http://localhost:3000/restaurant-admin

---

## 🌐 Production Deployment

### Deploy to Render.com

Render.com provides free hosting for Node.js applications with persistent databases.

#### Prerequisites

1. **Cloud Database** (Choose one):
   - TiDB Cloud (recommended) - See [TiDB Setup](#tidb-cloud-setup)
   - PlanetScale (free tier)
   - Railway (free tier)
   - AWS RDS MySQL

2. **Cloudinary Account** (required for file uploads)

#### Deployment Steps

**1. Prepare Database**

Export your local database:

```powershell
# Windows PowerShell
.\export-full-backup.ps1
```

```bash
# Mac/Linux
mysqldump -u root -p rwanda_eats_reserve > backup.sql
```

Import to cloud database (TiDB example):

```bash
node backend/scripts/import-to-tidb.js
```

**2. Connect GitHub to Render**

1. Go to [render.com](https://render.com)
2. Sign up / Login
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Select `Delivery-app` repository

**3. Configure Build Settings**

- **Name**: `rwanda-eats-reserve`
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build:css`
- **Start Command**: `npm start`
- **Instance Type**: Free (or paid for better performance)

**4. Set Environment Variables**

In Render Dashboard → Environment tab, add:

```env
# Database (TiDB Cloud example)
DB_HOST=gateway01.eu-central-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=your_tidb_username
DB_PASSWORD=your_tidb_password
DB_NAME=rwanda_eats_reserve
DB_SSL=true

# Security
JWT_SECRET=your-production-jwt-secret-at-least-32-chars
SESSION_SECRET=your-production-session-secret-different
NODE_ENV=production

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Optional)
MAILERSEND_API_KEY=your_mailersend_key
MAILERSEND_FROM_EMAIL=noreply@yourdomain.com
MAILERSEND_FROM_NAME=Rwanda Eats Reserve

# Base URL (update after deployment)
BASE_URL=https://your-app-name.onrender.com
```

**5. Deploy**

1. Click "Create Web Service"
2. Wait 5-10 minutes for deployment
3. Check logs for "✅ Database connection OK"
4. Visit your app URL

**6. Verify Deployment**

Test these endpoints:
- Homepage: `https://your-app.onrender.com/`
- Health check: `https://your-app.onrender.com/api/health`
- Login: `https://your-app.onrender.com/login`

**📖 Complete Guides:** 
- [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md) - Complete deployment instructions
- [`DEPLOYMENT_CHECKLIST.md`](DEPLOYMENT_CHECKLIST.md) - Pre-deployment checklist
- [`DEPLOYMENT_SYNC_GUIDE.md`](DEPLOYMENT_SYNC_GUIDE.md) - Keep deployments in sync

---

### TiDB Cloud Setup

TiDB Cloud provides MySQL-compatible serverless database with generous free tier.

#### 1. Create TiDB Account

1. Go to [tidbcloud.com](https://tidbcloud.com)
2. Sign up for free account
3. Verify email

#### 2. Create Cluster

1. Click "Create Cluster"
2. Choose "Serverless Tier" (free)
3. Select region closest to your users
4. Name: `rwanda-eats-reserve`
5. Click "Create"

#### 3. Get Connection Details

1. Select your cluster
2. Click "Connect"
3. Choose "General" connection type
4. Copy connection details:
   - **Host**: `gateway01.{region}.prod.aws.tidbcloud.com`
   - **Port**: `4000`
   - **User**: Your username
   - **Password**: Your password
   - **Database**: `rwanda_eats_reserve`

#### 4. Configure Environment

Add to `.env` file:

```env
# TiDB Cloud Configuration
TIDB_HOST=gateway01.eu-central-1.prod.aws.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=your_username
TIDB_PASSWORD=your_password
TIDB_DATABASE=rwanda_eats_reserve
```

Or update existing DB_ variables:

```env
DB_HOST=gateway01.eu-central-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=rwanda_eats_reserve
DB_SSL=true
```

#### 5. Import Data

```bash
# Test connection
node backend/scripts/test-tidb-connection.js

# Import data
node backend/scripts/import-to-tidb.js

# Verify data
node backend/scripts/verify-tidb-data.js
```

**Expected Output:**
```
✅ Connected to TiDB Cloud
✅ Data imported successfully
✅ Verification complete
```

**📖 Complete Guides:** 
- [`TIDB_SETUP.md`](TIDB_SETUP.md) - TiDB Cloud setup guide
- [`CONNECT_TIDB_TO_RENDER.md`](CONNECT_TIDB_TO_RENDER.md) - TiDB + Render integration

---

## 🧪 Testing & Troubleshooting

### Run Tests

```powershell
# Test database connection
node backend/scripts/test-tidb-connection.js

# Test password reset flow
.\test-password-reset.ps1

# Test full application flow
.\test-full-flow.ps1

# Check deployment sync
.\verify-deployment.ps1
```

### Common Issues

#### Issue: "Database connection failed"

**Symptoms:**
```
❌ Failed to connect to the database
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solution:**
1. Verify `.env` credentials are correct
2. Check MySQL is running: `mysql -u root -p`
3. Ensure database exists: `SHOW DATABASES;`
4. Check firewall/SSL settings

#### Issue: "Cloudinary not configured"

**Symptoms:**
```
⚠ Cloudinary not configured
```

**Solution:**
1. Verify `CLOUDINARY_*` variables in `.env`
2. Restart server after adding credentials
3. Test: Upload an image in admin panel

#### Issue: "Tailwind CSS not working"

**Symptoms:**
- No styling on pages
- CSS not loading

**Solution:**
```bash
npm run build:css
# or for development
npm run watch:css
```

#### Issue: "Registration requires recovery code"

**Cause:** Database missing `recovery_code` column

**Solution:**
```bash
node backend/scripts/add-recovery-code-column.js
```

#### Issue: "Session expired immediately"

**Cause:** Session storage not configured or database connection failed

**Solution:**
1. Check database connection
2. Verify `sessions` table exists
3. Check `SESSION_SECRET` in `.env`
4. Restart server

#### Issue: "Port 3000 already in use"

**Solution:**

Windows PowerShell:
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or change port in .env
PORT=3001
```

Mac/Linux:
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3001
```

**📖 Detailed Troubleshooting:** 
- [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md) - General troubleshooting
- [`TROUBLESHOOTING_RENDER.md`](TROUBLESHOOTING_RENDER.md) - Render-specific issues
- [`URGENT_FIX.md`](URGENT_FIX.md) - Critical fixes

---

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register new user account

**Request:**
```json
{
  "name": "Your Name",
  "email": "user@example.com",
  "password": "YourSecurePassword123",
  "phone": "0781234567",
  "user_type": "customer",
  "recovery_code": "YourRecoveryCode"
}
```

**Response (201):**
```json
{
  "message": "Registration successful",
  "user": {
    "id": 15,
    "name": "Your Name",
    "email": "user@example.com",
    "user_type": "customer"
  }
}
```

#### POST `/api/auth/login`
User login

**Request:**
```json
{
  "email": "user@example.com",
  "password": "YourPassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 15,
    "name": "Your Name",
    "email": "user@example.com",
    "user_type": "customer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/api/auth/reset-password`
Reset password using recovery code

**Request:**
```json
{
  "email": "user@example.com",
  "recovery_code": "YourRecoveryCode",
  "new_password": "YourNewSecurePassword@2025"
}
```

**Response (200):**
```json
{
  "message": "Password reset successful",
  "user": {
    "name": "Your Name",
    "email": "user@example.com"
  }
}
```

### Restaurant Endpoints

#### GET `/api/restaurants`
Get all restaurants

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Hôtel des Mille Collines",
    "cuisine_type": "International",
    "location": "Kigali City Center",
    "phone": "0788123456",
    "image_url": "https://res.cloudinary.com/.../image.jpg",
    "operating_hours": "Mon-Sun: 6:00 AM - 11:00 PM"
  }
]
```

#### GET `/api/restaurants/:id/menu`
Get restaurant menu

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Grilled Tilapia",
    "description": "Fresh tilapia with local spices",
    "price": 8500,
    "category": "Main Course",
    "is_available": true
  }
]
```

### Reservation Endpoints

#### POST `/api/reservations`
Create new reservation (requires authentication)

**Request:**
```json
{
  "restaurant_id": 1,
  "reservation_date": "2025-12-01",
  "reservation_time": "19:00",
  "party_size": 4,
  "special_requests": "Window seat preferred"
}
```

**Response (201):**
```json
{
  "message": "Reservation created successfully",
  "reservation": {
    "id": 42,
    "restaurant_id": 1,
    "reservation_date": "2025-12-01",
    "reservation_time": "19:00:00",
    "party_size": 4,
    "status": "pending"
  }
}
```

#### PUT `/api/reservations/:id/status`
Update reservation status (admin only)

**Request:**
```json
{
  "status": "confirmed"
}
```

**Response (200):**
```json
{
  "message": "Reservation status updated",
  "reservation": {
    "id": 42,
    "status": "confirmed"
  }
}
```

---

## 📖 Additional Guides

Quick summaries of all documentation files in this repository:

### Setup & Configuration
- [`ENV_CHECKLIST.md`](ENV_CHECKLIST.md) — Complete environment variables required for local and production.
- [`CLOUDINARY_SETUP.md`](CLOUDINARY_SETUP.md) — Configure Cloudinary credentials and verify uploads.
- [`TIDB_SETUP.md`](TIDB_SETUP.md) — Create TiDB serverless cluster and connect from the app.
- [`CLOUD_STORAGE_GUIDE.md`](CLOUD_STORAGE_GUIDE.md) — Why cloud storage is needed and how to enable it.

### Deployment
- [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md) — End-to-end deployment steps on Render.
- [`DEPLOYMENT_CHECKLIST.md`](DEPLOYMENT_CHECKLIST.md) — Pre-deploy checklist to avoid common failures.
- [`DEPLOYMENT_SYNC_GUIDE.md`](DEPLOYMENT_SYNC_GUIDE.md) — Keep environments in sync; data and config parity.
- [`PRODUCTION_SETUP.md`](PRODUCTION_SETUP.md) — Production choices, env vars, and recommended settings.
- [`CONNECT_TIDB_TO_RENDER.md`](CONNECT_TIDB_TO_RENDER.md) — Connect Render service to TiDB Cloud.
- [`LAST_DEPLOY.md`](LAST_DEPLOY.md) — Notes and verification steps from the last deployment.

### Features & Security
- [`PASSWORD_RECOVERY_GUIDE.md`](PASSWORD_RECOVERY_GUIDE.md) — Recovery code flow and endpoints.
- [`ADMIN_PASSWORD_UPDATE.md`](ADMIN_PASSWORD_UPDATE.md) — How admins update their passwords safely.
- [`UNLOCK_ACCOUNTS.md`](UNLOCK_ACCOUNTS.md) — Historical unlock steps; feature now removed.

### Troubleshooting
- [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md) — General diagnostics and fixes.
- [`TROUBLESHOOTING_RENDER.md`](TROUBLESHOOTING_RENDER.md) — Render-specific errors and remedies.
- [`URGENT_FIX.md`](URGENT_FIX.md) — Fast fixes for critical incidents.

### Project Information
- [`PROJECT_STRUCTURE.md`](PROJECT_STRUCTURE.md) — Folder layout and key files.
- [`MIGRATION_GUIDE.md`](MIGRATION_GUIDE.md) — How the project evolved and migrated.
- [`FILE_CONNECTIONS_REPORT.md`](FILE_CONNECTIONS_REPORT.md) — Cross-file dependencies and integrations.
- [`TAILWIND.md`](TAILWIND.md) — Tailwind setup, build, and watch commands.

### Operational Scripts (root)
- [`deploy.ps1`](deploy.ps1) / [`deploy.sh`](archive/deploy.sh) — Deployment helpers.
- [`export-full-backup.ps1`](export-full-backup.ps1) — Full DB export for backup/migration.
- [`import-to-tidb.ps1`](import-to-tidb.ps1) / [`import-updated-to-tidb.ps1`](import-updated-to-tidb.ps1) — Import backups to TiDB.
- [`verify-deployment.ps1`](verify-deployment.ps1) — Validate environment and endpoints post-deploy.
- [`pre-deployment-check.ps1`](pre-deployment-check.ps1) — Automated preflight checks.

---

## 🔒 Security Features

- **Password Security**: Bcrypt hashing with 12 rounds
- **JWT Authentication**: Secure token-based auth
- **Session Management**: Server-side session storage in database
- **Account Protection**: No auto-lock; consider enabling rate limiting
- **Password Recovery**: Secure 4-digit recovery code system
- **SQL Injection Prevention**: Prepared statements and parameterized queries
- **XSS Protection**: Input sanitization and validation
- **CORS Configuration**: Controlled cross-origin requests
- **SSL/TLS Support**: Encrypted database connections
- **Audit Logging**: Track all critical actions (login, logout, password changes)

---

## 📊 Database Schema

### Main Tables

- **users** - User accounts (customers, restaurant admins, system admins)
  - Columns: id, name, email, password_hash, phone, user_type, recovery_code, verification_token, etc.
  
- **restaurants** - Restaurant information
  - Columns: id, name, cuisine_type, location, phone, description, operating_hours, etc.
  
- **restaurant_images** - Multi-image gallery for restaurants
  - Columns: id, restaurant_id, image_url, is_primary, uploaded_at
  
- **menu_items** - Restaurant menus
  - Columns: id, restaurant_id, name, description, price, category, is_available
  
- **reservations** - Booking system
  - Columns: id, user_id, restaurant_id, reservation_date, reservation_time, party_size, status
  
- **user_favorites** - Customer favorite restaurants
  - Columns: id, user_id, restaurant_id, created_at
  
- **audit_logs** - System activity tracking
  - Columns: id, user_id, action_type, details, ip_address, created_at
  
- **sessions** - User session storage
  - Columns: session_id, expires, data

**Full Schema:** See `backend/migrations/database.sql`

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 💬 Support

For issues, questions, or contributions:

- **Issues**: Create an issue in the GitHub repository
- **Documentation**: Check the `.md` files in the repository
- **Email**: support@rwandaeats.com

---

## 🙏 Acknowledgments

- **Node.js & Express** - Backend framework
- **MySQL / TiDB Cloud** - Database
- **Cloudinary** - Cloud storage
- **Tailwind CSS** - UI framework
- **MailerSend / Brevo** - Email services
- **Render.com** - Hosting platform

---

**Last Updated:** November 27, 2025  
**Version:** 1.0.0  
**Author:** Rwanda Eats Reserve Development Team

---

## 🚀 Quick Start Summary

For those who want to get started immediately:

```bash
# 1. Clone and install
git clone <repo-url>
cd Delivery-app
npm install

# 2. Create .env file
# Copy template from above and fill in your values

# 3. Setup database
node backend/scripts/setup-database.js

# 4. Build CSS
npm run build:css

# 5. Start development server
npm run dev

# 6. Open browser
# http://localhost:3000

# 7. Login with your account
# Use the account you created during setup
```

**You're ready to go! 🎉**

---

## 📋 Step-by-Step Checklist

Use this checklist to ensure you've completed all setup steps:

### Local Development
- [ ] Node.js installed (v14+)
- [ ] MySQL installed and running
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with all required variables
- [ ] Database created (`node backend/scripts/setup-database.js`)
- [ ] Database verified (tables exist)
- [ ] Cloudinary account created
- [ ] Cloudinary credentials added to `.env`
- [ ] Tailwind CSS built (`npm run build:css`)
- [ ] Server starts successfully (`npm run dev`)
- [ ] Can login with test account
- [ ] File upload works (images go to Cloudinary)

### Production Deployment
- [ ] Cloud database created (TiDB/PlanetScale/Railway)
- [ ] Local database exported
- [ ] Data imported to cloud database
- [ ] Render.com account created
- [ ] GitHub repository connected to Render
- [ ] Build command set: `npm install && npm run build:css`
- [ ] Start command set: `npm start`
- [ ] All environment variables set in Render
- [ ] `NODE_ENV=production` set
- [ ] Deployment successful
- [ ] Health check passes
- [ ] Can login on production URL
- [ ] Restaurants display correctly
- [ ] Reservations work
- [ ] File uploads work (Cloudinary)

### Optional Enhancements
- [ ] Email service configured (MailerSend/Brevo)
- [ ] Custom domain configured
- [ ] SSL certificate configured
- [ ] Monitoring set up
- [ ] Backup strategy implemented

**Complete all items for a successful deployment! ✓**
