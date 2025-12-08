// pages/PracticeDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MonacoEditor from "@monaco-editor/react";
import axios from "axios";
import { 
  Play, Loader2, Send, Clock, ArrowLeft, RefreshCw, CheckCircle, XCircle, Code 
} from "lucide-react";

// ======================
// 1. CODE TEMPLATES (Mẫu code mặc định)
// ======================
const templates = {
  javascript: `// JavaScript (Node.js)
const fs = require('fs');
const input = fs.readFileSync(0, 'utf8');

function solve(data) {
  // data là chuỗi input đầu vào
  // Hãy xử lý và return kết quả
  return ""; 
}

if (input) console.log(solve(input));`,

  python: `# Python 3
import sys

def solve():
    # Đọc toàn bộ input
    data = sys.stdin.read()
    
    # Xử lý logic tại đây
    
    # In kết quả
    print(data)

if __name__ == '__main__':
    solve()`,

  cpp: `// C++ (GCC)
#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Viết code tại đây
    
    return 0;
}`
};

// ======================
// 2. HELPER: XỬ LÝ HTML NỘI DUNG
// ======================
const processContent = (html) => {
    if (!html) return "";
    let content = html;
    // Xóa bớt các thẻ thừa nếu cần
    content = content.replace(/<h3>Ví dụ<\/h3>/gi, ""); 
    content = content.replace(/<strong>Ví dụ<\/strong>/gi, "");
    content = content.replace(/Ví dụ:/gi, ""); 
    return content;
};

// ======================
// 3. MAIN COMPONENT
// ======================
export default function PracticeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [problem, setProblem] = useState(null);
  const [history, setHistory] = useState([]);
  const [language, setLanguage] = useState("cpp"); // Mặc định C++ cho ngầu
  const [code, setCode] = useState(templates.cpp);
  
  const [loading, setLoading] = useState(false);       // Loading khi Submit/Run
  const [pageLoading, setPageLoading] = useState(true); // Loading khi tải trang
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("editor");

  const token = localStorage.getItem("accessToken");
  
  // Key để lưu nháp code vào localStorage (tránh F5 mất code mới gõ)
  const userIdentifier = token ? token.slice(-10) : "guest";
  const draftKey = `draft_${userIdentifier}_${id}_${language}`;

  // --- EFFECT 1: Load draft từ LocalStorage khi mới vào ---
  useEffect(() => {
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
        setCode(savedDraft);
    } else {
        setCode(templates[language]);
    }
  }, [draftKey, language]);

  // --- EFFECT 2: Tải dữ liệu bài tập & Lịch sử ---
  useEffect(() => {
    fetchProblem();
    fetchHistory();
    // eslint-disable-next-line
  }, [id]);

  // --- EFFECT 3: Tự động lưu nháp khi code thay đổi (Debounce 1s) ---
  useEffect(() => {
    const timer = setTimeout(() => localStorage.setItem(draftKey, code), 1000);
    return () => clearTimeout(timer);
  }, [code, draftKey]);


  // --- HÀM 1: Tải chi tiết bài tập (VÀ FILL CODE CŨ) ---
  const fetchProblem = async () => {
    try {
      if (!token) {
          navigate("/login");
          return;
      }
      const res = await axios.get(`http://localhost:5000/api/practice/problems/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProblem(res.data);

      // [QUAN TRỌNG] Logic tự động điền code cũ (User Code)
      if (res.data.user_code) {
          console.log("Found old submission code, filling editor...");
          setCode(res.data.user_code);
          // Nếu bạn muốn lưu luôn vào draft để F5 vẫn còn
          localStorage.setItem(draftKey, res.data.user_code);
      }

    } catch (err) {
      alert("Không tìm thấy bài tập hoặc phiên đăng nhập hết hạn.");
      navigate("/practice");
    } finally {
      setPageLoading(false);
    }
  };

  // --- HÀM 2: Tải lịch sử nộp bài ---
  const fetchHistory = async () => {
    try {
      if (!token) return;
      const res = await axios.get(`http://localhost:5000/api/practice/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
    } catch (err) { console.error(err); }
  };

  // --- HÀM 3: Xử lý Chạy thử / Nộp bài ---
  const handleRun = async (runOnly) => {
    setLoading(true);
    setResult(null);
    setActiveTab("editor"); // Chuyển tab về console để xem kết quả
    
    try {
      const res = await axios.post(`http://localhost:5000/api/practice/submit/${id}`, {
        language, 
        source: code, 
        runOnly
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setResult(res.data);
      
      // Nếu nộp thật (không phải runOnly) thì tải lại lịch sử
      if (!runOnly) fetchHistory();

    } catch (err) {
      alert(`Lỗi: ${err.response?.data?.message || "Mất kết nối server"}`);
    } finally { 
      setLoading(false); 
    }
  };

  // --- HÀM 4: Reset Code ---
  const handleResetCode = () => {
    if (window.confirm("Bạn có chắc muốn reset code về mặc định không?")) {
      setCode(templates[language]);
      localStorage.removeItem(draftKey);
    }
  };

  // --- RENDER LOADING PAGE ---
  if (pageLoading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500 w-8 h-8"/>
    </div>
  );

  // Kiểm tra xem kết quả trả về có phải thành công hoàn toàn không
  const isResultSuccess = result && (
      result.status === "Accepted" || 
      (result.status === "Test Run" && result.passed_cases === result.total_cases)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-6 px-4">
      <div className="max-w-[1600px] mx-auto grid lg:grid-cols-3 gap-6 h-[85vh]">
        
        {/* ================= LEFT PANEL: ĐỀ BÀI ================= */}
        <div className="lg:col-span-1 bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden shadow-xl">
          
          {/* Header Đề bài */}
          <div className="p-5 border-b border-slate-800 bg-slate-900/50">
            <button onClick={() => navigate('/practice')} className="text-xs text-gray-400 hover:text-white flex items-center gap-1 mb-3 transition">
              <ArrowLeft size={14} /> Danh sách bài tập
            </button>
            <div className="flex justify-between items-start gap-4">
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 leading-tight">
                {problem.title}
              </h1>
              {/* Badge Solved */}
              {problem.solved > 0 && (
                 <div className="flex items-center gap-1 bg-green-500/10 text-green-400 px-2 py-1 rounded border border-green-500/20 text-xs font-bold whitespace-nowrap">
                    <CheckCircle size={12} /> Solved
                 </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    problem.difficulty === 'Hard' ? 'bg-red-900/20 text-red-300 border-red-800' :
                    problem.difficulty === 'Medium' ? 'bg-yellow-900/20 text-yellow-300 border-yellow-800' : 
                    'bg-green-900/20 text-green-300 border-green-800'
                }`}>
                    {problem.difficulty}
                </span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-gray-400">
                    {problem.category || "Algorithm"}
                </span>
            </div>
          </div>

          {/* Nội dung Đề bài (Scrollable) */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
            
            {/* Render HTML đề bài (Fix lỗi dấu ` của tailwind typography) */}
            <div 
                className="prose prose-invert prose-sm max-w-none text-gray-300 
                           prose-code:before:content-none prose-code:after:content-none prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-purple-300"
                dangerouslySetInnerHTML={{ __html: processContent(problem.description || problem.content_html) }} 
            />

            {/* Test Case Mẫu */}
            <div>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Code size={14} className="text-purple-400"/> Test Case Mẫu
              </h3>
              <div className="space-y-4">
                {problem.testcases_public && problem.testcases_public.length > 0 ? (
                    problem.testcases_public.map((tc, idx) => (
                      <div key={idx} className="border border-slate-700 rounded-lg overflow-hidden bg-slate-950">
                        <div className="bg-slate-800/50 px-3 py-1.5 text-xs font-bold text-gray-400 border-b border-slate-700">Case #{idx + 1}</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-700">
                          <div className="p-3">
                            <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">Input</span>
                            <code className="text-sm font-mono text-white whitespace-pre-wrap block">{tc.input}</code>
                          </div>
                          <div className="p-3">
                            <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">Output</span>
                            <code className="text-sm font-mono text-green-400 whitespace-pre-wrap block">{tc.output}</code>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                    (problem.sample_input || problem.sample_output) && (
                        <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-950">
                            <div className="bg-slate-800/50 px-3 py-1.5 text-xs font-bold text-gray-400 border-b border-slate-700">Example</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-700">
                                <div className="p-3">
                                    <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">Input</span>
                                    <code className="text-sm font-mono text-white whitespace-pre-wrap block">{problem.sample_input}</code>
                                </div>
                                <div className="p-3">
                                    <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">Output</span>
                                    <code className="text-sm font-mono text-green-400 whitespace-pre-wrap block">{problem.sample_output}</code>
                                </div>
                            </div>
                        </div>
                    )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT PANEL: EDITOR & CONSOLE ================= */}
        <div className="lg:col-span-2 flex flex-col gap-4 h-full">
          
          {/* Editor Toolbar */}
          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 flex flex-wrap justify-between items-center gap-2 shadow-md">
            <div className="flex items-center gap-3">
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-slate-800 border border-slate-700 text-white text-sm rounded px-3 py-1.5 outline-none focus:border-purple-500 transition">
                    <option value="javascript">JavaScript (Node.js)</option>
                    <option value="python">Python 3</option>
                    <option value="cpp">C++ (GCC)</option>
                </select>
                <button onClick={handleResetCode} title="Reset Code" className="p-1.5 text-gray-400 hover:text-white hover:bg-slate-700 rounded transition"><RefreshCw size={16}/></button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleRun(true)} disabled={loading} className="flex items-center gap-2 px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm font-bold disabled:opacity-50 transition">
                {loading ? <Loader2 size={16} className="animate-spin"/> : <Play size={16}/>} Run
              </button>
              <button onClick={() => handleRun(false)} disabled={loading} className="flex items-center gap-2 px-5 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded text-sm font-bold disabled:opacity-50 shadow-lg shadow-green-900/20 transition">
                {loading ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>} Submit
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 bg-[#1e1e1e] rounded-xl border border-slate-800 overflow-hidden shadow-2xl relative group">
            <MonacoEditor 
                height="100%" 
                language={language === 'cpp' ? 'cpp' : language} 
                theme="vs-dark" 
                value={code} 
                onChange={setCode} 
                options={{ 
                    fontSize: 14, 
                    minimap: { enabled: false }, 
                    automaticLayout: true, 
                    padding: { top: 16 },
                    scrollBeyondLastLine: false,
                    fontFamily: "'JetBrains Mono', Consolas, monospace"
                }} 
            />
          </div>

          {/* Console / History Tabs */}
          <div className="h-[35%] bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden shadow-xl">
            <div className="flex border-b border-slate-800 bg-slate-950/30">
              <button onClick={() => setActiveTab("editor")} className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition ${activeTab === "editor" ? "border-purple-500 text-white bg-slate-800" : "border-transparent text-gray-500 hover:text-gray-300"}`}><Play size={14}/> Console</button>
              <button onClick={() => setActiveTab("history")} className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition ${activeTab === "history" ? "border-purple-500 text-white bg-slate-800" : "border-transparent text-gray-500 hover:text-gray-300"}`}><Clock size={14}/> Lịch sử nộp</button>
            </div>
            
            <div className="p-0 overflow-y-auto custom-scrollbar flex-1 bg-slate-900">
              
              {/* TAB 1: CONSOLE KẾT QUẢ */}
              {activeTab === "editor" && (
                <div className="p-4">
                  {!result && !loading && <div className="h-full py-10 flex flex-col items-center justify-center text-gray-600"><Play size={40} className="mb-2 opacity-50"/><p>Chạy code để xem kết quả kiểm thử</p></div>}
                  {loading && <div className="h-full py-10 flex flex-col items-center justify-center text-gray-400"><Loader2 size={32} className="animate-spin mb-2 text-purple-500"/><p>Đang chấm bài...</p></div>}
                  
                  {result && !loading && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {/* Banner Kết quả Tổng quan */}
                      <div className={`p-4 rounded-lg border flex justify-between items-center shadow-sm ${
                          isResultSuccess 
                          ? "bg-green-500/10 border-green-500/20 text-green-400" 
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}>
                        <div>
                            <h3 className="font-bold text-lg flex gap-2 items-center">
                                {isResultSuccess ? <CheckCircle size={20}/> : <XCircle size={20}/>} 
                                {result.status}
                            </h3>
                            <div className="text-sm opacity-80 mt-1 font-mono">
                                Passed: <span className="font-bold">{result.passed_cases}/{result.total_cases}</span> test cases
                            </div>
                        </div>
                        <div className="text-right text-xs opacity-70 font-mono space-y-1">
                            <div>Time: {result.time_taken}s</div>
                            <div>Mem: {result.memory_used}KB</div>
                        </div>
                      </div>

                      {/* Chi tiết từng Test Case */}
                      <div className="space-y-2">
                        {result.results.map((r, i) => (
                          <div key={i} className={`text-sm rounded border overflow-hidden transition ${r.ok ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                            <div className={`px-3 py-2 flex justify-between font-bold text-xs uppercase ${r.ok ? "text-green-500 bg-green-500/10" : "text-red-400 bg-red-500/10"}`}>
                              <span>Test #{i+1} {r.is_public ? "(Public)" : "(Hidden)"}</span>
                              <span>{r.status}</span>
                            </div>
                            
                            {/* Hiển thị lỗi biên dịch/runtime */}
                            {r.stderr && <div className="p-3 text-red-300 bg-slate-950 font-mono text-xs whitespace-pre-wrap border-t border-red-500/20">{r.stderr}</div>}
                            
                            {/* Hiển thị chi tiết Input/Output nếu sai và là test public */}
                            {(!r.ok && r.is_public) && (
                                <div className="p-3 bg-slate-950/50 grid grid-cols-2 gap-3 font-mono text-xs border-t border-red-500/10">
                                    <div className="col-span-2 md:col-span-1"><span className="text-gray-500 font-bold block mb-1">Input</span><code className="text-gray-300 bg-slate-900 p-1 rounded block">{r.input}</code></div>
                                    <div className="col-span-2 md:col-span-1"><span className="text-gray-500 font-bold block mb-1">Expected</span><code className="text-blue-300 bg-slate-900 p-1 rounded block">{r.expected}</code></div>
                                    <div className="col-span-2"><span className="text-gray-500 font-bold block mb-1">Your Output</span><code className="text-red-300 bg-slate-900 p-1 rounded block">{r.output}</code></div>
                                </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: LỊCH SỬ NỘP BÀI */}
              {activeTab === "history" && (
                <div className="p-2 space-y-2">
                  {history.length === 0 ? (
                      <div className="text-center py-10 text-gray-500 text-sm">Chưa có lịch sử nộp bài.</div>
                  ) : (
                      history.map((h, i) => (
                          <div key={i} className="flex justify-between items-center p-3 bg-slate-800/40 rounded border border-slate-800 hover:bg-slate-800 transition">
                             <div className="flex items-center gap-3">
                                 {h.status === "Accepted" ? <CheckCircle size={16} className="text-green-500"/> : <XCircle size={16} className="text-red-500"/>}
                                 <div>
                                     <div className={`font-bold text-sm ${h.status === "Accepted" ? "text-green-400" : "text-red-400"}`}>{h.status}</div>
                                     <div className="text-xs text-gray-500">{new Date(h.submitted_at).toLocaleString()}</div>
                                 </div>
                             </div>
                             <div className="text-right">
                                 <div className="text-xs font-mono font-bold text-gray-300">{h.passed_cases}/{h.total_cases} passed</div>
                                 <div className="text-[10px] text-gray-500">{h.time_taken}s</div>
                             </div>
                          </div>
                      ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}