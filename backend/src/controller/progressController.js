const db = require('../db');

const clampProgress = (value) => Math.min(100, Math.max(0, Number(value) || 0));

exports.getProgress = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT algorithm_id, theory_progress, questions_progress, exercises_progress,
              last_accessed, status
       FROM user_progress WHERE user_id = ? AND algorithm_id = ? LIMIT 1`,
      [req.user.id, req.params.algorithm_id]
    );

    const progress = rows[0] || {
      algorithm_id: Number(req.params.algorithm_id),
      theory_progress: 0,
      questions_progress: 0,
      exercises_progress: 0,
      status: 'not_started'
    };
    progress.total_progress = Math.round(
      (Number(progress.theory_progress || 0) +
        Number(progress.questions_progress || 0) +
        Number(progress.exercises_progress || 0)) / 3
    );
    res.json({ success: true, data: progress });
  } catch (err) {
    console.error('getProgress error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { algorithmId } = req.body;
    const theoryProgress = clampProgress(req.body.theory_progress);
    const questionsProgress = clampProgress(req.body.questions_progress);
    const exercisesProgress = clampProgress(req.body.exercises_progress);

    if (!algorithmId) return res.status(400).json({ success: false, message: 'algorithmId required' });

    await db.query(
      `INSERT INTO user_progress (user_id, algorithm_id, theory_progress, questions_progress, exercises_progress, last_accessed)
       VALUES (?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         theory_progress = LEAST(100, GREATEST(COALESCE(theory_progress, 0), VALUES(theory_progress))),
         questions_progress = LEAST(100, GREATEST(COALESCE(questions_progress, 0), VALUES(questions_progress))),
         exercises_progress = LEAST(100, GREATEST(COALESCE(exercises_progress, 0), VALUES(exercises_progress))),
         last_accessed = NOW()`,
      [userId, algorithmId, theoryProgress, questionsProgress, exercisesProgress]
    );

    res.json({
      success: true,
      message: 'Progress updated',
      data: {
        algorithmId: Number(algorithmId),
        theory_progress: theoryProgress,
        questions_progress: questionsProgress,
        exercises_progress: exercisesProgress
      }
    });
  } catch (err) {
    console.error('updateProgress error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
