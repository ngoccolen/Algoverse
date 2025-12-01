import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Search, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function PracticePage() {
    const navigate = useNavigate();

    // Chỉ còn lại state cho Problems
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Bộ lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('All');
    const [selectedTopic, setSelectedTopic] = useState('All');

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, []);

    async function fetchData() {
        try {
            const base = "http://localhost:5000"; 
            const token = localStorage.getItem("accessToken");

            if (!token) {
                navigate("/login"); 
                return;
            }

            // Chỉ gọi API lấy danh sách bài tập
            const res = await axios.get(`${base}/api/practice/problems`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setProblems(res.data || []);

        } catch (err) {
            console.error("Lỗi tải dữ liệu:", err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                alert("Phiên đăng nhập đã hết hạn.");
                localStorage.removeItem("accessToken");
                navigate("/login");
            } 
        } finally {
            setLoading(false);
        }
    }

    // Bộ lọc UI
    const filteredProblems = problems.filter(problem => {
        const matchesSearch =
            (problem.title || "").toLowerCase().includes(searchTerm.toLowerCase()) || // [Sửa]: DB trả về 'title' chứ không phải 'name'
            (problem.description || "").toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDifficulty =
            selectedDifficulty === 'All' || problem.difficulty === selectedDifficulty;

        const matchesTopic =
            selectedTopic === 'All' || problem.category === selectedTopic;

        return matchesSearch && matchesDifficulty && matchesTopic;
    });

    return (
        <div className="min-h-screen px-5 pt-24 pb-12 bg-gradient-to-b from-indigo-950 to-black text-white">
            <div className="max-w-6xl mx-auto">

                {/* === Title === */}
                <motion.h1
                    className="text-4xl md:text-5xl font-bold mb-2"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    Luyện Tập Thuật Toán
                </motion.h1>

                <p className="text-gray-300 mb-8">
                    Danh sách các bài tập lập trình từ cơ bản đến nâng cao.
                </p>

                {/* === Search + Filters === */}
                <div className="flex flex-col md:flex-row gap-4 mb-10">
                    {/* Search */}
                    <div className="relative w-full md:w-1/2">
                        <Search className="absolute top-3 left-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm bài tập..."
                            className="w-full bg-slate-900 p-3 pl-10 rounded-md border border-slate-700 focus:outline-none focus:border-purple-500 transition"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Difficulty */}
                    <select
                        className="bg-slate-900 p-3 rounded-md border border-slate-700 focus:outline-none focus:border-purple-500"
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                    >
                        <option value="All">Độ khó: Tất cả</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>

                    {/* Topic */}
                    <select
                        className="bg-slate-900 p-3 rounded-md border border-slate-700 focus:outline-none focus:border-purple-500"
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                    >
                        <option value="All">Chủ đề: Tất cả</option>
                        <option value="Array">Array</option>
                        <option value="String">String</option>
                        <option value="Math">Math</option>
                        <option value="DP">Dynamic Programming</option>
                        <option value="Graph">Graph</option>
                    </select>
                </div>

                {/* === Loading === */}
                {loading && (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin w-10 h-10 text-purple-400" />
                    </div>
                )}

                {/* === Problems List === */}
                {!loading && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProblems.length === 0 ? (
                             <div className="col-span-full text-gray-400 italic py-10 text-center bg-slate-900/50 rounded-lg border border-dashed border-slate-800">
                                Không tìm thấy bài tập nào phù hợp.
                             </div>
                        ) : (
                            filteredProblems.map((problem) => (
                                <motion.div
                                    key={problem.id}
                                    className="bg-slate-900 p-5 rounded-lg border border-slate-800 shadow-lg hover:border-purple-500 transition cursor-pointer flex flex-col justify-between"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    whileHover={{ y: -5 }}
                                    onClick={() => navigate(`/practice/${problem.id}`)}
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition">{problem.title}</h3>
                                            {problem.solved > 0 && (
                                                <span className="text-[10px] bg-blue-900 text-blue-200 px-1.5 py-0.5 rounded">Solved</span>
                                            )}
                                        </div>
                                        <div className="flex gap-2 mb-3 text-xs text-gray-500">
                                            <span className="bg-slate-800 px-2 py-1 rounded">{problem.category || "General"}</span>
                                        </div>
                                        {/* Hiển thị Difficulty */}
                                        <div className="mb-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                problem.difficulty === 'Hard' ? 'bg-red-900 text-red-300' :
                                                problem.difficulty === 'Medium' ? 'bg-yellow-900 text-yellow-300' :
                                                'bg-green-900 text-green-300'
                                            }`}>
                                                {problem.difficulty}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-800">
                                        <span className="text-xs text-gray-500">
                                            {problem.total_submissions || 0} submissions
                                        </span>
                                        <button className="flex items-center gap-2 text-white bg-purple-600 hover:bg-purple-500 px-3 py-1.5 rounded-md text-sm font-bold transition shadow-lg shadow-purple-900/20">
                                            <Play className="w-3 h-3 fill-current" /> Làm bài
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}