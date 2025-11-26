# Project Structure

This document describes the reorganized folder structure of the Rwanda Eats Reserve application.

## Overview

The project is now organized into three main directories:

```
Delivery-app/
├── backend/          # Server-side code
├── frontend/         # Client-side code
└── (root files)      # Configuration files
```

## Directory Structure

### 📁 Root Directory
Configuration and build files that apply to the entire project:

- `package.json` - Project dependencies and scripts
- `tailwind.config.js` - Tailwind CSS configuration
- `.env` - Environment variables
- `README.md` - Project documentation
- `start.bat` - Windows startup script
- Test files (`test-*.ps1`, `test-*.bat`, `test-*.html`)

### 📁 Backend Directory (`backend/`)
All server-side code and logic:

```
backend/
├── server.js                 # Main Express server
├── config/                   # Configuration files
│   └── config.js            # Database and app configuration
├── controllers/             # Business logic controllers (empty - ready for use)
├── middleware/              # Express middleware (empty - ready for use)
├── models/                  # Database models (empty - ready for use)
├── routes/                  # API route definitions (empty - ready for use)
├── utils/                   # Utility functions (empty - ready for use)
├── migrations/              # Database migration SQL files
│   ├── database.sql
│   ├── init-database.sql
│   ├── migration-*.sql
│   └── fix-*.sql
└── scripts/                 # Maintenance and setup scripts
    ├── setup-database.js
    ├── check-admin-users.js
    ├── migration-*.js
    ├── run-*.js
    ├── test-*.js
    ├── reset-*.js
    ├── unlock-*.js
    └── verify-*.js
```

### 📁 Frontend Directory (`frontend/`)
All client-side code and assets:

```
frontend/
├── public/                  # Static assets served directly
│   ├── manifest.json       # PWA manifest
│   ├── service-worker.js   # PWA service worker
│   ├── style.css           # Global styles
│   ├── unregister-sw.js    # Service worker unregistration
│   ├── css/                # Compiled CSS
│   │   └── output.css      # Tailwind compiled output
│   ├── js/                 # JavaScript files
│   │   ├── customer.js
│   │   ├── restaurant-admin.js
│   │   ├── system-admin.js
│   │   ├── pwa.js
│   │   └── splash.js
│   └── uploads/            # User uploaded files
│       └── restaurants/    # Restaurant images
├── src/                    # Source files (pre-compiled)
│   └── input.css           # Tailwind input file
└── views/                  # HTML templates
    ├── customer.html
    ├── customer-profile.html
    ├── customer-tailwind.html
    ├── login.html
    ├── register.html
    ├── verify-email.html
    ├── admin-router.html
    ├── system-admin.html
    ├── restaurant-admin.html
    ├── home.html
    └── images/             # Static view images
```

## Running the Application

### Development Mode
```bash
npm run dev
```
This starts the server with nodemon for automatic restarts on file changes.

### Production Mode
```bash
npm start
```
This starts the server without auto-restart.

### Building CSS
```bash
# Build once
npm run build:css

# Watch for changes
npm run watch:css
```

## Key Changes from Original Structure

1. **Server Location**: `server.js` moved from root to `backend/server.js`
2. **Views**: Moved from root `views/` to `frontend/views/`
3. **Public Assets**: Moved from root `public/` to `frontend/public/`
4. **Source Files**: Moved from root `src/` to `frontend/src/`
5. **Configuration**: Moved `config.js` to `backend/config/config.js`
6. **Scripts**: Consolidated all utility scripts into `backend/scripts/`
7. **Migrations**: All SQL files moved to `backend/migrations/`

## Path Updates

All paths in `server.js` have been updated to reference the new structure:
- Static files: `../frontend/public/`
- Views: `../frontend/views/`
- Uploads: `../frontend/public/uploads/`

## Benefits of This Structure

1. **Clear Separation**: Backend and frontend code are clearly separated
2. **Scalability**: Easier to add new features in organized folders
3. **Maintainability**: Developers can quickly find relevant files
4. **Best Practices**: Follows industry-standard project organization
5. **Future-Ready**: Prepared for potential microservices or separate deployment

## Next Steps

The following directories are ready for implementation:
- `backend/controllers/` - Add route controllers
- `backend/middleware/` - Add authentication, validation middleware
- `backend/models/` - Add database models/schemas
- `backend/routes/` - Add modular route definitions
- `backend/utils/` - Add helper functions

This structure provides a solid foundation for scaling the application.
