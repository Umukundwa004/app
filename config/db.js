const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: process.env.TIDB_HOST || "localhost",
  user: process.env.TIDB_USER || "root",
  password: process.env.TIDB_PASSWORD || "",
  database: process.env.TIDB_DATABASE || "restaurantdb",
});

module.exports = db;
