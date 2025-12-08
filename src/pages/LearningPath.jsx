import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Lock, 
  PlayCircle, 
  ArrowLeft, 
  Trophy,
  Star
} from 'lucide-react';
import Footer from '../components/Footer/Footer'; // [ĐÃ THÊM] Import Footer

export default function LearningPath() {
  const { categoryId } = useParams(); 
  const navigate = useNavigate();
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryTitle, setCategoryTitle] = useState("");

  const CATEGORY_NAMES = {
    sorting: "Thuật toán Sắp xếp",
    search: "Thuật toán Tìm kiếm",
    graph: "Lý thuyết Đồ thị",
    tree: "Cấu trúc Cây",
    dp: "Quy hoạch động",
    greedy: "Thuật toán Tham lam"
  };

  useEffect(() => {
    const fetchPath = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};

        const res = await fetch("http://localhost:5000/api/algorithms", { headers });
        const data = await res.json();

        if (data.success) {
          const allAlgos = data.data;

          const filteredAlgos = allAlgos.filter(
            a => a.category && a.category.toLowerCase() === categoryId.toLowerCase()
          );

          setCategoryTitle(CATEGORY_NAMES[categoryId] || categoryId);

          const level1 = filteredAlgos.filter(a => a.difficulty === 'Easy');
          const level2 = filteredAlgos.filter(a => a.difficulty === 'Medium');
          const level3 = filteredAlgos.filter(a => a.difficulty === 'Hard');

          let previousCompleted = true; 

          const processLevel = (algos) => {
            return algos.map(algo => {
              const rawProgress = algo.progress || 0;
              const progress = Math.round(rawProgress);
              
              const isLocked = !previousCompleted;

              if (progress < 100) {
                previousCompleted = false;
              } else {
                previousCompleted = true; 
              }

              return { ...algo, isLocked, progress };
            });
          };

          const pathData = [
            {
              id: "l1",
              title: "Level 1: Nhập môn & Cơ bản",
              description: "Làm quen với các khái niệm nền tảng và thuật toán đơn giản.",
              algorithms: processLevel(level1)
            },
            {
              id: "l2",
              title: "Level 2: Trung cấp & Tối ưu",
              description: "Các thuật toán phức tạp hơn, sử dụng đệ quy hoặc chia để trị.",
              algorithms: processLevel(level2)
            },
            {
              id: "l3",
              title: "Level 3: Nâng cao & Ứng dụng",
              description: "Giải quyết các bài toán khó với hiệu suất cao nhất.",
              algorithms: processLevel(level3)
            }
          ];

          setLevels(pathData.filter(l => l.algorithms.length > 0));
        }
      } catch (err) {
        console.error("Lỗi tải lộ trình:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPath();
  }, [categoryId]);

  const handleNavigate = (algKey, isLocked) => {
    if (isLocked) return;
    navigate(`/lab/${algKey}`);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">
      Đang tải lộ trình học...
    </div>
  );

  return (
    // [CẬP NHẬT LAYOUT]: Thêm flex-col để đẩy footer xuống dưới cùng
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col">
      
      {/* Wrapper nội dung chính (flex-grow để chiếm hết khoảng trống) */}
      <div className="flex-grow pt-20 pb-20">
        
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 py-8 px-4 relative shadow-xl">
          <div className="max-w-4xl mx-auto">
            <button 
              onClick={() => navigate('/explore')} 
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft size={20} /> Quay lại Khám phá
            </button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  {categoryTitle}
                </h1>
                <p className="text-slate-400 mt-2 text-sm">Hoàn thành từng bài học để mở khóa cấp độ tiếp theo.</p>
              </div>
              <div className="hidden md:block">
                 <Trophy size={48} className="text-yellow-500 opacity-80" />
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="max-w-4xl mx-auto px-4 py-10 space-y-12">
          {levels.length === 0 ? (
            <div className="text-center text-slate-500 py-10">
              Chưa có bài học nào trong mục này.
            </div>
          ) : (
            levels.map((level, lvlIdx) => (
              <div key={level.id} className="relative pl-8 md:pl-0">
                
                {/* Level Connector Line */}
                <div className="hidden md:block absolute left-8 top-14 bottom-0 w-0.5 bg-slate-700 -z-10"></div>

                {/* Level Title */}
                <div className="mb-6 relative">
                   <div className="hidden md:flex absolute -left-10 top-1 w-8 h-8 rounded-full bg-slate-800 border-2 border-blue-500 items-center justify-center font-bold text-sm text-blue-400 z-10">
                      {lvlIdx + 1}
                   </div>
                   <h2 className="text-2xl font-bold text-white">{level.title}</h2>
                   <p className="text-slate-400 text-sm">{level.description}</p>
                </div>

                {/* Grid of Algorithms */}
                <div className="grid gap-4">
                  {level.algorithms.map((algo) => (
                    <motion.div
                      key={algo.id}
                      whileHover={!algo.isLocked ? { scale: 1.01, x: 4 } : {}}
                      onClick={() => handleNavigate(algo.alg_key, algo.isLocked)}
                      className={`
                        relative flex items-center p-4 rounded-xl border transition-all duration-300 group overflow-hidden
                        ${algo.isLocked 
                          ? 'bg-slate-800/40 border-slate-800 opacity-50 cursor-not-allowed grayscale' 
                          : 'bg-slate-800 border-slate-700 hover:border-blue-500 hover:shadow-lg cursor-pointer'
                        }
                      `}
                    >
                      {/* Background Progress Effect */}
                      {!algo.isLocked && algo.progress > 0 && (
                          <div 
                              className="absolute left-0 top-0 bottom-0 bg-blue-500/10 z-0 transition-all duration-1000" 
                              style={{width: `${algo.progress}%`}}
                          ></div>
                      )}

                      {/* Icon Status */}
                      <div className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0 bg-slate-900 border border-slate-700">
                        {algo.progress >= 100 ? (
                            <CheckCircle size={24} className="text-green-400" />
                        ) : algo.isLocked ? (
                            <Lock size={24} className="text-slate-500" />
                        ) : (
                            <div className="relative flex items-center justify-center">
                                <svg className="absolute w-full h-full -rotate-90 scale-125" viewBox="0 0 36 36">
                                    <path className="text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" />
                                    <path className="text-blue-500" strokeDasharray={`${algo.progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                <PlayCircle size={20} className="text-blue-400" />
                            </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 relative z-10">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-bold truncate pr-4 group-hover:text-blue-400 transition-colors">
                              {algo.name}
                          </h3>
                          {!algo.isLocked && (
                              <span className={`text-xs font-bold px-2 py-1 rounded ${algo.progress === 100 ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                  {algo.progress}%
                              </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                          <span className={`px-2 py-0.5 rounded border ${
                               algo.difficulty === 'Easy' ? 'border-green-800 text-green-500' : 
                               algo.difficulty === 'Medium' ? 'border-yellow-800 text-yellow-500' : 'border-red-800 text-red-500'
                          }`}>
                              {algo.difficulty}
                          </span>
                          <span className="flex items-center gap-1">
                              <Star size={12} className="text-yellow-500"/> {algo.complexity}
                          </span>
                        </div>
                        
                        {/* Thanh tiến độ ngang */}
                        {!algo.isLocked && (
                            <div className="mt-3 w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-1000 ${algo.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                  style={{ width: `${algo.progress}%` }}
                                ></div>
                            </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* [ĐÃ THÊM] Footer ở cuối trang */}
      <Footer />
    </div>
  );
}