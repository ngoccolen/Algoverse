// backend/src/controller/algorithmController.js
const db = require('../db');

// --- 1. CONFIG IMPORT JUDGE0 AN TOÀN ---
// Đoạn này giúp server không bị crash nếu bạn chưa cấu hình xong Judge0
let judge0;
try {
  judge0 = require('../utils/judge0'); 
} catch (e) {
  console.warn("⚠️ Warning: judge0 util not found. Code execution might fail.");
}

// --- 2. HÀM TIỆN ÍCH ---
// Parse JSON an toàn để tránh lỗi cú pháp từ DB
const safeParseJSON = (data) => {
    if (!data) return []; 
    if (typeof data === 'object') return data; 
    try {
        return JSON.parse(data);
    } catch (e) {
        console.error("JSON Parse Error:", e.message);
        return []; 
    }
};

// --- 3. CÁC API CONTROLLER ---

// API 1: Lấy danh sách thuật toán (Dùng cho trang LearningPath)
exports.getAlgorithms = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    
    // Lấy danh sách và tính % hoàn thành dựa trên dữ liệu user_progress
    const sql = `
      SELECT 
        a.id, a.alg_key, a.name, a.category, a.difficulty, a.description, a.complexity,
        -- Tính điểm trung bình: (Điểm Trắc nghiệm + Điểm Code) / 2
        ROUND((COALESCE(up.questions_progress, 0) + COALESCE(up.exercises_progress, 0)) / 2) as progress,
        COALESCE(up.status, 'not_started') as status
      FROM algorithms a
      LEFT JOIN user_progress up ON a.id = up.algorithm_id AND up.user_id = ?
      ORDER BY a.id ASC
    `;

    const [rows] = await db.query(sql, [userId]);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("getAlgorithms Error:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// API 2: Lấy chi tiết bài học (Kèm logic KHÓA BÀI)
exports.getAlgorithmByKey = async (req, res) => {
  try {
    const algKey = req.params.algKey;
    const userId = req.user ? req.user.id : null;

    // 1. Lấy thông tin cơ bản của bài hiện tại
    const [rows] = await db.query('SELECT * FROM algorithms WHERE alg_key = ?', [algKey]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Algorithm not found' });
    const currentAlg = rows[0];

    // =========================================================
    // --- LOGIC KIỂM TRA KHÓA (LOCK) ---
    // =========================================================
    if (userId) {
        // Tìm bài học liền trước (Sắp xếp theo ID, lấy bài có ID nhỏ hơn gần nhất)
        const [prevAlgRows] = await db.query(
            'SELECT id, name FROM algorithms WHERE id < ? ORDER BY id DESC LIMIT 1', 
            [currentAlg.id]
        );

        // Nếu tồn tại bài trước đó (Tức là bài hiện tại không phải bài đầu tiên)
        if (prevAlgRows.length > 0) {
            const prevAlg = prevAlgRows[0];
            
            // Lấy tiến độ của bài trước đó
            const [prevProgressRows] = await db.query(
                'SELECT questions_progress, exercises_progress FROM user_progress WHERE user_id = ? AND algorithm_id = ?',
                [userId, prevAlg.id]
            );

            let isPrevCompleted = false;
            if (prevProgressRows.length > 0) {
                const pp = prevProgressRows[0];
                const prevScore = Math.round(( (pp.questions_progress || 0) + (pp.exercises_progress || 0) ) / 2);
                
                // ĐIỀU KIỆN MỞ KHÓA: Bài trước phải đạt 100%
                if (prevScore >= 100) isPrevCompleted = true;
            }

            // Nếu bài trước chưa xong -> Trả về trạng thái KHÓA
            if (!isPrevCompleted) {
                return res.json({
                    success: true,
                    data: {
                        isLocked: true,
                        name: currentAlg.name,
                        message: `Bạn cần hoàn thành bài "${prevAlg.name}" (100%) để mở khóa bài học này.`
                    }
                });
            }
        }
    }
    // =========================================================

    // 2. Nếu không bị khóa, tiếp tục lấy dữ liệu chi tiết
    
    // Lấy câu hỏi trắc nghiệm
    const [qs] = await db.query('SELECT id, question, options FROM questions WHERE algorithm_id = ?', [currentAlg.id]);
    const parsedQs = qs.map(q => ({ ...q, options: safeParseJSON(q.options) }));

    // Lấy bài tập code
    const [exs] = await db.query('SELECT id, prompt, testcases, solution_description FROM exercises WHERE algorithm_id = ?', [currentAlg.id]);
    
    // Lấy tiến độ hiện tại của bài này
    let userProgress = { theory_progress: 0, questions_progress: 0, exercises_progress: 0 };
    if (userId) {
      const [up] = await db.query(
        'SELECT theory_progress, questions_progress, exercises_progress FROM user_progress WHERE user_id = ? AND algorithm_id = ?', 
        [userId, currentAlg.id]
      );
      if (up.length) userProgress = up[0];
    }

    // Tính điểm tổng hợp
    const totalProgress = Math.round((userProgress.questions_progress + userProgress.exercises_progress) / 2);

    res.json({
      success: true,
      data: {
        ...currentAlg,
        isLocked: false, // Xác nhận không khóa
        theory: currentAlg.theory,
        complexity: {
            time: currentAlg.time_complexity || currentAlg.complexity || "N/A",
            space: currentAlg.space_complexity || "N/A"
        },
        Checklist: safeParseJSON(currentAlg.checklist),
        CodeExamples: safeParseJSON(currentAlg.code_examples), 
        Questions: parsedQs,
        Exercises: exs.map(e => ({...e, testcases: safeParseJSON(e.testcases)})), 
        
        progress: totalProgress,
        
        user_details: {
            theory: userProgress.theory_progress || 0,
            questions: userProgress.questions_progress || 0,
            exercises: userProgress.exercises_progress || 0,
            total: totalProgress
        }
      }
    });

  } catch (err) {
    console.error("getAlgorithmByKey Error:", err);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

// API 3: Nộp bài Trắc nghiệm
exports.submitQuestions = async (req, res) => {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({success: false, message: "Unauthorized"});
    const userId = req.user.id;
    
    // Lấy ID bài học
    let algorithmId = req.params.id;
    if (isNaN(algorithmId)) { 
        const [algo] = await db.query("SELECT id FROM algorithms WHERE alg_key = ?", [req.params.algKey || req.params.id]);
        if(!algo.length) return res.status(404).json({success: false, message: "Algo not found"});
        algorithmId = algo[0].id;
    }

    const userAnswers = req.body.answers || [];

    // Lấy đáp án đúng từ DB
    const [questions] = await db.query('SELECT id, answer, explanation FROM questions WHERE algorithm_id = ? ORDER BY id', [algorithmId]);
    
    let correctCount = 0;
    const details = []; 

    // Chấm điểm
    questions.forEach((q, index) => {
      // So sánh đáp án (chấp nhận cả string/number)
      const isCorrect = userAnswers[index] != null && userAnswers[index] == q.answer;
      if (isCorrect) correctCount++;

      details.push({
          questionId: q.id,
          userAnswer: userAnswers[index],
          correctAnswer: q.answer,
          explanation: q.explanation,
          isCorrect: isCorrect
      });
    });

    const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    
    // Lưu điểm trắc nghiệm vào DB
    await db.query(`
        INSERT INTO user_progress (user_id, algorithm_id, questions_progress) VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE questions_progress = ?
    `, [userId, algorithmId, score, score]);

    res.json({ 
        success: true, 
        correctCount, 
        total: questions.length, 
        scorePercent: score,
        details: details 
    });

  } catch (err) {
    console.error("submitQuestions Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// API 4: Nộp bài Code (Dùng Judge0)
exports.submitCode = async (req, res) => {
  // Kiểm tra Judge0 có sẵn sàng không
  if (!judge0) return res.status(500).json({success: false, message: "Judge0 module missing or not configured"});
  
  try {
    if (!req.user || !req.user.id) return res.status(401).json({success: false, message: "Unauthorized"});
    const { code, language_id } = req.body;
    const userId = req.user.id;

    // Lấy ID bài học
    let algorithmId = req.params.id;
    if (isNaN(algorithmId)) {
        const [algo] = await db.query("SELECT id FROM algorithms WHERE alg_key = ?", [req.params.algKey || req.params.id]);
        if(!algo.length) return res.status(404).json({success: false, message: "Algo not found"});
        algorithmId = algo[0].id;
    }

    // Lấy bài tập và testcases
    const [exs] = await db.query('SELECT * FROM exercises WHERE algorithm_id = ?', [algorithmId]);
    if (!exs.length) return res.json({ success: false, message: "No exercise found" });

    const ex = exs[0]; 
    const testcases = safeParseJSON(ex.testcases);

    let passed = 0;
    let results = [];

    // Gửi từng test case lên Judge0
    for (const t of testcases) {
      // Gọi hàm runSubmission từ judge0.js
      const run = await judge0.runSubmission(code, language_id || 54, t.input);
      
      const output = run.stdout ? run.stdout.trim() : "";
      const expected = t.output ? t.output.trim() : "";
      const error = run.stderr || run.compile_output || "";
      
      // Hàm chuẩn hóa chuỗi để so sánh (bỏ dòng trống, khoảng trắng thừa)
      const normalize = (str) => str.toString().replace(/\r\n/g, "\n").trim();
      const isCorrect = !error && normalize(output) === normalize(expected);
      
      results.push({ 
          input: t.input, 
          expected, 
          actual: output, 
          passed: isCorrect, 
          error: error 
      });

      if (isCorrect) passed++;
    }

    // Tính điểm code
    const score = testcases.length > 0 ? Math.round((passed / testcases.length) * 100) : 0;

    // Lưu điểm code vào DB
    await db.query(`
        INSERT INTO user_progress (user_id, algorithm_id, exercises_progress) VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE exercises_progress = ?
    `, [userId, algorithmId, score, score]);

    res.json({ success: true, passed, total: testcases.length, results, score });
  } catch (err) {
    console.error("submitCode Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};