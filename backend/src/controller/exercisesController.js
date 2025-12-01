const db = require("../db");

const judge0 = require("../utils/judge0");

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
      const run = await judge0.runCode(71, code, t.input); // 71 = python3
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
