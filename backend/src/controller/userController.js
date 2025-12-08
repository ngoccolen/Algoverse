const db = require('../db'); 

module.exports = {
  getProfile: async (req, res) => {
    try {
      const userId = req.user.id;

      const [users] = await db.query(`SELECT id, username, email, avatar, bio, location, created_at FROM users WHERE id = ?`, [userId]);
      if (users.length === 0) return res.status(404).json({ success: false, message: "User not found" });
      const user = users[0];

      const [stats] = await db.query(`
        SELECT COUNT(*) as Total,
            SUM(CASE WHEN p.difficulty = 'Easy' THEN 1 ELSE 0 END) as Easy,
            SUM(CASE WHEN p.difficulty = 'Medium' THEN 1 ELSE 0 END) as Medium,
            SUM(CASE WHEN p.difficulty = 'Hard' THEN 1 ELSE 0 END) as Hard
        FROM submissions s
        LEFT JOIN problems p ON s.problem_id = p.id
        WHERE s.user_id = ? AND s.status = 'Accepted'
      `, [userId]);
      
      const [totalSub] = await db.query(`SELECT COUNT(*) as total FROM submissions WHERE user_id = ?`, [userId]);

      const userProfile = {
          ...user,
          totalSubmissions: totalSub[0].total || 0,
          stats: stats[0] || { Total: 0, Easy: 0, Medium: 0, Hard: 0 }
      };

      const [recentActivity] = await db.query(`
        SELECT s.id, 
            COALESCE(p.title, 'Bài tập chưa định danh') as title, 
            COALESCE(p.difficulty, 'Unknown') as difficulty, 
            s.status, s.submitted_at as created_at
        FROM submissions s
        LEFT JOIN problems p ON s.problem_id = p.id
        WHERE s.user_id = ?
        ORDER BY s.submitted_at DESC LIMIT 5
      `, [userId]);
      
      const [contestHistory] = await db.query(`
          SELECT c.id, c.title, cp.score, cp.penalty, cp.registered_at
          FROM contest_participants cp
          JOIN contests c ON cp.contest_id = c.id
          WHERE cp.user_id = ?
          ORDER BY c.start_time DESC LIMIT 5
      `, [userId]);

      const [rawSubmissions] = await db.query(`SELECT submitted_at FROM submissions WHERE user_id = ? AND submitted_at >= DATE_SUB(NOW(), INTERVAL 10 DAY)`, [userId]);

      const chartData = [];
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(today.getDate() - i);
          
          const checkDay = d.getDate();
          const checkMonth = d.getMonth();
          const checkYear = d.getFullYear();

          const count = rawSubmissions.filter(sub => {
              const subDate = new Date(sub.submitted_at);
              return subDate.getDate() === checkDay && subDate.getMonth() === checkMonth && subDate.getFullYear() === checkYear;
          }).length;

          chartData.push({
              date: d.toISOString().split('T')[0],
              dayName: d.toLocaleDateString('vi-VN', { weekday: 'short' }),
              count: count
          });
      }

      res.json({ success: true, user: userProfile, recentActivity: recentActivity || [], contestHistory: contestHistory || [], chartData });

    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { bio, location } = req.body; 
      await db.query("UPDATE users SET bio = ?, location = ? WHERE id = ?", [bio, location, req.user.id]);
      res.json({ success: true, message: "Cập nhật thành công" });
    } catch (err) { res.status(500).json({ success: false, message: "Lỗi cập nhật" }); }
  },

  uploadAvatar: async (req, res) => {
      try {
          if (!req.file) return res.status(400).json({ success: false, message: "Chưa chọn file" });
          const avatarUrl = `/uploads/${req.file.filename}`;
          await db.query("UPDATE users SET avatar = ? WHERE id = ?", [avatarUrl, req.user.id]);
          res.json({ success: true, message: "Thành công", avatar: avatarUrl });
      } catch (err) { res.status(500).json({ success: false, message: "Lỗi upload" }); }
  }
};