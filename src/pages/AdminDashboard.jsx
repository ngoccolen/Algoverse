import React, { useState, useEffect } from 'react'; 
import axios from 'axios'; 
import { 
    Trophy, Code, BookOpen, Plus, ShieldCheck, 
    Edit, Trash2, LogOut, Loader2, 
    LayoutDashboard, Calendar, Clock, Database,
    ChevronRight, Save, X, AlignLeft, Type, Layers, FileText, Hash, Globe
} from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../config';

const BASE_URL = `${API_BASE_URL}/api`;

const Label = ({ children }) => (
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
        {children}
    </label>
);

const InputGroup = ({ label, icon: Icon, type = "text", className = "", ...props }) => (
    <div className="space-y-1">
        {label && <Label>{label}</Label>}
        <div className="relative group">
            {Icon && (
                <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
                    <Icon size={20} />
                </div>
            )}
            <input 
                type={type}
                className={`w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl py-3.5 ${Icon ? 'pl-12' : 'pl-4'} pr-4 outline-none transition-all duration-200 font-medium placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm ${className}`}
                {...props}
            />
        </div>
    </div>
);

const TextAreaGroup = ({ label, icon: Icon, className = "", rows = 4, ...props }) => (
    <div className="space-y-1">
        {label && <Label>{label}</Label>}
        <div className="relative group">
            {Icon && (
                <div className="absolute left-0 top-4 w-12 flex justify-center text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
                    <Icon size={20} />
                </div>
            )}
            <textarea 
                rows={rows}
                className={`w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl py-3.5 ${Icon ? 'pl-12' : 'pl-4'} pr-4 outline-none transition-all duration-200 font-medium placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm min-h-[100px] ${className}`}
                {...props}
            />
        </div>
    </div>
);

const SelectGroup = ({ label, icon: Icon, options, className = "", ...props }) => (
    <div className="space-y-1">
        {label && <Label>{label}</Label>}
        <div className="relative group">
            {Icon && (
                <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
                    <Icon size={20} />
                </div>
            )}
            <select 
                className={`w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl py-3.5 ${Icon ? 'pl-12' : 'pl-4'} pr-10 outline-none transition-all duration-200 appearance-none cursor-pointer font-medium focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm ${className}`}
                {...props}
            >
                {options}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronRight size={16} className="rotate-90" />
            </div>
        </div>
    </div>
);

export default function AdminDashboard() {
    const navigate = useNavigate();

    const [contestForm, setContestForm] = useState({ title: '', description: '', startTime: '', durationMinutes: 120 });
    const [contestProblemForm, setContestProblemForm] = useState({ title: '', difficulty: 'Medium', contentHtml: '', sampleInput: '', sampleOutput: '', contestIdToLink: '' }); 
    const [practiceForm, setPracticeForm] = useState({ title: '', difficulty: 'Easy', contentHtml: '', sampleInput: '', sampleOutput: '' });

    const [availableProblems, setAvailableProblems] = useState([]);
    const [availableContests, setAvailableContests] = useState([]); 
    const [loading, setLoading] = useState(false);

    const [activeNav, setActiveNav] = useState('dashboard'); 
    const [adminUser, setAdminUser] = useState(null);
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentEditItem, setCurrentEditItem] = useState(null);
    const [editType, setEditType] = useState(''); 

    const getToken = () => localStorage.getItem("accessToken");

    const fetchAllData = async (userToken) => {
        setLoading(true);
        try {
            const [resContests, resProblems] = await Promise.all([
                axios.get(`${BASE_URL}/contests`, { headers: { Authorization: `Bearer ${userToken}` } }),
                axios.get(`${BASE_URL}/practice/all-titles`, { headers: { Authorization: `Bearer ${userToken}` } })
            ]);
            setAvailableContests(resContests.data.contests || []);
            setAvailableProblems(resProblems.data.problems || []);
        } catch (e) {
            if (e.response?.status === 401) handleLogout();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedToken = localStorage.getItem("accessToken");
        const userStr = localStorage.getItem('user');
        let user = null;
        try { user = JSON.parse(userStr); } catch (e) {}
        if (user && user.role === 'admin' && storedToken) {
            setAdminUser(user);
            fetchAllData(storedToken);
        }
    }, [navigate]);

    // 1. Tạo Contest
    const createContest = async () => {
        try {
            await axios.post(`${BASE_URL}/contests/create`, contestForm, { headers: { Authorization: `Bearer ${getToken()}` } });
            alert("✅ Tạo cuộc thi thành công!");
            setContestForm({ title: '', description: '', startTime: '', durationMinutes: 120 });
            fetchAllData(getToken());
        } catch (e) { alert("Lỗi: " + (e.response?.data?.message || e.message)); }
    };

    // 2. Tạo Bài Tập cho Contest 
    const createContestProblem = async () => {
        const { title, contentHtml, contestIdToLink, ...rest } = contestProblemForm;
        if (!title || !contentHtml) return alert("Vui lòng nhập tiêu đề và nội dung!");
        if (!contestIdToLink) return alert("Vui lòng chọn Contest để liên kết!");

        try {
            const token = getToken();
            const res = await axios.post(`${BASE_URL}/practice/problems/create`, { title, contentHtml, ...rest, isPublic: 0 }, { headers: { Authorization: `Bearer ${token}` } });
            
            await axios.post(`${BASE_URL}/contests/add-problem`, { contestId: contestIdToLink, problemId: res.data.problemId, index: 'A', points: 100 }, { headers: { Authorization: `Bearer ${token}` } });
            
            alert(`Đã thêm bài vào Contest!`);
            setContestProblemForm({ title: '', difficulty: 'Medium', contentHtml: '', sampleInput: '', sampleOutput: '', contestIdToLink: '' }); 
            fetchAllData(token);
        } catch (e) { alert("Lỗi: " + (e.response?.data?.message || e.message)); }
    };

    // 3. Tạo Bài Luyện Tập 
    const createPracticeProblem = async () => {
        const { title, contentHtml, ...rest } = practiceForm;
        if (!title || !contentHtml) return alert("Vui lòng nhập tiêu đề và nội dung!");

        try {
            const token = getToken();
            await axios.post(`${BASE_URL}/practice/problems/create`, { title, contentHtml, ...rest, isPublic: 1 }, { headers: { Authorization: `Bearer ${token}` } });
            
            alert(`Đã thêm bài vào kho Luyện Tập!`);
            setPracticeForm({ title: '', difficulty: 'Easy', contentHtml: '', sampleInput: '', sampleOutput: '' });
            fetchAllData(token);
        } catch (e) { alert("Lỗi: " + (e.response?.data?.message || e.message)); }
    };

    const updateItem = async () => {
        if (!currentEditItem) return;
        try {
            const token = getToken();
            const url = editType === 'Contest' ? `${BASE_URL}/contests/${currentEditItem.id}` : `${BASE_URL}/practice/problems/${currentEditItem.id}`;
            await axios.put(url, currentEditItem, { headers: { Authorization: `Bearer ${token}` } });
            alert(`Cập nhật thành công!`);
            setIsEditModalOpen(false);
            fetchAllData(token);
        } catch (e) { alert("Lỗi: " + (e.response?.data?.message || e.message)); }
    };

    const deleteItem = async (type, id) => {
        if (!window.confirm(`Bạn chắc chắn muốn xóa ${type} này?`)) return;
        try {
            const url = type === 'Contest' ? `${BASE_URL}/contests/${id}` : `${BASE_URL}/practice/problems/${id}`;
            await axios.delete(url, { headers: { Authorization: `Bearer ${getToken()}` } });
            fetchAllData(getToken());
        } catch (e) { alert("Lỗi xóa: " + (e.response?.data?.message || e.message)); }
    };

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        navigate("/login", { replace: true }); 
    };
    
    // A. Trang Tạo Contest
    const renderCreateContestPage = () => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10">
                <div className="mb-8 border-b border-slate-100 pb-6">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Trophy size={24}/></div>
                        Tạo Cuộc Thi Mới
                    </h2>
                    <p className="text-slate-500 mt-1 ml-12">Lên lịch và thiết lập thông tin cho kỳ thi.</p>
                </div>

                <div className="space-y-6">
                    <InputGroup icon={Type} label="Tên cuộc thi" placeholder="VD: Weekly Contest #12" value={contestForm.title} onChange={e => setContestForm({...contestForm, title: e.target.value})} />
                    <TextAreaGroup icon={AlignLeft} label="Mô tả / Nội quy" placeholder="Nhập nội dung mô tả..." value={contestForm.description} onChange={e => setContestForm({...contestForm, description: e.target.value})} rows={4} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup icon={Calendar} label="Thời gian bắt đầu" type="datetime-local" value={contestForm.startTime} onChange={e => setContestForm({...contestForm, startTime: e.target.value})} className="cursor-pointer"/>
                        <InputGroup icon={Clock} label="Thời lượng (phút)" type="number" value={contestForm.durationMinutes} onChange={e => setContestForm({...contestForm, durationMinutes: parseInt(e.target.value) || 0})} />
                    </div>

                    <div className="pt-4">
                        <button onClick={createContest} className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2">
                            <Plus size={20} /> Xác Nhận Tạo Contest
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    // Trang Tạo Problem cho CONTEST 
    const renderCreateContestProblemPage = () => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
             <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10">
                <div className="mb-8 border-b border-slate-100 pb-6">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-pink-100 text-pink-600 rounded-lg"><Code size={24}/></div>
                        Thêm Bài Vào Contest
                    </h2>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SelectGroup 
                            icon={Trophy}
                            label="Chọn Contest" 
                            value={contestProblemForm.contestIdToLink} 
                            onChange={e => setContestProblemForm({...contestProblemForm, contestIdToLink: e.target.value})}
                            options={<>
                                <option value="">-- Chọn cuộc thi --</option>
                                {availableContests.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </>}
                            className="border-pink-200"
                        />
                        <SelectGroup 
                            icon={Layers}
                            label="Độ khó" 
                            value={contestProblemForm.difficulty} 
                            onChange={e => setContestProblemForm({...contestProblemForm, difficulty: e.target.value})} 
                            options={<><option value="Easy">Dễ</option><option value="Medium">Trung bình</option><option value="Hard">Khó</option></>} 
                        />
                    </div>

                    <InputGroup icon={Type} label="Tiêu đề bài toán" placeholder="VD: Quy hoạch động cơ bản" value={contestProblemForm.title} onChange={e => setContestProblemForm({...contestProblemForm, title: e.target.value})} />
                    
                    <TextAreaGroup icon={FileText} label="Nội dung đề bài" placeholder="" value={contestProblemForm.contentHtml} onChange={e => setContestProblemForm({...contestProblemForm, contentHtml: e.target.value})} rows={6} className="font-mono text-sm" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TextAreaGroup label="Input mẫu" placeholder="1 2" value={contestProblemForm.sampleInput} onChange={e => setContestProblemForm({...contestProblemForm, sampleInput: e.target.value})} rows={3} />
                        <TextAreaGroup label="Output mẫu" placeholder="3" value={contestProblemForm.sampleOutput} onChange={e => setContestProblemForm({...contestProblemForm, sampleOutput: e.target.value})} rows={3} />
                    </div>

                    <div className="pt-4">
                        <button onClick={createContestProblem} className="w-full py-3.5 rounded-xl bg-pink-600 text-white font-bold text-lg hover:bg-pink-700 hover:shadow-lg hover:shadow-pink-500/30 transition-all flex items-center justify-center gap-2">
                            <Plus size={20} /> Thêm Vào Contest
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    // Trang Tạo Practice Problem 
    const renderCreatePracticePage = () => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10">
                <div className="mb-8 border-b border-slate-100 pb-6">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Globe size={24}/></div>
                        Thêm Bài Luyện Tập
                    </h2>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                         <SelectGroup 
                            icon={Layers}
                            label="Độ khó" 
                            value={practiceForm.difficulty} 
                            onChange={e => setPracticeForm({...practiceForm, difficulty: e.target.value})} 
                            options={<><option value="Easy">Dễ (Easy)</option><option value="Medium">Trung bình (Medium)</option><option value="Hard">Khó (Hard)</option></>} 
                        />
                    </div>
                    
                    <InputGroup icon={Type} label="Tiêu đề bài tập" value={practiceForm.title} onChange={e => setPracticeForm({...practiceForm, title: e.target.value})} placeholder="VD: Tổng hai số" />
                    
                    <TextAreaGroup icon={FileText} label="Nội dung đề bài" value={practiceForm.contentHtml} onChange={e => setPracticeForm({...practiceForm, contentHtml: e.target.value})} rows={6} className="font-mono text-sm" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TextAreaGroup label="Input mẫu" placeholder="5" value={practiceForm.sampleInput} onChange={e => setPracticeForm({...practiceForm, sampleInput: e.target.value})} rows={3} />
                        <TextAreaGroup label="Output mẫu" placeholder="120" value={practiceForm.sampleOutput} onChange={e => setPracticeForm({...practiceForm, sampleOutput: e.target.value})} rows={3} />
                    </div>

                    <div className="pt-4">
                        <button onClick={createPracticeProblem} className="w-full py-3.5 rounded-xl bg-orange-500 text-white font-bold text-lg hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2">
                            <Plus size={20} /> Đăng Bài Luyện Tập
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const renderManagementPage = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-6">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Trophy size={28}/></div>
                    <div><p className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-1">Tổng Contest</p><h3 className="text-3xl font-bold text-slate-800">{availableContests.length}</h3></div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-6">
                    <div className="w-14 h-14 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center"><Code size={28}/></div>
                    <div><p className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-1">Tổng Bài Tập</p><h3 className="text-3xl font-bold text-slate-800">{availableProblems.length}</h3></div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Trophy className="text-indigo-500" size={20}/> Danh Sách Cuộc Thi</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
                            <tr><th className="px-6 py-4">ID</th><th className="px-6 py-4">Tên</th><th className="px-6 py-4">Bắt đầu</th><th className="px-6 py-4 text-center">Hành động</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {availableContests.map(c => (
                                <tr key={c.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4 font-mono text-slate-400 font-bold">#{c.id}</td>
                                    <td className="px-6 py-4 font-semibold text-slate-700">{c.title}</td>
                                    <td className="px-6 py-4 text-slate-500 font-medium">
                                        {c.start_time ? new Date(c.start_time).toLocaleString('vi-VN') : '---'}
                                    </td>
                                    <td className="px-6 py-4 flex justify-center gap-2">
                                        <button onClick={() => { 
                                            setCurrentEditItem({
                                                ...c, 
                                                startTime: c.start_time, 
                                                durationMinutes: c.duration_minutes || 120 
                                            }); 
                                            setEditType('Contest'); 
                                            setIsEditModalOpen(true); 
                                        }} className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"><Edit size={16}/></button>
                                        <button onClick={() => deleteItem('Contest', c.id)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
             <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100"><h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Code className="text-pink-500" size={20}/> Kho Bài Tập</h3></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
                            <tr><th className="px-6 py-4">ID</th><th className="px-6 py-4">Tiêu đề</th><th className="px-6 py-4">Độ khó</th><th className="px-6 py-4 text-center">Hành động</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {availableProblems.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4 font-mono text-slate-400 font-bold">#{p.id}</td>
                                    <td className="px-6 py-4 font-semibold text-slate-700">{p.title}</td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-xs font-bold ${p.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : p.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{p.difficulty}</span></td>
                                    <td className="px-6 py-4 flex justify-center gap-2">
                                        <button onClick={() => { setCurrentEditItem({...p, isPublic: p.isPublic === 1}); setEditType('Problem'); setIsEditModalOpen(true); }} className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"><Edit size={16}/></button>
                                        <button onClick={() => deleteItem('Problem', p.id)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );

    const EditModal = () => {
        if (!isEditModalOpen || !currentEditItem) return null;
        const handleChange = (e) => {
            const { name, value, type, checked } = e.target;
            setCurrentEditItem(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        };

        return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                        <h3 className="font-bold text-lg text-slate-800">Chỉnh sửa {editType}</h3>
                        <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition"><X size={20} className="text-slate-400"/></button>
                    </div>
                    <div className="p-6 overflow-y-auto space-y-6 bg-white">
                        <InputGroup label="Tiêu đề" name="title" value={currentEditItem.title} onChange={handleChange} />
                        {editType === 'Contest' ? (
                            <>
                                <TextAreaGroup label="Mô tả" name="description" value={currentEditItem.description} onChange={handleChange} />
                                <div className="grid grid-cols-2 gap-6">
                                    <InputGroup 
                                        label="Bắt đầu" 
                                        type="datetime-local" 
                                        name="startTime" 
                                        value={currentEditItem.startTime ? new Date(currentEditItem.startTime).toISOString().slice(0, 16) : ''} 
                                        onChange={handleChange} 
                                    />
                                    <InputGroup label="Thời lượng" type="number" name="durationMinutes" value={currentEditItem.durationMinutes} onChange={handleChange} />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <SelectGroup label="Độ khó" name="difficulty" value={currentEditItem.difficulty} onChange={handleChange} options={<><option value="Easy">Dễ</option><option value="Medium">Trung bình</option><option value="Hard">Khó</option></>} />
                                    </div>
                                    <div className="flex items-end pb-3">
                                        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-xl hover:border-indigo-300 transition-colors w-full">
                                            <input type="checkbox" name="isPublic" checked={currentEditItem.isPublic} onChange={handleChange} className="w-5 h-5 accent-indigo-600 rounded" />
                                            <span className="text-sm font-bold text-slate-700">Công khai</span>
                                        </label>
                                    </div>
                                </div>
                                <TextAreaGroup label="Nội dung (HTML)" name="contentHtml" value={currentEditItem.contentHtml} onChange={handleChange} rows={5} />
                            </>
                        )}
                    </div>
                    <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
                        <button onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition">Hủy</button>
                        <button onClick={updateItem} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition"><Save size={18}/> Lưu Thay Đổi</button>
                    </div>
                </div>
            </div>
        );
    }

    const navItems = [
        { kind: 'header', label: 'TỔNG QUAN' },
        { id: 'dashboard', icon: LayoutDashboard, label: 'Thống Kê & Quản lý' },
        { kind: 'header', label: 'TẠO MỚI' },
        { id: 'create-contest', icon: Trophy, label: 'Tạo Cuộc Thi' },
        { id: 'create-problem', icon: Code, label: 'Thêm Bài Vào Contest' }, 
        { id: 'create-exercise', icon: Globe, label: 'Thêm Bài Luyện Tập' }, 
    ];

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
            <aside className="w-72 bg-white border-r border-slate-200 flex flex-col z-20 shadow-sm">
                <div className="p-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30"><ShieldCheck size={22} /></div>
                    <span className="font-extrabold text-xl tracking-tight text-slate-800">Algoverse <span className="text-indigo-600">Admin</span></span>
                </div>
                
                <nav className="flex-1 px-6 space-y-1 overflow-y-auto custom-scrollbar">
                    {navItems.map((item, idx) => (
                        item.kind === 'header' ? (
                            <div key={idx} className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-8 mb-3 px-3">{item.label}</div>
                        ) : (
                            <button
                                key={item.id}
                                onClick={() => setActiveNav(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm group ${
                                    activeNav === item.id 
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-100' 
                                        : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
                                }`}
                            >
                                <item.icon size={20} className={activeNav === item.id ? "text-white" : "text-slate-400 group-hover:text-indigo-600 transition-colors"}/>
                                {item.label}
                            </button>
                        )
                    ))}
                </nav>

                <div className="p-6 border-t border-slate-100">
                    <div className="flex items-center gap-3 mb-4 px-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sm font-bold text-indigo-600 shadow-sm">
                            {adminUser?.username ? adminUser.username.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate text-slate-800">{adminUser?.username || 'Đang tải...'}</p>
                            <p className="text-xs text-slate-400 truncate">Administrator</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 border-slate-100 text-slate-600 text-sm font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all">
                        <LogOut size={18}/> Đăng Xuất
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
                <header className="h-20 px-8 flex items-center justify-between bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                    <div>
                         <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                            {activeNav === 'dashboard' && 'Thống Kê & Quản Lý'}
                            {activeNav === 'create-contest' && 'Tạo Cuộc Thi Mới'}
                            {activeNav === 'create-problem' && 'Thêm Bài Vào Contest'}
                            {activeNav === 'create-exercise' && 'Thêm Bài Luyện Tập'}
                        </h1>
    
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {activeNav === 'dashboard' && renderManagementPage()}
                    {activeNav === 'create-contest' && renderCreateContestPage()}
                    {activeNav === 'create-problem' && renderCreateContestProblemPage()}
                    {activeNav === 'create-exercise' && renderCreatePracticePage()}
                </div>
            </main>

            <EditModal />
        </div>
    );
}