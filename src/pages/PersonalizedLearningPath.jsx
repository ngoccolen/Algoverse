import React, { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Check, ChevronRight, Clock3, Lock, Map, RefreshCw, Sparkles, Star, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMyLearningPath, updateLearningPathStep } from '../api/learningPathApi';
import Footer from '../components/Footer/Footer';
import './learningPath.css';

const readLocalPath = () => {
  try {
    const value = localStorage.getItem('algoverse_learning_path');
    return value ? JSON.parse(value) : null;
  } catch (error) {
    return null;
  }
};

const isComplete = (step) => step.progress >= 100 || step.status === 'completed';

export default function PersonalizedLearningPath() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [path, setPath] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPath = async () => {
      const token = localStorage.getItem('accessToken');
      try {
        if (token) {
          const result = await getMyLearningPath();
          setPath(result.data);
          localStorage.setItem('algoverse_learning_path', JSON.stringify(result.data));
        } else {
          setPath(readLocalPath());
        }
      } catch (requestError) {
        const localPath = readLocalPath();
        if (localPath) setPath(localPath);
        else setError(requestError.status === 404 ? 'Bạn chưa có lộ trình cá nhân.' : requestError.message);
      } finally {
        setLoading(false);
      }
    };
    loadPath();
  }, []);

  const steps = path?.steps || [];
  const viewSteps = useMemo(() => steps.map((step, index) => {
    const completed = isComplete(step);
    const unlocked = index === 0 || steps.slice(0, index).every(isComplete);
    return { ...step, completed, unlocked, current: unlocked && !completed };
  }), [steps]);

  const selectedStep = viewSteps[selectedIndex] || viewSteps.find((step) => step.current) || viewSteps[0];
  const completedCount = viewSteps.filter((step) => step.completed).length;
  const overallProgress = viewSteps.length ? Math.round((completedCount / viewSteps.length) * 100) : 0;
  const canvasWidth = Math.max(1100, viewSteps.length * 220);
  const points = viewSteps.map((step, index) => ({
    x: 100 + index * 210,
    y: 190 + (index % 2 === 0 ? -48 : 48)
  }));
  const pathD = points.map((point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1];
    const controlX = (previous.x + point.x) / 2;
    return `C ${controlX} ${previous.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
  }).join(' ');

  const handleStart = async (step) => {
    if (!step || !step.unlocked) return;
    const token = localStorage.getItem('accessToken');
    if (token && step.id) {
      try {
        await updateLearningPathStep(step.id, 'in_progress');
      } catch (requestError) {
        // Starting a lesson should still work if the progress endpoint is temporarily unavailable.
        console.warn('Unable to update learning path step:', requestError.message);
      }
    }
    navigate(`/lab/${step.algKey}`);
  };

  if (loading) return <main className="learning-path-page path-loading"><span className="button-spinner" /> Đang tải con đường học tập...</main>;

  if (!path || !viewSteps.length) {
    return (
      <main className="learning-path-page path-empty">
        <Map size={48} />
        <h1>Chưa có con đường học tập</h1>
        <p>Trả lời vài câu hỏi để Algoverse xây dựng lộ trình phù hợp với bạn.</p>
        <button type="button" className="survey-primary" onClick={() => navigate('/learning-path/survey')}>Bắt đầu khảo sát <ChevronRight size={17} /></button>
        {error && <small>{error}</small>}
      </main>
    );
  }

  return (
    <main className="learning-path-page personalized-page">
      <div className="path-ambient path-ambient-one" />
      <div className="path-ambient path-ambient-two" />
      <div className="path-content">
        <div className="path-toolbar">
          <button type="button" className="path-back" onClick={() => navigate('/explore')}><ArrowLeft size={17} /> Khám phá</button>
          <button type="button" className="path-regenerate" onClick={() => navigate('/learning-path/survey')}><RefreshCw size={15} /> Làm lại khảo sát</button>
        </div>

        <motion.header initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="path-header">
          <div>
            <span className="eyebrow"><Sparkles size={15} /> Lộ trình được cá nhân hóa</span>
            <h1>{path.title}</h1>
            <p>{path.summary}</p>
          </div>
          <div className="path-progress-stat"><Trophy size={22} /><strong>{overallProgress}%</strong><span>{completedCount}/{viewSteps.length} chặng</span></div>
        </motion.header>

        <section className="path-board" aria-label="Bản đồ lộ trình học tập">
          <div className="path-board-top"><span><Map size={17} /> Bản đồ hành trình</span><span className="path-board-hint">Cuộn ngang để khám phá toàn bộ con đường</span></div>
          <div className="path-map-scroll">
            <div className="path-map-canvas" style={{ width: `${canvasWidth}px` }}>
              <div className="path-stars" aria-hidden="true" />
              <svg viewBox={`0 0 ${canvasWidth} 360`} role="img" aria-label="Các chặng trong lộ trình học tập">
                <title>{path.title}</title>
                <path d={pathD} fill="none" stroke="rgba(148,163,184,.2)" strokeWidth="10" strokeLinecap="round" />
                <motion.path d={pathD} fill="none" stroke="url(#pathGradient)" strokeWidth="4" strokeLinecap="round" initial={reduceMotion ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: 'easeOut' }} />
                <defs><linearGradient id="pathGradient" x1="0" x2="1"><stop stopColor="#22d3ee" /><stop offset="0.5" stopColor="#8b5cf6" /><stop offset="1" stopColor="#f472b6" /></linearGradient></defs>
                {viewSteps.map((step, index) => {
                  const point = points[index];
                  const selected = selectedIndex === index;
                  return (
                    <motion.g
                      key={step.algKey}
                      tabIndex="0"
                      role="button"
                      aria-label={`${step.position}. ${step.name}`}
                      className={`path-node ${step.completed ? 'path-node-complete' : ''} ${step.unlocked ? 'path-node-open' : 'path-node-locked'} ${step.current ? 'path-node-current' : ''} ${selected ? 'path-node-selected' : ''}`}
                      transform={`translate(${point.x}, ${point.y})`}
                      onClick={() => setSelectedIndex(index)}
                      onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelectedIndex(index); }}
                      whileHover={reduceMotion ? undefined : { scale: 1.08 }}
                      animate={step.current && !reduceMotion ? { y: [0, -5, 0] } : { y: 0 }}
                      transition={step.current && !reduceMotion ? { duration: 2.2, repeat: Infinity } : undefined}
                    >
                      <circle r="32" className="path-node-halo" />
                      <circle r="24" className="path-node-circle" />
                      <text y="5" textAnchor="middle" className="path-node-number">{step.completed ? '✓' : step.unlocked ? index + 1 : '•'}</text>
                    </motion.g>
                  );
                })}
              </svg>
              <div className="path-map-labels">{viewSteps.map((step, index) => <button type="button" key={step.algKey} style={{ left: `${points[index].x}px`, top: `${points[index].y + 47}px` }} className={`path-label ${selectedIndex === index ? 'path-label-selected' : ''}`} onClick={() => setSelectedIndex(index)}>{step.name}</button>)}</div>
            </div>
          </div>
        </section>

        <section className="path-detail-grid">
          <div className="path-selected-step">
            <div className="path-step-heading"><span className="path-step-index">{selectedStep.position}</span><div><span className="path-step-kicker">Chặng đang chọn</span><h2>{selectedStep.name}</h2></div></div>
            <div className="path-badges"><span>{selectedStep.difficulty}</span><span><Clock3 size={14} /> {selectedStep.estimatedMinutes} phút</span><span><Star size={14} /> {selectedStep.complexity}</span></div>
            <p className="path-reason"><strong>Vì sao có chặng này?</strong> {selectedStep.reason}</p>
            <p className="path-checkpoint"><Check size={17} /> {selectedStep.checkpoint}</p>
            <button type="button" className="survey-primary" onClick={() => handleStart(selectedStep)} disabled={!selectedStep.unlocked}>{selectedStep.completed ? 'Ôn tập chặng này' : 'Bắt đầu chặng học'} <ChevronRight size={17} /></button>
          </div>
          <aside className="path-side-panel"><div className="path-side-icon"><Sparkles size={20} /></div><h3>Lời nhắn từ AlgoBot</h3><p>{path.encouragement}</p><div className="path-mini-progress"><span style={{ width: `${overallProgress}%` }} /></div><small>{overallProgress === 100 ? 'Bạn đã hoàn thành toàn bộ lộ trình!' : 'Hoàn thành chặng hiện tại để mở khóa chặng tiếp theo.'}</small></aside>
        </section>
      </div>
      <Footer />
    </main>
  );
}
