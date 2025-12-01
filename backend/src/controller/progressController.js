// controllers/progressController.js
const db = require("../db");


exports.updateProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { algorithmId, theory_progress = 0, questions_progress = 0, exercises_progress = 0 } = req.body;

    if (!algorithmId) return res.status(400).json({ message: 'algorithmId required' });

    // Upsert into user_progress (your table has UNIQUE(user_id, algorithm_id))
    await pool.query(
      `INSERT INTO user_progress (user_id, algorithm_id, theory_progress, questions_progress, exercises_progress, last_accessed)
       VALUES (?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         theory_progress = LEAST(100, GREATEST(theory_progress, VALUES(theory_progress))),
         questions_progress = LEAST(100, GREATEST(questions_progress, VALUES(questions_progress))),
         exercises_progress = LEAST(100, GREATEST(exercises_progress, VALUES(exercises_progress))),
         last_accessed = NOW()`,
      [userId, algorithmId, theory_progress, questions_progress, exercises_progress]
    );

    res.json({ message: 'Progress updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
