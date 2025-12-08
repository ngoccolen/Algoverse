import React from 'react';
import { CheckCircle, Check, X, Info, Send, RefreshCw, Loader2 } from "lucide-react";

const QuizSection = ({ questions, userAnswers, setUserAnswers, onSubmit, onRetry, status, score, resultDetails }) => {
  const isSubmitted = status === 'success';
  if (!questions?.length) return <div className="text-slate-500">Chưa có câu hỏi.</div>;

  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
      <div className="flex justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2"><CheckCircle className="text-purple-400"/> Trắc nghiệm</h3>
        {score !== null && (
          <div className="flex items-center gap-3">
             <span className={`px-3 py-1 rounded font-bold ${score >= 50 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>Điểm: {score}</span>
             {isSubmitted && <button onClick={onRetry} className="text-blue-400 text-sm flex gap-1"><RefreshCw size={14}/> Làm lại</button>}
          </div>
        )}
      </div>
      <div className="space-y-6">
        {questions.map((q, qIdx) => {
          const result = resultDetails[qIdx];
          return (
            <div key={q.id} className={`p-4 rounded-xl border ${isSubmitted && result?.isCorrect ? 'border-green-500/30 bg-green-900/10' : isSubmitted && !result?.isCorrect && result ? 'border-red-500/30 bg-red-900/10' : 'border-slate-700 bg-slate-900'}`}>
               <p className="font-medium mb-3 text-slate-200">Câu {qIdx+1}: {q.question}</p>
               <div className="space-y-2">
                 {q.options.map((opt, oIdx) => {
                    const isSelected = userAnswers[qIdx] === oIdx;
                    let style = "border-transparent hover:bg-slate-800";
                    if (isSubmitted) {
                        if (oIdx === result?.correctAnswer) style = "text-green-400 font-bold border-green-500/50 bg-green-500/10";
                        else if (isSelected && !result?.isCorrect) style = "text-red-400 line-through border-red-500/50 bg-red-500/10";
                        else style = "opacity-50";
                    } else if (isSelected) style = "text-purple-300 border-purple-500/50 bg-purple-500/10";
                    
                    return (
                        <label key={oIdx} className={`flex items-center gap-3 p-3 rounded border cursor-pointer ${style}`}>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-current' : 'border-slate-500'}`}>{isSelected && <div className="w-2 h-2 rounded-full bg-current"></div>}</div>
                            <input type="radio" className="hidden" disabled={isSubmitted} checked={isSelected} onChange={()=>!isSubmitted && setUserAnswers({...userAnswers, [qIdx]: oIdx})}/>
                            {opt}
                        </label>
                    )
                 })}
               </div>
               {isSubmitted && result?.explanation && <div className="mt-3 text-sm text-slate-400 bg-slate-950 p-3 rounded border-l-2 border-blue-500"><Info size={14} className="inline mr-1"/> {result.explanation}</div>}
            </div>
          );
        })}
      </div>
      {!isSubmitted && <button onClick={onSubmit} disabled={status==='submitting'} className="mt-6 bg-purple-600 px-6 py-2 rounded text-white font-bold flex gap-2">{status==='submitting' ? <Loader2 className="animate-spin"/> : <Send/>} Nộp bài</button>}
    </div>
  );
};
export default QuizSection;