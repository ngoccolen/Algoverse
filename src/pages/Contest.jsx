import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Clock, CheckCircle, Search, 
  ChevronRight, Calendar, Code, AlertCircle, 
  RotateCcw, Play, Globe, List, Crown, Zap, UserPlus,
  Loader2, Terminal, Send // Import thêm icon mới
} from 'lucide-react';

// -----------------------------
// 1. CSS Styles cho hiển thị đề bài HTML
// -----------------------------
const CF_STYLES = `
  .cf-problem-content { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #222; font-size: 15px; line-height: 1.5; }
  .cf-problem-content .title { font-size: 1.75rem; font-weight: bold; margin-bottom: 1.5rem; color: #3b82f6; text-align: center; }
  .cf-problem-content p { margin-bottom: 1em; text-align: justify; }
  .cf-problem-content .section-title { font-weight: bold; font-size: 1.15em; margin-top: 1.5em; margin-bottom: 0.5em; color: #1f2937; }
  .cf-problem-content .sample-test { border: 1px solid #e5e7eb; border-radius: 6px; margin: 1.5rem 0; overflow: hidden; background: white; }
  .cf-problem-content .input, .cf-problem-content .output { padding: 0.5rem; }
  .cf-problem-content .input { border-bottom: 1px solid #e5e7eb; }
  .cf-problem-content .input .title, .cf-problem-content .output .title { font-weight: bold; color: #6b7280; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 0.5rem; letter-spacing: 0.05em; }
  .cf-problem-content pre { margin: 0; white-space: pre-wrap; word-wrap: break-word; background: #f9fafb; padding: 0.75rem; border-radius: 4px; font-size: 0.9rem; font-family: Consolas, 'Courier New', monospace; border: 1px solid #f3f4f6; }
  .cf-problem-content img { max-width: 100%; height: auto; display: block; margin: 15px auto; border-radius: 4px; }
`;

// -----------------------------
// 2. Cấu hình & Helper
// -----------------------------
const statusConfig = { 
  ongoing: { label: 'Đang diễn ra', color: 'bg-green-500 text-white', icon: Zap }, 
  upcoming: { label: 'Sắp diễn ra', color: 'bg-blue-500 text-white', icon: Clock }, 
  finished: { label: 'Đã kết thúc', color: 'bg-gray-500 text-white', icon: CheckCircle } 
};

const LANGUAGES = [ 
  { id: 'cpp', name: 'C++ (GCC 9.2)' }, 
  { id: 'python', name: 'Python (3.8.1)' }, 
  { id: 'java', name: 'Java (OpenJDK 13)' }, 
  { id: 'javascript', name: 'Node.js (12.14)' } 
];

// -----------------------------
// 3. Component Card Cuộc Thi
// -----------------------------
const ContestCard = ({ contest, onClick }) => {
  const StatusIcon = statusConfig[contest.status]?.icon || Clock;
  const statusInfo = statusConfig[contest.status] || statusConfig.upcoming;
  const isExternal = contest.source === 'codeforces';

  return (
    <motion.div whileHover={{ y: -5 }} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition cursor-pointer border border-gray-100 relative overflow-hidden" onClick={onClick}>
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-10 -mt-10 opacity-10 ${isExternal ? 'bg-red-500' : 'bg-blue-500'}`}></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex-1 pr-2">
           <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{contest.title}</h3>
           <p className="text-gray-500 text-sm mt-1 line-clamp-2">{contest.description || "Cuộc thi lập trình thuật toán."}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${statusInfo.color}`}>
          <StatusIcon size={12} /> {statusInfo.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-gray-500">
         <div className="bg-gray-50 p-2 rounded border flex flex-col">
            <span className="font-bold text-gray-400 uppercase text-[10px]">Bắt đầu</span>
            <span className="font-semibold text-gray-700">{new Date(contest.startTime).toLocaleDateString('vi-VN')}</span>
         </div>
         <div className="bg-gray-50 p-2 rounded border flex flex-col">
            <span className="font-bold text-gray-400 uppercase text-[10px]">Nguồn</span>
            <span className={`font-bold ${isExternal ? 'text-red-500' : 'text-blue-600'}`}>
                {isExternal ? 'Codeforces' : 'Hệ thống'}
            </span>
         </div>
      </div>

      <div className="flex items-center justify-end mt-4 pt-3 border-t border-gray-100">
         <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition flex items-center gap-1 shadow-lg">
            Chi tiết <ChevronRight size={12}/>
         </button>
      </div>
    </motion.div>
  );
};

// -----------------------------
// 4. Component Chi Tiết Cuộc Thi (Logic Chính)
// -----------------------------
const ContestDetail = ({ contest, onBack }) => {
  const [activeProblem, setActiveProblem] = useState(null); 
  const [activeTab, setActiveTab] = useState('problems'); // 'problems' | 'leaderboard'
  
  // State quản lý đăng ký & dữ liệu
  const [isRegistered, setIsRegistered] = useState(false);
  const [checkingReg, setCheckingReg] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [problemsList, setProblemsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Editor & Submission
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  // State Run Code (Mới)
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);

  // --- EFFECT: Check Registration & Inject Styles ---
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = CF_STYLES;
    document.head.appendChild(styleSheet);
    
    const token = localStorage.getItem("accessToken");
    
    // 1. Kiểm tra đã đăng ký chưa
    if(token) {
        fetch(`http://localhost:5000/api/contests/${contest.id}/check-registration`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            setIsRegistered(data.registered);
            setCheckingReg(false);
        })
        .catch(() => setCheckingReg(false));
    } else {
        setCheckingReg(false);
    }

    // 2. Load danh sách bài
    fetch(`http://localhost:5000/api/contests/${contest.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { if(data.success) setProblemsList(data.problems || []); })
      .finally(() => setLoading(false));

    return () => document.head.removeChild(styleSheet);
  }, [contest.id]);

  // --- EFFECT: Load Leaderboard ---
  useEffect(() => {
      if(activeTab === 'leaderboard') {
          fetch(`http://localhost:5000/api/contests/${contest.id}/leaderboard`)
            .then(res => res.json())
            .then(data => setLeaderboard(data.leaderboard || []));
      }
  }, [activeTab, contest.id]);

  // --- HANDLER: Đăng ký ---
  const handleRegister = async () => {
      const token = localStorage.getItem("accessToken");
      if(!token) return alert("Vui lòng đăng nhập để đăng ký!");

      try {
        const res = await fetch('http://localhost:5000/api/contests/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ contestId: contest.id })
        });
        const data = await res.json();
        if(data.success) {
            alert("Đăng ký thành công!");
            setIsRegistered(true);
        } else {
            alert(data.message);
        }
      } catch(e) { alert("Lỗi kết nối!"); }
  };

  // --- HANDLER: Chạy Thử Code (Mới) ---
  const handleRunCode = async () => {
    if (!code.trim()) return alert("Vui lòng nhập code!");
    setIsRunning(true);
    setRunResult(null); // Reset kết quả cũ
    setSubmitResult(null); // Ẩn kết quả nộp bài đi để đỡ rối

    const token = localStorage.getItem("accessToken");
    try {
        const res = await fetch(`http://localhost:5000/api/contests/run`, {
            method: 'POST',
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ 
                problemId: activeProblem.id, 
                language: language, 
                source: code 
            })
        });
        const data = await res.json();
        setRunResult(data);
    } catch (err) {
        alert("Lỗi kết nối server khi chạy thử!");
    } finally {
        setIsRunning(false);
    }
  };

  // --- HANDLER: Nộp Bài ---
  const handleSubmit = async () => {
    if (!code.trim()) return alert("Vui lòng nhập code!");
    setSubmitting(true);
    setSubmitResult(null);
    setRunResult(null); // Ẩn kết quả chạy thử đi

    const token = localStorage.getItem("accessToken");
    try {
      const res = await fetch('http://localhost:5000/api/submissions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ problemId: activeProblem.id, language, source: code, contestId: contest.id })
      });
      const data = await res.json();
      setSubmitResult(data);
    } catch (error) { alert("Lỗi kết nối server!"); } 
    finally { setSubmitting(false); }
  };

  // ==========================================
  // VIEW 1: MÀN HÌNH CHƯA ĐĂNG KÝ
  // ==========================================
  if (!checkingReg && !isRegistered) {
      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto mt-10">
            <button onClick={onBack} className="mb-6 text-gray-500 hover:text-blue-600 flex items-center gap-2 font-bold">← Quay lại</button>
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
                <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-10 text-center text-white relative overflow-hidden">
                    <Trophy size={120} className="mx-auto text-yellow-400 mb-6 drop-shadow-lg animate-bounce-slow"/>
                    <h1 className="text-4xl font-black mb-4">{contest.title}</h1>
                    <p className="text-blue-200 text-lg max-w-2xl mx-auto">{contest.description}</p>
                </div>
                <div className="p-10 text-center">
                    <button onClick={handleRegister} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full font-bold text-xl shadow-xl flex items-center gap-3 mx-auto transition transform hover:scale-105">
                        <UserPlus size={24}/> Đăng Ký Tham Gia Ngay
                    </button>
                </div>
            </div>
        </motion.div>
      );
  }

  // ==========================================
  // VIEW 2: MÀN HÌNH LÀM BÀI (Problem Detail + Editor)
  // ==========================================
  if (activeProblem) {
    return (
      <div className="h-[calc(100vh-100px)] flex flex-col">
        <div className="flex justify-between items-center mb-3 px-2">
            <button onClick={() => setActiveProblem(null)} className="flex items-center gap-2 font-bold text-gray-500 hover:text-blue-600 transition">
                <RotateCcw size={16}/> Quay lại danh sách
            </button>
            <div className="font-bold text-slate-700">{contest.title}</div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-hidden">
           {/* Cột Trái: Đề Bài */}
           <div className="bg-white rounded-xl shadow border border-gray-200 flex flex-col overflow-hidden">
              <div className="p-4 border-b bg-gray-50 font-bold text-lg text-blue-700 flex justify-between items-center">
                 {activeProblem.title}
                 <span className="text-xs bg-white border px-2 py-1 rounded text-gray-500 font-normal">{activeProblem.difficulty}</span>
              </div>
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                 <div className="cf-problem-content" dangerouslySetInnerHTML={{ __html: activeProblem.content_html }} />
              </div>
           </div>
           
           {/* Cột Phải: Editor & Terminal */}
           <div className="flex flex-col gap-4 h-full overflow-hidden">
              <div className="bg-slate-900 rounded-xl flex flex-col flex-1 overflow-hidden shadow-xl border border-slate-700">
                 {/* Header Editor */}
                 <div className="p-3 bg-slate-800 flex justify-between items-center border-b border-slate-700">
                    <span className="text-gray-300 text-xs font-bold uppercase flex items-center gap-2"><Code size={14}/> Code Editor</span>
                    <select value={language} onChange={e => setLanguage(e.target.value)} className="bg-slate-700 text-white text-xs px-2 py-1 rounded border border-slate-600 outline-none">
                       {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                 </div>
                 
                 {/* Textarea Code */}
                 <textarea 
                    className="flex-1 bg-slate-900 text-gray-200 p-4 font-mono text-sm outline-none resize-none" 
                    value={code} onChange={(e) => setCode(e.target.value)} 
                    placeholder="// Nhập code giải bài..." spellCheck="false"
                 />

                 {/* --- KHU VỰC TERMINAL (RUN RESULT) --- */}
                 <AnimatePresence>
                    {runResult && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="bg-slate-950 border-t border-slate-800 font-mono text-xs overflow-hidden">
                            <div className="p-3 max-h-[150px] overflow-y-auto">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-slate-400 font-bold flex gap-2 items-center"><Terminal size={12}/> Run Result</span>
                                    <button onClick={()=>setRunResult(null)} className="text-[10px] text-slate-500 hover:text-white">Close</button>
                                </div>
                                {runResult.stderr || runResult.compile_output ? (
                                    <pre className="text-red-400 whitespace-pre-wrap">{runResult.stderr || runResult.compile_output}</pre>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-slate-900 p-2 rounded border border-slate-800">
                                            <span className="block text-slate-500 mb-1">Your Output</span>
                                            <div className={`${runResult.stdout?.trim() === runResult.expected_output?.trim() ? 'text-green-400' : 'text-yellow-400'}`}>
                                                {runResult.stdout || <span className="text-slate-600 italic">Empty</span>}
                                            </div>
                                        </div>
                                        <div className="bg-slate-900 p-2 rounded border border-slate-800">
                                            <span className="block text-slate-500 mb-1">Expected</span>
                                            <div className="text-blue-400">{runResult.expected_output}</div>
                                        </div>
                                        <div className="col-span-2 text-center mt-1">
                                            {runResult.stdout?.trim() === runResult.expected_output?.trim() ? 
                                                <span className="text-green-500 font-bold bg-green-900/20 px-2 py-0.5 rounded">Correct Answer</span> : 
                                                <span className="text-red-500 font-bold bg-red-900/20 px-2 py-0.5 rounded">Wrong Answer</span>
                                            }
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                 </AnimatePresence>

                 {/* Footer Buttons */}
                 <div className="p-3 bg-slate-800 border-t border-slate-700 flex justify-end gap-3">
                    {/* Nút Chạy Thử */}
                    <button 
                        onClick={handleRunCode} 
                        disabled={isRunning || submitting} 
                        className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition text-slate-300 bg-slate-700 hover:bg-slate-600 border border-slate-600 disabled:opacity-50`}
                    >
                        {isRunning ? <Loader2 size={14} className="animate-spin"/> : <Play size={14}/>} Chạy thử
                    </button>

                    {/* Nút Nộp Bài */}
                    <button 
                        onClick={handleSubmit} 
                        disabled={submitting || isRunning} 
                        className={`px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition text-white ${submitting ? 'bg-green-800 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 shadow-lg shadow-green-900/20'}`}
                    >
                        {submitting ? <Loader2 size={14} className="animate-spin"/> : <Send size={14}/>} Nộp bài
                    </button>
                 </div>
              </div>
              
              {/* Kết quả Nộp Bài (Submit Result) */}
              <AnimatePresence>
                {submitResult && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-xl p-4 shadow-lg border-l-4 max-h-[200px] overflow-y-auto ${submitResult.status === 'Accepted' ? 'bg-green-50 border-green-500 text-green-900' : 'bg-red-50 border-red-500 text-red-900'}`}>
                     <div className="flex items-center gap-2 font-bold text-lg mb-2">
                        {submitResult.status === 'Accepted' ? <CheckCircle size={24}/> : <AlertCircle size={24}/>}
                        {submitResult.status}
                     </div>
                     <div className="text-sm">
                        {submitResult.status === 'Accepted' ? 
                            <div className="flex gap-4 font-mono opacity-80"><span>⏱ {submitResult.time || 0}s</span><span>💾 {submitResult.memory || 0}KB</span></div> :
                            <div className="font-mono bg-white/50 p-2 rounded text-xs">{submitResult.error_detail || "Kiểm tra lại logic hoặc test case."}</div>
                        }
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: DASHBOARD (Problems & Leaderboard)
  // ==========================================
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <button onClick={onBack} className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-2">← Quay lại danh sách cuộc thi</button>
      
      <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
         <div className="p-8 border-b border-slate-100 flex justify-between items-end bg-gradient-to-r from-slate-50 to-white">
            <div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">{contest.title}</h2>
                <div className="flex gap-4 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><Calendar size={16}/> {new Date(contest.startTime).toLocaleDateString('vi-VN')}</span>
                    <span className="flex items-center gap-1"><Trophy size={16}/> {contest.prize || "Danh hiệu"}</span>
                </div>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
                <button onClick={() => setActiveTab('problems')} className={`px-6 py-2 rounded-lg font-bold text-sm transition ${activeTab === 'problems' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <List size={16} className="inline mr-2"/> Đề Bài
                </button>
                <button onClick={() => setActiveTab('leaderboard')} className={`px-6 py-2 rounded-lg font-bold text-sm transition ${activeTab === 'leaderboard' ? 'bg-white text-yellow-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <Crown size={16} className="inline mr-2"/> Bảng Xếp Hạng
                </button>
            </div>
         </div>

         <div className="p-6 bg-slate-50 min-h-[400px]">
            {activeTab === 'problems' && (
                <div className="grid gap-3">
                   {loading ? <div className="text-center py-10">Đang tải đề...</div> : problemsList.map((problem, idx) => (
                      <div key={problem.id} onClick={() => setActiveProblem(problem)} className="group bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-blue-500 hover:shadow-md transition">
                         <div className="flex items-center gap-4">
                            <span className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 font-black flex items-center justify-center text-xl group-hover:bg-blue-600 group-hover:text-white transition">
                               {problem.index || String.fromCharCode(65 + idx)}
                            </span>
                            <div>
                               <div className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition">{problem.title}</div>
                               <div className="text-xs text-gray-500 mt-1 flex gap-2">
                                   <span className="bg-gray-100 px-2 rounded">Độ khó: {problem.difficulty}</span>
                               </div>
                            </div>
                         </div>
                         <button className="px-5 py-2 bg-slate-100 text-slate-700 font-bold text-sm rounded-lg group-hover:bg-blue-600 group-hover:text-white transition flex items-center gap-2">
                            Làm bài <ChevronRight size={14}/>
                         </button>
                      </div>
                   ))}
                </div>
            )}

            {activeTab === 'leaderboard' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-100 border-b border-slate-200">
                            <tr>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase w-16">Hạng</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Thí sinh</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Điểm</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Phạt (Phút)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.length === 0 ? (
                                <tr><td colSpan="4" className="p-8 text-center text-slate-400 italic">Chưa có ai nộp bài. Hãy là người đầu tiên!</td></tr>
                            ) : leaderboard.map((user, idx) => (
                                <tr key={idx} className={`border-b last:border-0 hover:bg-slate-50 ${idx < 3 ? 'bg-yellow-50/50' : ''}`}>
                                    <td className="p-4 font-bold text-slate-700">
                                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                                    </td>
                                    <td className="p-4 flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                            {user.username?.[0]?.toUpperCase()}
                                        </div>
                                        <span className="font-semibold text-slate-700">{user.username}</span>
                                    </td>
                                    <td className="p-4 font-bold text-green-600 text-right">{user.score}</td>
                                    <td className="p-4 text-slate-500 text-right">{user.penalty}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
         </div>
      </div>
    </motion.div>
  );
};

// -----------------------------
// 5. MAIN PAGE: DANH SÁCH CUỘC THI
// -----------------------------
export default function ContestPage() {
  const [contests, setContests] = useState([]);
  const [selectedContest, setSelectedContest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
      const token = localStorage.getItem("accessToken");
      fetch('http://localhost:5000/api/contests', {
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => { if(data.success) setContests(data.contests); })
        .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                <Zap className="text-yellow-500" fill="currentColor"/> Các Cuộc Thi
            </h1>
            <p className="text-slate-500 mt-2">Tham gia thi đấu để nâng cao kỹ năng và leo rank.</p>
        </div>

        <AnimatePresence mode="wait">
          {selectedContest ? (
            <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <ContestDetail contest={selectedContest} onBack={() => setSelectedContest(null)} />
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                 <div className="col-span-3 text-center py-20 text-gray-500">Đang tải dữ liệu...</div>
              ) : contests.length > 0 ? (
                  contests.map(c => <ContestCard key={c.id} contest={c} onClick={() => setSelectedContest(c)} />)
              ) : (
                  <div className="col-span-3 text-center py-20 text-gray-400 border border-dashed rounded-3xl bg-white">
                      <Search size={48} className="mx-auto mb-2 opacity-50"/>
                      Hiện chưa có cuộc thi nào.
                  </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}