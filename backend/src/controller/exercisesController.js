const db = require("../db");

const judge0 = require("../utils/judge0");

const createNewExerciseInDb = async ({ title, prompt, testcases, solution_description, algorithm_id }) => {
    const [result] = await db.query(
        "INSERT INTO Exercises (title, prompt, testcases, solution_description, algorithm_id) VALUES (?, ?, ?, ?, ?)",
        [title, prompt, JSON.stringify(testcases), solution_description, algorithm_id]
    );
    return result.insertId;
};
// ------------------------------------------------------------------

exports.getExerciseByAlgorithm = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM Exercises WHERE algorithm_id = ?",
      [req.params.id]
    );

    if (rows.length === 0)
      return res.json({ success: false, message: "No exercises found" });

    const ex = rows[0];

    res.json({
      success: true,
      exercise: {
        id: ex.id,
        prompt: ex.prompt,
        testcases: JSON.parse(ex.testcases),
        solution_description: ex.solution_description
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.submitExercise = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;
    const algorithmId = req.params.id;

    const [rows] = await db.query(
      "SELECT * FROM Exercises WHERE algorithm_id = ?",
      [algorithmId]
    );

    if (!rows.length) return res.json({ success: false, message: "No exercise found" });

    const ex = rows[0];
    const tests = JSON.parse(ex.testcases);

    let passed = 0;
    let results = [];

    for (const t of tests) {
      const run = await judge0.runCode(71, code, t.input); 
      const ok = run.stdout?.trim() === t.output.trim();

      results.push({
        input: t.input,
        expected: t.output,
        got: run.stdout,
        passed: ok,
      });

      if (ok) passed++;
    }

    const percent = Math.round((passed / tests.length) * 100);

    if (percent === 100) {
      await db.query(
        "UPDATE UserProgress SET exercises_progress = 100 WHERE user_id=? AND algorithm_id=?",
        [userId, algorithmId]
      );
    }

    res.json({
      success: true,
      passed,
      total: tests.length,
      percent,
      results
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


exports.createExercise = async (req, res) => {
    try {
        const { title, prompt, testcases, solution_description, algorithm_id } = req.body;

        if (!title || !prompt || !testcases || !algorithm_id) {
            return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc (title, prompt, testcases, algorithm_id)" });
        }
        
        if (!Array.isArray(testcases) || testcases.length === 0) {
            return res.status(400).json({ success: false, message: "Testcases phải là một mảng không rỗng." });
        }

        const newId = await createNewExerciseInDb({ title, prompt, testcases, solution_description, algorithm_id });

        res.json({ success: true, message: "Tạo bài tập luyện tập thành công!", exerciseId: newId });

    } catch (err) {
        console.error("Create Exercise Error:", err);
        res.status(500).json({ success: false, error: "Lỗi Server khi tạo bài tập" });
    }
};