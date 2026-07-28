const axios = require('axios');
const db = require('../db');
const {
  catalogByKey,
  normalizeProfile,
  buildDeterministicSelection,
  createFallbackPath
} = require('../data/learningPathCatalog');

const MAX_PROFILE_JSON = 4000;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const parseJsonResponse = (text) => {
  if (!text) return null;
  const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start < 0 || end <= start) return null;
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch (nestedError) {
      return null;
    }
  }
};

const normalizeSurvey = (body = {}) => {
  const profile = normalizeProfile(body);
  if (JSON.stringify(profile).length > MAX_PROFILE_JSON) {
    throw new Error('SURVEY_TOO_LARGE');
  }
  return profile;
};

const enrichWithAI = async (profile, algorithms, fallback) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fallback;

  const allowedKeys = algorithms.map((algorithm) => algorithm.algKey);
  const prompt = `
Bạn là cố vấn học thuật của Algoverse. Hãy cá nhân hóa lộ trình dưới đây bằng tiếng Việt.
Chỉ được dùng các algKey trong danh sách cho trước, không được thêm hoặc đổi algKey.
Trả về JSON thuần, không markdown, theo schema:
{"title":"string","summary":"string","encouragement":"string","steps":[{"algKey":"string","reason":"string","checkpoint":"string","estimatedMinutes":number}]}

Hồ sơ: ${JSON.stringify(profile)}
Các chặng hợp lệ: ${JSON.stringify(algorithms)}
`;

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${apiKey}`,
      {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.45, maxOutputTokens: 1800 },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
        ]
      },
      { headers: { 'Content-Type': 'application/json' }, timeout: 20000 }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = parseJsonResponse(text);
    if (!parsed || !Array.isArray(parsed.steps)) return fallback;

    const validSteps = parsed.steps
      .filter((step) => allowedKeys.includes(step.algKey))
      .map((step) => ({
        algKey: step.algKey,
        reason: String(step.reason || '').slice(0, 500) || 'Chặng học được chọn để xây dựng nền tảng tiếp theo.',
        checkpoint: String(step.checkpoint || '').slice(0, 300) || 'Hoàn thành lý thuyết và bài kiểm tra.',
        estimatedMinutes: Number(step.estimatedMinutes) || catalogByKey.get(step.algKey).estimatedMinutes
      }));

    const stepMap = new Map(validSteps.map((step) => [step.algKey, step]));
    const orderedSteps = allowedKeys.map((key) => stepMap.get(key)).filter(Boolean);
    if (orderedSteps.length !== allowedKeys.length) return fallback;

    return {
      title: String(parsed.title || fallback.title).slice(0, 180),
      summary: String(parsed.summary || fallback.summary).slice(0, 500),
      encouragement: String(parsed.encouragement || fallback.encouragement).slice(0, 500),
      generatedBy: 'rules+ai',
      steps: orderedSteps
    };
  } catch (error) {
    console.warn('Learning path AI enrichment failed:', error.response?.status || error.message);
    return fallback;
  }
};

const getAlgorithmRows = async (keys) => {
  if (!keys.length) return [];
  const placeholders = keys.map(() => '?').join(',');
  const [rows] = await db.query(
    `SELECT id, alg_key, name, category, difficulty, description, complexity, time_complexity, space_complexity
     FROM algorithms WHERE alg_key IN (${placeholders})`,
    keys
  );
  const byKey = new Map(rows.map((row) => [row.alg_key, row]));
  return keys.map((key) => byKey.get(key)).filter(Boolean);
};

const persistProfile = async (userId, profile) => {
  await db.query(
    `INSERT INTO learning_profiles (user_id, survey_json, updated_at)
     VALUES (?, ?, NOW())
     ON DUPLICATE KEY UPDATE survey_json = VALUES(survey_json), updated_at = NOW()`,
    [userId, JSON.stringify(profile)]
  );
};

const persistPath = async (userId, profile, pathData, algorithmRows) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('UPDATE learning_paths SET status = ? WHERE user_id = ? AND status = ?', ['archived', userId, 'active']);
    const [pathResult] = await connection.query(
      `INSERT INTO learning_paths (user_id, title, summary, encouragement, goal, generated_by, status, generated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [userId, pathData.title, pathData.summary, pathData.encouragement, profile.goal, pathData.generatedBy]
    );

    const algorithmByKey = new Map(algorithmRows.map((row) => [row.alg_key, row]));
    for (let index = 0; index < pathData.steps.length; index += 1) {
      const step = pathData.steps[index];
      const algorithm = algorithmByKey.get(step.algKey);
      if (!algorithm) continue;
      await connection.query(
        `INSERT INTO learning_path_steps
          (path_id, algorithm_id, position, reason, checkpoint, estimated_minutes, status)
         VALUES (?, ?, ?, ?, ?, ?, 'locked')`,
        [pathResult.insertId, algorithm.id, index + 1, step.reason, step.checkpoint, step.estimatedMinutes]
      );
    }
    await connection.commit();
    return pathResult.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const serializeStoredPath = (pathRow, stepRows) => ({
  id: pathRow.id,
  title: pathRow.title,
  summary: pathRow.summary,
  encouragement: pathRow.encouragement || 'Hãy duy trì nhịp học đều đặn và hoàn thành từng chặng.',
  generatedBy: pathRow.generated_by,
  status: pathRow.status,
  generatedAt: pathRow.generated_at,
  steps: stepRows.map((step) => ({
    id: step.step_id,
    position: step.position,
    algKey: step.alg_key,
    name: step.name,
    category: step.category,
    difficulty: step.difficulty,
    description: step.description,
    complexity: step.complexity || step.time_complexity,
    reason: step.reason,
    checkpoint: step.checkpoint,
    estimatedMinutes: step.estimated_minutes,
    progress: Math.round((Number(step.questions_progress || 0) + Number(step.exercises_progress || 0)) / 2),
    status: step.status
  }))
});

const getStoredPath = async (userId) => {
  const [paths] = await db.query(
    `SELECT id, title, summary, encouragement, generated_by, status, generated_at
     FROM learning_paths WHERE user_id = ? ORDER BY id DESC LIMIT 1`,
    [userId]
  );
  if (!paths.length) return null;

  const [steps] = await db.query(
    `SELECT lps.id AS step_id, lps.position, lps.reason, lps.checkpoint,
            lps.estimated_minutes, lps.status, a.alg_key, a.name, a.category,
            a.difficulty, a.description, a.complexity, a.time_complexity,
            COALESCE(up.questions_progress, 0) AS questions_progress,
            COALESCE(up.exercises_progress, 0) AS exercises_progress
     FROM learning_path_steps lps
     JOIN algorithms a ON a.id = lps.algorithm_id
     LEFT JOIN user_progress up ON up.algorithm_id = a.id AND up.user_id = ?
     WHERE lps.path_id = ? ORDER BY lps.position ASC`,
    [userId, paths[0].id]
  );

  return serializeStoredPath(paths[0], steps);
};

const generatePath = async (req, res) => {
  try {
    const profile = normalizeSurvey(req.body?.profile || req.body || {});
    const selection = buildDeterministicSelection(profile);
    const algorithmRows = await getAlgorithmRows(selection.map((item) => item.algKey));
    const algorithmMap = new Map(algorithmRows.map((row) => [row.alg_key, row]));
    const selectedRows = selection.filter((item) => algorithmMap.has(item.algKey));

    if (!selectedRows.length) {
      return res.status(422).json({ success: false, code: 'NO_ALGORITHMS', message: 'Chưa có dữ liệu thuật toán để tạo lộ trình.' });
    }

    const fallback = createFallbackPath(profile, selectedRows);
    const pathData = await enrichWithAI(profile, selectedRows, fallback);
    const orderedRows = pathData.steps.map((step) => algorithmMap.get(step.algKey)).filter(Boolean);

    let savedPathId = null;
    if (req.user?.id) {
      await persistProfile(req.user.id, profile);
      savedPathId = await persistPath(req.user.id, profile, pathData, orderedRows);
    }

    res.json({
      success: true,
      data: {
        id: savedPathId || `guest-${Date.now()}`,
        ...pathData,
        steps: pathData.steps.map((step, index) => {
          const algorithm = algorithmMap.get(step.algKey);
          return {
            ...step,
            position: index + 1,
            name: algorithm?.name || step.algKey,
            category: algorithm?.category || '',
            difficulty: algorithm?.difficulty || 'Easy',
            description: algorithm?.description || '',
            complexity: algorithm?.complexity || algorithm?.time_complexity || 'N/A',
            progress: 0,
            status: index === 0 ? 'available' : 'locked'
          };
        })
      }
    });
  } catch (error) {
    if (error.message === 'SURVEY_TOO_LARGE') {
      return res.status(400).json({ success: false, code: 'SURVEY_TOO_LARGE', message: 'Khảo sát có quá nhiều dữ liệu.' });
    }
    console.error('generatePath error:', error);
    res.status(500).json({ success: false, code: 'LEARNING_PATH_ERROR', message: 'Không thể tạo lộ trình lúc này.' });
  }
};

exports.saveSurvey = async (req, res) => {
  try {
    const profile = normalizeSurvey(req.body?.profile || req.body || {});
    if (req.user?.id) await persistProfile(req.user.id, profile);
    res.json({ success: true, data: profile, persisted: Boolean(req.user?.id) });
  } catch (error) {
    const status = error.message === 'SURVEY_TOO_LARGE' ? 400 : 500;
    res.status(status).json({ success: false, code: error.message === 'SURVEY_TOO_LARGE' ? error.message : 'SURVEY_ERROR', message: 'Không thể lưu khảo sát.' });
  }
};

exports.generate = generatePath;

exports.getMine = async (req, res) => {
  try {
    const path = await getStoredPath(req.user.id);
    if (!path) return res.status(404).json({ success: false, code: 'PATH_NOT_FOUND', message: 'Bạn chưa có lộ trình cá nhân.' });
    res.json({ success: true, data: path });
  } catch (error) {
    console.error('get learning path error:', error);
    res.status(500).json({ success: false, code: 'LEARNING_PATH_ERROR', message: 'Không thể tải lộ trình.' });
  }
};

exports.updateStep = async (req, res) => {
  try {
    const status = ['locked', 'available', 'in_progress', 'completed', 'skipped'].includes(req.body?.status)
      ? req.body.status
      : null;
    if (!status) return res.status(400).json({ success: false, code: 'INVALID_STEP_STATUS', message: 'Trạng thái bước học không hợp lệ.' });

    const [result] = await db.query(
      `UPDATE learning_path_steps lps
       JOIN learning_paths lp ON lp.id = lps.path_id
       SET lps.status = ?
       WHERE lps.id = ? AND lp.user_id = ?`,
      [status, req.params.stepId, req.user.id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, code: 'STEP_NOT_FOUND', message: 'Không tìm thấy bước học.' });
    res.json({ success: true, data: { id: Number(req.params.stepId), status } });
  } catch (error) {
    console.error('update learning path step error:', error);
    res.status(500).json({ success: false, code: 'LEARNING_PATH_ERROR', message: 'Không thể cập nhật bước học.' });
  }
};
