// pages/Explore.jsx
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { 
  Search, 
  GitBranch, 
  Database, 
  Share2, 
  Layers, 
  Cpu, 
  ArrowRight, 
  Zap,
  Code2,
  Hash,
  Terminal,
  Activity
} from 'lucide-react';

// --- HÀM TIỆN ÍCH: Xử lý tiếng Việt ---
// Chuyển đổi chuỗi tiếng Việt có dấu thành không dấu để tìm kiếm chính xác
const removeVietnameseTones = (str) => {
  if (!str) return "";
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  // Loại bỏ các dấu thanh/ký tự đặc biệt còn sót lại
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
  return str;
};

// --- Dữ liệu Chủ đề (Categories) ---
const TOPICS = [
  {
    id: "sorting",
    title: "Thuật toán Sắp xếp",
    description: "Bubble Sort, Quick Sort, Merge Sort... Nền tảng tư duy tối ưu hóa dữ liệu.",
    icon: Activity,
    count: "8 Bài học",
    level: "Cơ bản",
    color: "from-blue-500 to-cyan-500",
    path: "/path/sorting"
  },
  {
    id: "search",
    title: "Thuật toán Tìm kiếm",
    description: "Binary Search, Linear Search. Kỹ thuật truy vết dữ liệu siêu tốc.",
    icon: Search,
    count: "5 Bài học",
    level: "Cơ bản",
    color: "from-purple-500 to-pink-500",
    path: "/path/search"
  },
  {
    id: "graph",
    title: "Đồ thị (Graph)",
    description: "BFS, DFS, Dijkstra. Giải quyết bài toán đường đi ngắn nhất và mạng lưới.",
    icon: Share2,
    count: "12 Bài học",
    level: "Nâng cao",
    color: "from-orange-500 to-red-500",
    path: "/path/graph"
  },
  {
    id: "tree",
    title: "Cấu trúc Cây (Tree)",
    description: "Binary Tree, AVL, Heap. Cấu trúc dữ liệu phân cấp quan trọng nhất.",
    icon: GitBranch,
    count: "10 Bài học",
    level: "Trung cấp",
    color: "from-green-500 to-emerald-500",
    path: "/path/tree"
  },
  {
    id: "dp",
    title: "Quy hoạch động",
    description: "Dynamic Programming. Kỹ thuật chia nhỏ bài toán để tối ưu hiệu suất.",
    icon: Layers,
    count: "15 Bài học",
    level: "Khó",
    color: "from-indigo-500 to-violet-500",
    path: "/path/dp"
  },
  {
    id: "greedy",
    title: "Tham lam (Greedy)",
    description: "Chọn phương án tốt nhất ở hiện tại. Ứng dụng trong nén dữ liệu, lập lịch.",
    icon: Zap,
    count: "6 Bài học",
    level: "Trung cấp",
    color: "from-yellow-400 to-orange-500",
    path: "/path/greedy"
  },
  {
    id: "string",
    title: "Xử lý Chuỗi",
    description: "KMP, Rabin-Karp, Z-Algo. Các thuật toán xử lý văn bản chuyên sâu.",
    icon: Terminal,
    count: "7 Bài học",
    level: "Trung cấp",
    color: "from-pink-500 to-rose-500",
    path: "/path/string"
  },
  {
    id: "math",
    title: "Toán học & Số học",
    description: "Sàng nguyên tố, GCD, Modulo. Nền tảng toán học cho lập trình viên.",
    icon: Hash,
    count: "9 Bài học",
    level: "Cơ bản",
    color: "from-teal-400 to-blue-500",
    path: "/path/math"
  },
  {
    id: "datastruct",
    title: "CTDL Nâng cao",
    description: "Segment Tree, Fenwick Tree, Trie. Vũ khí hạng nặng cho Competitive Programming.",
    icon: Database,
    count: "11 Bài học",
    level: "Chuyên sâu",
    color: "from-slate-500 to-slate-300",
    path: "/path/datastruct"
  }
];

// --- Animations ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Explore() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // --- LOGIC TÌM KIẾM ---
  // Sử dụng useMemo để tối ưu, lọc dựa trên chuỗi đã được loại bỏ dấu
  const filteredTopics = useMemo(() => {
    const normalizedSearch = removeVietnameseTones(searchTerm.trim());

    if (!normalizedSearch) return TOPICS;

    return TOPICS.filter(topic => {
      const normalizedTitle = removeVietnameseTones(topic.title);
      const normalizedDesc = removeVietnameseTones(topic.description);
      
      return normalizedTitle.includes(normalizedSearch) || 
             normalizedDesc.includes(normalizedSearch);
    });
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-sans flex flex-col">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <div className="relative pt-32 pb-16 px-6 border-b border-slate-800 bg-[#0F172A] overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="container mx-auto text-center relative z-10 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-slate-800/50 border border-slate-700 rounded-full px-4 py-1.5 mb-6 backdrop-blur-md"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-sm font-medium text-slate-300">Thư viện thuật toán toàn diện</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6"
          >
            Khám phá <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Tri thức Số</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Hơn 100+ thuật toán và cấu trúc dữ liệu được phân loại chi tiết. 
            Chọn một chủ đề để bắt đầu hành trình chinh phục đỉnh cao lập trình.
          </motion.p>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-xl mx-auto group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
            <div className="relative flex items-center bg-slate-900 rounded-xl border border-slate-700 shadow-2xl overflow-hidden">
              <div className="pl-4 text-slate-500">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm chủ đề (VD: Quy hoạch động, Đồ thị...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-white px-4 py-4 focus:outline-none placeholder-slate-500"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- GRID TOPICS SECTION --- */}
      <main className="flex-grow py-16 px-6 bg-slate-950/50">
        <div className="container mx-auto max-w-7xl">
          
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Cpu className="w-6 h-6 text-blue-500" />
              Chủ đề nổi bật
            </h2>
            <span className="text-sm text-slate-500 font-mono">
              Hiển thị {filteredTopics.length} kết quả
            </span>
          </div>

          {/* QUAN TRỌNG: Thêm key để reset animation khi search thay đổi */}
          <motion.div 
            key={searchTerm + filteredTopics.length}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredTopics.length > 0 ? (
              filteredTopics.map((topic) => {
                const IconComponent = topic.icon;
                
                return (
                  <motion.div
                    key={topic.id}
                    variants={itemVariants}
                    whileHover={{ y: -8, scale: 1.01 }}
                    onClick={() => navigate(topic.path)}
                    className="group relative bg-slate-900 rounded-2xl p-1 cursor-pointer"
                  >
                    {/* Gradient Border Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${topic.color} opacity-0 group-hover:opacity-100 rounded-2xl blur-sm transition-opacity duration-300`}></div>
                    
                    {/* Card Content */}
                    <div className="relative h-full bg-slate-900 rounded-xl p-6 border border-slate-800 group-hover:border-transparent transition-colors flex flex-col">
                      
                      <div className="flex justify-between items-start mb-6">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${topic.color} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="w-7 h-7 text-white" />
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 border border-slate-700 ${
                          topic.level === 'Cơ bản' ? 'text-green-400' :
                          topic.level === 'Trung cấp' ? 'text-yellow-400' : 
                          topic.level === 'Nâng cao' ? 'text-purple-400' : 'text-red-400'
                        }`}>
                          {topic.level}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                        {topic.title}
                      </h3>

                      <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">
                        {topic.description}
                      </p>

                      <div className="pt-4 border-t border-slate-800 flex items-center justify-between group-hover:border-slate-700/50">
                        <div className="flex items-center text-xs font-mono text-slate-500">
                          <Code2 className="w-3 h-3 mr-1" />
                          {topic.count}
                        </div>
                        <div className="flex items-center text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
                          Học ngay
                          <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>

                    </div>
                  </motion.div>
                );
              })
            ) : (
              // Empty State
              <div className="col-span-full py-20 text-center text-slate-500">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg">Không tìm thấy chủ đề nào phù hợp với "{searchTerm}".</p>
                <button 
                  onClick={() => setSearchTerm("")}
                  className="mt-4 text-blue-500 hover:text-blue-400 underline"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}