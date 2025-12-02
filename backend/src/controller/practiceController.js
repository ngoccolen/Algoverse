// src/controller/practiceController.js
const db = require("../db"); 
const { runSubmission, LANGUAGE_MAPPING } = require("../utils/judge0");

// Hàm chuẩn hóa chuỗi (xóa khoảng trắng thừa, đưa về \n để so sánh chính xác)
const normalize = (str) => {
  if (str === null || str === undefined) return "";
  return String(str).trim().replace(/\r\n/g, '\n');
};

// =============================================
// 1. LẤY DANH SÁCH BÀI TẬP
// =============================================
exports.getAllProblems = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT id, title, difficulty, IFNULL(category, 'Algorithm') as category, total_submissions, solved 
      FROM problems 
      ORDER BY id ASC
    `);
    return res.json(rows);
  } catch (err) {
    console.error("❌ getAllProblems Error:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// =============================================
// 2. LẤY CHI TIẾT BÀI TẬP
// =============================================
exports.getProblemById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // [QUAN TRỌNG]: Lấy đủ sample_input và sample_output
    const [problemRows] = await db.execute(`
      SELECT id, title, difficulty, content_html, category, sample_input, sample_output, total_submissions, solved 
      FROM problems WHERE id = ?`, [id]);

    if (problemRows.length === 0) return res.status(404).json({ message: "Bài tập không tồn tại" });
    const problem = problemRows[0];

    // Lấy Test cases CÔNG KHAI từ bảng test_cases (nếu có)
    let publicTests = [];
    try {
        const [tests] = await db.execute(`
            SELECT input, output FROM test_cases 
            WHERE problem_id = ? AND is_hidden = 0`, [id]);
        publicTests = tests;
    } catch (e) {}

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
        solved: problem.solved
    });

  } catch (err) {
    console.error("❌ getProblemById Error:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// =============================================
// 3. NỘP BÀI / CHẤM ĐIỂM (Đã fix lỗi crash + sai tên cột)
// =============================================
exports.submitSolution = async (req, res) => {
  try {
    const { id } = req.params; // ID bài tập
    const { language, source, runOnly } = req.body;
    
    // [FIX 1]: Đảm bảo userId luôn có giá trị (Fallback về 1 nếu lỗi Auth để tránh crash)
    const userId = req.user ? req.user.id : 1;

    // 1. Validate ngôn ngữ
    const languageId = LANGUAGE_MAPPING[language];
    if (!languageId) return res.status(400).json({ message: `Ngôn ngữ '${language}' chưa được hỗ trợ.` });

    // 2. Lấy Test Cases (Ưu tiên bảng test_cases, fallback sang sample_input)
    let testCases = [];
    try {
        let query = `SELECT input, output, is_hidden FROM test_cases WHERE problem_id = ?`;
        if (runOnly) query += ` AND is_hidden = 0`; 
        const [rows] = await db.execute(query, [id]);
        testCases = rows;
    } catch (e) {}

    // Fallback: Dùng sample_input từ bảng problems nếu chưa có test_cases
    if (testCases.length === 0) {
        const [prob] = await db.execute(`SELECT sample_input, sample_output FROM problems WHERE id = ?`, [id]);
        if (prob.length > 0 && prob[0].sample_input) {
            testCases.push({
                input: prob[0].sample_input,
                output: prob[0].sample_output,
                is_hidden: 0
            });
        }
    }

    if (testCases.length === 0) return res.status(400).json({ message: "Bài tập này chưa có dữ liệu test." });

    // 3. Gửi Judge0 chấm song song
    const judgePromises = testCases.map(tc => runSubmission(source, languageId, tc.input));
    const judgeResults = await Promise.all(judgePromises);

    // 4. Tổng hợp kết quả
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
        const isCorrect = (actualOutput === expectedOutput) && (!output.stderr) && (output.status.id === 3);

        if (isCorrect) passed++;
        else if (finalStatus === "Accepted") {
            finalStatus = output.status.id === 3 ? "Wrong Answer" : output.status.description;
        }

        // [FIX 2]: Xử lý Time/Memory an toàn, tránh NaN gây lỗi SQL
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

    // 5. Lưu vào DB (Chỉ khi nộp thật)
    if (!runOnly) {
        try {
            // [FIX 3]: Dùng cột 'exercise_id' (theo database của bạn) thay vì problem_id
            // [SỬA LẠI ĐOẠN INSERT]
await db.execute(
    `INSERT INTO submissions 
    (user_id, problem_id, language_id, source_code, status, passed_cases, total_cases, time_taken, memory_used, submitted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`, // Lưu ý: Bỏ cột exercise_id, thay bằng problem_id
    [userId, id, languageId, source, finalStatus, passed, testCases.length, maxTime, maxMemory]
);

            // Update thống kê bài tập
            await db.execute(`UPDATE problems SET total_submissions = total_submissions + 1 WHERE id = ?`, [id]);

            if (finalStatus === "Accepted") {
                // Kiểm tra xem user đã giải được bài này trước đây chưa (Dùng exercise_id)
                const [existing] = await db.execute(
                    `SELECT id FROM submissions WHERE user_id = ? AND exercise_id = ? AND status = 'Accepted' LIMIT 1`,
                    [userId, id]
                );
                if (existing.length === 0) { 
                     await db.execute(`UPDATE problems SET solved = solved + 1 WHERE id = ?`, [id]);
                }
            }
        } catch (dbErr) {
            console.error("❌ LỖI SQL KHI SUBMIT:", dbErr.message);
            // Không return lỗi ở đây để người dùng vẫn xem được kết quả chấm (dù lưu DB thất bại)
        }
    }

    // 6. Trả về Frontend
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
};

// =============================================
// 4. LỊCH SỬ NỘP BÀI
// =============================================
exports.getSubmissionHistory = async (req, res) => {
    try {
      const { id } = req.params;
      
      // [FIX 4]: Dùng cột 'exercise_id' trong WHERE
      const [rows] = await db.execute(
        `SELECT id, status, passed_cases, total_cases, time_taken, memory_used, submitted_at
         FROM submissions
         WHERE user_id = ? AND exercise_id = ?
         ORDER BY submitted_at DESC LIMIT 20`, 
        [req.user.id, id]
      );
      return res.json(rows);
    } catch (err) {
      console.error("History Error:", err);
      return res.status(500).json({ message: "Lỗi tải lịch sử" });
    }
};