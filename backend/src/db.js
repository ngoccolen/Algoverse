const mysql = require("mysql2");
require("dotenv").config({ path: __dirname + "/../.env" }); 

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, 
  queueLimit: 0,
});

// Kiểm tra kết nối
db.getConnection((err, connection) => {
  if (err) {
    console.error("🔥 Database connection failed:", err.stack);
    return;
  }
  if (connection) {
    connection.release();
    console.log("Database connected successfully! 🚀");
  }
});

module.exports = db.promise();