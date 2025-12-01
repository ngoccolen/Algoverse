// src/components/lab/CodeChallenge.jsx
import React from 'react';
import { Terminal, PlayCircle, Loader2, CheckCircle, XCircle } from "lucide-react";

const CodeChallenge = ({ exercises, code, setCode, onSubmit, status, feedback }) => {
  if (!exercises?.length) return null;
  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
      <h3 className="text-xl font-bold flex items-center gap-2 mb-4"><Terminal className="text-green-400"/> Thử thách Code</h3>
      {exercises.map((ex) => (
        <div key={ex.id}>
            <div className="bg-slate-900 p-4 rounded mb-4 text-slate-300 text-sm border border-slate-700"><span className="text-yellow-500 font-bold">ĐỀ BÀI:</span> {ex.prompt}</div>
            <div className="h-80 bg-[#1e1e1e] rounded border border-slate-600 mb-4 overflow-hidden">
                <textarea className="w-full h-full bg-transparent p-4 text-[#d4d4d4] font-mono text-sm resize-none outline-none" value={code} onChange={e => setCode(e.target.value)} spellCheck="false"/>
            </div>
            <div className="flex flex-col gap-3">
                <button onClick={onSubmit} disabled={status==='submitting'} className="w-fit bg-green-600 hover:bg-green-700 px-6 py-2 rounded text-white font-bold flex gap-2 items-center">{status==='submitting' ? <Loader2 className="animate-spin"/> : <PlayCircle/>} Chấm Code</button>
                {feedback && (
                    <div className={`p-3 rounded border ${feedback.passed===feedback.total ? 'bg-green-900/20 border-green-800 text-green-300' : 'bg-red-900/20 border-red-800 text-red-300'}`}>
                        {feedback.passed===feedback.total ? <div className="flex gap-2 items-center"><CheckCircle/> Xuất sắc! 100/100</div> : <div className="flex gap-2 items-center"><XCircle/> Chưa đạt: {feedback.passed}/{feedback.total} test cases.</div>}
                    </div>
                )}
            </div>
        </div>
      ))}
    </div>
  );
};
export default CodeChallenge;