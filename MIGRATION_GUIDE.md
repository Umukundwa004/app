# Migration Guide

## Changes Made to File Structure

Your project has been reorganized into a professional 3-folder structure. Here's what changed:

## What Moved Where

### Backend Files
- ✅ `server.js` → `backend/server.js`
- ✅ `config.js` → `backend/config/config.js`
- ✅ All `*.sql` files → `backend/migrations/`
- ✅ All script files → `backend/scripts/`
  - setup-database.js
  - check-admin-users.js
  - migration-*.js
  - run-*.js
  - test-*.js
  - reset-*.js
  - unlock-*.js
  - verify-*.js
  - add-*.js
  - create-*.js
  - fix-*.js

### Frontend Files
- ✅ `views/` → `frontend/views/`
- ✅ `public/` → `frontend/public/`
- ✅ `src/` → `frontend/src/`

### Root Files (Unchanged)
- ✅ `package.json` (updated scripts)
- ✅ `tailwind.config.js` (updated paths)
- ✅ `.env`
- ✅ `README.md`
- ✅ All test files

## Updated Commands

### Running the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

Both commands now correctly point to `backend/server.js`

### Building CSS
```bash
# Build once
npm run build:css

# Watch for changes
npm run watch:css
```

These now use `frontend/src/input.css` and output to `frontend/public/css/output.css`

## Path Changes in Code

All paths in `backend/server.js` have been automatically updated:

### Static Files
- **Before**: `express.static('public')`
- **After**: `express.static(path.join(__dirname, '..', 'frontend', 'public'))`

### Views
- **Before**: `path.join(__dirname, 'views', 'customer.html')`
- **After**: `path.join(__dirname, '..', 'frontend', 'views', 'customer.html')`

### Uploads
- **Before**: `'public/uploads/restaurants'`
- **After**: `path.join(__dirname, '..', 'frontend', 'public', 'uploads', 'restaurants')`

## New Files Created

1. **`frontend/public/service-worker.js`** - PWA service worker (was missing)
2. **`PROJECT_STRUCTURE.md`** - Detailed documentation of the new structure
3. **`MIGRATION_GUIDE.md`** - This file

## Running Scripts

When running backend scripts, use the new path:

```bash
# Before
node check-admin-users.js

# After
node backend/scripts/check-admin-users.js
```

## Database Migrations

All SQL files are now in `backend/migrations/`:

```bash
# Run migrations
node backend/scripts/setup-database.js
node backend/scripts/run-migration.js
```

## Verification

✅ Server starts successfully with `npm run dev`
✅ Server starts successfully with `npm start`
✅ All paths correctly reference new locations
✅ Static files served from `frontend/public/`
✅ Views served from `frontend/views/`
✅ Uploads go to `frontend/public/uploads/`

## Benefits

1. **Professional Structure**: Industry-standard organization
2. **Clear Separation**: Backend and frontend clearly separated
3. **Scalability**: Easy to add new features in organized folders
4. **Maintainability**: Quick to find relevant files
5. **Team-Friendly**: Multiple developers can work without conflicts

## Empty Folders (Ready for Use)

These folders are created and ready for future development:

```
backend/
├── controllers/    # Add business logic here
├── middleware/     # Add authentication, validation here
├── models/         # Add database models here
├── routes/         # Add API routes here
└── utils/          # Add helper functions here
```

## No Breaking Changes

- All functionality remains the same
- Database connections work as before
- All routes work as before
- Email services work as before
- File uploads work as before

## Next Steps

1. Continue developing as normal using `npm run dev`
2. Add new backend code to appropriate folders in `backend/`
3. Add new frontend code to appropriate folders in `frontend/`
4. Refer to `PROJECT_STRUCTURE.md` for detailed structure info

---

**Note**: The Brevo email configuration warning you see is pre-existing and unrelated to this restructuring.
