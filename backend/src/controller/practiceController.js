// controller/practiceController.js
const db = require("../db"); 
const { runSubmission, LANGUAGE_MAPPING } = require("../utils/judge0");

// Helper chuẩn hóa chuỗi (xóa khoảng trắng thừa, thống nhất xuống dòng)
const normalize = (str) => {
  if (str === null || str === undefined) return "";
  return String(str).trim().replace(/\r\n/g, '\n');
};

module.exports = {

  // 1. LẤY DANH SÁCH BÀI TẬP (Kèm trạng thái User đã giải hay chưa)
  getAllProblems: async (req, res) => {
    try {
      // Lấy ID user nếu đã đăng nhập (middleware verifyToken đã gán vào req.user)
      const userId = req.user ? req.user.id : null;

      // Query này kiểm tra trong bảng submissions xem user này đã có bài Accepted chưa
      const query = `
        SELECT p.id, p.title, p.difficulty, IFNULL(p.category, 'Algorithm') as category, 
               p.total_submissions, p.solved,
               (SELECT COUNT(*) FROM submissions s 
                WHERE s.problem_id = p.id 
                AND s.user_id = ? 
                AND s.status = 'Accepted'
               ) > 0 AS is_solved
        FROM problems p
        WHERE p.is_public = 1
        ORDER BY p.id ASC
      `;

      // Lưu ý: db.execute dùng cho mysql2
      const [rows] = await db.execute(query, [userId]);
      
      // Frontend PracticePage.jsx cần map lại: nếu is_solved > 0 thì coi như đã solved
      const result = rows.map(row => ({
          ...row,
          solved: row.is_solved // Ghi đè solved global bằng trạng thái của user
      }));

      return res.json(result);
    } catch (err) {
      console.error("❌ getAllProblems Error:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }
  },

  // 2. LẤY CHI TIẾT BÀI TẬP (Kèm Code cũ của User)
  getProblemById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user ? req.user.id : null;
      
      // A. Lấy thông tin bài tập
      const [problemRows] = await db.execute(`
        SELECT id, title, difficulty, content_html, category, sample_input, sample_output, total_submissions, solved 
        FROM problems WHERE id = ?`, [id]);

      if (problemRows.length === 0) return res.status(404).json({ message: "Bài tập không tồn tại" });
      const problem = problemRows[0];

      // B. Lấy Test Case công khai (để hiển thị ví dụ)
      let publicTests = [];
      try {
          const [tests] = await db.execute(`SELECT input, output FROM test_cases WHERE problem_id = ? AND is_hidden = 0`, [id]);
          publicTests = tests;
      } catch (e) {}

      // C. [QUAN TRỌNG] Lấy code cũ của User (nếu có)
      // Ưu tiên lấy bài đã Accepted, nếu không thì lấy bài nộp mới nhất
      let userCode = "";
      if (userId) {
          const [history] = await db.execute(`
              SELECT source_code 
              FROM submissions 
              WHERE user_id = ? AND problem_id = ?
              ORDER BY (status = 'Accepted') DESC, submitted_at DESC 
              LIMIT 1
          `, [userId, id]);
          
          if (history.length > 0) {
              userCode = history[0].source_code;
          }
      }

      // Trả về dữ liệu gộp
      return res.json({
          id: problem.id,
          title: problem.title,
          description: problem.content_html, 
          difficulty: problem.difficulty,
          category: problem.category || "Algorithm",
          testcases_public: publicTests, 
          sample_input: problem.sample_input,   
          sample_output: problem.sample_output, 
          total_submissions: problem.total_submissions,
          solved: problem.solved,
          user_code: userCode // <--- Frontend sẽ dùng cái này để fill vào editor
      });

    } catch (err) {
      console.error("❌ getProblemById Error:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }
  },

  // 3. NỘP BÀI & CHẤM ĐIỂM
  submitSolution: async (req, res) => {
    try {
      const { id } = req.params; 
      const { language, source, runOnly } = req.body;
      
      const userId = req.user ? req.user.id : null;
      if (!userId && !runOnly) return res.status(401).json({ message: "Bạn cần đăng nhập để nộp bài." });

      const languageId = LANGUAGE_MAPPING[language];
      if (!languageId) return res.status(400).json({ message: `Ngôn ngữ '${language}' chưa được hỗ trợ.` });

      // Lấy test case (ẩn + hiện)
      let testCases = [];
      try {
          let query = `SELECT input, output, is_hidden FROM test_cases WHERE problem_id = ?`;
          // Nếu chỉ chạy thử (Run Code), chỉ lấy test công khai
          if (runOnly) query += ` AND is_hidden = 0`; 
          const [rows] = await db.execute(query, [id]);
          testCases = rows;
      } catch (e) {}

      // Fallback: Nếu không có test case riêng, dùng sample từ bảng problems
      if (testCases.length === 0) {
          const [prob] = await db.execute(`SELECT sample_input, sample_output FROM problems WHERE id = ?`, [id]);
          if (prob.length > 0 && prob[0].sample_input) {
              testCases.push({ input: prob[0].sample_input, output: prob[0].sample_output, is_hidden: 0 });
          }
      }

      if (testCases.length === 0) return res.status(400).json({ message: "Bài tập này chưa có dữ liệu test." });

      // Gửi sang Judge0 chấm song song
      const judgePromises = testCases.map(tc => runSubmission(source, languageId, tc.input));
      const judgeResults = await Promise.all(judgePromises);

      let passed = 0;
      let results = [];
      let finalStatus = "Accepted";
      let maxTime = 0;
      let maxMemory = 0;

      for (let i = 0; i < testCases.length; i++) {
          const tc = testCases[i];
          const output = judgeResults[i];

          const actualOutput = normalize(output.stdout);
          const expectedOutput = normalize(tc.output);
          
          // Logic so sánh: Output giống nhau + Không có lỗi stderr + Status từ Judge0 là 3 (Accepted)
          const isCorrect = (actualOutput === expectedOutput) && (!output.stderr) && (output.status.id === 3);

          if (isCorrect) passed++;
          else if (finalStatus === "Accepted") {
              // Nếu sai, cập nhật trạng thái chung
              finalStatus = output.status.id === 3 ? "Wrong Answer" : output.status.description;
          }

          const timeVal = parseFloat(output.time || 0);
          const memVal = parseFloat(output.memory || 0);
          if (timeVal > maxTime) maxTime = timeVal;
          if (memVal > maxMemory) maxMemory = memVal;

          results.push({
              input: tc.input, 
              expected: tc.output, 
              output: actualOutput, 
              stderr: output.stderr,
              status: isCorrect ? "Accepted" : (output.status.id === 3 ? "Wrong Answer" : output.status.description),
              ok: isCorrect, 
              time: output.time, 
              is_public: !tc.is_hidden 
          });
      }

      // Lưu kết quả vào DB (Trừ khi chạy thử Run Code)
      if (!runOnly) {
          try {
              // Insert submission
              await db.execute(
                  `INSERT INTO submissions 
                  (user_id, problem_id, language_id, source_code, status, passed_cases, total_cases, time_taken, memory_used, submitted_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`, 
                  [userId, id, languageId, source, finalStatus, passed, testCases.length, maxTime, maxMemory]
              );

              // Tăng đếm tổng số lần nộp
              await db.execute(`UPDATE problems SET total_submissions = total_submissions + 1 WHERE id = ?`, [id]);

              // Nếu đúng, kiểm tra xem đây có phải lần đầu đúng không để tăng biến 'solved' toàn cục
              if (finalStatus === "Accepted") {
                  const [existing] = await db.execute(
                      `SELECT id FROM submissions WHERE user_id = ? AND problem_id = ? AND status = 'Accepted' LIMIT 1`,
                      [userId, id]
                  );
                  // Logic đơn giản: cứ accepted là +1 solved cho bài toán (hoặc bạn có thể check kỹ hơn)
                   await db.execute(`UPDATE problems SET solved = solved + 1 WHERE id = ?`, [id]);
              }
          } catch (dbErr) {
              console.error("❌ LỖI SQL KHI SUBMIT:", dbErr.message);
          }
      }

      return res.json({
          status: runOnly ? "Test Run" : finalStatus,
          passed_cases: passed, 
          total_cases: testCases.length,
          time_taken: maxTime, 
          memory_used: maxMemory, 
          results: results
      });

    } catch (err) {
      console.error("❌ submitSolution Error:", err);
      return res.status(500).json({ message: "Lỗi server khi chấm bài" });
    }
  },

  // 4. LỊCH SỬ NỘP BÀI
  getSubmissionHistory: async (req, res) => {
      try {
        const { id } = req.params;
        const [rows] = await db.execute(
          `SELECT id, status, passed_cases, total_cases, time_taken, memory_used, submitted_at
           FROM submissions
           WHERE user_id = ? AND problem_id = ? 
           ORDER BY submitted_at DESC LIMIT 20`, 
          [req.user.id, id]
        );
        return res.json(rows);
      } catch (err) {
        return res.status(500).json({ message: "Lỗi tải lịch sử" });
      }
  },
  
  // 5. CÁC HÀM ADMIN (QUẢN LÝ BÀI TẬP)
  getAllProblemTitles: async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT id, title, difficulty, is_public
            FROM problems 
            ORDER BY id DESC
        `);
        return res.json({ success: true, problems: rows });
    } catch (err) {
        console.error("❌ getAllProblemTitles Error:", err);
        return res.status(500).json({ success: false, message: "Lỗi tải danh sách bài tập" });
    }
  },

  createNewProblem: async (req, res) => {
    try {
        const { title, difficulty, contentHtml, sampleInput, sampleOutput, isPublic } = req.body;
        
        const [result] = await db.execute(
            `INSERT INTO problems (title, difficulty, content_html, sample_input, sample_output, is_public) VALUES (?, ?, ?, ?, ?, ?)`,
            [title, difficulty, contentHtml, sampleInput, sampleOutput, isPublic ? 1 : 0]
        );

        res.json({ success: true, message: "Tạo bài tập thành công!", problemId: result.insertId });
    } catch (err) {
        console.error("❌ createNewProblem Error:", err);
        res.status(500).json({ message: "Lỗi tạo bài tập" });
    }
  },
  
  createNewExercise: async (req, res) => {
    try {
        const { title, prompt, testcases, solution_description, algorithm_id } = req.body;
        
        const [result] = await db.execute(
            `INSERT INTO Exercises (title, prompt, testcases, solution_description, algorithm_id) VALUES (?, ?, ?, ?, ?)`,
            [title, prompt, JSON.stringify(testcases), solution_description, algorithm_id]
        );

        res.json({ success: true, message: "Tạo bài tập Luyện Tập thành công!", exerciseId: result.insertId });

    } catch (err) {
        console.error("❌ createNewExercise Error:", err);
        res.status(500).json({ message: "Lỗi tạo bài tập Luyện Tập" });
    }
  },

  updateProblem: async (req, res) => {
    try {
        const { id } = req.params;
        const { title, difficulty, contentHtml, sampleInput, sampleOutput, isPublic } = req.body;
        
        const [result] = await db.execute(
            `UPDATE problems SET title=?, difficulty=?, content_html=?, sample_input=?, sample_output=?, is_public=? WHERE id=?`,
            [title, difficulty, contentHtml, sampleInput, sampleOutput, isPublic ? 1 : 0, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Problem không tồn tại." });
        }
        
        res.json({ success: true, message: "Đã cập nhật Problem thành công." });
    } catch (err) {
        console.error("Update Problem Error:", err);
        return res.status(500).json({ message: "Lỗi cập nhật Problem" });
    }
  },

  deleteProblem: async (req, res) => {
    try {
        const { id } = req.params;
        
        // Xóa các dữ liệu liên quan trước (foreign keys)
        await db.execute("DELETE FROM contest_problems WHERE problem_id = ?", [id]);
        await db.execute("DELETE FROM submissions WHERE problem_id = ?", [id]);
        await db.execute("DELETE FROM test_cases WHERE problem_id = ?", [id]);

        const [result] = await db.execute("DELETE FROM problems WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Problem không tồn tại." });
        }
        
        res.json({ success: true, message: "Đã xóa Problem thành công." });
    } catch (err) {
        console.error("Delete Problem Error:", err);
        return res.status(500).json({ message: "Lỗi xóa Problem" });
    }
  },
  
};