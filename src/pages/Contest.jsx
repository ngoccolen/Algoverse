import API_BASE_URL from '../config';
// pages/Contest.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Clock, CheckCircle, Search, 
  ChevronRight, Calendar, Code, AlertCircle, 
  RotateCcw, Play, Globe, List, Crown, Zap, UserPlus,
  Loader2, Terminal, Send, Users, Timer, Sparkles, Hourglass, ShieldCheck 
} from 'lucide-react';
import Footer from '../components/Footer/Footer'; 

const CF_STYLES = `
  .cf-problem-content { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1f2937; font-size: 15px; line-height: 1.6; }
  .cf-problem-content .title { font-size: 1.5rem; font-weight: 800; margin-bottom: 1.5rem; color: #111827; }
  .cf-problem-content p { margin-bottom: 1.2em; text-align: justify; color: #374151; }
  .cf-problem-content .section-title { font-weight: 700; font-size: 1.1em; margin-top: 1.5em; margin-bottom: 0.75em; color: #111827; display: flex; align-items: center; gap: 8px; }
  .cf-problem-content .sample-test { border: 1px solid #e5e7eb; border-radius: 8px; margin: 1.5rem 0; overflow: hidden; background: #f9fafb; }
  .cf-problem-content .input, .cf-problem-content .output { padding: 0.75rem; }
  .cf-problem-content .input { border-bottom: 1px solid #e5e7eb; }
  .cf-problem-content .input .title, .cf-problem-content .output .title { font-weight: 700; color: #6b7280; font-size: 0.7rem; text-transform: uppercase; margin-bottom: 0.5rem; letter-spacing: 0.05em; }
  .cf-problem-content pre { margin: 0; white-space: pre-wrap; word-wrap: break-word; background: #ffffff; padding: 0.75rem; border-radius: 6px; font-size: 0.9rem; font-family: 'JetBrains Mono', Consolas, monospace; border: 1px solid #e5e7eb; color: #1f2937; }
  .cf-problem-content img { max-width: 100%; height: auto; display: block; margin: 20px auto; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
  /* Custom Scrollbar */
  .custom-scrollbar::-webkit-scrollbar { width: 8px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
`;

const LANGUAGES = [ 
  { id: 'cpp', name: 'C++ (GCC 9.2)' }, 
  { id: 'python', name: 'Python (3.8.1)' }, 
  { id: 'java', name: 'Java (OpenJDK 13)' }, 
  { id: 'javascript', name: 'Node.js (12.14)' } 
];

const statusConfig = { 
  ongoing: { label: 'Đang diễn ra', bg: 'bg-green-500', text: 'text-green-600', border: 'border-green-200', icon: Zap }, 
  upcoming: { label: 'Sắp diễn ra', bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200', icon: Timer }, 
  finished: { label: 'Đã kết thúc', bg: 'bg-slate-500', text: 'text-slate-500', border: 'border-slate-200', icon: CheckCircle } 
};

const ContestCard = ({ contest, onClick }) => {
  const config = statusConfig[contest.status] || statusConfig.upcoming;
  const StatusIcon = config.icon;
  const isExternal = contest.source === 'codeforces';

  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.01 }}
      className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col h-full"
      onClick={onClick}
    >
      <div className={`h-2 w-full ${config.bg}`}></div>
      <div className="p-6 flex flex-col h-full relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 border ${config.border} bg-white ${config.text} shadow-sm`}>
             <StatusIcon size={12} className="animate-pulse" /> {config.label}
          </div>
          {isExternal && <div className="bg-slate-100 text-slate-500 p-1.5 rounded-lg" title="External Contest"><Globe size={14}/></div>}
        </div>
        <h3 className="text-xl font-extrabold text-slate-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">{contest.title}</h3>
        <p className="text-slate-500 text-sm mb-6 line-clamp-2 flex-grow leading-relaxed">{contest.description || "Cuộc thi thuật toán dành cho các lập trình viên đam mê thử thách."}</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600"><Calendar size={16}/></div>
                <div className="flex flex-col"><span className="text-[10px] text-slate-400 font-bold uppercase">Ngày bắt đầu</span><span className="text-xs font-bold text-slate-700">{new Date(contest.start_time).toLocaleDateString('vi-VN')}</span></div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="bg-yellow-100 p-1.5 rounded-lg text-yellow-600"><Trophy size={16}/></div>
                <div className="flex flex-col"><span className="text-[10px] text-slate-400 font-bold uppercase">Giải thưởng</span><span className="text-xs font-bold text-slate-700 truncate max-w-[80px]">{contest.prize || "Danh hiệu"}</span></div>
            </div>
        </div>
        <div className="pt-4 border-t border-slate-100 flex justify-end items-center">
             <div className="flex items-center gap-1 text-sm font-bold text-slate-400 group-hover:text-blue-600 transition-colors">Chi tiết <ChevronRight size={16}/></div>
        </div>
      </div>
    </motion.div>
  );
};

const ContestDetail = ({ contest, onBack }) => {
  const [activeProblem, setActiveProblem] = useState(null); 
  const [activeTab, setActiveTab] = useState('problems');
  
  const [isRegistered, setIsRegistered] = useState(false);
  const [checkingReg, setCheckingReg] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  const [leaderboard, setLeaderboard] = useState([]);
  const [problemsList, setProblemsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({});

  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);

  const calculateTimeLeft = () => {
    const difference = new Date(contest.start_time) - new Date();
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return {};
  };

  //kiểm tra đăng ký và tải đề thi khi cuộc thi bắt đầu
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = CF_STYLES;
    document.head.appendChild(styleSheet);
    
    const token = localStorage.getItem("accessToken");
    if(token) {
        fetch(`${API_BASE_URL}/api/contests/${contest.id}/check-registration`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => { 
            setIsRegistered(data.registered); 
            setCheckingReg(false); 
        })
        .catch(() => setCheckingReg(false));
    } else { setCheckingReg(false); }

    const timer = setInterval(() => {
        const remaining = calculateTimeLeft();
        setTimeLeft(remaining);
        
        const isNowStarted = new Date() >= new Date(contest.start_time);
        setIsStarted(isNowStarted);

        if (isRegistered && isNowStarted && problemsList.length === 0 && loading) {
             fetch(`${API_BASE_URL}/api/contests/${contest.id}`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => { if(data.success) setProblemsList(data.problems || []); })
            .finally(() => setLoading(false));
        }

    }, 1000);

    return () => {
        document.head.removeChild(styleSheet);
        clearInterval(timer);
    };
  }, [contest.id, isRegistered]); 

  useEffect(() => {
      if(activeTab === 'leaderboard') {
          fetch(`${API_BASE_URL}/api/contests/${contest.id}/leaderboard`)
            .then(res => res.json())
            .then(data => setLeaderboard(data.leaderboard || []));
      }
  }, [activeTab, contest.id]);

  const handleRegister = async () => {
      const token = localStorage.getItem("accessToken");
      if(!token) return alert("Vui lòng đăng nhập!");
      
      setIsRegistering(true); 
      try {
        const res = await fetch(`${API_BASE_URL}/api/contests/register`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ contestId: contest.id }) });
        const data = await res.json();
        
        if(data.success) {
            setTimeout(() => {
                setIsRegistered(true);
                setIsRegistering(false);
            }, 800); 
        } else {
            alert(data.message);
            setIsRegistering(false);
        }
      } catch(e) { 
          alert("Lỗi kết nối!"); 
          setIsRegistering(false);
      }
  };

  const handleRunCode = async () => { 
    if (!code.trim()) return alert("Vui lòng nhập code!"); setIsRunning(true); setRunResult(null); setSubmitResult(null);
    const token = localStorage.getItem("accessToken");
    try { const res = await fetch(`${API_BASE_URL}/api/contests/run`, { method: 'POST', headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify({ problemId: activeProblem.id, language: language, source: code }) }); const data = await res.json(); setRunResult(data); } catch (err) { alert("Lỗi!"); } finally { setIsRunning(false); }
  };
  const handleSubmit = async () => { 
    if (!code.trim()) return alert("Vui lòng nhập code!"); setSubmitting(true); setSubmitResult(null); setRunResult(null);
    const token = localStorage.getItem("accessToken");
    try { const res = await fetch(`${API_BASE_URL}/api/submissions/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ problemId: activeProblem.id, language, source: code, contestId: contest.id }) }); const data = await res.json(); setSubmitResult(data); } catch (error) { alert("Lỗi!"); } finally { setSubmitting(false); }
  };

  if (checkingReg || !isRegistered) {
      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto mt-12 pb-20">
            <button onClick={onBack} className="mb-8 text-slate-500 hover:text-slate-900 flex items-center gap-2 font-bold transition"><RotateCcw size={18}/> Quay lại</button>
            
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col lg:flex-row">
                <div className="p-10 lg:w-3/5 flex flex-col justify-center relative">
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-bold text-xs w-fit mb-6 uppercase tracking-wider">
                        Sự kiện chính thức
                    </span>
                    <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 leading-tight">{contest.title}</h1>
                    <p className="text-slate-600 text-lg mb-8 leading-relaxed pr-8">{contest.description}</p>
                    
                    <div className="grid grid-cols-2 gap-6 mb-10">
                        <div className="flex items-center gap-3 text-slate-700 font-medium">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><Calendar size={24}/></div>
                            <div>
                                <span className="block text-xs text-slate-400 font-bold uppercase">Bắt đầu</span>
                                <span className="text-lg font-bold">{new Date(contest.start_time).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-slate-700 font-medium">
                            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-500"><Trophy size={24}/></div>
                            <div>
                                <span className="block text-xs text-slate-400 font-bold uppercase">Giải thưởng</span>
                                <span className="text-lg font-bold">{contest.prize || "Danh hiệu"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleRegister} 
                            disabled={isRegistering || checkingReg}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-slate-200 flex items-center gap-3 transition-all transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isRegistering ? <Loader2 size={24} className="animate-spin"/> : <UserPlus size={24}/>}
                            {isRegistering ? "Đang xử lý..." : "Đăng Ký Tham Gia"}
                        </button>
                    </div>
                </div>

                <div className="lg:w-2/5 bg-slate-900 relative overflow-hidden flex items-center justify-center min-h-[400px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-purple-600/30 z-10"></div>
                    <div className="relative z-20 text-center">
                        <div className="mb-6 relative inline-block">
                             <Trophy size={160} className="text-white relative z-10 drop-shadow-2xl"/>
                             <Crown size={60} className="text-yellow-400 absolute -top-4 -right-4 z-20 rotate-12 drop-shadow-lg"/>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
      );
  }

  if (isRegistered && !isStarted) {
    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto mt-20 pb-20 text-center">
            <button onClick={onBack} className="mb-10 text-slate-500 hover:text-slate-900 flex items-center gap-2 font-bold mx-auto"><RotateCcw size={18}/> Quay lại danh sách</button>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                
                <div className="mb-8">
                    <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-green-50 text-green-600 font-bold text-sm border border-green-100 shadow-sm"
                    >
                        <ShieldCheck size={18}/> Bạn đã đăng ký thành công
                    </motion.div>
                </div>

                <h2 className="text-3xl md:text-5xl font-black text-slate-800 mb-6">{contest.title}</h2>
                <p className="text-slate-500 text-lg mb-12">Cuộc thi chưa bắt đầu. Vui lòng giữ tinh thần thép chờ đến giờ G!</p>

                {/* COUNTDOWN TIMER */}
                <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto mb-12">
                    {[
                        { label: 'Ngày', value: timeLeft.days || 0 },
                        { label: 'Giờ', value: timeLeft.hours || 0 },
                        { label: 'Phút', value: timeLeft.minutes || 0 },
                        { label: 'Giây', value: timeLeft.seconds || 0 }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-slate-900 text-white rounded-2xl p-4 md:p-6 shadow-xl flex flex-col items-center justify-center border border-slate-700 relative overflow-hidden group">
                            <span className="text-3xl md:text-5xl font-mono font-bold mb-1">{String(item.value).padStart(2, '0')}</span>
                            <span className="text-xs md:text-sm text-slate-400 font-bold uppercase tracking-wider">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
  }

  if (activeProblem) {
    return (
      <div className="h-[calc(100vh-90px)] flex flex-col bg-slate-50">
        <div className="h-14 bg-white border-b border-slate-200 flex justify-between items-center px-6 shadow-sm z-20">
            <div className="flex items-center gap-4">
                <button onClick={() => setActiveProblem(null)} className="text-slate-500 hover:text-blue-600 transition p-1 rounded hover:bg-slate-100"><List size={20}/></button>
                <div className="h-6 w-px bg-slate-200"></div>
                <h2 className="font-bold text-slate-800 truncate max-w-md">{activeProblem.title}</h2>
            </div>
            <div className="flex items-center gap-3">
                 <div className="bg-red-50 text-red-600 px-3 py-1 rounded text-sm font-bold flex items-center gap-2"><Timer size={14}/> LIVE</div>
            </div>
        </div>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden">
           <div className="bg-white border-r border-slate-200 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                 <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between items-start mb-6">
                        <h1 className="text-2xl font-black text-slate-900">{activeProblem.index}. {activeProblem.title}</h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${activeProblem.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : activeProblem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{activeProblem.difficulty}</span>
                    </div>
                    
                    <div className="cf-problem-content" dangerouslySetInnerHTML={{ __html: activeProblem.content_html }} />

                    {(activeProblem.sample_input || activeProblem.sample_output) && (
                      <div className="mt-8 space-y-6">
                        {activeProblem.sample_input && (
                          <div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Input</div>
                            <div className="bg-slate-100 p-4 rounded-lg border border-slate-200 font-mono text-sm text-slate-800 whitespace-pre-wrap">
                              {activeProblem.sample_input}
                            </div>
                          </div>
                        )}

                        {activeProblem.sample_output && (
                          <div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Output</div>
                            <div className="bg-slate-100 p-4 rounded-lg border border-slate-200 font-mono text-sm text-slate-800 whitespace-pre-wrap">
                              {activeProblem.sample_output}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                 </div>
              </div>
           </div>
           <div className="flex flex-col bg-slate-900 border-l border-slate-800">
              <div className="h-12 bg-slate-950 border-b border-slate-800 flex justify-between items-center px-4">
                 <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider"><Code size={14} className="text-blue-500"/> Editor</div>
                 <div className="flex items-center gap-3">
                    <select value={language} onChange={e => setLanguage(e.target.value)} className="bg-slate-800 text-slate-200 text-xs px-3 py-1.5 rounded border border-slate-700 outline-none hover:border-slate-500 transition">
                       {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                 </div>
              </div>
              <div className="flex-1 relative">
                 <textarea className="absolute inset-0 w-full h-full bg-[#0d1117] text-gray-300 p-4 font-mono text-sm outline-none resize-none leading-relaxed" value={code} onChange={(e) => setCode(e.target.value)} placeholder="// Viết lời giải của bạn tại đây..." spellCheck="false"/>
              </div>
              <AnimatePresence>
                {runResult && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="bg-slate-900 border-t border-slate-800 overflow-hidden">
                        <div className="p-4 max-h-[200px] overflow-y-auto font-mono text-xs">
                            <div className="flex justify-between mb-2">
                                <span className="text-slate-400 font-bold flex gap-2"><Terminal size={14}/> Console</span>
                                <button onClick={()=>setRunResult(null)} className="text-slate-500 hover:text-white">✕</button>
                            </div>
                            {runResult.stderr || runResult.compile_output ? (
                                <div className="bg-red-900/20 border border-red-900/50 p-3 rounded text-red-400 whitespace-pre-wrap">{runResult.stderr || runResult.compile_output}</div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <div><div className="text-slate-500 mb-1">Your Output</div><div className={`p-2 rounded border border-slate-700 bg-slate-800 ${runResult.stdout?.trim() === runResult.expected_output?.trim() ? 'text-green-400 border-green-900' : 'text-yellow-400'}`}>{runResult.stdout || "Empty"}</div></div>
                                    <div><div className="text-slate-500 mb-1">Expected</div><div className="p-2 rounded border border-slate-700 bg-slate-800 text-blue-400">{runResult.expected_output}</div></div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
              </AnimatePresence>
              <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
                 <div className="flex-1">
                    {submitResult && (
                        <div className={`text-xs font-bold flex items-center gap-2 ${submitResult.status === 'Accepted' ? 'text-green-500' : 'text-red-500'}`}>
                            {submitResult.status === 'Accepted' ? <CheckCircle size={14}/> : <AlertCircle size={14}/>}
                            {submitResult.status === 'Accepted' ? 'Accepted' : submitResult.status}
                        </div>
                    )}
                 </div>
                 <div className="flex gap-3">
                    <button onClick={handleRunCode} disabled={isRunning || submitting} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-700 transition flex items-center gap-2 disabled:opacity-50">{isRunning ? <Loader2 size={16} className="animate-spin"/> : <Play size={16}/>} Run Code</button>
                    <button onClick={handleSubmit} disabled={submitting || isRunning} className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-500 shadow-lg shadow-green-900/30 transition flex items-center gap-2 disabled:opacity-50">{submitting ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>} Submit</button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  if (isRegistered && isStarted) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-7xl mx-auto px-4 mt-8 pb-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
              <div>
                <button onClick={onBack} className="text-slate-500 hover:text-slate-900 font-semibold text-sm flex items-center gap-1 mb-2"><ChevronRight size={16} className="rotate-180"/> Danh sách</button>
                <h1 className="text-3xl font-black text-slate-900">{contest.title}</h1>
              </div>
              <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                <button onClick={() => setActiveTab('problems')} className={`px-6 py-2.5 rounded-lg font-bold text-sm transition flex items-center gap-2 ${activeTab === 'problems' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}><List size={16}/> Đề Bài</button>
                <button onClick={() => setActiveTab('leaderboard')} className={`px-6 py-2.5 rounded-lg font-bold text-sm transition flex items-center gap-2 ${activeTab === 'leaderboard' ? 'bg-yellow-400 text-black shadow' : 'text-slate-500 hover:bg-slate-50'}`}><Crown size={16}/> Bảng Xếp Hạng</button>
              </div>
          </div>
          <div className="min-h-[400px]">
            {activeTab === 'problems' && (
                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400"><Loader2 size={40} className="animate-spin mb-4 text-blue-500"/><p>Đang tải dữ liệu...</p></div>
                    ) : problemsList.length === 0 ? (
                        <div className="text-center py-20 text-slate-500 bg-white rounded-xl border border-slate-200">Không tìm thấy đề bài nào.</div>
                    ) : problemsList.map((problem, idx) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: idx * 0.05 }} 
                            key={problem.id} 
                            onClick={() => {
                                setActiveProblem(problem);
                                if (problem.user_code) {
                                    setCode(problem.user_code); 
                                } else {
                                    setCode(""); 
                                }
                                setRunResult(null); 
                                setSubmitResult(null); 
                            }} 
                            className={`group border p-5 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 
                            ${problem.status === 'Accepted' ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 hover:border-blue-500 hover:shadow-md'}`}
                        >
                            <div className="flex items-center gap-6">
                                <span className={`w-10 h-10 rounded-lg font-black flex items-center justify-center text-lg transition
                                    ${problem.status === 'Accepted' ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-600 group-hover:text-white'}`}>
                                    {problem.status === 'Accepted' ? <CheckCircle size={20}/> : (problem.index || String.fromCharCode(65 + idx))}
                                </span>
                                
                                <div>
                                    <h3 className={`font-bold text-lg transition ${problem.status === 'Accepted' ? 'text-green-700' : 'text-slate-800 group-hover:text-blue-600'}`}>
                                        {problem.title}
                                    </h3>
                                    <div className="flex gap-2 mt-1">
                                        <span className={`text-xs px-2 py-0.5 rounded font-medium border ${problem.difficulty === 'Easy' ? 'bg-green-50 text-green-700 border-green-100' : problem.difficulty === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 'bg-red-50 text-red-700 border-red-100'}`}>{problem.difficulty}</span>
                                        {problem.status && (
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ml-2 border
                                                ${problem.status === 'Accepted' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                {problem.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition"><Play size={16} className="ml-1"/></div>
                        </motion.div>
                    ))}
                </div>
            )}
            {activeTab === 'leaderboard' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr><th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider w-20 text-center">Rank</th><th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Contestant</th><th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Score</th><th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Penalty</th></tr>
                        </thead>
                        <tbody>
                            {leaderboard.length === 0 ? ( <tr><td colSpan="4" className="p-10 text-center text-slate-400 italic">Chưa có dữ liệu.</td></tr> ) : leaderboard.map((user, idx) => (
                                <tr key={idx} className={`border-b last:border-0 hover:bg-slate-50 transition ${idx < 3 ? 'bg-yellow-50/30' : ''}`}>
                                    <td className="p-5 text-center">{idx === 0 ? <Crown size={24} className="mx-auto text-yellow-500 fill-yellow-500"/> : idx === 1 ? <div className="mx-auto w-6 h-6 rounded-full bg-slate-300 text-white font-bold text-xs flex items-center justify-center">2</div> : idx === 2 ? <div className="mx-auto w-6 h-6 rounded-full bg-orange-300 text-white font-bold text-xs flex items-center justify-center">3</div> : <span className="font-bold text-slate-500 text-sm">#{idx + 1}</span>}</td>
                                    <td className="p-5"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">{user.username?.[0]}</div><span className={`font-bold ${idx < 3 ? 'text-slate-900' : 'text-slate-600'}`}>{user.username}</span></div></td>
                                    <td className="p-5 font-bold text-green-600 text-right">{user.score}</td><td className="p-5 text-slate-500 font-mono text-right">{user.penalty}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>
            )}
          </div>
        </motion.div>
    );
  }
};

//DANH SÁCH CUỘC THI
export default function ContestPage() {
  const [contests, setContests] = useState([]);
  const [selectedContest, setSelectedContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { 
      const token = localStorage.getItem("accessToken");
      
      fetch(`${API_BASE_URL}/api/contests`, {
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => { 
            if(data.success) {
                const sortedContests = data.contests.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
                setContests(sortedContests);
            }
        })
        .finally(() => setLoading(false));
  }, []);

  const filteredContests = contests.filter(contest => {
    if (filter === 'all') return true;
    return contest.status === filter;
  });

  const filterTabs = [
      { id: 'all', label: 'Tất cả', Icon: List },
      { id: 'ongoing', label: 'Đang diễn ra', Icon: Zap },
      { id: 'upcoming', label: 'Sắp diễn ra', Icon: Timer },
      { id: 'finished', label: 'Đã kết thúc', Icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <div className="flex-grow pb-20">
        <div className="bg-slate-900 text-white pt-28 pb-16 px-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none -ml-20 -mb-20"></div>
            <div className="max-w-7xl mx-auto relative z-10 text-center md:text-left flex justify-between items-start">
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight flex items-center justify-center md:justify-start gap-4"><Trophy className="text-yellow-400" size={48} fill="currentColor"/> Đấu trường Algoverse</h1>
                    <p className="text-slate-300 text-lg max-w-2xl leading-relaxed mx-auto md:mx-0">Nơi quy tụ những lập trình viên tài năng nhất. Tham gia các cuộc thi tuần để leo rank, nhận giải thưởng và khẳng định bản lĩnh code của bạn.</p>
                </div>
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
            <AnimatePresence mode="wait">
            {selectedContest ? (
                <motion.div key="detail" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <ContestDetail contest={selectedContest} onBack={() => setSelectedContest(null)} />
                </motion.div>
            ) : (
                <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="flex flex-wrap justify-center md:justify-start gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 w-fit mx-auto md:mx-0">
                    {filterTabs.map(tab => {
                        const Icon = tab.Icon;
                        return ( <button key={tab.id} onClick={() => setFilter(tab.id)} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${filter === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:bg-slate-50'}`}>{Icon && <Icon size={14}/>} {tab.label}</button>);
                    })}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-32 text-slate-400"><Loader2 size={48} className="animate-spin mb-4 text-blue-500"/><p>Đang tải dữ liệu...</p></div>
                    ) : filteredContests.length > 0 ? (
                        filteredContests.map(c => <ContestCard key={c.id} contest={c} onClick={() => setSelectedContest(c)} />)
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-32 bg-white rounded-3xl shadow-sm border border-slate-100 text-center"><div className="bg-slate-50 p-6 rounded-full mb-4"><Sparkles size={48} className="text-slate-300"/></div><h3 className="text-xl font-bold text-slate-700">Không tìm thấy cuộc thi nào</h3><p className="text-slate-500 mt-2">Thử chọn bộ lọc khác xem sao nhé!</p></div>
                    )}
                </div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
      </div>
      <Footer />
    </div>
  );
}