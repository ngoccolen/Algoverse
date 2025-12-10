import React, { useEffect } from 'react';

import { Terminal, PlayCircle, Loader2, CheckCircle, XCircle, AlertTriangle, ChevronDown } from "lucide-react";

// Cấu hình danh sách ngôn ngữ 
const LANGUAGES = [
    { 
        id: 54, 
        name: "C++ (GCC 9.2)", 
        template: "// Viết hàm xử lý \nvoid bubbleSort(vector<int>& arr) {\n    // Code C++ của bạn...\n}" 
    },
    { 
        id: 71, 
        name: "Python (3.8)",  
        template: "# Viết hàm xử lý \ndef bubbleSort(arr):\n    # Code Python của bạn...\n    pass" 
    },
    { 
        id: 62, 
        name: "Java (OpenJDK)", 
        template: "// Viết phương thức tĩnh bên trong class \nclass Solution {\n    public static void bubbleSort(int[] arr) {\n        // Code Java của bạn...\n    }\n}" 
    }
];

const CodeChallenge = ({ exercises, code, setCode, onSubmit, status, feedback, languageId, setLanguageId }) => {
  
  // Xử lý khi người dùng đổi ngôn ngữ
  const handleLangChange = (id) => {
      setLanguageId(id);
      const lang = LANGUAGES.find(l => l.id === id);
      if (lang) {
          setCode(lang.template);
      }
  };

  useEffect(() => {
     if (!code && LANGUAGES.length > 0) {
         handleLangChange(LANGUAGES[0].id);
     }
  }, []);

  if (!exercises?.length) return null;

  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
      <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2 text-white">
            <Terminal className="text-green-400"/> Thử thách Code
          </h3>
          
          <div className="relative group">
              <select 
                value={languageId} 
                onChange={(e) => handleLangChange(Number(e.target.value))}
                className="appearance-none bg-slate-900 text-slate-300 border border-slate-600 px-4 py-2 pr-10 rounded-lg font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer hover:bg-slate-700 transition"
              >
                  {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"/>
          </div>
      </div>
      
      {exercises.map((ex) => (
        <div key={ex.id}>
            <div className="bg-slate-900/60 p-4 rounded-lg mb-4 border border-slate-700/50 backdrop-blur-sm">
                <div className="text-slate-200 text-sm mb-3 leading-relaxed">
                    <span className="text-yellow-500 font-bold tracking-wide">ĐỀ BÀI: </span> {ex.prompt}
                </div>
                
            </div>

            <div className="h-96 bg-[#1e1e1e] rounded-lg border border-slate-600 mb-5 overflow-hidden relative shadow-inner group focus-within:border-blue-500 transition-colors">
                <div className="absolute left-0 top-0 bottom-0 w-10 bg-[#252526] border-r border-[#3e3e42] flex flex-col items-center pt-4 text-slate-600 text-xs font-mono select-none pointer-events-none">
                    {Array.from({length: 20}).map((_, i) => <div key={i} className="leading-6">{i+1}</div>)}
                </div>

                <textarea 
                    className="w-full h-full bg-transparent pl-12 pr-4 py-4 text-[#d4d4d4] font-mono text-sm resize-none outline-none leading-6" 
                    value={code} 
                    onChange={e => setCode(e.target.value)} 
                    spellCheck="false"
                    placeholder="// Viết code giải thuật của bạn ở đây..."
                />
            </div>

            <div className="flex flex-col gap-4">
                {/* Nút Submit */}
                <button 
                    onClick={onSubmit} 
                    disabled={status === 'submitting'} 
                    className={`w-fit px-8 py-2.5 rounded-lg font-bold flex gap-2 items-center transition shadow-lg transform active:scale-95
                        ${status === 'submitting' 
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                            : 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/20'}`}
                >
                    {status === 'submitting' ? <Loader2 className="animate-spin" size={20}/> : <PlayCircle size={20}/>} 
                    {status === 'submitting' ? 'Đang chấm bài...' : 'Chạy thử Code'}
                </button>

                {feedback && (
                    <div className={`rounded-lg border overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 shadow-md
                        ${feedback.success ? 'bg-green-950/30 border-green-800' : 'bg-red-950/30 border-red-800'}`
                    }>
                        <div className={`px-4 py-3 font-bold flex items-center gap-3 border-b 
                            ${feedback.success ? 'text-green-400 border-green-800/50' : 'text-red-400 border-red-800/50'}`}>
                            {feedback.success ? <CheckCircle size={22}/> : <XCircle size={22}/>}
                            <span>{feedback.message}</span>
                            
                            {/* Điểm số */}
                            {feedback.score !== undefined && (
                                <span className="ml-auto text-xs font-mono px-2 py-1 rounded bg-black/20 border border-white/10">
                                    Score: {feedback.score}/100
                                </span>
                            )}
                        </div>
                        
                        {feedback.details && (
                            <div className="bg-[#0c0c0c] p-4 max-h-64 overflow-y-auto">
                                <div className="text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-wider">Compiler / Runtime Output:</div>
                                <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap break-words leading-relaxed">
                                    {feedback.details}
                                </pre>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      ))}
    </div>
  );
};

export default CodeChallenge;