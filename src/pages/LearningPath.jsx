import API_BASE_URL from '../config';
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Lock,
  PlayCircle,
  ArrowLeft,
  Trophy,
  Star,
  Sparkles
} from 'lucide-react';
import Footer from '../components/Footer/Footer';
import './learningPath.css';

// ── Floating particles background ──
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  size: 2 + Math.random() * 3,
  duration: 10 + Math.random() * 12,
  delay: Math.random() * 8,
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

// ── Progress ring SVG ──
function ProgressRing({ progress, completed, total }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="roadmap-progress-card">
      <div className="roadmap-progress-ring">
        <svg viewBox="0 0 48 48">
          <defs>
            <linearGradient id="roadmapProgressGrad" x1="0" x2="1">
              <stop stopColor="#22d3ee" />
              <stop offset="0.5" stopColor="#8b5cf6" />
              <stop offset="1" stopColor="#f472b6" />
            </linearGradient>
          </defs>
          <circle cx="24" cy="24" r={radius} className="roadmap-progress-ring__bg" />
          <circle
            cx="24" cy="24" r={radius}
            className="roadmap-progress-ring__fill"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="roadmap-progress-ring__text">{progress}%</span>
      </div>
      <div className="roadmap-progress-meta">
        <strong>{completed}/{total} bài</strong>
        <span>Hoàn thành</span>
      </div>
    </div>
  );
}

// ── Connector dots between nodes ──
function ConnectorDots({ prevCompleted, currentUnlocked }) {
  const dotState = prevCompleted
    ? 'roadmap-connector__dot--done'
    : currentUnlocked
      ? 'roadmap-connector__dot--active'
      : '';

  return (
    <div className="roadmap-connector">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`roadmap-connector__dot ${dotState}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.05 * i, duration: 0.3 }}
        />
      ))}
    </div>
  );
}

// ── Single roadmap node ──
function RoadmapNode({ algo, index, onClick }) {
  const isCompleted = algo.progress >= 100;
  const isCurrent = !algo.isLocked && !isCompleted && !algo._isPreviouslyOpen;
  const isOpen = !algo.isLocked && !isCompleted && !isCurrent;
  const isLocked = algo.isLocked;

  const stateClass = isCompleted
    ? 'roadmap-node--completed'
    : isCurrent
      ? 'roadmap-node--current'
      : isOpen
        ? 'roadmap-node--open'
        : 'roadmap-node--locked';

  const side = index % 2 === 0 ? 'left' : 'right';

  const difficultyClass =
    algo.difficulty === 'Easy' ? 'easy'
      : algo.difficulty === 'Medium' ? 'medium'
        : 'hard';

  return (
    <motion.div
      className={`roadmap-node-row roadmap-node-row--${side}`}
      initial={{ opacity: 0, x: side === 'left' ? -40 : 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.08 * index, duration: 0.5, ease: 'easeOut' }}
      onClick={() => onClick(algo.alg_key, algo.isLocked)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(algo.alg_key, algo.isLocked); }}
      aria-label={`${algo.name} - ${algo.difficulty}`}
    >
      {/* Circle node */}
      <motion.div
        className={`roadmap-node ${stateClass}`}
        whileHover={!isLocked ? { scale: 1.12 } : {}}
        whileTap={!isLocked ? { scale: 0.95 } : {}}
        animate={
          isCurrent
            ? { y: [0, -6, 0] }
            : {}
        }
        transition={
          isCurrent
            ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.2 }
        }
      >
        <div className="roadmap-node__ring" />
        <div className="roadmap-node__inner">
          <span className="roadmap-node__icon">
            {isCompleted ? (
              <CheckCircle size={26} />
            ) : isLocked ? (
              <Lock size={22} />
            ) : (
              <PlayCircle size={26} />
            )}
          </span>
        </div>
      </motion.div>

      {/* Info card */}
      <div className="roadmap-info">
        <h3 className="roadmap-info__name">{algo.name}</h3>
        <div className="roadmap-info__meta">
          <span className={`roadmap-info__difficulty roadmap-info__difficulty--${difficultyClass}`}>
            {algo.difficulty}
          </span>
          {algo.complexity && (
            <span className="roadmap-info__complexity">
              <Star size={11} /> {algo.complexity}
            </span>
          )}
        </div>

        {!isLocked && (
          <>
            <div className="roadmap-info__progress-bar">
              <div
                className={`roadmap-info__progress-fill ${isCompleted ? 'roadmap-info__progress-fill--done' : 'roadmap-info__progress-fill--active'}`}
                style={{ width: `${algo.progress}%` }}
              />
            </div>
            <span className="roadmap-info__progress-text">{algo.progress}%</span>
          </>
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
    difficulty === 'Easy' ? <Sparkles size={14} />
      : difficulty === 'Medium' ? <Star size={14} />
        : <Trophy size={14} />;

  return (
    <motion.div
      className="roadmap-level-divider"
      initial={{ opacity: 0, scaleX: 0.5 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
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
              title: "Level 1: Nhập môn & Cơ bản",
              difficulty: "Easy",
              algorithms: processLevel(level1)
            },
            {
              id: "l2",
              title: "Level 2: Trung cấp & Tối ưu",
              difficulty: "Medium",
              algorithms: processLevel(level2)
            },
            {
              id: "l3",
              title: "Level 3: Nâng cao & Ứng dụng",
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
      <span className="button-spinner" />
      Đang tải lộ trình học...
    </div>
  );

  // Keep a running global index for zigzag positioning
  let globalIndex = 0;

  return (
    <div className="roadmap-page">
      {/* Ambient background glows */}
      <div className="roadmap-ambient roadmap-ambient--one" />
      <div className="roadmap-ambient roadmap-ambient--two" />
      <div className="roadmap-ambient roadmap-ambient--three" />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Header */}
      <header className="roadmap-header">
        <button
          className="roadmap-back"
          onClick={() => navigate('/explore')}
        >
          <ArrowLeft size={18} /> Quay lại Khám phá
        </button>

        <div className="roadmap-title-row">
          <div>
            <motion.h1
              className="roadmap-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {categoryTitle}
            </motion.h1>
            <motion.p
              className="roadmap-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Hoàn thành từng bài học để mở khóa cấp độ tiếp theo trên con đường chinh phục.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <ProgressRing
              progress={overallProgress}
              completed={completedCount}
              total={allAlgos.length}
            />
          </motion.div>
        </div>
      </header>

      {/* Main roadmap area */}
      <div className="roadmap-container">
        {processedLevels.length === 0 ? (
          <div className="roadmap-empty">
            <Trophy size={48} style={{ color: '#67e8f9' }} />
            <h2>Chưa có bài học nào</h2>
            <p>Chưa có bài học nào trong mục này. Hãy quay lại sau nhé!</p>
          </div>
        ) : (
          processedLevels.map((level, lvlIdx) => {
            const levelContent = (
              <div key={level.id}>
                {/* Level divider */}
                <LevelDivider
                  title={level.title}
                  difficulty={level.difficulty}
                />

                {/* Nodes */}
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
                      {/* Connector dots (skip before very first node) */}
                      {!isFirst && (
                        <ConnectorDots
                          prevCompleted={prevAlgo?.progress >= 100}
                          currentUnlocked={!algo.isLocked}
                        />
                      )}

                      {/* The node */}
                      <RoadmapNode
                        algo={algo}
                        index={currentGlobalIndex}
                        onClick={handleNavigate}
                      />
                    </React.Fragment>
                  );
                })}
              </div>
            );

            return levelContent;
          })
        )}

        {/* End trophy */}
        {processedLevels.length > 0 && (
          <motion.div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: '2.5rem',
              gap: '0.5rem',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <ConnectorDots prevCompleted={overallProgress === 100} currentUnlocked={false} />
            <motion.div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: overallProgress === 100
                  ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                  : 'linear-gradient(135deg, #1e293b, #0f172a)',
                border: overallProgress === 100
                  ? '3px solid #fbbf24'
                  : '3px solid #334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: overallProgress === 100
                  ? '0 0 30px rgba(251, 191, 36, 0.3)'
                  : 'none',
              }}
              animate={
                overallProgress === 100
                  ? { rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }
                  : {}
              }
              transition={
                overallProgress === 100
                  ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                  : {}
              }
            >
              <Trophy
                size={28}
                style={{
                  color: overallProgress === 100 ? '#fff' : '#475569',
                }}
              />
            </motion.div>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: overallProgress === 100 ? '#fbbf24' : '#475569',
              textAlign: 'center',
              marginTop: '0.2rem',
            }}>
              {overallProgress === 100 ? '🎉 Hoàn thành xuất sắc!' : 'Đích đến'}
            </span>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}
