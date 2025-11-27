const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { uploadFile } = require("../services/s3");
const db = require("../config/db");

// Create restaurant with image upload
router.post("/create", upload.single("image"), async (req, res) => {
  try {
    const { name, location } = req.body;
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadFile(req.file, "restaurants");
    }
    const sql = `INSERT INTO restaurants (name, location, image_url) VALUES (?, ?, ?)`;
    await db.query(sql, [name, location, imageUrl]);
    res.json({ message: "Restaurant created", imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Edit restaurant with new image upload
router.put("/edit/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, location } = req.body;
    const { id } = req.params;
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadFile(req.file, "restaurants");
    }
    const sql = `UPDATE restaurants SET name = ?, location = ?, image_url = COALESCE(?, image_url) WHERE id = ?`;
    await db.query(sql, [name, location, imageUrl, id]);
    res.json({ message: "Restaurant updated", imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

module.exports = router;
