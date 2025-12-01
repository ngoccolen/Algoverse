// backend/src/controller/userController.js
const User = require('../../models/userModel'); 
const db = require('../db'); 

module.exports = {
  // ==========================================
  // 1. LẤY THÔNG TIN PROFILE
  // ==========================================
  getProfile: async (req, res) => {
    try {
      const userId = req.user.id;

      // 1. User & Stats
      const userProfile = await User.getProfileStats(userId);
      if (!userProfile) return res.status(404).json({ success: false, message: "User not found" });

      // 2. Hoạt động gần đây
      const recentActivity = await User.getRecentActivity(userId);
      
      // 3. Lịch sử Contest
      const [contestHistory] = await db.query(`
          SELECT c.id, c.title, cp.score, cp.penalty, cp.registered_at
          FROM contest_participants cp
          JOIN contests c ON cp.contest_id = c.id
          WHERE cp.user_id = ?
          ORDER BY c.startTime DESC LIMIT 5
      `, [userId]);

      // 4. Biểu đồ
      const rawStats = await User.getActivityStats(userId);
      const chartData = [];
      for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const found = rawStats.find(r => r.date === dateStr);
          chartData.push({
              date: dateStr,
              dayName: d.toLocaleDateString('vi-VN', { weekday: 'short' }),
              count: found ? found.count : 0
          });
      }

      res.json({ 
          success: true, 
          user: userProfile, 
          recentActivity,
          contestHistory: contestHistory || [],
          chartData 
      });

    } catch (err) {
      console.error("Get Profile Error:", err);
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },

  // ==========================================
  // 2. CẬP NHẬT THÔNG TIN (BIO, LOCATION)
  // ==========================================
  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const { bio, location } = req.body; 
      await db.query("UPDATE users SET bio = ?, location = ? WHERE id = ?", [bio, location, userId]);
      res.json({ success: true, message: "Cập nhật thành công" });
    } catch (err) {
      console.error("Update Profile Error:", err);
      res.status(500).json({ success: false, message: "Lỗi cập nhật hồ sơ" });
    }
  },

  // ==========================================
  // 3. UPLOAD AVATAR
  // ==========================================
  uploadAvatar: async (req, res) => {
      try {
          if (!req.file) return res.status(400).json({ success: false, message: "Chưa chọn file ảnh" });
          
          const avatarUrl = `/uploads/${req.file.filename}`;
          await db.query("UPDATE users SET avatar = ? WHERE id = ?", [avatarUrl, req.user.id]);
          
          res.json({ success: true, message: "Đổi ảnh đại diện thành công", avatar: avatarUrl });
      } catch (err) {
          console.error("Upload Avatar Error:", err);
          res.status(500).json({ success: false, message: "Lỗi upload ảnh" });
      }
  }
};