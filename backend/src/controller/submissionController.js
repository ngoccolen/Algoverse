const pool = require("../db");
const judge0 = require('../utils/judge0');

// Hàm chuẩn hóa chuỗi (xóa khoảng trắng thừa)
const normalize = (str) => {
  if (!str) return "";
  return str.trim().replace(/\r\n/g, '\n').split('\n').map(s => s.trim()).join('\n');
};

exports.submitCode = async (req, res) => {
  try {
    // Lấy User ID (Nếu chưa đăng nhập thì dùng tạm ID 1 để test, tránh lỗi 500)
    const userId = req.user ? req.user.id : (req.body.userId || 1); 
    
    const { problemId, language, source, contestId } = req.body;

    // 1. Kiểm tra đầu vào
    if (!problemId || !language || !source) {
      return res.status(400).json({ message: 'Thiếu thông tin đầu vào' });
    }

    // 2. Lấy Input/Output mẫu từ DB
    const [problems] = await pool.query('SELECT id, sample_input, sample_output FROM problems WHERE id = ?', [problemId]);
    if (problems.length === 0) return res.status(404).json({ message: 'Không tìm thấy bài tập' });
    
    const problem = problems[0];
    const languageId = judge0.LANGUAGE_MAPPING[language];

    if (!languageId) return res.status(400).json({ message: 'Ngôn ngữ không hỗ trợ' });

    // 3. Gửi sang Judge0 chấm
    const sampleInput = problem.sample_input || "";
    const expectedOutput = problem.sample_output || "";

    const runResult = await judge0.runSubmission(source, languageId, sampleInput);

    // 4. Xử lý kết quả trả về
    let status = "Unknown";
    let detail = ""; // Biến này chứa chi tiết lỗi (nếu có)

    // ID 6: Compilation Error (Lỗi cú pháp)
    if (runResult.status.id === 6) { 
        status = "Compilation Error";
        detail = runResult.compile_output; // Lấy thông báo lỗi của trình biên dịch
    } 
    // ID 3: Accepted (Nhưng cần so sánh output lần nữa cho chắc)
    else if (runResult.status.id === 3) {
        const actualOutput = runResult.stdout || "";
        if (normalize(actualOutput) === normalize(expectedOutput)) {
            status = "Accepted";
        } else {
            status = "Wrong Answer"; // WA
            detail = `Expected: ${expectedOutput}\nActual: ${actualOutput}`;
        }
    }
    // ID 5: Time Limit Exceeded
    else if (runResult.status.id === 5) {
        status = "Time Limit Exceeded";
    }
    // ID 7-12: Runtime Error (Lỗi chạy)
    else if (runResult.status.id >= 7 && runResult.status.id <= 12) {
        status = "Runtime Error";
        detail = runResult.stderr; // Lấy lỗi stderr (ví dụ: chia cho 0, null pointer)
    } 
    // Các lỗi khác
    else {
        status = runResult.status.description;
        detail = runResult.stderr || runResult.compile_output || "Unknown error";
    }

    // 5. Lưu DB (Nếu muốn lưu lịch sử)
    try {
        await pool.query(
          `INSERT INTO submissions (user_id, contest_id, problem_id, language_id, source_code, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
          [userId, contestId || null, problemId, languageId, source, status]
        );
    } catch (dbErr) {
        console.error("Lỗi lưu submission:", dbErr.message); 
        // Không return lỗi ở đây để người dùng vẫn thấy kết quả chấm
    }

    // 6. Trả kết quả về Frontend
    res.json({
      status: status,
      input: sampleInput,
      expected: expectedOutput,
      output: runResult.stdout,
      error_detail: detail, // Frontend sẽ hiển thị cái này
      time: runResult.time,
      memory: runResult.memory
    });

  } catch (err) {
    console.error('Submit Error:', err);
    // Trả về 200 kèm thông báo lỗi thay vì 500 để Frontend hiển thị đẹp
    res.json({ 
        status: "System Error", 
        error_detail: "Lỗi hệ thống hoặc kết nối Judge0 thất bại." 
    });
  }
};