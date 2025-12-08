const db = require('../db');

let judge0;
try {
  judge0 = require('../utils/judge0'); 
} catch (e) {
  console.warn("⚠️ Warning: judge0 util not found. Code execution might fail.");
}

const safeParseJSON = (data) => {
    if (!data) return []; 
    if (typeof data === 'object') return data; 
    try {
        return JSON.parse(data);
    } catch (e) {
        return []; 
    }
};



const ALGO_DRIVERS = {
    // 1. BUBBLE SORT
    'bubble-sort': {
        54: `int main() { std::vector<int> arr = {64, 34, 25, 12, 22, 11, 90}; bubbleSort(arr); for(int i : arr) std::cout << i << " "; return 0; }`,
        71: `if __name__ == "__main__":\n    arr = [64, 34, 25, 12, 22, 11, 90]\n    bubble_sort(arr)\n    print(*(arr))`,
        62: `public class Main { public static void main(String[] args) { int[] arr = {64, 34, 25, 12, 22, 11, 90}; Solution.bubbleSort(arr); for(int i : arr) System.out.print(i + " "); } }`
    },

    // 2. SELECTION SORT
    'selection-sort': {
        54: `int main() { std::vector<int> arr = {64, 25, 12, 22, 11}; selectionSort(arr); for(int i : arr) std::cout << i << " "; return 0; }`,
        71: `if __name__ == "__main__":\n    arr = [64, 25, 12, 22, 11]\n    selection_sort(arr)\n    print(*(arr))`,
        62: `public class Main { public static void main(String[] args) { int[] arr = {64, 25, 12, 22, 11}; Solution.selectionSort(arr); for(int i : arr) System.out.print(i + " "); } }`
    },

    // 3. INSERTION SORT
    'insertion-sort': {
        54: `
            int main() {
                std::vector<int> arr = {12, 11, 13, 5, 6};
                insertionSort(arr);
                for (int i=0; i < arr.size(); i++) std::cout << arr[i] << " ";
                return 0;
            }
        `,
        71: `
if __name__ == "__main__":
    arr = [12, 11, 13, 5, 6]
    insertion_sort(arr)
    print(*(arr))
        `,
        62: `
public class Main {
    public static void main(String[] args) {
        int[] arr = {12, 11, 13, 5, 6};
        Solution.insertionSort(arr);
        for(int i=0; i<arr.length; i++) System.out.print(arr[i] + " ");
    }
}
        `
    },

    // 4. LINEAR SEARCH
    'linear-search': {
        54: `
            int main() {
                std::vector<int> arr = {10, 50, 30, 70, 80};
                int x = 30;
                std::cout << linearSearch(arr, x);
                return 0;
            }
        `,
        71: `
if __name__ == "__main__":
    arr = [10, 50, 30, 70, 80]
    x = 30
    print(linear_search(arr, x))
        `,
        62: `
public class Main {
    public static void main(String[] args) {
        int[] arr = {10, 50, 30, 70, 80};
        int x = 30;
        System.out.print(Solution.linearSearch(arr, x));
    }
}
        `
    },

    'default': {}
};

const EXPECTED_OUTPUTS = {
    'bubble-sort': "11 12 22 25 34 64 90",
    'selection-sort': "11 12 22 25 64",
    'insertion-sort': "5 6 11 12 13",
    'linear-search': "2" 
};


// Lấy danh sách thuật toán & tiến độ
exports.getAlgorithms = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    
    const sql = `
      SELECT 
        a.id, a.alg_key, a.name, a.category, a.difficulty, a.description, a.complexity,
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

//Lấy chi tiết bài học
exports.getAlgorithmByKey = async (req, res) => {
  try {
    const algKey = req.params.algKey;
    const userId = req.user ? req.user.id : null;

    const [rows] = await db.query('SELECT * FROM algorithms WHERE alg_key = ?', [algKey]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Algorithm not found' });
    const currentAlg = rows[0];

    if (userId) {
        const [prevAlgRows] = await db.query(
            'SELECT id, name FROM algorithms WHERE id < ? AND category = ? ORDER BY id DESC LIMIT 1', 
            [currentAlg.id, currentAlg.category]
        );

        if (prevAlgRows.length > 0) {
            const prevAlg = prevAlgRows[0];
            const [prevProgressRows] = await db.query(
                'SELECT questions_progress, exercises_progress FROM user_progress WHERE user_id = ? AND algorithm_id = ?',
                [userId, prevAlg.id]
            );

            let isPrevCompleted = false;
            if (prevProgressRows.length > 0) {
                const pp = prevProgressRows[0];
                const prevScore = Math.round(( (pp.questions_progress || 0) + (pp.exercises_progress || 0) ) / 2);
                if (prevScore >= 100) isPrevCompleted = true;
            }

            if (!isPrevCompleted) {
                return res.json({
                    success: true,
                    data: {
                        isLocked: true,
                        name: currentAlg.name,
                        message: `Bạn cần hoàn thành bài "${prevAlg.name}" (trong cùng chủ đề) để mở khóa bài học này.`
                    }
                });
            }
        }
    }

    const [qs] = await db.query('SELECT id, question, options FROM questions WHERE algorithm_id = ?', [currentAlg.id]);
    const parsedQs = qs.map(q => ({ ...q, options: safeParseJSON(q.options) }));
    const [exs] = await db.query('SELECT id, prompt FROM exercises WHERE algorithm_id = ?', [currentAlg.id]);
    
    let userProgress = { theory_progress: 0, questions_progress: 0, exercises_progress: 0 };
    if (userId) {
      const [up] = await db.query(
        'SELECT theory_progress, questions_progress, exercises_progress FROM user_progress WHERE user_id = ? AND algorithm_id = ?', 
        [userId, currentAlg.id]
      );
      if (up.length) userProgress = up[0];
    }

    const totalProgress = Math.round((userProgress.questions_progress + userProgress.exercises_progress) / 2);

    res.json({
      success: true,
      data: {
        ...currentAlg,
        isLocked: false, 
        theory: currentAlg.theory,
        complexity: {
            time: currentAlg.time_complexity || currentAlg.complexity || "N/A",
            space: currentAlg.space_complexity || "N/A"
        },
        Questions: parsedQs,
        Exercises: exs,
        progress: totalProgress,
        user_details: {
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

//Nộp bài Trắc nghiệm
exports.submitQuestions = async (req, res) => {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({success: false, message: "Unauthorized"});
    const userId = req.user.id;
    
    let algorithmId = req.params.id;
    if (isNaN(algorithmId)) { 
        const [algo] = await db.query("SELECT id FROM algorithms WHERE alg_key = ?", [req.params.algKey || req.params.id]);
        if(!algo.length) return res.status(404).json({success: false, message: "Algo not found"});
        algorithmId = algo[0].id;
    }

    const userAnswers = req.body.answers || [];
    const [questions] = await db.query('SELECT id, answer, explanation FROM questions WHERE algorithm_id = ? ORDER BY id', [algorithmId]);
    
    let correctCount = 0;
    const details = []; 

    questions.forEach((q, index) => {
      const isCorrect = userAnswers[index] != null && String(userAnswers[index]) === String(q.answer);
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
    
    await db.query(`
        INSERT INTO user_progress (user_id, algorithm_id, questions_progress) VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE questions_progress = ?
    `, [userId, algorithmId, score, score]);

    res.json({ success: true, correctCount, total: questions.length, scorePercent: score, details: details });

  } catch (err) {
    console.error("submitQuestions Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Nộp bài Code
exports.submitCode = async (req, res) => {
  if (!judge0) return res.status(500).json({success: false, message: "Judge0 chưa được cấu hình."});
  
  try {
    if (!req.user || !req.user.id) return res.status(401).json({success: false, message: "Vui lòng đăng nhập."});
    const userId = req.user.id;
    
    const { code, language_id } = req.body; 
    let algKey = req.params.algKey || req.params.id;
    let algorithmId = null;

    if (!isNaN(algKey)) { 
         algorithmId = algKey;
         const [algo] = await db.query("SELECT alg_key FROM algorithms WHERE id = ?", [algorithmId]);
         if(algo.length) algKey = algo[0].alg_key;
    } else {
         const [algo] = await db.query("SELECT id FROM algorithms WHERE alg_key = ?", [algKey]);
         if(algo.length) algorithmId = algo[0].id;
    }

    if (!algorithmId) return res.status(404).json({success: false, message: "Không tìm thấy bài học."});

    const drivers = ALGO_DRIVERS[algKey] || ALGO_DRIVERS['default'];
    const driverCode = drivers[language_id]; 
    const expectedOutput = EXPECTED_OUTPUTS[algKey] || "";

    if (!driverCode) {
         return res.json({
             success: false, 
             status: "error", 
             message: "Ngôn ngữ này chưa được hỗ trợ kiểm tra tự động cho bài này."
         });
    }

    const fullSourceCode = code + "\n" + driverCode;

    const run = await judge0.runSubmission(fullSourceCode, language_id || 54, ""); 

    let status = "success";
    let message = "Chúc mừng! Code chạy chính xác.";
    let details = run.compile_output || run.stderr || ""; 

    if (details) {
        status = run.compile_output ? "syntax_error" : "runtime_error";
        message = run.compile_output ? "Lỗi cú pháp (Syntax Error)." : "Lỗi khi chạy (Runtime Error).";
    } 
    else {
        const actualOutput = run.stdout ? run.stdout.trim() : "";
        const cleanActual = actualOutput.replace(/\s+/g, ' ').trim();
        const cleanExpected = expectedOutput.replace(/\s+/g, ' ').trim();

        if (cleanActual !== cleanExpected) {
            status = "wrong_answer";
            message = "Kết quả sai logic. Thuật toán chưa sắp xếp đúng.";
            details = `Expected Output: ${cleanExpected}\nActual Output:   ${cleanActual}`;
        }
    }

    const score = status === "success" ? 100 : 0;
    if (status === "success") {
        await db.query(`
            INSERT INTO user_progress (user_id, algorithm_id, exercises_progress, updated_at) 
            VALUES (?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE exercises_progress = VALUES(exercises_progress), updated_at = NOW()
        `, [userId, algorithmId, score]);
    }

    res.json({ 
        success: status === "success", 
        status: status, 
        score: score,
        message: message,
        details: details 
    });

  } catch (err) {
    console.error("submitCode Error:", err);
    res.status(500).json({ success: false, message: "Lỗi server: " + err.message });
  }
};