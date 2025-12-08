// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react'; 
import axios from 'axios'; 
import { Trophy, Code, FileText, PlusCircle, ShieldCheck, BookOpen, Edit, Trash2, List, LogOut, Loader2 } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';

const BASE_URL = 'http://localhost:5000/api';

export default function AdminDashboard() {
    const navigate = useNavigate();

    // 1. State Forms
    const [contestForm, setContestForm] = useState({ title: '', description: '', startTime: '', durationMinutes: 120 });
    const [newProblemForm, setNewProblemForm] = useState({ title: '', difficulty: 'Easy', contentHtml: '', sampleInput: '', sampleOutput: '', contestIdToLink: '' }); 
    const [newExerciseForm, setNewExerciseForm] = useState({ title: '', prompt: '', testcasesJson: '[{"input": "1 2", "output": "3"}]', solution_description: '', algorithm_id: 1 });

    // 2. State Data Lists (Loading mặc định là true)
    const [availableProblems, setAvailableProblems] = useState([]);
    const [availableContests, setAvailableContests] = useState([]); 
    const [loadingProblems, setLoadingProblems] = useState(true);
    const [loadingContests, setLoadingContests] = useState(true); 

    // 3. State UI/Auth
    const [activeNav, setActiveNav] = useState('create'); 
    const [adminUser, setAdminUser] = useState(null);

    // 4. State cho việc chỉnh sửa
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentEditItem, setCurrentEditItem] = useState(null);
    const [editType, setEditType] = useState(''); 


    // =======================================================
    // I. LOGIC AUTH & INIT (ĐÃ TỐI ƯU HÓA)
    // =======================================================
    
    // Hàm tải dữ liệu chung - Xử lý token trực tiếp để tránh lỗi stale state
    const fetchAllData = async (userToken) => {
        setLoadingProblems(true);
        setLoadingContests(true);

        try {
            console.log("🚀 Bắt đầu tải dữ liệu...");

            // 1. Gọi API Contest
            const resContests = await axios.get(`${BASE_URL}/contests`, { 
                headers: { Authorization: `Bearer ${userToken}` } 
            });
            console.log("✅ Contests:", resContests.data.contests?.length);
            setAvailableContests(resContests.data.contests || []);

            // 2. Gọi API Problems
            const resProblems = await axios.get(`${BASE_URL}/practice/all-titles`, { 
                headers: { Authorization: `Bearer ${userToken}` } 
            });
            console.log("✅ Problems:", resProblems.data.problems?.length);
            setAvailableProblems(resProblems.data.problems || []);

        } catch (e) {
            console.error("❌ Lỗi tải dữ liệu:", e);
            
            // Xử lý lỗi Token hết hạn hoặc không có quyền
            if (e.response && (e.response.status === 401 || e.response.status === 403)) {
                alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
                handleLogout(); // Gọi hàm đăng xuất để xóa token rác
            }
        } finally {
            // [QUAN TRỌNG] Luôn tắt loading dù thành công hay thất bại
            setLoadingProblems(false);
            setLoadingContests(false);
        }
    };

    useEffect(() => {
        // Lấy Token và User từ LocalStorage mỗi khi load trang
        const storedToken = localStorage.getItem("accessToken");
        const userStr = localStorage.getItem('user');
        
        let user = null;
        try { user = JSON.parse(userStr); } catch (e) {}

        // Kiểm tra quyền Admin
        if (user && user.role === 'admin' && storedToken) {
            setAdminUser(user);
            // Gọi hàm tải dữ liệu với token vừa lấy được
            fetchAllData(storedToken);
        } else {
            console.warn("⛔ Không tìm thấy User Admin hoặc Token");
            setLoadingContests(false);
            setLoadingProblems(false);
            
            // Nếu muốn bảo mật hơn: Tự động chuyển hướng về Login
            // navigate('/login', { replace: true });
        }
    }, [navigate]);


    // =======================================================
    // II. LOGIC TẠO MỚI (CRUD C)
    // =======================================================
    
    const getToken = () => localStorage.getItem("accessToken"); // Helper lấy token

    const createContest = async () => {
        try {
            await axios.post(`${BASE_URL}/contests/create`, contestForm, { headers: { Authorization: `Bearer ${getToken()}` } });
            alert("Tạo Contest thành công!");
            setContestForm({ title: '', description: '', startTime: '', durationMinutes: 120 });
            fetchAllData(getToken()); // Reload dữ liệu
        } catch (e) {
            alert("Lỗi tạo contest: " + (e.response?.data?.message || e.message));
        }
    };

    const createNewProblem = async () => {
        const { title, contentHtml, contestIdToLink, ...rest } = newProblemForm;

        if (!title || !contentHtml) return alert("Vui lòng nhập Tiêu đề và Nội dung Bài Tập.");
        
        try {
            const token = getToken();
            // 1. TẠO PROBLEM MỚI
            const problemPayload = { title, contentHtml, ...rest, isPublic: rest.isPublic ? 1 : 0 };
            const resProblem = await axios.post(`${BASE_URL}/practice/problems/create`, problemPayload, { headers: { Authorization: `Bearer ${token}` } });
            const problemId = resProblem.data.problemId;

            // 2. LIÊN KẾT VÀO CONTEST (Nếu chọn)
            if (contestIdToLink) {
                const linkPayload = { contestId: contestIdToLink, problemId: problemId, index: 'A', points: 100 };
                await axios.post(`${BASE_URL}/contests/add-problem`, linkPayload, { headers: { Authorization: `Bearer ${token}` } });
                alert(`Tạo Bài Tập (ID: ${problemId}) và thêm vào Contest ${contestIdToLink} thành công!`);
            } else {
                 alert(`Tạo Bài Tập thành công (ID: ${problemId}).`);
            }
            
            setNewProblemForm({ title: '', difficulty: 'Easy', contentHtml: '', sampleInput: '', sampleOutput: '', contestIdToLink: '' }); 
            fetchAllData(token); // Reload dữ liệu

        } catch (e) { 
            console.error("Lỗi tạo Problem:", e);
            alert(`Lỗi tạo bài tập: ${e.response?.data?.message || e.message}`); 
        }
    };

    const createNewExercise = async () => {
        try {
            await axios.post(`${BASE_URL}/practice/exercises/create`, newExerciseForm, { headers: { Authorization: `Bearer ${getToken()}` } });
            alert("Tạo Bài Luyện Tập thành công!");
            setNewExerciseForm({ title: '', prompt: '', testcasesJson: '[]', solution_description: '', algorithm_id: 1 });
        } catch (e) {
            alert("Lỗi tạo bài tập: " + (e.response?.data?.message || e.message));
        }
    };


    // =======================================================
    // III. LOGIC SỬA & XÓA (UPDATE/DELETE)
    // =======================================================

    const editItem = (type, item) => {
        const itemData = {
            ...item,
            startTime: type === 'Contest' && item.startTime ? new Date(item.startTime).toISOString().slice(0, 16) : '',
            isPublic: item.isPublic === 1 || item.isPublic === true 
        };
        setCurrentEditItem(itemData);
        setEditType(type);
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async () => {
        if (!currentEditItem) return;
        try {
            const token = getToken();
            const url = editType === 'Contest' 
                ? `${BASE_URL}/contests/${currentEditItem.id}` 
                : `${BASE_URL}/practice/problems/${currentEditItem.id}`;
            
            await axios.put(url, currentEditItem, { headers: { Authorization: `Bearer ${token}` } });
            
            alert(`Cập nhật ${editType} thành công!`);
            setIsEditModalOpen(false);
            fetchAllData(token); // Reload dữ liệu

        } catch (e) {
            alert("Lỗi cập nhật: " + (e.response?.data?.message || e.message));
        }
    };

    const deleteItem = async (type, id) => {
        if (!window.confirm(`Bạn có chắc muốn xóa ${type} ID: ${id}?`)) return;
        
        try {
            const token = getToken();
            const url = type === 'Contest' 
                ? `${BASE_URL}/contests/${id}` 
                : `${BASE_URL}/practice/problems/${id}`;

            await axios.delete(url, { headers: { Authorization: `Bearer ${token}` } });
            
            alert(`Xóa ${type} thành công!`);
            // Cập nhật state UI ngay lập tức để cảm giác nhanh hơn
            if (type === 'Contest') setAvailableContests(prev => prev.filter(i => i.id !== id));
            else setAvailableProblems(prev => prev.filter(i => i.id !== id));
            
        } catch (e) {
            alert("Lỗi xóa: " + (e.response?.data?.message || e.message));
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        navigate("/login", { replace: true }); 
    };


    // =======================================================
    // IV. RENDER UI
    // =======================================================

    const navItems = [
        { id: 'create', icon: PlusCircle, label: 'Tạo Mới' },
        { id: 'management', icon: List, label: 'Quản Lý' },
    ];

    const renderCreateContent = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. Form Tạo Contest */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 flex items-center gap-3"><Trophy size={24} className="text-white"/><h2 className="text-xl font-bold text-white">1. Tạo Cuộc Thi</h2></div>
                <div className="p-6 space-y-4">
                    <input className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Tên cuộc thi" value={contestForm.title} onChange={e => setContestForm({...contestForm, title: e.target.value})} />
                    <textarea className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Mô tả" value={contestForm.description} onChange={e => setContestForm({...contestForm, description: e.target.value})} rows="2"/>
                    <div className="space-y-3">
                        <label className="text-sm text-slate-600 font-medium">Thời gian bắt đầu</label>
                        <input type="datetime-local" className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" onChange={e => setContestForm({...contestForm, startTime: e.target.value})} />
                        <div className="flex gap-3 items-center">
                            <label className="text-sm text-slate-600 font-medium w-32">Thời lượng (phút)</label>
                            <input type="number" className="flex-1 border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="120" value={contestForm.durationMinutes} onChange={e => setContestForm({...contestForm, durationMinutes: parseInt(e.target.value) || 0})} />
                        </div>
                    </div>
                    <button onClick={createContest} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                        <PlusCircle size={20}/> Tạo Contest
                    </button>
                </div>
            </div>

            {/* 2. Form Tạo Bài Tập Contest */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 flex items-center gap-3"><FileText size={24} className="text-white"/><h2 className="text-xl font-bold text-white">2. Tạo Bài Tập Contest</h2></div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-500 mb-2">Tạo bài tập và tùy chọn thêm vào Contest.</p>
                    
                    <select 
                        className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white" 
                        value={newProblemForm.contestIdToLink} 
                        onChange={e => setNewProblemForm({...newProblemForm, contestIdToLink: e.target.value})}
                        disabled={loadingContests}
                    >
                        <option value="">{loadingContests ? "Đang tải Contest..." : "Chọn Contest để thêm (Tùy chọn)"}</option>
                        {availableContests.map(c => (
                            <option key={c.id} value={c.id}>{c.id} - {c.title}</option> 
                        ))}
                    </select>

                    <input className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Tiêu đề Bài Tập" value={newProblemForm.title} onChange={e => setNewProblemForm({...newProblemForm, title: e.target.value})} />
                    <select className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white" value={newProblemForm.difficulty} onChange={e => setNewProblemForm({...newProblemForm, difficulty: e.target.value})}><option value="Easy">Dễ</option><option value="Medium">Trung Bình</option><option value="Hard">Khó</option></select>
                    <textarea className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Nội dung Bài Tập (HTML)" value={newProblemForm.contentHtml} onChange={e => setNewProblemForm({...newProblemForm, contentHtml: e.target.value})} rows="3"/>
                    <div className="grid grid-cols-2 gap-3">
                         <textarea className="border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Sample Input" value={newProblemForm.sampleInput} onChange={e => setNewProblemForm({...newProblemForm, sampleInput: e.target.value})} rows="2"/>
                         <textarea className="border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Sample Output" value={newProblemForm.sampleOutput} onChange={e => setNewProblemForm({...newProblemForm, sampleOutput: e.target.value})} rows="2"/>
                    </div>
                    <button onClick={createNewProblem} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                        <Code size={20}/> Tạo & Liên kết Bài Tập
                    </button>
                </div>
            </div>

            {/* 3. Form Tạo Bài Luyện Tập */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 flex items-center gap-3"><BookOpen size={24} className="text-white"/><h2 className="text-xl font-bold text-white">3. Tạo Bài Luyện Tập</h2></div>
                 <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-500">Tạo bài tập cho trang Luyện Tập (bảng Exercises).</p>
                    <input className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Tiêu đề Bài Tập" value={newExerciseForm.title} onChange={e => setNewExerciseForm({...newExerciseForm, title: e.target.value})} />
                    <input className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" placeholder="ID Thuật toán (Algorithm ID)" value={newExerciseForm.algorithm_id} type="number" onChange={e => setNewExerciseForm({...newExerciseForm, algorithm_id: e.target.value})} />
                    <textarea className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Prompt/Nội dung chính" value={newExerciseForm.prompt} onChange={e => setNewExerciseForm({...newExerciseForm, prompt: e.target.value})} rows="2"/>
                    <textarea className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" placeholder='Testcases (JSON)' value={newExerciseForm.testcasesJson} onChange={e => setNewExerciseForm({...newExerciseForm, testcasesJson: e.target.value})} rows="2"/>
                    <button onClick={createNewExercise} className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                        <PlusCircle size={20}/> Tạo Bài Luyện Tập
                    </button>
                </div>
            </div>
        </div>
    );

    const renderManagementContent = () => (
        <div className="space-y-8">
            {/* Quản lý Contest */}
            <h2 className="text-2xl font-bold text-pink-600 flex items-center gap-2"><Trophy/> Quản Lý Contest ({loadingContests ? '...' : availableContests.length} mục)</h2>
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tên Contest</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Thời gian</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {loadingContests ? (
                            <tr><td colSpan="4" className="text-center py-4 text-slate-500"><Loader2 className="animate-spin inline mr-2"/>Đang tải Contest...</td></tr>
                        ) : availableContests.length === 0 ? (
                             <tr><td colSpan="4" className="text-center py-4 text-slate-500">Chưa có Contest nào.</td></tr>
                        ) : availableContests.map(c => (
                            <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{c.id}</td>
                                <td className="px-6 py-4 text-sm text-slate-500">{c.title}</td>
                                <td className="px-6 py-4 text-sm text-slate-500">{new Date(c.startTime).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium flex justify-center gap-2">
                                    <button onClick={() => editItem('Contest', c)} className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50"><Edit size={18}/></button>
                                    <button onClick={() => deleteItem('Contest', c.id)} className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50"><Trash2 size={18}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Quản lý Problem */}
            <h2 className="text-2xl font-bold text-pink-600 pt-8 flex items-center gap-2"><Code/> Quản Lý Bài Tập ({loadingProblems ? '...' : availableProblems.length} mục)</h2>
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tiêu đề</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Độ khó</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {loadingProblems ? (
                            <tr><td colSpan="4" className="text-center py-4 text-slate-500"><Loader2 className="animate-spin inline mr-2"/>Đang tải Problem...</td></tr>
                        ) : availableProblems.length === 0 ? (
                             <tr><td colSpan="4" className="text-center py-4 text-slate-500">Kho Problem rỗng.</td></tr>
                        ) : availableProblems.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{p.id}</td>
                                <td className="px-6 py-4 text-sm text-slate-500">{p.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : p.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                        {p.difficulty}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-start gap-2">
                                    <button onClick={() => editItem('Problem', p)} className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50"><Edit size={18}/></button>
                                    <button onClick={() => deleteItem('Problem', p.id)} className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50"><Trash2 size={18}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderMainContent = () => {
        if (activeNav === 'management') return renderManagementContent();
        return renderCreateContent();
    };

    const EditModal = () => {
        if (!isEditModalOpen || !currentEditItem) return null;

        const handleInputChange = (e) => {
            const { name, value, type, checked } = e.target;
            const newValue = type === 'checkbox' ? checked : value;

            setCurrentEditItem(prev => ({
                ...prev,
                [name]: newValue
            }));
        };

        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-hidden flex flex-col">
                    <h3 className="text-2xl font-bold mb-4 text-indigo-600">Sửa {editType} ID: {currentEditItem.id}</h3>

                    {/* FORM CHUNG (Có thanh cuộn) */}
                    <div className="space-y-4 overflow-y-auto pr-2">
                        <label className="block text-sm font-medium text-slate-700">Tiêu đề</label>
                        <input
                            type="text" name="title" placeholder="Tiêu đề"
                            value={currentEditItem.title || ''} onChange={handleInputChange}
                            className="w-full border p-2 rounded-lg focus:ring-indigo-500 outline-none"
                        />
                        {
                            editType === 'Contest' ? (
                                <>
                                    <label className="block text-sm font-medium text-slate-700">Mô tả</label>
                                    <textarea
                                        name="description" placeholder="Mô tả"
                                        value={currentEditItem.description || ''} onChange={handleInputChange}
                                        className="w-full border p-2 rounded-lg focus:ring-indigo-500 outline-none" rows="3"
                                    />
                                    <label className="block text-sm font-medium text-slate-700">Thời gian bắt đầu</label>
                                    <input
                                        type="datetime-local" name="startTime"
                                        value={currentEditItem.startTime || ''} onChange={handleInputChange}
                                        className="w-full border p-2 rounded-lg focus:ring-indigo-500 outline-none"
                                    />
                                    <label className="block text-sm font-medium text-slate-700">Thời lượng (phút)</label>
                                     <input
                                        type="number" name="durationMinutes"
                                        value={currentEditItem.durationMinutes || 0} onChange={handleInputChange}
                                        className="w-full border p-2 rounded-lg focus:ring-indigo-500 outline-none"
                                    />
                                    <label className="block text-sm font-medium text-slate-700">Trạng thái</label>
                                    <select name="status" value={currentEditItem.status || 'upcoming'} onChange={handleInputChange} className="w-full border p-2 rounded-lg focus:ring-indigo-500 outline-none">
                                        <option value="upcoming">Sắp diễn ra</option>
                                        <option value="ongoing">Đang diễn ra</option>
                                        <option value="finished">Đã kết thúc</option>
                                    </select>
                                </>
                            ) : (
                                <>
                                    <label className="block text-sm font-medium text-slate-700">Độ khó</label>
                                    <select name="difficulty" value={currentEditItem.difficulty || 'Easy'} onChange={handleInputChange} className="w-full border p-2 rounded-lg focus:ring-indigo-500 outline-none">
                                        <option value="Easy">Dễ</option>
                                        <option value="Medium">Trung Bình</option>
                                        <option value="Hard">Khó</option>
                                    </select>
                                    <label className="block text-sm font-medium text-slate-700">Nội dung (HTML)</label>
                                    <textarea name="contentHtml" placeholder="Nội dung (HTML)" value={currentEditItem.contentHtml || ''} onChange={handleInputChange} className="w-full border p-2 rounded-lg focus:ring-indigo-500 outline-none" rows="4" />
                                    <label className="block text-sm font-medium text-slate-700">Sample Input</label>
                                    <textarea name="sampleInput" placeholder="Sample Input" value={currentEditItem.sampleInput || ''} onChange={handleInputChange} className="w-full border p-2 rounded-lg focus:ring-indigo-500 outline-none" rows="2" />
                                    <label className="block text-sm font-medium text-slate-700">Sample Output</label>
                                    <textarea name="sampleOutput" placeholder="Sample Output" value={currentEditItem.sampleOutput || ''} onChange={handleInputChange} className="w-full border p-2 rounded-lg focus:ring-indigo-500 outline-none" rows="2" />

                                    <div className="flex items-center gap-2 pt-2">
                                        <input
                                            type="checkbox"
                                            name="isPublic"
                                            checked={currentEditItem.isPublic === 1 || currentEditItem.isPublic === true}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                        />
                                        <label className="text-sm text-slate-700">Bài tập công khai (Public)</label>
                                    </div>
                                </>
                            )
                        }
                    </div>

                    <div className="mt-6 flex justify-end gap-3 flex-shrink-0">
                        <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 transition font-medium">Hủy</button>
                        <button onClick={handleEditSubmit} className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition font-bold">Lưu Thay Đổi</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
            
            {/* Sidebar */}
            <div className={`w-64 bg-gradient-to-b from-pink-600 to-rose-600 text-white flex flex-col shadow-2xl`}>
                <div className="p-6 flex items-center justify-start border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm"><ShieldCheck size={28} className="text-white"/></div>
                        <h2 className="font-bold text-xl">Admin Panel</h2>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveNav(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                activeNav === item.id 
                                    ? 'bg-white text-pink-600 shadow-lg' 
                                    : 'text-pink-50 hover:bg-white/10'
                            }`}
                        >
                            <item.icon size={22}/>
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold transition-colors shadow-md">
                        <LogOut size={20}/> Đăng Xuất
                    </button>
                    <div className="flex items-center gap-3 p-3 mt-3 bg-white/10 rounded-xl backdrop-blur-sm">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center font-bold">A</div>
                        <div className="flex-1"><p className="font-semibold text-sm">{adminUser?.username || 'Admin'}</p><p className="text-xs text-pink-100">{adminUser?.email || 'admin@accu.com'}</p></div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="bg-white px-8 py-5 sticky top-0 z-10 shadow-sm border-b border-slate-200">
                    <h1 className="text-3xl font-bold text-slate-800">{activeNav === 'create' ? 'Tạo Nội Dung Mới' : 'Quản Lý & Chỉnh Sửa'}</h1>
                    <p className="text-slate-500 text-sm mt-1">Sử dụng thanh điều hướng bên để chuyển đổi.</p>
                </div>

                <div className="p-8">
                    {renderMainContent()}
                </div>
            </div>
            
            <EditModal /> 
        </div>
    );
}