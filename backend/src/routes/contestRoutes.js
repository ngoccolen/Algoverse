const express = require("express");
const router = express.Router();
const ContestController = require("../controller/ContestController");
const axios = require("axios");

// -------------------------------
// API Contest từ DATABASE
// -------------------------------
router.get("/", ContestController.getAll);
router.get("/:id", ContestController.getDetail);
router.post("/", ContestController.create);
router.get("/import/codeforces", ContestController.importFromCodeforces);


// -------------------------------
// API LẤY CONTEST CÓ SẴN TỪ CODEFORCES
// -------------------------------
router.get("/external/codeforces", async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://codeforces.com/api/contest.list?gym=false"
    );

    const contests = data.result
      .filter(c => c.phase !== "BEFORE")        // loại contest chưa mở
      .slice(0, 20)                             // lấy 20 cái mới nhất
      .map(item => ({
        id: item.id,
        title: item.name,
        description: "Cuộc thi từ Codeforces (import tự động)",
        startTime: item.startTimeSeconds * 1000,
        endTime: (item.startTimeSeconds + item.durationSeconds) * 1000,
        difficulty: "Medium",
        status:
          item.phase === "FINISHED"
            ? "finished"
            : item.phase === "CODING"
            ? "ongoing"
            : "upcoming",
        participants: 0,
        prize: "Không có"
      }));

    res.json({ success: true, contests });
  } catch (err) {
    console.error("Error CF API:", err);
    res.status(500).json({ error: "Không thể lấy contest từ Codeforces" });
  }
});

module.exports = router;
