const ALGORITHM_CATALOG = [
  { algKey: 'linear-search', topics: ['searching', 'arrays'], prerequisites: [], stage: 'foundation', estimatedMinutes: 25 },
  { algKey: 'bubble-sort', topics: ['sorting', 'arrays'], prerequisites: [], stage: 'foundation', estimatedMinutes: 30 },
  { algKey: 'selection-sort', topics: ['sorting', 'arrays'], prerequisites: ['bubble-sort'], stage: 'foundation', estimatedMinutes: 30 },
  { algKey: 'insertion-sort', topics: ['sorting', 'arrays'], prerequisites: ['bubble-sort'], stage: 'foundation', estimatedMinutes: 35 },
  { algKey: 'stack', topics: ['data-structures'], prerequisites: [], stage: 'foundation', estimatedMinutes: 30 },
  { algKey: 'queue', topics: ['data-structures'], prerequisites: ['stack'], stage: 'foundation', estimatedMinutes: 30 },
  { algKey: 'recursion', topics: ['fundamentals', 'recursion'], prerequisites: ['insertion-sort'], stage: 'core', estimatedMinutes: 40 },
  { algKey: 'binary-search', topics: ['searching', 'arrays'], prerequisites: ['insertion-sort'], stage: 'core', estimatedMinutes: 35 },
  { algKey: 'linked-list', topics: ['data-structures'], prerequisites: ['stack'], stage: 'core', estimatedMinutes: 40 },
  { algKey: 'merge-sort', topics: ['sorting', 'divide-and-conquer'], prerequisites: ['recursion'], stage: 'core', estimatedMinutes: 45 },
  { algKey: 'quick-sort', topics: ['sorting', 'divide-and-conquer'], prerequisites: ['recursion'], stage: 'core', estimatedMinutes: 45 },
  { algKey: 'counting-sort', topics: ['sorting', 'arrays'], prerequisites: ['insertion-sort'], stage: 'core', estimatedMinutes: 40 },
  { algKey: 'two-pointers', topics: ['techniques', 'arrays'], prerequisites: ['insertion-sort'], stage: 'core', estimatedMinutes: 35 },
  { algKey: 'bfs', topics: ['graph'], prerequisites: ['queue'], stage: 'advanced', estimatedMinutes: 50 },
  { algKey: 'dfs', topics: ['graph'], prerequisites: ['stack', 'recursion'], stage: 'advanced', estimatedMinutes: 50 }
];

const TOPIC_ALIASES = {
  sorting: 'sorting',
  search: 'searching',
  searching: 'searching',
  graph: 'graph',
  datastruct: 'data-structures',
  'data-structure': 'data-structures',
  'data-structures': 'data-structures',
  fundamentals: 'fundamentals',
  recursion: 'recursion',
  techniques: 'techniques',
  arrays: 'arrays',
  'divide-and-conquer': 'divide-and-conquer'
};

const normalizeTopic = (topic) => TOPIC_ALIASES[String(topic || '').trim().toLowerCase()] || null;

const normalizeProfile = (profile = {}) => ({
  goal: ['beginner', 'interview', 'contest', 'school'].includes(profile.goal) ? profile.goal : 'beginner',
  level: ['beginner', 'intermediate', 'advanced'].includes(profile.level) ? profile.level : 'beginner',
  language: ['python', 'cpp', 'java'].includes(profile.language) ? profile.language : 'python',
  dailyMinutes: [15, 30, 60].includes(Number(profile.dailyMinutes)) ? Number(profile.dailyMinutes) : 30,
  topics: Array.isArray(profile.topics)
    ? profile.topics.map(normalizeTopic).filter(Boolean).filter((topic, index, all) => all.indexOf(topic) === index)
    : [],
  learningStyle: Array.isArray(profile.learningStyle) ? profile.learningStyle.slice(0, 4) : [],
  weeklyTarget: Math.min(7, Math.max(1, Number(profile.weeklyTarget) || 3))
});

const catalogByKey = new Map(ALGORITHM_CATALOG.map((item) => [item.algKey, item]));

const addWithPrerequisites = (algKey, selected) => {
  if (selected.has(algKey)) return;
  const item = catalogByKey.get(algKey);
  if (!item) return;
  item.prerequisites.forEach((prerequisite) => addWithPrerequisites(prerequisite, selected));
  selected.add(algKey);
};

const buildDeterministicSelection = (profileInput) => {
  const profile = normalizeProfile(profileInput);
  const selected = new Set();
  const requestedTopics = new Set(profile.topics);

  if (requestedTopics.size === 0) {
    ALGORITHM_CATALOG.slice(0, profile.level === 'advanced' ? 12 : 10)
      .forEach((item) => addWithPrerequisites(item.algKey, selected));
  } else {
    ALGORITHM_CATALOG
      .filter((item) => item.topics.some((topic) => requestedTopics.has(topic)))
      .forEach((item) => addWithPrerequisites(item.algKey, selected));

    const minimumSteps = profile.level === 'beginner' ? 8 : 6;
    ALGORITHM_CATALOG
      .filter((item) => item.stage === 'foundation')
      .forEach((item) => {
        if (selected.size < minimumSteps) addWithPrerequisites(item.algKey, selected);
      });
  }

  const maxSteps = profile.weeklyTarget >= 5 ? 12 : profile.weeklyTarget <= 2 ? 8 : 10;
  return ALGORITHM_CATALOG.filter((item) => selected.has(item.algKey)).slice(0, maxSteps);
};

const createFallbackPath = (profileInput, algorithms) => {
  const profile = normalizeProfile(profileInput);
  const goalLabels = {
    beginner: 'nền tảng thuật toán',
    interview: 'phỏng vấn lập trình',
    contest: 'thi đấu thuật toán',
    school: 'môn học cấu trúc dữ liệu'
  };

  return {
    title: `Con đường chinh phục ${goalLabels[profile.goal]}`,
    summary: `Lộ trình cá nhân hóa gồm ${algorithms.length} chặng, phù hợp với ${profile.dailyMinutes} phút học mỗi ngày.`,
    encouragement: 'Mỗi chặng hoàn thành sẽ mở khóa một kỹ năng mới. Hãy học chậm, thực hành đều và quay lại ôn tập khi cần.',
    generatedBy: 'rules',
    steps: algorithms.map((algorithm, index) => ({
      algKey: algorithm.algKey,
      reason: index === 0
        ? 'Bắt đầu bằng một khái niệm nền tảng để tạo đà học tập.'
        : 'Chặng này được chọn vì xây dựng trực tiếp trên kiến thức của các chặng trước.',
      checkpoint: 'Đọc lý thuyết, xem mô phỏng và hoàn thành bài kiểm tra.',
      estimatedMinutes: algorithm.estimatedMinutes
    }))
  };
};

module.exports = {
  ALGORITHM_CATALOG,
  catalogByKey,
  normalizeProfile,
  buildDeterministicSelection,
  createFallbackPath
};
