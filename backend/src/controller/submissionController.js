const pool = require("../db");
const judge0 = require('../utils/judge0');

// Hàm chuẩn hóa chuỗi để so sánh output chính xác hơn (xóa khoảng trắng thừa, xuống dòng)
const normalize = (str) => {
  if (!str) return "";
  return str.trim().replace(/\r\n/g, '\n').split('\n').map(s => s.trim()).join('\n');
};

exports.submitCode = async (req, res) => {
  try {
    // ------------------------------------------------------------------
    // [QUAN TRỌNG] FIX LỖI CỘNG ĐIỂM NHẦM TÀI KHOẢN
    // Chỉ lấy userId từ token đã xác thực (req.user).
    // Tuyệt đối KHÔNG dùng (req.body.userId || 1) để tránh lỗi bảo mật.
    // ------------------------------------------------------------------
    const userId = req.user ? req.user.id : null;

    if (!userId) {
        return res.status(401).json({ 
            message: 'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.' 
        });
    }

    const { problemId, language, source, contestId } = req.body;

    // 1. Kiểm tra dữ liệu đầu vào
    if (!problemId || !language || !source) {
      return res.status(400).json({ message: 'Thiếu thông tin code hoặc bài tập' });
    }

    // 2. Lấy Input/Output mẫu từ database để chấm
    const [problems] = await pool.query('SELECT id, sample_input, sample_output FROM problems WHERE id = ?', [problemId]);
    if (problems.length === 0) return res.status(404).json({ message: 'Không tìm thấy bài tập' });
    
    const problem = problems[0];
    const languageId = judge0.LANGUAGE_MAPPING[language];

    if (!languageId) return res.status(400).json({ message: 'Ngôn ngữ chưa được hỗ trợ' });

    // 3. Gửi code sang Judge0
    const sampleInput = problem.sample_input || "";
    const expectedOutput = problem.sample_output || "";

    const runResult = await judge0.runSubmission(source, languageId, sampleInput);

    // 4. Phân tích kết quả trả về
    let status = "Unknown";
    let detail = ""; 

    if (runResult.status.id === 6) { // Compilation Error
        status = "Compilation Error";
        detail = runResult.compile_output;
    } 
    else if (runResult.status.id === 3) { // Accepted (Cần so sánh output)
        const actualOutput = runResult.stdout || "";
        if (normalize(actualOutput) === normalize(expectedOutput)) {
            status = "Accepted";
        } else {
            status = "Wrong Answer"; 
            detail = `Expected:\n${expectedOutput}\n\nActual:\n${actualOutput}`;
        }
    }
    else if (runResult.status.id === 5) { // Time Limit
        status = "Time Limit Exceeded";
    }
    else if (runResult.status.id >= 7 && runResult.status.id <= 12) { // Runtime Error
        status = "Runtime Error";
        detail = runResult.stderr;
    } 
    else {
        status = runResult.status.description; // Các lỗi khác
        detail = runResult.stderr || runResult.compile_output || "Unknown error";
    }

    // 5. Lưu lịch sử nộp bài (Submission History)
    let insertedId = null;
    try {
        const [result] = await pool.query(
          `INSERT INTO submissions (user_id, contest_id, problem_id, language_id, source_code, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
          [userId, contestId || null, problemId, languageId, source, status]
        );
        insertedId = result.insertId;

        // ------------------------------------------------------------------
        // 6. XỬ LÝ LOGIC TÍNH ĐIỂM CUỘC THI (NẾU ĐANG THI)
        // ------------------------------------------------------------------
        if (contestId && status === "Accepted") {
            
            // 6.1 Kiểm tra: User đã từng giải đúng bài này chưa?
            const [existing] = await pool.query(`
                SELECT id FROM submissions 
                WHERE user_id = ? AND contest_id = ? AND problem_id = ? AND status = 'Accepted' AND id != ?
            `, [userId, contestId, problemId, insertedId]);

            // Nếu chưa từng giải đúng (Đây là lần đầu tiên Accepted)
            if (existing.length === 0) {
                
                // A. Lấy điểm của bài toán
                const [contestProb] = await pool.query(`
                    SELECT points FROM contest_problems 
                    WHERE contest_id = ? AND problem_id = ?
                `, [contestId, problemId]);
                const pointsToAdd = contestProb.length > 0 ? contestProb[0].points : 100;

                // B. Tính Penalty (Thời gian + Phạt sai)
                // B1. Lấy thời gian bắt đầu cuộc thi
                const [contestInfo] = await pool.query(`SELECT start_time FROM contests WHERE id = ?`, [contestId]);
                
                let totalPenalty = 0;
                if (contestInfo.length > 0) {
                    const startTime = new Date(contestInfo[0].start_time);
                    const submitTime = new Date();
                    
                    // Thời gian làm bài (tính bằng phút)
                    const timeElapsed = Math.max(0, Math.floor((submitTime - startTime) / 60000));

                    // B2. Đếm số lần nộp sai TRƯỚC ĐÓ cho bài này
                    const [wrongSubs] = await pool.query(`
                        SELECT COUNT(*) as fail_count FROM submissions 
                        WHERE user_id = ? AND contest_id = ? AND problem_id = ? 
                        AND status != 'Accepted' AND id < ?
                    `, [userId, contestId, problemId, insertedId]);

                    const failCount = wrongSubs[0].fail_count || 0;
                    
                    // Công thức Penalty: Thời gian (phút) + (Số lần sai * 20 phút)
                    totalPenalty = timeElapsed + (failCount * 20);
                }

                // C. Cập nhật Điểm và Penalty vào Bảng Xếp Hạng
                await pool.query(`
                    UPDATE contest_participants 
                    SET score = score + ?, 
                        penalty = penalty + ?
                    WHERE contest_id = ? AND user_id = ?
                `, [pointsToAdd, totalPenalty, contestId, userId]);
            }
        }

    } catch (dbErr) {
        console.error("Lỗi Database:", dbErr.message); 
    }

    // 7. Trả kết quả về Frontend
    res.json({
      status: status,
      input: sampleInput,
      expected: expectedOutput,
      output: runResult.stdout,
      error_detail: detail,
      time: runResult.time,
      memory: runResult.memory
    });

  } catch (err) {
    console.error('Submit Error:', err);
    res.status(500).json({ 
        status: "System Error", 
        error_detail: "Lỗi hệ thống hoặc mất kết nối đến máy chấm (Judge0)." 
    });
  }
};