import API_BASE_URL from '../config';
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Lock,
  PlayCircle,
  ArrowLeft,
  ArrowRight,
  Trophy,
  Star,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';
import Footer from '../components/Footer/Footer';
import './learningPath.css';

// ── Floating particles background ──
const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  size: 2 + Math.random() * 4,
  duration: 12 + Math.random() * 16,
  delay: Math.random() * 10,
}));

function FloatingParticles() {
  return (
    <div className="roadmap-particles" aria-hidden="true">
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="roadmap-particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Star field background ──
function StarField() {
  return <div className="roadmap-starfield" aria-hidden="true" />;
}

// ── Progress ring — glowing orb ──
function ProgressOrb({ progress, completed, total }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="roadmap-progress-orb">
      <div className="roadmap-progress-ring-wrap">
        <div className="roadmap-progress-ring">
          <svg viewBox="0 0 100 100">
            <defs>
              <linearGradient id="roadmapProgressGrad" x1="0" x2="1">
                <stop stopColor="#6366f1" />
                <stop offset="0.5" stopColor="#a855f7" />
                <stop offset="1" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r={radius} className="roadmap-progress-ring__bg" />
            <circle
              cx="50" cy="50" r={radius}
              className="roadmap-progress-ring__fill"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <span className="roadmap-progress-ring__text">
            <span className="roadmap-progress-pct">{progress}%</span>
            <span className="roadmap-progress-label">Hoàn thành</span>
          </span>
        </div>
      </div>
      <div className="roadmap-progress-stats">
        <span>
          <span className="stat-dot stat-dot--done" />
          {completed} đã xong
        </span>
        <span>
          <span className="stat-dot stat-dot--remaining" />
          {total - completed} còn lại
        </span>
      </div>
    </div>
  );
}

// ── Connector dots between timeline items ──
function ConnectorDots({ prevCompleted, currentUnlocked }) {
  const dotState = prevCompleted
    ? 'roadmap-connector__dot--done'
    : currentUnlocked
      ? 'roadmap-connector__dot--active'
      : '';

  return (
    <div className="roadmap-connector">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className={`roadmap-connector__dot ${dotState}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.06 * i, duration: 0.35 }}
        />
      ))}
    </div>
  );
}

// ── Single timeline item (hexagonal milestone + glassmorphism card) ──
function TimelineItem({ algo, index, globalIndex, onClick }) {
  const isCompleted = algo.progress >= 100;
  const isCurrent = !algo.isLocked && !isCompleted && !algo._isPreviouslyOpen;
  const isOpen = !algo.isLocked && !isCompleted && !isCurrent;
  const isLocked = algo.isLocked;

  const milestoneState = isCompleted
    ? 'roadmap-milestone--completed'
    : isCurrent
      ? 'roadmap-milestone--current'
      : isOpen
        ? 'roadmap-milestone--open'
        : 'roadmap-milestone--locked';

  const cardState = isCompleted
    ? 'roadmap-card--completed'
    : isCurrent
      ? 'roadmap-card--current'
      : isLocked
        ? 'roadmap-card--locked'
        : '';

  const side = index % 2 === 0 ? 'left' : 'right';

  const difficultyClass =
    algo.difficulty === 'Easy' ? 'easy'
      : algo.difficulty === 'Medium' ? 'medium'
        : 'hard';

  const difficultyLabel =
    algo.difficulty === 'Easy' ? 'Cơ bản'
      : algo.difficulty === 'Medium' ? 'Trung bình'
        : 'Nâng cao';

  return (
    <motion.div
      className={`roadmap-timeline-item roadmap-timeline-item--${side}`}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: 0.1 * globalIndex,
        duration: 0.6,
        ease: [0.34, 1.56, 0.64, 1]
      }}
    >
      {/* Hexagonal milestone */}
      <motion.div
        className={`roadmap-milestone ${milestoneState}`}
        whileHover={!isLocked ? { scale: 1.15 } : {}}
        whileTap={!isLocked ? { scale: 0.9 } : {}}
        onClick={() => onClick(algo.alg_key, algo.isLocked)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onClick(algo.alg_key, algo.isLocked);
        }}
        aria-label={`${algo.name} - ${algo.difficulty}`}
      >
        <div className="roadmap-milestone__hex" />
        <div className="roadmap-milestone__inner">
          <span className="roadmap-milestone__icon">
            {isCompleted ? (
              <CheckCircle size={22} />
            ) : isLocked ? (
              <Lock size={18} />
            ) : isCurrent ? (
              <Zap size={22} />
            ) : (
              <PlayCircle size={22} />
            )}
          </span>
        </div>
        <span className="roadmap-milestone__number">{globalIndex + 1}</span>
      </motion.div>

      {/* Glassmorphism info card */}
      <div
        className={`roadmap-card ${cardState}`}
        onClick={() => onClick(algo.alg_key, algo.isLocked)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onClick(algo.alg_key, algo.isLocked);
        }}
      >
        <div className="roadmap-card__header">
          <h3 className="roadmap-card__name">{algo.name}</h3>
          {!isLocked && (
            <ArrowRight size={16} className="roadmap-card__arrow" />
          )}
        </div>

        <div className="roadmap-card__meta">
          <span className={`roadmap-card__difficulty roadmap-card__difficulty--${difficultyClass}`}>
            {difficultyLabel}
          </span>
          {algo.complexity && (
            <span className="roadmap-card__complexity">
              <Star size={10} /> {algo.complexity}
            </span>
          )}
        </div>

        {!isLocked && (
          <div className="roadmap-card__progress">
            <div className="roadmap-card__progress-bar">
              <div
                className={`roadmap-card__progress-fill ${isCompleted ? 'roadmap-card__progress-fill--done' : 'roadmap-card__progress-fill--active'}`}
                style={{ width: `${algo.progress}%` }}
              />
            </div>
            <div className="roadmap-card__progress-row">
              <span className="roadmap-card__progress-text">
                {isCompleted ? 'Hoàn thành' : isCurrent ? 'Đang học' : 'Đã mở khóa'}
              </span>
              <span className={`roadmap-card__progress-pct ${isCompleted ? 'roadmap-card__progress-pct--done' : ''}`}>
                {algo.progress}%
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Level divider ──
function LevelDivider({ title, difficulty }) {
  const badgeClass =
    difficulty === 'Easy' ? 'roadmap-level-badge--easy'
      : difficulty === 'Medium' ? 'roadmap-level-badge--medium'
        : 'roadmap-level-badge--hard';

  const icon =
    difficulty === 'Easy' ? <Sparkles size={13} />
      : difficulty === 'Medium' ? <Star size={13} />
        : <Trophy size={13} />;

  return (
    <motion.div
      className="roadmap-level-divider"
      initial={{ opacity: 0, scaleX: 0.3 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <span className={`roadmap-level-badge ${badgeClass}`}>
        {icon} {title}
      </span>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════
export default function LearningPath() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryTitle, setCategoryTitle] = useState("");

  const CATEGORY_ALIASES = {
    sorting: 'Sorting',
    search: 'Searching',
    searching: 'Searching',
    graph: 'Graph',
    datastruct: 'Data Structure',
    'data-structure': 'Data Structure',
    fundamentals: 'Fundamentals',
    techniques: 'Techniques'
  };

  const CATEGORY_DISPLAY_NAMES = {
    sorting: 'Thuật toán Sắp xếp',
    search: 'Thuật toán Tìm kiếm',
    searching: 'Thuật toán Tìm kiếm',
    graph: 'Lý thuyết Đồ thị',
    datastruct: 'Cấu trúc Dữ liệu',
    'data-structure': 'Cấu trúc Dữ liệu',
    fundamentals: 'Nền tảng Lập trình',
    techniques: 'Kỹ thuật giải bài'
  };

  const CATEGORY_NAMES = {
    sorting: "Thuật toán Sắp xếp",
    search: "Thuật toán Tìm kiếm",
    graph: "Lý thuyết Đồ thị",
    tree: "Cấu trúc Cây",
    dp: "Quy hoạch động",
    greedy: "Thuật toán Tham lam"
  };

  useEffect(() => {
    const fetchPath = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};

        const res = await fetch(`${API_BASE_URL}/api/algorithms`, { headers });
        const data = await res.json();

        if (data.success) {
          const allAlgos = data.data;

          const canonicalCategory = CATEGORY_ALIASES[categoryId.toLowerCase()] || categoryId;
          const filteredAlgos = allAlgos.filter(
            a => a.category && a.category.toLowerCase() === canonicalCategory.toLowerCase()
          );

          setCategoryTitle(CATEGORY_DISPLAY_NAMES[categoryId.toLowerCase()] || CATEGORY_NAMES[categoryId] || categoryId);

          const level1 = filteredAlgos.filter(a => a.difficulty === 'Easy');
          const level2 = filteredAlgos.filter(a => a.difficulty === 'Medium');
          const level3 = filteredAlgos.filter(a => a.difficulty === 'Hard');

          let previousCompleted = true;

          const processLevel = (algos) => {
            return algos.map(algo => {
              const rawProgress = algo.progress || 0;
              const progress = Math.round(rawProgress);

              const isLocked = !previousCompleted;

              if (progress < 100) {
                previousCompleted = false;
              } else {
                previousCompleted = true;
              }

              return { ...algo, isLocked, progress };
            });
          };

          const pathData = [
            {
              id: "l1",
              title: "Nhập môn & Cơ bản",
              difficulty: "Easy",
              algorithms: processLevel(level1)
            },
            {
              id: "l2",
              title: "Trung cấp & Tối ưu",
              difficulty: "Medium",
              algorithms: processLevel(level2)
            },
            {
              id: "l3",
              title: "Nâng cao & Ứng dụng",
              difficulty: "Hard",
              algorithms: processLevel(level3)
            }
          ];

          setLevels(pathData.filter(l => l.algorithms.length > 0));
        }
      } catch (err) {
        console.error("Lỗi tải lộ trình:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPath();
  }, [categoryId]);

  // Flatten all algorithms for overall stats
  const allAlgos = useMemo(() => {
    return levels.flatMap(l => l.algorithms);
  }, [levels]);

  const completedCount = useMemo(() => {
    return allAlgos.filter(a => a.progress >= 100).length;
  }, [allAlgos]);

  const overallProgress = useMemo(() => {
    return allAlgos.length ? Math.round((completedCount / allAlgos.length) * 100) : 0;
  }, [completedCount, allAlgos.length]);

  // Mark first non-completed unlocked node as "current", rest as "previously open"
  const processedLevels = useMemo(() => {
    let foundCurrent = false;
    return levels.map(level => ({
      ...level,
      algorithms: level.algorithms.map(algo => {
        const isCompleted = algo.progress >= 100;
        const isUnlocked = !algo.isLocked;
        if (!isCompleted && isUnlocked && !foundCurrent) {
          foundCurrent = true;
          return { ...algo, _isPreviouslyOpen: false }; // This IS the current node
        }
        if (!isCompleted && isUnlocked && foundCurrent) {
          return { ...algo, _isPreviouslyOpen: true }; // Unlocked but not current
        }
        return { ...algo, _isPreviouslyOpen: false };
      })
    }));
  }, [levels]);

  const handleNavigate = (algKey, isLocked) => {
    if (isLocked) return;
    navigate(`/lab/${algKey}`);
  };

  // ── Loading state ──
  if (loading) return (
    <div className="roadmap-loading">
      <div className="roadmap-loading-spinner" />
      <span>Đang tải lộ trình học...</span>
    </div>
  );

  // Keep a running global index for positioning & numbering
  let globalIndex = 0;

  return (
    <div className="roadmap-page">
      {/* Star field background */}
      <StarField />

      {/* Nebula ambient glows */}
      <div className="roadmap-ambient roadmap-ambient--one" />
      <div className="roadmap-ambient roadmap-ambient--two" />
      <div className="roadmap-ambient roadmap-ambient--three" />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Header */}
      <header className="roadmap-header">
        <motion.button
          className="roadmap-back"
          onClick={() => navigate('/explore')}
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={16} /> Quay lại Khám phá
        </motion.button>

        {/* Hero section */}
        <motion.div
          className="roadmap-hero"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="roadmap-hero-info">
            <div className="roadmap-eyebrow">
              <Target size={14} /> Lộ trình học tập
            </div>
            <motion.h1
              className="roadmap-title"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
            >
              {categoryTitle}
            </motion.h1>
            <motion.p
              className="roadmap-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Chinh phục từng cột mốc để mở khóa kiến thức mới. Mỗi bước đi là một bước tiến gần hơn đến mục tiêu.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <ProgressOrb
              progress={overallProgress}
              completed={completedCount}
              total={allAlgos.length}
            />
          </motion.div>
        </motion.div>
      </header>

      {/* Main timeline area */}
      <div className="roadmap-container">
        {/* Animated vertical line */}
        <div className="roadmap-timeline-line" />

        {processedLevels.length === 0 ? (
          <div className="roadmap-empty">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <Trophy size={56} style={{ color: '#6366f1' }} />
            </motion.div>
            <h2>Chưa có bài học nào</h2>
            <p>Chưa có bài học nào trong mục này. Hãy quay lại sau nhé!</p>
          </div>
        ) : (
          <AnimatePresence>
            {processedLevels.map((level, lvlIdx) => (
              <div key={level.id} className="roadmap-level-section">
                {/* Level divider */}
                <LevelDivider
                  title={level.title}
                  difficulty={level.difficulty}
                />

                {/* Timeline items */}
                {level.algorithms.map((algo, algoIdx) => {
                  const currentGlobalIndex = globalIndex;
                  globalIndex++;

                  // Determine connector state
                  const isFirst = lvlIdx === 0 && algoIdx === 0;
                  const prevAlgo = algoIdx > 0
                    ? level.algorithms[algoIdx - 1]
                    : lvlIdx > 0
                      ? processedLevels[lvlIdx - 1].algorithms[processedLevels[lvlIdx - 1].algorithms.length - 1]
                      : null;

                  return (
                    <React.Fragment key={algo.id || algo.alg_key || currentGlobalIndex}>
                      {/* Connector dots */}
                      {!isFirst && (
                        <ConnectorDots
                          prevCompleted={prevAlgo?.progress >= 100}
                          currentUnlocked={!algo.isLocked}
                        />
                      )}

                      {/* Timeline item */}
                      <TimelineItem
                        algo={algo}
                        index={algoIdx}
                        globalIndex={currentGlobalIndex}
                        onClick={handleNavigate}
                      />
                    </React.Fragment>
                  );
                })}
              </div>
            ))}
          </AnimatePresence>
        )}

        {/* End trophy */}
        {processedLevels.length > 0 && (
          <motion.div
            className="roadmap-finish"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
          >
            <ConnectorDots prevCompleted={overallProgress === 100} currentUnlocked={false} />

            <motion.div
              className="roadmap-finish__trophy-wrap"
              animate={
                overallProgress === 100
                  ? { rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }
                  : {}
              }
              transition={
                overallProgress === 100
                  ? { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                  : {}
              }
            >
              <div className={`roadmap-finish__trophy-bg ${overallProgress === 100 ? 'roadmap-finish__trophy-bg--unlocked' : 'roadmap-finish__trophy-bg--locked'}`} />
              <Trophy
                size={32}
                className="roadmap-finish__icon"
                style={{
                  color: overallProgress === 100 ? '#fff' : '#475569',
                }}
              />
            </motion.div>

            <span className={`roadmap-finish__text ${overallProgress === 100 ? 'roadmap-finish__text--unlocked' : 'roadmap-finish__text--locked'}`}>
              {overallProgress === 100 ? '🎉 Hoàn thành xuất sắc!' : 'Đích đến cuối cùng'}
            </span>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}
