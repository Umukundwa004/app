const multer = require("multer");

const storage = multer.memoryStorage(); // Keeps file buffer in memory

const upload = multer({ storage });

module.exports = upload;
