const db = require("../db");

exports.getQuestionsByAlgorithm = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM Questions WHERE algorithm_id = ?",
      [req.params.id]
    );

    res.json({
      success: true,
      questions: rows.map(q => ({
        id: q.id,
        question: q.question,
        options: JSON.parse(q.options),
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.submitQuestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const algorithmId = req.params.id;
    const userAnswers = req.body.answers;

    const [questions] = await db.query(
      "SELECT * FROM Questions WHERE algorithm_id = ?",
      [algorithmId]
    );

    let correct = 0;
    let results = [];

    questions.forEach((q, index) => {
      const correctAnswer = q.answer;

      results.push({
        question: q.question,
        correct,
        userAnswer: userAnswers[index],
        isCorrect: userAnswers[index] == correctAnswer
      });

      if (userAnswers[index] == correctAnswer) correct++;
    });

    const scorePercent = Math.round((correct / questions.length) * 100);

    await db.query(
      `INSERT INTO user_progress (user_id, algorithm_id, questions_progress, updated_at)
       VALUES (?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         questions_progress = GREATEST(COALESCE(questions_progress, 0), VALUES(questions_progress)),
         updated_at = NOW()`,
      [userId, algorithmId, scorePercent]
    );

    res.json({
      success: true,
      correct,
      total: questions.length,
      scorePercent,
      results
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
