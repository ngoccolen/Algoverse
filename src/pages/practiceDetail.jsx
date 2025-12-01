import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MonacoEditor from "@monaco-editor/react";
import axios from "axios";
import { 
  Play, Loader2, Send, Clock, Database, ArrowLeft, RefreshCw, CheckCircle, XCircle 
} from "lucide-react";

// ======================
// 1. CODE TEMPLATES
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
// 2. MAIN COMPONENT
// ======================
export default function PracticeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [history, setHistory] = useState([]);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(templates.javascript);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("editor");

  const draftKey = `draft_${id}_${language}`;

  useEffect(() => {
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) setCode(savedDraft);
    else setCode(templates[language]);
    fetchProblem();
    fetchHistory();
  }, [id, language]);

  useEffect(() => {
    const timer = setTimeout(() => localStorage.setItem(draftKey, code), 1000);
    return () => clearTimeout(timer);
  }, [code, draftKey]);

  const fetchProblem = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`http://localhost:5000/api/practice/problems/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProblem(res.data);
    } catch (err) {
      alert("Không tìm thấy bài tập.");
      navigate("/practice");
    } finally {
      setPageLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`http://localhost:5000/api/practice/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
    } catch (err) { console.error(err); }
  };

  const handleRun = async (runOnly) => {
    setLoading(true);
    setResult(null);
    setActiveTab("editor");
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.post(`http://localhost:5000/api/practice/submit/${id}`, {
        language, source: code, runOnly
      }, { headers: { Authorization: `Bearer ${token}` } });
      setResult(res.data);
      if (!runOnly) fetchHistory();
    } catch (err) {
      alert(`Lỗi: ${err.response?.data?.message || "Mất kết nối server"}`);
    } finally { setLoading(false); }
  };

  const handleResetCode = () => {
    if (window.confirm("Reset code về mặc định?")) {
      setCode(templates[language]);
      localStorage.removeItem(draftKey);
    }
  };

  if (pageLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-purple-500 w-8 h-8"/></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-20 pb-6 px-4">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-3 gap-6 h-[88vh]">
        
        {/* --- LEFT PANEL --- */}
        <div className="lg:col-span-1 bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-800 bg-slate-900/50">
            <button onClick={() => navigate('/practice')} className="text-xs text-gray-400 hover:text-white flex items-center gap-1 mb-3">
              <ArrowLeft size={14} /> Danh sách bài tập
            </button>
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{problem.title}</h1>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                problem.difficulty === 'Hard' ? 'bg-red-900 text-red-200' :
                problem.difficulty === 'Medium' ? 'bg-yellow-900 text-yellow-200' : 'bg-green-900 text-green-200'
              }`}>{problem.difficulty}</span>
            </div>
            <div className="mt-2 text-xs text-gray-500 bg-slate-800 px-2 py-1 rounded w-fit">Category: {problem.category || "General"}</div>
          </div>

          <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-6">
            <div 
                className="prose prose-invert prose-sm max-w-none text-gray-300"
                dangerouslySetInnerHTML={{ __html: problem.description || problem.content_html }} 
            />

            {/* --- PHẦN HIỂN THỊ TEST CASE (ĐÃ SỬA) --- */}
            <div>
              <h3 className="text-sm font-bold text-white mb-3">Test Case Mẫu</h3>
              <div className="space-y-4">
                {/* Trường hợp 1: Nếu API trả về mảng test cases (Database nâng cao) */}
                {problem.testcases_public && problem.testcases_public.length > 0 ? (
                    problem.testcases_public.map((tc, idx) => (
                      <div key={idx} className="border border-slate-700 rounded-lg overflow-hidden">
                        <div className="bg-slate-800 px-3 py-1.5 text-xs font-bold text-gray-400 border-b border-slate-700">Test Case #{idx + 1}</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-700 bg-slate-950">
                          <div className="p-3">
                            <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">Input</span>
                            <code className="text-sm font-mono text-white whitespace-pre-wrap">{tc.input}</code>
                          </div>
                          <div className="p-3">
                            <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">Output</span>
                            <code className="text-sm font-mono text-green-400 whitespace-pre-wrap">{tc.output}</code>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                    // Trường hợp 2: Nếu API chỉ trả về sample_input và sample_output đơn lẻ (Database hiện tại)
                    (problem.sample_input || problem.sample_output) && (
                        <div className="border border-slate-700 rounded-lg overflow-hidden">
                            <div className="bg-slate-800 px-3 py-1.5 text-xs font-bold text-gray-400 border-b border-slate-700">Test Case #1</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-700 bg-slate-950">
                            <div className="p-3">
                                <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">Input</span>
                                <code className="text-sm font-mono text-white whitespace-pre-wrap">{problem.sample_input}</code>
                            </div>
                            <div className="p-3">
                                <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">Output</span>
                                <code className="text-sm font-mono text-green-400 whitespace-pre-wrap">{problem.sample_output}</code>
                            </div>
                            </div>
                        </div>
                    )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT PANEL (EDITOR) --- */}
        <div className="lg:col-span-2 flex flex-col gap-4 h-full">
          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-3">
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-slate-800 border border-slate-700 text-white text-sm rounded px-3 py-1.5 outline-none focus:border-purple-500">
                    <option value="javascript">JavaScript (Node.js)</option>
                    <option value="python">Python 3</option>
                    <option value="cpp">C++ (GCC)</option>
                </select>
                <button onClick={handleResetCode} title="Reset" className="p-1.5 text-gray-400 hover:text-white hover:bg-slate-700 rounded"><RefreshCw size={16}/></button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleRun(true)} disabled={loading} className="flex items-center gap-2 px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm font-bold disabled:opacity-50">
                {loading ? <Loader2 size={16} className="animate-spin"/> : <Play size={16}/>} Run
              </button>
              <button onClick={() => handleRun(false)} disabled={loading} className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded text-sm font-bold disabled:opacity-50 shadow-lg shadow-green-900/20">
                {loading ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>} Submit
              </button>
            </div>
          </div>

          <div className="flex-1 bg-[#1e1e1e] rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
            <MonacoEditor height="100%" language={language==='cpp'?'cpp':language} theme="vs-dark" value={code} onChange={setCode} options={{ fontSize: 14, minimap: { enabled: false }, automaticLayout: true, padding: { top: 16 } }} />
          </div>

          <div className="h-[35%] bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden">
            <div className="flex border-b border-slate-800 bg-slate-950/30">
              <button onClick={() => setActiveTab("editor")} className={`px-5 py-2.5 text-sm font-medium flex items-center gap-2 border-b-2 ${activeTab === "editor" ? "border-purple-500 text-white bg-slate-800" : "border-transparent text-gray-500 hover:text-gray-300"}`}><Play size={14}/> Console</button>
              <button onClick={() => setActiveTab("history")} className={`px-5 py-2.5 text-sm font-medium flex items-center gap-2 border-b-2 ${activeTab === "history" ? "border-purple-500 text-white bg-slate-800" : "border-transparent text-gray-500 hover:text-gray-300"}`}><Clock size={14}/> History</button>
            </div>
            
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1 bg-slate-900">
              {activeTab === "editor" && (
                <>
                  {!result && !loading && <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60"><Play size={48} className="mb-2"/><p>Chạy code để xem kết quả</p></div>}
                  {loading && <div className="h-full flex flex-col items-center justify-center text-gray-400"><Loader2 size={32} className="animate-spin mb-2 text-purple-500"/><p>Đang chấm bài...</p></div>}
                  {result && !loading && (
                    <div className="space-y-4">
                      <div className={`p-4 rounded border flex justify-between items-center ${result.status === "Accepted" ? "bg-green-900/20 border-green-800/50 text-green-400" : "bg-red-900/20 border-red-800/50 text-red-400"}`}>
                        <div><h3 className="font-bold text-lg flex gap-2 items-center">{result.status === "Accepted" ? <CheckCircle/> : <XCircle/>} {result.status}</h3><div className="text-sm opacity-80 mt-1">Passed: {result.passed_cases}/{result.total_cases}</div></div>
                        <div className="text-right text-sm opacity-80"><div>{result.time_taken}s</div><div>{result.memory_used}KB</div></div>
                      </div>
                      <div className="space-y-2">
                        {result.results.map((r, i) => (
                          <div key={i} className={`text-sm rounded border overflow-hidden ${r.ok ? "border-green-900/30 bg-green-900/5" : "border-red-900/30 bg-red-900/5"}`}>
                            <div className={`px-3 py-2 flex justify-between font-medium ${r.ok ? "text-green-400 bg-green-900/10" : "text-red-400 bg-red-900/10"}`}>
                              <span>Test #{i+1} {r.is_public ? "(Public)" : "(Hidden)"}</span><span>{r.status}</span>
                            </div>
                            {r.stderr && <div className="p-2 text-red-300 bg-red-950/30 font-mono text-xs whitespace-pre-wrap">{r.stderr}</div>}
                            {(!r.ok && r.is_public) && (
                                <div className="p-3 bg-slate-950/50 grid grid-cols-2 gap-2 font-mono text-xs">
                                    <div><span className="text-gray-500 font-bold block">Input</span><code className="text-gray-300">{r.input}</code></div>
                                    <div><span className="text-gray-500 font-bold block">Expected</span><code className="text-blue-300">{r.expected}</code></div>
                                    <div className="col-span-2"><span className="text-gray-500 font-bold block">Your Output</span><code className="text-red-300">{r.output}</code></div>
                                </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              {activeTab === "history" && (
                <div className="space-y-2">
                  {history.map((h, i) => (
                      <div key={i} className="flex justify-between p-3 bg-slate-800/50 rounded border border-slate-800 hover:bg-slate-800">
                         <div className={`font-bold text-sm ${h.status === "Accepted" ? "text-green-400" : "text-red-400"}`}>{h.status} <span className="text-gray-500 text-xs font-normal ml-2">{new Date(h.submitted_at).toLocaleString()}</span></div>
                         <div className="text-xs text-gray-400 font-mono">{h.passed_cases}/{h.total_cases} cases</div>
                      </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}