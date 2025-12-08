const db = require('../src/db'); 

const Post = {
  // LẤY DANH SÁCH BÀI VIẾT 
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
    if (filter && filter !== 'All') {
      sql += ` AND (p.tags LIKE ? OR p.status = ?)`;
      params.push(`%${filter}%`, filter);
    }

    if (sort === 'trending') {
      sql += ` ORDER BY p.views DESC, p.votes DESC`;
    } else if (sort === 'unanswered') {
      sql += ` AND p.status = 'unanswered' ORDER BY p.created_at DESC`;
    } else {
      sql += ` ORDER BY p.created_at DESC`; 
    }

    const [rows] = await db.query(sql, params);
    return rows;
  },

  
  //TẠO BÀI VIẾT MỚI 
  async create(userId, data) {
    const { title, content, tags, image_url } = data; 
    const sql = `
      INSERT INTO posts (user_id, title, content, tags, image_url, status) 
      VALUES (?, ?, ?, ?, ?, 'unanswered')
    `;
    const [result] = await db.query(sql, [userId, title, content, tags, image_url]);
    return result.insertId;
  },

  //TĂNG LƯỢT XEM
  async incrementView(postId) {
    await db.query(`UPDATE posts SET views = views + 1 WHERE id = ?`, [postId]);
  }
};

module.exports = Post;