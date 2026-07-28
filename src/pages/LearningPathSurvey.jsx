import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BrainCircuit, Check, Clock3, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateLearningPath, saveSurvey } from '../api/learningPathApi';
import './learningPath.css';

const initialProfile = {
  goal: 'beginner',
  level: 'beginner',
  language: 'python',
  dailyMinutes: 30,
  topics: ['sorting', 'searching'],
  learningStyle: ['visual'],
  weeklyTarget: 3
};

const GOALS = [
  { value: 'beginner', label: 'Xây nền tảng', description: 'Bắt đầu từ những khái niệm quan trọng nhất.' },
  { value: 'interview', label: 'Chuẩn bị phỏng vấn', description: 'Tập trung vào tư duy và dạng bài thường gặp.' },
  { value: 'contest', label: 'Thi đấu thuật toán', description: 'Đi nhanh hơn đến kỹ thuật và bài nâng cao.' },
  { value: 'school', label: 'Hoàn thành môn học', description: 'Học theo trình tự cấu trúc dữ liệu và thuật toán.' }
];

const TOPICS = [
  ['sorting', 'Sorting'],
  ['searching', 'Searching'],
  ['graph', 'Graph'],
  ['data-structures', 'Cấu trúc dữ liệu'],
  ['recursion', 'Đệ quy'],
  ['techniques', 'Kỹ thuật giải bài']
];

const STYLES = [
  ['visual', 'Trực quan animation'],
  ['theory', 'Đọc lý thuyết'],
  ['practice', 'Làm quiz'],
  ['code', 'Viết code']
];

const QUESTIONS = [
  { title: 'Bạn muốn đạt được điều gì?', key: 'goal' },
  { title: 'Bạn đang ở trình độ nào?', key: 'level' },
  { title: 'Bạn muốn học bằng ngôn ngữ nào?', key: 'language' },
  { title: 'Mỗi ngày bạn có bao nhiêu thời gian?', key: 'dailyMinutes' },
  { title: 'Bạn muốn tập trung vào chủ đề nào?', key: 'topics' },
  { title: 'Cách học nào khiến bạn hứng thú nhất?', key: 'learningStyle' },
  { title: 'Mỗi tuần bạn muốn hoàn thành bao nhiêu chặng?', key: 'weeklyTarget' }
];

function ChoiceCard({ selected, onClick, title, description }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`survey-choice ${selected ? 'survey-choice-selected' : ''}`}
    >
      <span>
        <strong>{title}</strong>
        {description && <small>{description}</small>}
      </span>
      {selected && <Check size={18} aria-hidden="true" />}
    </button>
  );
}

export default function LearningPathSurvey() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(initialProfile);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const currentQuestion = QUESTIONS[questionIndex];
  const updateProfile = (key, value) => setProfile((current) => ({ ...current, [key]: value }));

  const toggleArrayValue = (key, value) => {
    setProfile((current) => {
      const values = current[key] || [];
      const next = values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
      return { ...current, [key]: next };
    });
  };

  const canContinue = () => {
    if (currentQuestion.key === 'topics') return profile.topics.length > 0;
    if (currentQuestion.key === 'learningStyle') return profile.learningStyle.length > 0;
    return true;
  };

  const handleNext = async () => {
    setError('');
    if (!canContinue()) {
      setError('Hãy chọn ít nhất một lựa chọn để Algoverse hiểu bạn hơn.');
      return;
    }
    if (questionIndex < QUESTIONS.length - 1) {
      setQuestionIndex((index) => index + 1);
      return;
    }

    setIsGenerating(true);
    try {
      await saveSurvey(profile);
      const result = await generateLearningPath(profile);
      localStorage.setItem('algoverse_learning_path', JSON.stringify(result.data));
      localStorage.setItem('algoverse_learning_profile', JSON.stringify(profile));
      navigate('/learning-path', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'Không thể tạo lộ trình. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderQuestion = () => {
    switch (currentQuestion.key) {
      case 'goal':
        return <div className="survey-options">{GOALS.map((item) => <ChoiceCard key={item.value} selected={profile.goal === item.value} onClick={() => updateProfile('goal', item.value)} title={item.label} description={item.description} />)}</div>;
      case 'level':
        return <div className="survey-options survey-options-compact">
          <ChoiceCard selected={profile.level === 'beginner'} onClick={() => updateProfile('level', 'beginner')} title="Mới bắt đầu" description="Chưa học hoặc mới làm quen." />
          <ChoiceCard selected={profile.level === 'intermediate'} onClick={() => updateProfile('level', 'intermediate')} title="Đã có nền tảng" description="Biết vòng lặp, mảng và hàm." />
          <ChoiceCard selected={profile.level === 'advanced'} onClick={() => updateProfile('level', 'advanced')} title="Nâng cao" description="Đã giải được nhiều bài thuật toán." />
        </div>;
      case 'language':
        return <div className="survey-options survey-options-compact">
          {['python', 'cpp', 'java'].map((language) => <ChoiceCard key={language} selected={profile.language === language} onClick={() => updateProfile('language', language)} title={language === 'cpp' ? 'C++' : language[0].toUpperCase() + language.slice(1)} description="Ngôn ngữ dùng trong ví dụ và bài tập." />)}
        </div>;
      case 'dailyMinutes':
        return <div className="survey-options survey-options-compact">
          {[15, 30, 60].map((minutes) => <ChoiceCard key={minutes} selected={profile.dailyMinutes === minutes} onClick={() => updateProfile('dailyMinutes', minutes)} title={`${minutes} phút mỗi ngày`} description={minutes === 15 ? 'Nhẹ nhàng, duy trì thói quen.' : minutes === 30 ? 'Cân bằng giữa học và thực hành.' : 'Tăng tốc với nhiều bài tập hơn.'} />)}
        </div>;
      case 'topics':
        return <div className="survey-chip-grid">{TOPICS.map(([value, label]) => <button type="button" key={value} onClick={() => toggleArrayValue('topics', value)} className={`survey-chip ${profile.topics.includes(value) ? 'survey-chip-selected' : ''}`}>{profile.topics.includes(value) && <Check size={15} />}{label}</button>)}</div>;
      case 'learningStyle':
        return <div className="survey-chip-grid">{STYLES.map(([value, label]) => <button type="button" key={value} onClick={() => toggleArrayValue('learningStyle', value)} className={`survey-chip ${profile.learningStyle.includes(value) ? 'survey-chip-selected' : ''}`}>{profile.learningStyle.includes(value) && <Check size={15} />}{label}</button>)}</div>;
      case 'weeklyTarget':
        return <div className="survey-options survey-options-compact">
          {[2, 3, 5].map((target) => <ChoiceCard key={target} selected={profile.weeklyTarget === target} onClick={() => updateProfile('weeklyTarget', target)} title={`${target} chặng mỗi tuần`} description="Mỗi chặng gồm lý thuyết, mô phỏng và bài kiểm tra." />)}
        </div>;
      default:
        return null;
    }
  };

  return (
    <main className="learning-path-page survey-page">
      <div className="survey-glow survey-glow-one" />
      <div className="survey-glow survey-glow-two" />
      <div className="survey-shell">
        <button type="button" onClick={() => navigate(-1)} className="survey-back"><ArrowLeft size={17} /> Quay lại</button>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="survey-header">
          <span className="eyebrow"><Sparkles size={15} /> AlgoPath AI</span>
          <h1>Hãy để AI vẽ con đường học tập cho bạn</h1>
          <p>Trả lời 7 câu hỏi ngắn. Algoverse sẽ sắp xếp những chặng phù hợp với mục tiêu và thời gian của bạn.</p>
        </motion.div>

        <section className="survey-panel" aria-live="polite">
          <div className="survey-progress-row"><span>Câu {questionIndex + 1} / {QUESTIONS.length}</span><span><Clock3 size={15} /> Khoảng 2 phút</span></div>
          <div className="survey-progress-bar"><span style={{ width: `${((questionIndex + 1) / QUESTIONS.length) * 100}%` }} /></div>
          <motion.div key={currentQuestion.key} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} className="survey-question">
            <div className="survey-question-icon"><BrainCircuit size={25} /></div>
            <h2>{currentQuestion.title}</h2>
            <p className="survey-hint">Bạn có thể thay đổi lộ trình sau này.</p>
            {renderQuestion()}
          </motion.div>
          {error && <p className="survey-error" role="alert">{error}</p>}
          <div className="survey-actions">
            <button type="button" className="survey-secondary" onClick={() => setQuestionIndex((index) => Math.max(0, index - 1))} disabled={questionIndex === 0 || isGenerating}>Quay lại</button>
            <button type="button" className="survey-primary" onClick={handleNext} disabled={isGenerating}>
              {isGenerating ? <><span className="button-spinner" /> Đang xây dựng...</> : <>{questionIndex === QUESTIONS.length - 1 ? 'Tạo lộ trình' : 'Tiếp tục'} <ArrowRight size={17} /></>}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
