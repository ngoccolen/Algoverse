const db = require('../db'); 
const Post = require('../../models/postModel'); 

module.exports = {
  // LẤY DANH SÁCH BÀI VIẾT 
  getPosts: async (req, res) => {
    try {
      const { search, sort, filter } = req.query;
      const currentUserId = req.user ? req.user.id : null;
      const posts = await Post.getAll({ search, sort, filter, currentUserId });
      res.json({ success: true, data: posts });
    } catch (err) {
      console.error("getPosts Error:", err);
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },

  // ĐĂNG BÀI VIẾT MỚI 
  createPost: async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Chưa đăng nhập" });
      const { title, content, tags } = req.body;
      let image_url = null;
      if (req.file) {
        image_url = `/uploads/${req.file.filename}`;
      }
      const postData = {
        title,
        content,
        tags,
        image_url 
      };
      const newPostId = await Post.create(req.user.id, postData);
      res.json({ success: true, message: "Đăng bài thành công!", postId: newPostId });
    } catch (err) {
      console.error("createPost Error:", err);
      res.status(500).json({ success: false, message: "Lỗi khi đăng bài" });
    }
  },

  //XỬ LÝ LIKE / UNLIKE 
  votePost: async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Chưa đăng nhập" });
      const userId = req.user.id;
      const postId = req.params.id;
      const [existing] = await db.query(
        "SELECT * FROM post_likes WHERE user_id = ? AND post_id = ?",
        [userId, postId]
      );

      if (existing.length > 0) {
        await db.query("DELETE FROM post_likes WHERE user_id = ? AND post_id = ?", [userId, postId]);
        await db.query("UPDATE posts SET votes = GREATEST(votes - 1, 0) WHERE id = ?", [postId]);
        return res.json({ success: true, message: "Unliked", action: "unlike" });
      } else {
        await db.query("INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)", [userId, postId]);
        await db.query("UPDATE posts SET votes = votes + 1 WHERE id = ?", [postId]);
        return res.json({ success: true, message: "Liked", action: "like" });
      }
    } catch (err) {
      console.error("votePost Error:", err);
      res.status(500).json({ success: false, message: "Lỗi server khi vote" });
    }
  },

  //THÊM BÌNH LUẬN
  addComment: async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Chưa đăng nhập" });

      const userId = req.user.id;
      const postId = req.params.id;
      const { content } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({ success: false, message: "Nội dung không được để trống" });
      }

      const [result] = await db.query(
        "INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)",
        [postId, userId, content]
      );

      const [newComment] = await db.query(`
        SELECT c.*, u.username, u.avatar 
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
      `, [result.insertId]);


      res.json({ success: true, data: newComment[0] });

    } catch (err) {
      console.error("addComment Error:", err);
      res.status(500).json({ success: false, message: "Lỗi khi bình luận" });
    }
  },

  // LẤY DANH SÁCH BÌNH LUẬN
  getPostComments: async (req, res) => {
    try {
      const postId = req.params.id;
      const [rows] = await db.query(`
        SELECT c.*, u.username, u.avatar 
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ?
        ORDER BY c.created_at DESC
      `, [postId]);
      
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error("getComments Error:", err);
      res.status(500).json({ success: false, message: "Lỗi tải bình luận" });
    }
  },

  // XÓA BÀI VIẾT
  deletePost: async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Chưa đăng nhập" });

      const postId = req.params.id;
      const userId = req.user.id;

      const [post] = await db.query("SELECT user_id FROM posts WHERE id = ?", [postId]);

      if (post.length === 0) {
        return res.status(404).json({ success: false, message: "Bài viết không tồn tại" });
      }

      if (post[0].user_id !== userId) {
        return res.status(403).json({ success: false, message: "Bạn không có quyền xóa bài này!" });
      }

      await db.query("DELETE FROM posts WHERE id = ?", [postId]);

      res.json({ success: true, message: "Đã xóa bài viết" });

    } catch (err) {
      console.error("deletePost Error:", err);
      res.status(500).json({ success: false, message: "Lỗi server khi xóa bài" });
    }
  }
};