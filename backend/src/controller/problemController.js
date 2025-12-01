// src/controller/ProblemController.js
const db = require("../db"); // Đảm bảo file db.js export pool promise (mysql2/promise)
const Problem = require('../../models/Problem');

module.exports = {
  // 1. TẠO BÀI TẬP MỚI (Thủ công)
  createManual: async (req, res) => {
    try {
      const { 
        contestId,      // ID cuộc thi muốn thêm bài vào
        index,          // Mã bài (A, B, C...)
        title, 
        difficulty, 
        contentHtml,    // Nội dung đề (HTML từ bộ soạn thảo)
        sampleInput, 
        sampleOutput 
      } = req.body;

      // Tạo ID giả cho externalId để không trùng (VD: MANUAL_1732867...)
      const fakeExternalId = `MANUAL_${Date.now()}`;

      // 1. Lưu vào bảng problems
      const problemId = await Problem.createOrUpdate({
         title,
         difficulty,
         contentHtml,
         sampleInput,
         sampleOutput,
         externalId: fakeExternalId, 
         externalLink: '' // Không có link gốc
      });

      // 2. Link vào Contest
      if (contestId && index) {
          await Problem.linkToContest(contestId, problemId, index);
      }

      res.json({ success: true, message: "Đã tạo bài tập mới!", problemId });
    } catch (err) {
      console.error("Lỗi tạo bài:", err);
      res.status(500).json({ error: "Không thể tạo bài tập" });
    }
  },

  // 2. SỬA BÀI TẬP (Dùng để Dịch đề hoặc Sửa lỗi)
  update: async (req, res) => {
    try {
      const { id } = req.params; // ID bài tập trong DB
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

  // 3. LẤY CHI TIẾT (Để đổ dữ liệu vào form sửa)
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