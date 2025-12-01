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
      `UPDATE UserProgress 
       SET questions_progress = GREATEST(questions_progress, ?), 
           total_progress = (theory_progress + questions_progress + exercises_progress)/3 
       WHERE user_id = ? AND algorithm_id = ?`,
      [scorePercent, userId, algorithmId]
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
