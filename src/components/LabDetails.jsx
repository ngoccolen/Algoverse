// src/pages/LabDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from 'react-markdown'; 
import { Activity, RotateCcw, ArrowLeft, Loader2, Lock, Copy } from "lucide-react";
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; 

// --- IMPORT CÁC MODULE ĐÃ TÁCH ---
import AlgorithmVisualizer from "../components/visualization";
import QuizSection from "../components/lab/QuizSection";
import CodeChallenge from "../components/lab/CodeChallenge";
import { getAlgoResource } from "../data/algorithmData"; 

export default function LabDetail() {
  const { algKey } = useParams();
  const navigate = useNavigate();
  const resources = getAlgoResource(algKey); // Lấy data tĩnh
  
  const [algorithm, setAlgorithm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [activeTab, setActiveTab] = useState("Lý thuyết");

  const [simulationData, setSimulationData] = useState([64, 34, 25, 12, 22, 11, 90]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sampleLang, setSampleLang] = useState('cpp');

  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizStatus, setQuizStatus] = useState(null);
  const [quizScore, setQuizScore] = useState(null);
  const [quizDetails, setQuizDetails] = useState([]);

  const [userCode, setUserCode] = useState("");
  const [codeStatus, setCodeStatus] = useState(null);
  const [codeFeedback, setCodeFeedback] = useState(null);

  // 1. Fetch API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`http://localhost:5000/api/algorithms/${algKey}`, {
            headers: token ? { "Authorization": `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (data.success) {
            if (data.data.isLocked) { setIsLocked(true); return; }
            setAlgorithm(data.data);
            setUserCode(resources.starterCode['cpp']); // Load code khởi tạo
            if (data.data.user_details) {
                setQuizScore(data.data.user_details.questions);
                if (data.data.user_details.exercises > 0) setCodeFeedback({ score: data.data.user_details.exercises, passed: 0, total: 0 });
            }
        } else setError(data.message);
      } catch (e) { setError("Lỗi kết nối"); } finally { setLoading(false); }
    };
    fetchData();
  }, [algKey]);

  // 2. Logic Submit (Giữ nguyên logic cũ)
  const handleSubmitQuiz = async () => { /* Logic gọi API submit quiz... */ };
  const handleRetryQuiz = () => { setQuizStatus(null); setQuizDetails([]); };
  const handleSubmitCode = async () => { /* Logic gọi API submit code... */ };

  if (loading) return <Loader2 className="animate-spin mx-auto mt-20 text-white"/>;
  if (isLocked) return <div className="text-white text-center mt-20">Bài học bị khóa. <button onClick={()=>navigate(-1)} className="text-blue-500 underline">Quay lại</button></div>;
  if (error) return <div className="text-red-500 text-center mt-20">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-20 pb-10">
      <div className="sticky top-[64px] z-30 bg-slate-900/80 backdrop-blur border-b border-slate-800 mb-8">
         <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-4">
               <button onClick={()=>navigate(-1)} className="hover:bg-slate-800 p-2 rounded-full"><ArrowLeft/></button>
               <h1 className="font-bold text-xl">{algorithm.name}</h1>
            </div>
            <div className="bg-slate-800 p-1 rounded-lg flex">
               {["Lý thuyết", "Mô phỏng", "Bài tập"].map(tab => (
                  <button key={tab} onClick={()=>setActiveTab(tab)} className={`px-4 py-1.5 rounded text-sm ${activeTab===tab ? 'bg-blue-600' : 'text-slate-400'}`}>{tab}</button>
               ))}
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {activeTab === "Lý thuyết" && (
           <div className="prose prose-invert max-w-none bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{algorithm.theory}</ReactMarkdown>
           </div>
        )}

        {activeTab === "Mô phỏng" && (
           <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
              <div className="flex-1 bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col">
                  <div className="flex justify-between mb-4">
                      <h3 className="font-bold flex gap-2"><Activity/> Visualizer</h3>
                      <div className="flex gap-2">
                        <button onClick={()=>setIsPlaying(!isPlaying)} className="bg-blue-600 px-4 py-1 rounded text-sm font-bold">{isPlaying ? 'Stop' : 'Run'}</button>
                        <button onClick={()=>{setIsPlaying(false); setSimulationData([...simulationData])}} className="bg-slate-800 p-2 rounded"><RotateCcw size={16}/></button>
                      </div>
                  </div>
                  <div className="flex-1 border border-slate-800/50 rounded-xl overflow-hidden mb-4 bg-slate-950/50 relative flex items-center justify-center">
                      <AlgorithmVisualizer algKey={algKey} isPlaying={isPlaying} data={simulationData} onFinish={()=>setIsPlaying(false)}/>
                  </div>
              </div>
              <div className="lg:w-[500px] bg-[#1e1e1e] rounded-2xl border border-slate-800 flex flex-col">
                  <div className="bg-[#252526] px-4 py-2 border-b border-black/40 flex justify-between items-center">
                      <div className="flex gap-2">
                          {['cpp', 'java', 'python'].map(l => (
                              <button key={l} onClick={()=>setSampleLang(l)} className={`uppercase text-xs font-bold px-2 py-1 rounded ${sampleLang===l ? 'bg-blue-600' : 'text-slate-500'}`}>{l}</button>
                          ))}
                      </div>
                      <Copy size={16} className="cursor-pointer text-slate-500 hover:text-white" onClick={()=>navigator.clipboard.writeText(resources.sampleCode[sampleLang])}/>
                  </div>
                  <textarea readOnly value={resources.sampleCode[sampleLang]} className="flex-1 bg-transparent p-4 font-mono text-sm text-[#d4d4d4] resize-none outline-none"/>
              </div>
           </div>
        )}

        {activeTab === "Bài tập" && (
           <div className="space-y-8">
              <QuizSection questions={algorithm.Questions} userAnswers={quizAnswers} setUserAnswers={setQuizAnswers} onSubmit={handleSubmitQuiz} onRetry={handleRetryQuiz} status={quizStatus} score={quizScore} resultDetails={quizDetails} />
              <CodeChallenge exercises={algorithm.Exercises} code={userCode} setCode={setUserCode} onSubmit={handleSubmitCode} status={codeStatus} feedback={codeFeedback} />
           </div>
        )}
      </div>
    </div>
  );
}