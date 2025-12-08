const db = require('../src/db');

const User = {
  // Tạo user mới
  async create(username, email, password) {
    const sql = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
    const [result] = await db.query(sql, [username, email, password]);
    return result;
  },

  // Tìm user theo username
  async findByUsername(username) {
    const sql = `SELECT * FROM users WHERE username = ? LIMIT 1`;
    const [rows] = await db.query(sql, [username]);
    return rows[0];
  },

  // Tìm user theo email
  async findByEmail(email) {
    const sql = `SELECT * FROM users WHERE email = ? LIMIT 1`;
    const [rows] = await db.query(sql, [email]);
    return rows[0];
  },

  // Tìm user theo ID
  async findById(id) {
    const sql = `SELECT id, username, email, avatar, role, bio, location, created_at FROM users WHERE id = ?`;
    const [rows] = await db.query(sql, [id]);
    return rows[0];
  },

  // Tìm user bằng Token reset mật khẩu
  async findByResetToken(token) {
    const sql = `SELECT * FROM users WHERE reset_token = ? LIMIT 1`;
    const [rows] = await db.query(sql, [token]);
    return rows[0];
  },

  // Lưu Token reset mật khẩu
  async setResetToken(email, token) {
    const sql = `UPDATE users SET reset_token = ?, reset_token_expire = ? WHERE email = ?`;
    const expire = Date.now() + 10 * 60 * 1000; // 10 phút
    await db.query(sql, [token, expire, email]);
  },

  // Đổi mật khẩu mới
  async resetPassword(token, newPassword) {
    const sql = `
      UPDATE users 
      SET password = ?, reset_token = NULL, reset_token_expire = NULL 
      WHERE reset_token = ? 
        AND reset_token_expire > ?
    `;
    const now = Date.now();
    const [result] = await db.query(sql, [newPassword, token, now]);
    return result;
  },

  // Login bằng Google
  async findOrCreateGoogleUser(profile) {
    const email = profile.emails[0].value;
    let user = await this.findByEmail(email);
    if (user) return user;
    const username = profile.displayName.replace(/\s+/g, '').toLowerCase() + '_' + profile.id;
    const placeholderPassword = "google_oauth_user"; 
    await this.create(username, email, placeholderPassword);
    if (profile.photos && profile.photos[0]) {
        await db.query("UPDATE users SET avatar = ? WHERE email = ?", [profile.photos[0].value, email]);
    }

    return await this.findByEmail(email);
  },

  // Lấy thông tin chi tiết 
  async getProfileStats(userId) {
    try {
        // 1. Lấy thông tin cá nhân 
        const [users] = await db.query(
            "SELECT id, username, email, avatar, role, bio, location, created_at FROM users WHERE id = ?", 
            [userId]
        );
        
        if (users.length === 0) return null;
        const user = users[0];
        //Thống kê số bài đã giải 
        const sqlStats = `
            SELECT p.difficulty, COUNT(DISTINCT s.exercise_id) as count
            FROM submissions s
            JOIN problems p ON s.exercise_id = p.id
            WHERE s.user_id = ? AND s.status = 'Accepted'
            GROUP BY p.difficulty
        `;
        const [stats] = await db.query(sqlStats, [userId]);
        // Đếm tổng số lần nộp bài
        const [totalSubs] = await db.query("SELECT COUNT(*) as total FROM submissions WHERE user_id = ?", [userId]);
        const solved = { Easy: 0, Medium: 0, Hard: 0, Total: 0 };
    
        if (stats.length > 0) {
            stats.forEach(row => {
                if (solved[row.difficulty] !== undefined) {
                    solved[row.difficulty] = row.count;
                    solved.Total += row.count;
                }
            });
        }

        return { ...user, stats: solved, totalSubmissions: totalSubs[0]?.total || 0 };
    } catch (err) {
        console.error("Lỗi getProfileStats:", err.message);
        throw err; 
    }
  },

  // Lấy danh sách hoạt động gần đây 
  async getRecentActivity(userId) {
      const sql = `
        SELECT s.id, s.status, s.submitted_at as created_at, p.title, p.difficulty
        FROM submissions s
        JOIN problems p ON s.exercise_id = p.id
        WHERE s.user_id = ?
        ORDER BY s.submitted_at DESC
        LIMIT 10
      `;
      const [rows] = await db.query(sql, [userId]);
      return rows;
  },

  // Cập nhật Profile 
  async updateProfile(userId, data) {
    const { bio, location, avatar } = data;
  
    let sql = "UPDATE users SET ";
    const arams = [];
    const fields = [];

    if (bio !== undefined) { fields.push("bio = ?"); params.push(bio); }
    if (location !== undefined) { fields.push("location = ?"); params.push(location); }
    if (avatar !== undefined) { fields.push("avatar = ?"); params.push(avatar); }

    if (fields.length === 0) return true; 

    sql += fields.join(", ") + " WHERE id = ?";
    params.push(userId);

    await db.query(sql, params);
    return true;
  },

};

module.exports = User;