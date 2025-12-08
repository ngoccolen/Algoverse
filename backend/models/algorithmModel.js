const db = require('../src/db'); //

const AlgorithmModel = {
  async getAllWithProgress(userId) {
    const sql = `
      SELECT a.*, 
             COALESCE(up.progress_percent, 0) as user_progress,
             COALESCE(up.status, 'not_started') as user_status
      FROM algorithms a
      LEFT JOIN user_progress up ON a.id = up.alg_id AND up.user_id = ?
    `;
    const [rows] = await db.query(sql, [userId]);
    return rows;
  },

  async updateProgress(userId, algKey, percent) {
    const [alg] = await db.query("SELECT id FROM algorithms WHERE alg_key = ?", [algKey]);
    if (alg.length === 0) throw new Error("Algorithm not found");
    const algId = alg[0].id;
    const status = percent >= 100 ? 'completed' : 'in_progress';
    const sql = `
      INSERT INTO user_progress (user_id, alg_id, progress_percent, status)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE progress_percent = ?, status = ?
    `;
    await db.query(sql, [userId, algId, percent, status, percent, status]);
    return { success: true };
  }
};

module.exports = AlgorithmModel;