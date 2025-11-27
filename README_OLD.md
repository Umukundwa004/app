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
  - Secure registration with email verification
  - 4-digit recovery code for password reset
  - JWT tokens and session management
  - Account lockout protection after failed login attempts

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

Project Structure
Delivery-app/
├── backend/
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── migrations/
│   └── scripts/
├── frontend/
│   ├── public/
│   │   ├── css/
│   │   ├── js/
│   │   ├── uploads/
│   │   ├── manifest.json
│   │   └── service-worker.js
│   ├── src/
│   └── views/
└── package.json


Backend contains server logic, API routes, scripts, and migrations.
Frontend contains static assets, views, and Tailwind CSS source.

Prerequisites

Before starting, ensure the following are installed:

Node.js v14 or higher

MySQL v5.7 or higher (or TiDB Cloud for cloud DB)

npm or yarn package manager

Step-by-Step Installation & Setup
Step 1: Clone the repository
git clone <repository-url>
cd app

Step 2: Install dependencies
npm install


This installs backend and frontend dependencies including Express, MySQL2, Bcryptjs, JSON Web Token, Express Session, Nodemailer, and Tailwind CSS.

Step 3: Configure environment variables

Create a .env file in the root folder. Example configuration for local MySQL:

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=rwanda_eats_reserve
DB_SSL=false

MAILERSEND_API_KEY=your_mailer_key
BREVO_API_KEY=your_brevo_key
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret


If using TiDB Cloud, replace DB_* variables with TiDB connection details.

Step 4: Initialize the database

For local MySQL:

node backend/scripts/setup-database.js


This will:

Create the rwanda_eats_reserve database

Create all tables

Insert sample users, restaurants, menu items, and templates

Step 5: Verify Database

Log in to MySQL and ensure tables exist:

mysql -u root -p
SHOW DATABASES;
USE rwanda_eats_reserve;
SHOW TABLES;


You should see tables like users, restaurants, restaurant_images, reservations, and menu_items.

Step 6: Configure Tailwind CSS

Tailwind source: frontend/src/input.css

Output CSS: frontend/public/css/output.css

Build Tailwind CSS for production:

npm run build:css


Watch CSS during development:

npm run watch:css


Include in HTML:

<link rel="stylesheet" href="/css/output.css">

Step 7: Run the Application

Development mode with auto-reload:

npm run dev


Production mode:

npm start


Server will run on http://localhost:3000.

Step 8: Test Accounts

Use the accounts created during database setup. Passwords can be reset using the password recovery functionality.

TiDB Cloud Configuration (Optional)

To use TiDB Cloud instead of local MySQL:

Login to TiDB Cloud at https://tidbcloud.com/

Select your cluster and click “Connect”

Copy host, port, username, password, and database name

Update .env with TIDB_HOST, TIDB_PORT, TIDB_USER, TIDB_PASSWORD, TIDB_DATABASE

Run:

node backend/scripts/test-tidb-connection.js
node backend/scripts/import-to-tidb.js
node backend/scripts/verify-tidb-data.js

API Endpoints Overview

Authentication

POST /api/auth/register

POST /api/auth/login

POST /api/auth/logout

POST /api/auth/verify-email

POST /api/auth/forgot-password

POST /api/auth/reset-password

GET /api/auth/me

Restaurants

GET /api/restaurants

GET /api/restaurants/:id/menu

Reservations

POST /api/reservations

PUT /api/reservations/:id/status

Admin (Auth Required)

Restaurant Admin: /api/restaurant-admin/*

System Admin: /api/system-admin/*

Features

JWT-based authentication and session management

Bcrypt password hashing

Email and SMS notifications

Multi-image restaurant galleries with primary image selection

Reservation system with real-time availability

Audit logging and security

Reporting dashboards for admins

Troubleshooting

Database connection errors: verify .env and database running

Port conflicts: change port in backend/server.js or stop conflicting process

Missing modules: run npm install

Tailwind rebuilds: use npm run watch:css

Production Deployment

Set strong JWT and session secrets in .env

Use cloud database (TiDB, PlanetScale, Railway)

Build Tailwind CSS for production with npm run build:css

Enable HTTPS, secure cookies, and CORS

Start server with PM2:

npm install -g pm2
pm2 start backend/server.js --name rwanda-eats

License

