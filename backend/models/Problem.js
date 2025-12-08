const db = require('../src/db');

module.exports = {
  // Lấy danh sách bài tập 
  getByContest: async (contestId) => {
    const sql = `
      SELECT 
        p.id, 
        p.title, 
        p.difficulty, 
        p.total_submissions AS totalSubmissions, 
        p.solved,
        p.content_html,   -- [QUAN TRỌNG] Phải lấy cột này thì mới hiện đề được
        p.sample_input,   -- Lấy luôn để dùng khi chấm bài
        p.sample_output,  -- Lấy luôn để dùng khi chấm bài
        cp.problem_index AS 'index' 
      FROM problems p
      JOIN contest_problems cp ON p.id = cp.problem_id
      WHERE cp.contest_id = ?
      ORDER BY cp.problem_index ASC
    `;
    const [rows] = await db.query(sql, [contestId]);
    return rows;
  },

  // Lấy chi tiết 1 bài tập 
  getById: async (id) => {
    const sql = `SELECT * FROM problems WHERE id = ?`;
    const [rows] = await db.query(sql, [id]);
    return rows[0];
  },

  createOrUpdate: async (data, forceInsert = false) => {
    try {
      if (data.externalId && !forceInsert) {
        // --- LOGIC CHO BÀI CÀO TỪ EXTERNAL ID (UPDATE HOẶC INSERT) ---
        const checkSql = "SELECT id FROM problems WHERE external_id = ?";
        const [existing] = await db.query(checkSql, [data.externalId]);

        if (existing.length > 0) {
          // [UPDATE]
          const updateSql = `
            UPDATE problems 
            SET title = ?, content_html = ?, sample_input = ?, sample_output = ?, difficulty = ?
            WHERE id = ?
          `;
          await db.query(updateSql, [
            data.title, 
            data.contentHtml, 
            data.sampleInput, 
            data.sampleOutput, 
            data.difficulty,
            existing[0].id
          ]);
          return existing[0].id;
        }
      }
      
      const insertSql = `
        INSERT INTO problems (title, difficulty, content_html, sample_input, sample_output, external_id, external_link)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.query(insertSql, [
        data.title, 
        data.difficulty, 
        data.contentHtml, 
        data.sampleInput, 
        data.sampleOutput, 
        data.externalId || null, 
        data.externalLink || null
      ]);
      return result.insertId;
      
    } catch (error) {
      console.error("Lỗi khi lưu Problem:", error);
      throw error;
    }
  },

  // 4. Liên kết bài tập vào Contest
  linkToContest: async (contestId, problemId, problemIndex) => {
    try {
      const checkSql = "SELECT * FROM contest_problems WHERE contest_id = ? AND problem_id = ?";
      const [existing] = await db.query(checkSql, [contestId, problemId]);

      if (existing.length === 0) {
        const sql = `
          INSERT INTO contest_problems (contest_id, problem_id, problem_index)
          VALUES (?, ?, ?)
        `;
        await db.query(sql, [contestId, problemId, problemIndex]);
      }
    } catch (error) {
      console.error("Lỗi khi link Contest-Problem:", error);
    }
  }
};