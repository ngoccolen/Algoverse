const db = require("../db"); 
const Problem = require('../../models/Problem');

module.exports = {
  // 1. TẠO BÀI TẬP MỚI (Thủ công)
  createManual: async (req, res) => {
    try {
      const { 
        contestId,      
        index,         
        title, 
        difficulty, 
        contentHtml,    
        sampleInput, 
        sampleOutput 
      } = req.body;

      const problemId = await Problem.createOrUpdate({
         title,
         difficulty,
         contentHtml,
         sampleInput,
         sampleOutput,
        
      });

      if (contestId && index) {
          await Problem.linkToContest(contestId, problemId, index);
      }

      res.json({ success: true, message: "Đã tạo bài tập mới!", problemId });
    } catch (err) {
      console.error("Lỗi tạo bài:", err);
      res.status(500).json({ error: "Không thể tạo bài tập" });
    }
  },

  //SỬA BÀI TẬP 
  update: async (req, res) => {
    try {
      const { id } = req.params; 
      const { title, contentHtml, sampleInput, sampleOutput, difficulty } = req.body;

      const sql = `
        UPDATE problems 
        SET title = ?, content_html = ?, sample_input = ?, sample_output = ?, difficulty = ?
        WHERE id = ?
      `;
      await db.query(sql, [title, contentHtml, sampleInput, sampleOutput, difficulty, id]);

      res.json({ success: true, message: "Đã cập nhật nội dung bài tập!" });
    } catch (err) {
      console.error("Lỗi sửa bài:", err);
      res.status(500).json({ error: "Không thể cập nhật bài tập" });
    }
  },

  // LẤY CHI TIẾT 
  getDetail: async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query("SELECT * FROM problems WHERE id = ?", [id]);
        if (rows.length === 0) return res.status(404).json({ error: "Không tìm thấy bài" });
        res.json({ success: true, problem: rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Lỗi server" });
    }
  }
};