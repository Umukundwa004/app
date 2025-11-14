# 🚀 Quick Start Guide - Multiple Restaurant Images

## Step 1: Run Migration (REQUIRED)

Choose ONE method:

### Method A: MySQL Command Line (Easiest)
```bash
mysql -u root -p rwanda_eats_reserve
```
Then paste:
```sql
CREATE TABLE IF NOT EXISTS restaurant_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_restaurant (restaurant_id),
    INDEX idx_primary (restaurant_id, is_primary)
);
```

### Method B: Node Script
```bash
node run-migration.js
```
(Set MySQL password in `config.js` first)

## Step 2: Test It!

### As Restaurant Admin:
1. Login at `http://localhost:3000/login`
2. Click "My Restaurants" tab
3. Click "Add Restaurant" or "Edit" existing
4. In "Restaurant Images" field → Select multiple files (Ctrl+Click)
5. See preview → Save
6. Edit again → See existing images → Hover for "Delete" or "Set Primary"

### As Customer:
1. Go to `http://localhost:3000`
2. Click any restaurant card
3. See primary image in header
4. See gallery thumbnails below (if 2+ images)
5. Click thumbnails to change main image

## ✅ That's It!

You now have:
- ✅ Multiple image uploads
- ✅ Image gallery
- ✅ Primary image selection
- ✅ Delete images
- ✅ Full restaurant editing

## 📚 More Info

- **Full Guide**: See `MULTIPLE_IMAGES_GUIDE.md`
- **Migration Help**: See `MIGRATION_QUICK_START.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`

## 🆘 Problems?

**Migration fails?**
- Check MySQL password in `config.js`
- Or use MySQL command line directly

**Images not showing?**
- Verify migration ran: `SHOW TABLES LIKE 'restaurant_images';`
- Check browser console for errors
- Restart server: `npm start`

**Gallery empty?**
- Need at least 2 images for gallery to appear
- Single image shows in header only

---
**Quick Tip**: First uploaded image is automatically primary!
