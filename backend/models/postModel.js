const db = require('../src/db');


const Post = {
  // Lấy danh sách bài viết (Hỗ trợ tìm kiếm, lọc, sắp xếp)
  async getAll({ search, sort, filter }) {
    let sql = `
      SELECT p.*, u.username, u.avatar, 
      (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as answers_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Tìm kiếm
    if (search) {
      sql += ` AND (p.title LIKE ? OR p.content LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    // Lọc theo tag hoặc trạng thái
    if (filter && filter !== 'All') {
      // Nếu filter là tag (Sorting, Graph...) hoặc status
      sql += ` AND (p.tags LIKE ? OR p.status = ?)`;
      params.push(`%${filter}%`, filter);
    }

    // Sắp xếp
    if (sort === 'trending') {
      sql += ` ORDER BY p.views DESC, p.votes DESC`;
    } else if (sort === 'unanswered') {
      sql += ` AND p.status = 'unanswered' ORDER BY p.created_at DESC`;
    } else {
      sql += ` ORDER BY p.created_at DESC`; // Mặc định mới nhất
    }

    const [rows] = await db.query(sql, params);
    return rows;
  },

  // Tạo bài viết mới
  async create(userId, data) {
    const { title, content, tags, urgency } = data;
    // Urgency có thể dùng để set status hoặc prefix title
    const sql = `INSERT INTO posts (user_id, title, content, tags, status) VALUES (?, ?, ?, ?, 'unanswered')`;
    const [result] = await db.query(sql, [userId, title, content, tags]);
    return result.insertId;
  },

  // Tăng lượt xem
  async incrementView(postId) {
    await db.query(`UPDATE posts SET views = views + 1 WHERE id = ?`, [postId]);
  }
};

module.exports = Post;