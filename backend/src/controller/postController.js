// backend/src/controller/postController.js
const db = require('../db'); 
const Post = require('../../models/postModel'); 

module.exports = {
  // ============================================
  // 1. LẤY DANH SÁCH BÀI VIẾT (Feed)
  // ============================================
  // GET /api/posts
  getPosts: async (req, res) => {
    try {
      const { search, sort, filter } = req.query;
      const currentUserId = req.user ? req.user.id : null;

      // Gọi Model để lấy danh sách bài viết (kèm thông tin user, like, comment)
      const posts = await Post.getAll({ search, sort, filter, currentUserId });
      
      res.json({ success: true, data: posts });
    } catch (err) {
      console.error("getPosts Error:", err);
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },

  // ============================================
  // 2. ĐĂNG BÀI VIẾT MỚI (Có xử lý ảnh)
  // ============================================
  // POST /api/posts
  createPost: async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Chưa đăng nhập" });
      
      // Lấy dữ liệu từ form (khi dùng multer, req.body sẽ chứa text fields)
      const { title, content, tags } = req.body;
      
      // Xử lý ảnh upload (nếu có)
      let image_url = null;
      if (req.file) {
        // req.file do multer tạo ra
        image_url = `/uploads/${req.file.filename}`;
      }

      // Đóng gói dữ liệu
      const postData = {
        title,
        content,
        tags,
        image_url // Trường mới thêm
      };
      
      // Gọi Model tạo bài viết (Lưu ý: postModel.create cần hỗ trợ cột image_url)
      const newPostId = await Post.create(req.user.id, postData);
      
      res.json({ success: true, message: "Đăng bài thành công!", postId: newPostId });
    } catch (err) {
      console.error("createPost Error:", err);
      res.status(500).json({ success: false, message: "Lỗi khi đăng bài" });
    }
  },

  // ============================================
  // 3. XỬ LÝ LIKE / UNLIKE (VOTE)
  // ============================================
  // POST /api/posts/:id/vote
  votePost: async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Chưa đăng nhập" });

      const userId = req.user.id;
      const postId = req.params.id;

      // 1. Kiểm tra xem user đã like chưa
      const [existing] = await db.query(
        "SELECT * FROM post_likes WHERE user_id = ? AND post_id = ?",
        [userId, postId]
      );

      if (existing.length > 0) {
        // --- UNLIKE ---
        await db.query("DELETE FROM post_likes WHERE user_id = ? AND post_id = ?", [userId, postId]);
        // Giảm vote count (không cho nhỏ hơn 0)
        await db.query("UPDATE posts SET votes = GREATEST(votes - 1, 0) WHERE id = ?", [postId]);
        return res.json({ success: true, message: "Unliked", action: "unlike" });
      } else {
        // --- LIKE ---
        await db.query("INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)", [userId, postId]);
        // Tăng vote count
        await db.query("UPDATE posts SET votes = votes + 1 WHERE id = ?", [postId]);
        return res.json({ success: true, message: "Liked", action: "like" });
      }
    } catch (err) {
      console.error("votePost Error:", err);
      res.status(500).json({ success: false, message: "Lỗi server khi vote" });
    }
  },

  // ============================================
  // 4. BÌNH LUẬN (COMMENT)
  // ============================================
  // POST /api/posts/:id/comments
  addComment: async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Chưa đăng nhập" });

      const userId = req.user.id;
      const postId = req.params.id;
      const { content } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({ success: false, message: "Nội dung không được để trống" });
      }

      // 1. Thêm comment vào DB
      const [result] = await db.query(
        "INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)",
        [postId, userId, content]
      );

      // 2. Lấy lại thông tin comment vừa tạo (kèm info User để hiển thị Avatar/Tên ngay lập tức)
      const [newComment] = await db.query(`
        SELECT c.*, u.username, u.avatar 
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
      `, [result.insertId]);

      // 3. Cập nhật số lượng bình luận trong bảng posts (nếu có cột answers_count)
      // await db.query("UPDATE posts SET answers_count = answers_count + 1 WHERE id = ?", [postId]);

      res.json({ success: true, data: newComment[0] });

    } catch (err) {
      console.error("addComment Error:", err);
      res.status(500).json({ success: false, message: "Lỗi khi bình luận" });
    }
  }
};