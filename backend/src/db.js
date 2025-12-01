// THAY THẾ TOÀN BỘ FILE: ./src/db.js
const mysql = require("mysql2");
// Đảm bảo file .env ở thư mục gốc (ngang hàng package.json)
require("dotenv").config({ path: __dirname + "/../.env" }); 

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Quản lý 10 kết nối
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

// Xuất ra pool, thêm .promise() để dùng async/await
module.exports = db.promise();