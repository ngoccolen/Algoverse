// backend/src/routes/contestRoutes.js
const express = require("express");
const router = express.Router();
const ContestController = require("../controller/ContestController");
const { verifyToken } = require("../middleware/authMiddleware");

// =======================================================
// 1. CÁC ROUTE CỤ THỂ & ACTION (ĐẶT TRÊN CÙNG)
// =======================================================

// Lấy danh sách tất cả cuộc thi
router.get("/", ContestController.getAll);

// Đăng ký tham gia (POST - Cần đăng nhập)
// Đây là cái API bị lỗi trong hình cũ của bạn
router.post("/register", verifyToken, ContestController.registerContest);

// Tạo cuộc thi mới (Admin)
router.post("/", verifyToken, ContestController.create);

// Import từ Codeforces
router.get("/import/codeforces", ContestController.importFromCodeforces);

// API Lấy contest từ Codeforces (External)
router.get("/external/codeforces", async (req, res) => {
  try {
    const axios = require("axios");
    const { data } = await axios.get("https://codeforces.com/api/contest.list?gym=false");
    const contests = data.result
      .filter(c => c.phase !== "BEFORE")
      .slice(0, 20)
      .map(item => ({
        id: item.id,
        title: item.name,
        description: "Cuộc thi từ Codeforces (import tự động)",
        startTime: item.startTimeSeconds * 1000,
        endTime: (item.startTimeSeconds + item.durationSeconds) * 1000,
        difficulty: "Medium",
        status: item.phase === "FINISHED" ? "finished" : item.phase === "CODING" ? "ongoing" : "upcoming",
        participants: 0,
        prize: "Không có"
      }));
    res.json({ success: true, contests });
  } catch (err) {
    res.status(500).json({ error: "Lỗi kết nối Codeforces" });
  }
});

// =======================================================
// 2. CÁC ROUTE DYNAMIC (/:id) - BẮT BUỘC ĐẶT CUỐI CÙNG
// =======================================================

// Kiểm tra trạng thái đăng ký của user (GET)
// Đây là cái API bị lỗi trong hình mới nhất của bạn
router.get("/:id/check-registration", verifyToken, ContestController.checkRegistration);

// Lấy bảng xếp hạng
router.get("/:id/leaderboard", ContestController.getLeaderboard);

// Lấy chi tiết contest (Cái này HỨNG mọi url dạng /:id nên phải để cuối cùng)
router.get("/:id", ContestController.getDetail);

module.exports = router;