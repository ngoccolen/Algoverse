require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// --- 1. IMPORT ROUTES (Thêm dòng này) ---
const practiceRoutes = require("./src/routes/practiceRoutes"); // Kiểm tra kỹ đường dẫn file này có đúng là ./src/... hay ./routes/...
// Nếu file practiceRoutes.js nằm trong folder src/routes thì để nguyên.
// Nếu file practiceRoutes.js nằm ngay trong folder routes (ngang hàng server.js) thì sửa thành "./routes/practiceRoutes"

// ---------------------------
// Middlewares
// ---------------------------
app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ---------------------------
// Routes
// ---------------------------
app.use("/api/auth", require("./src/routes/auth")); // Check lại đường dẫn này

// --- 2. ĐĂNG KÝ ROUTE PRACTICE (Thêm dòng này) ---
app.use("/api/practice", practiceRoutes);
// -------------------------------------------------

// ---------------------------
// Error Handler
// ---------------------------
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// ---------------------------
// Start server
// ---------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});