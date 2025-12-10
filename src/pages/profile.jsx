import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, MapPin, Mail, LogOut, Award, 
  Calendar, Activity, Save, Camera, Trophy
} from "lucide-react";
import axios from 'axios';
import Footer from '../components/Footer/Footer'; 

const API_URL = "http://localhost:5000";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [contestHistory, setContestHistory] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); 
  
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [editForm, setEditForm] = useState({ bio: "", location: "" });

  // --- LẤY DỮ LIỆU ---
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("accessToken"); 
      if (!token) return navigate("/login");

      try {
        const res = await axios.get(`${API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setUser(res.data.user);
          setActivities(res.data.recentActivity || []);
          setContestHistory(res.data.contestHistory || []); 
          
          setEditForm({
            bio: res.data.user.bio || "",
            location: res.data.user.location || ""
          });
        }
      } catch (err) {
        if(err.response?.status === 401) handleLogout();
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken"); 
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken"); 
    try {
      await axios.put(`${API_URL}/api/users/profile`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Cập nhật thông tin thành công!");
      setUser({...user, ...editForm});
    } catch(err) { alert("Lỗi cập nhật"); }
  };

  const handleAvatarUpload = async (e) => {
      const file = e.target.files[0];
      if(!file) return;

      const formData = new FormData();
      formData.append('avatar', file);
      const token = localStorage.getItem("accessToken");

      try {
          const res = await axios.post(`${API_URL}/api/users/avatar`, formData, {
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
          });
          if(res.data.success) {
              setUser({...user, avatar: res.data.avatar});
              alert("Đổi ảnh đại diện thành công!");
          }
      } catch (err) { alert("Lỗi upload ảnh"); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      <div className="pt-24 pb-12 px-4 flex-grow">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 relative">
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative">
                        <button onClick={handleLogout} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white transition backdrop-blur-sm" title="Đăng xuất"><LogOut size={18}/></button>
                    </div>
                    
                    <div className="px-6 pb-8 relative text-center -mt-16">
                        <div className="relative inline-block group">
                            <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden relative">
                                <img 
                                    src={user?.avatar?.startsWith("http") ? user.avatar : `${API_URL}${user?.avatar}`} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {e.target.src = "https://ui-avatars.com/api/?name=" + user?.username}} 
                                />
                            </div>
                            <div onClick={() => fileInputRef.current.click()} className="absolute bottom-1 right-1 p-2 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition shadow-md border-2 border-white">
                                <Camera size={16}/>
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*"/>
                        </div>

                        <h1 className="text-2xl font-black text-slate-800 mt-3">{user?.username}</h1>
                        <p className="text-slate-500 font-medium text-sm">@{user?.username?.toLowerCase()}</p>
                        
                        <div className="mt-6 text-left space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            {user?.bio && <p className="text-slate-600 text-sm italic mb-2">"{user.bio}"</p>}
                            <div className="space-y-2 pt-2 border-t border-slate-200">
                                {user?.location && <div className="flex items-center gap-2 text-sm text-slate-600"><MapPin size={16} className="text-red-500"/> {user.location}</div>}
                                <div className="flex items-center gap-2 text-sm text-slate-600"><Calendar size={16} className="text-blue-500"/> Tham gia: {new Date(user?.created_at).toLocaleDateString('vi-VN')}</div>
                                <div className="flex items-center gap-2 text-sm text-slate-600"><Mail size={16} className="text-green-500"/> {user?.email}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Award className="text-yellow-500"/> Thống kê</h3>
                    
                    <div className="grid grid-cols-1 gap-4 text-center mb-6">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center hover:bg-blue-50 hover:border-blue-100 transition">
                            <div className="text-3xl font-black text-blue-600">{user?.totalSubmissions || 0}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase mt-1">Tổng bài nộp</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {[
                            { label: 'Easy', color: 'bg-green-500', val: user?.stats?.Easy || 0, max: 20 },
                            { label: 'Medium', color: 'bg-yellow-500', val: user?.stats?.Medium || 0, max: 20 },
                            { label: 'Hard', color: 'bg-red-500', val: user?.stats?.Hard || 0, max: 20 },
                        ].map((stat, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between text-xs mb-1 font-bold"><span className="text-slate-600">{stat.label}</span><span>{stat.val}</span></div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden"><div className={`${stat.color} h-2 rounded-full transition-all duration-1000`} style={{width: `${Math.min((stat.val / Math.max(stat.max, 1)) * 100, 100)}%`}}></div></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-8">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden min-h-[600px]">
                    <div className="flex border-b border-slate-100">
                        {['overview', 'settings'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 text-sm font-bold capitalize transition ${activeTab === tab ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                                {tab === 'overview' ? 'Tổng quan' : 'Cài đặt'}
                            </button>
                        ))}
                    </div>

                    <div className="p-8">
                        {activeTab === 'overview' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            
                                <div>
                                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <Trophy className="text-yellow-500"/> Các cuộc thi đã tham gia
                                    </h3>
                                    {contestHistory.length === 0 ? (
                                        <div className="text-center py-6 text-slate-400 border border-dashed rounded-xl bg-slate-50">Chưa tham gia cuộc thi nào.</div>
                                    ) : (
                                        <div className="grid gap-3">
                                            {contestHistory.map((c) => (
                                                <div key={c.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition">
                                                    <div>
                                                        <div className="font-bold text-slate-800 text-lg">{c.title}</div>
                                                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                            <Calendar size={12}/> Đăng ký: {new Date(c.registered_at).toLocaleDateString('vi-VN')}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-black text-blue-600 text-lg">{c.score} <span className="text-xs font-normal text-slate-500">Điểm</span></div>
                                                        <div className="text-xs text-slate-400">Penalty: {c.penalty}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Activity className="text-blue-500"/> Code gần đây</h3>
                                    {activities.length === 0 ? <div className="text-center py-6 text-slate-400 bg-slate-50 border border-dashed rounded-xl">Chưa giải bài nào.</div> : (
                                        <div className="space-y-3">
                                            {activities.map((act) => (
                                            <div key={act.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition">
                                                <div>
                                                    <div className="font-bold text-slate-800">{act.title}</div>
                                                    <div className="text-xs text-slate-500 mt-1 flex gap-2">
                                                        <span className={`px-2 py-0.5 rounded border ${act.difficulty === 'Easy' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>{act.difficulty}</span>
                                                        <span>{new Date(act.created_at).toLocaleString('vi-VN')}</span>
                                                    </div>
                                                </div>
                                                <span className={`font-bold text-xs px-3 py-1 rounded-full ${act.status === 'Accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{act.status}</span>
                                            </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <form onSubmit={handleUpdateProfile} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">Giới thiệu (Bio)</label><textarea className="w-full border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none" rows="4" value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})}/></div>
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">Nơi ở</label><input type="text" className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})}/></div>
                            <div className="flex justify-end"><button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"><Save size={18}/> Lưu thay đổi</button></div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}