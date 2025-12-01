import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, ThumbsUp, X, Search, TrendingUp, Clock, 
  Share2, Send, Image as ImageIcon, Hash, Loader2, User, Code, Trash2 
} from 'lucide-react';
import axios from 'axios';

// --- UTILS ---
const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = (now - date) / 1000;
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return date.toLocaleDateString('vi-VN');
};

const topicColors = {
  'Sorting': 'text-blue-600 bg-blue-50',
  'Graph': 'text-green-600 bg-green-50',
  'DP': 'text-purple-600 bg-purple-50',
  'Bug': 'text-red-600 bg-red-50',
  'General': 'text-gray-600 bg-gray-50'
};

// URL Backend (Để hiển thị ảnh)
const API_URL = "http://localhost:5000";

// --- COMPONENTS ---

// 1. MODAL TẠO BÀI VIẾT (Có Upload Ảnh + Code Insert)
const CreatePostModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({ title: '', tags: '', content: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Xử lý chọn ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Xóa ảnh đã chọn
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  // Chèn Code Block vào nội dung
  const insertCodeBlock = () => {
    setFormData(prev => ({
      ...prev,
      content: prev.content + "\n\n```javascript\n// Viết code của bạn ở đây\n```\n"
    }));
  };

  const handleSubmit = async () => {
    if(!formData.title || !formData.content) return alert("Vui lòng nhập tiêu đề và nội dung");
    
    setLoading(true);
    
    // Dùng FormData để gửi file
    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('tags', formData.tags);
    if (imageFile) {
      data.append('image', imageFile);
    }

    await onSubmit(data);
    
    setLoading(false);
    // Reset form
    setFormData({ title: '', tags: '', content: '' });
    removeImage();
    onClose();
  };

  if(!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">Tạo bài viết mới</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X size={20}/></button>
        </div>
        
        <div className="p-4 space-y-4 overflow-y-auto">
          <input 
            className="w-full text-lg font-bold placeholder-gray-400 outline-none" 
            placeholder="Tiêu đề bài viết..."
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
          />
          
          <textarea 
            className="w-full h-32 resize-none outline-none text-gray-600 placeholder-gray-400" 
            placeholder="Bạn đang gặp vấn đề gì?"
            value={formData.content}
            onChange={e => setFormData({...formData, content: e.target.value})}
          />

          {/* Image Preview Area */}
          {imagePreview && (
            <div className="relative rounded-lg overflow-hidden border border-gray-200">
              <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover"/>
              <button 
                onClick={removeImage}
                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-red-500 transition"
              >
                <X size={16}/>
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 border rounded-lg p-2">
            <Hash size={18} className="text-gray-400"/>
            <input 
              className="flex-1 outline-none text-sm" 
              placeholder="Thẻ (VD: Java, Sorting...)"
              value={formData.tags}
              onChange={e => setFormData({...formData, tags: e.target.value})}
            />
          </div>

          {/* Toolbar */}
          <div className="flex gap-2">
             <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="hidden" 
                accept="image/*"
             />
             <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium text-gray-600">
                <ImageIcon size={16} className="text-green-500"/> Thêm ảnh
             </button>
             <button onClick={insertCodeBlock} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium text-gray-600">
                <Code size={16} className="text-blue-500"/> Chèn Code
             </button>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end gap-2 bg-gray-50">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium">Hủy</button>
            <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
            >
                {loading && <Loader2 className="animate-spin" size={16}/>} Đăng bài
            </button>
        </div>
      </motion.div>
    </div>
  );
};

// 2. MODAL CHI TIẾT BÀI VIẾT
const PostDetailModal = ({ post, isOpen, onClose, onVote, onComment }) => {
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState(post?.comments || []);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if(post) setComments(post.comments || []);
    }, [post]);

    const handleSend = async () => {
        if(!commentText.trim()) return;
        setIsSending(true);
        const newCmt = await onComment(post.id, commentText);
        if(newCmt) {
            setComments(prev => [newCmt, ...prev]); 
            setCommentText("");
        }
        setIsSending(false);
    };

    if(!isOpen || !post) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <motion.div 
                initial={{ opacity: 0, y: 50 }} 
                animate={{ opacity: 1, y: 0 }} 
                onClick={e => e.stopPropagation()}
                className="bg-white w-full max-w-2xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center shrink-0">
                    <h3 className="font-bold text-xl truncate pr-4">Bài viết của {post.username}</h3>
                    <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"><X size={20}/></button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    <div className="bg-white p-5 rounded-xl shadow-sm border mb-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                {post.avatar ? <img src={post.avatar} alt="avt" className="w-full h-full object-cover"/> : <User/>}
                            </div>
                            <div>
                                <div className="font-bold text-gray-900">{post.username}</div>
                                <div className="text-xs text-gray-500">{formatTime(post.created_at)}</div>
                            </div>
                        </div>
                        
                        <h2 className="text-xl font-bold mb-3">{post.title}</h2>
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed font-sans">{post.content}</p>
                        
                        {/* Hiển thị ảnh bài viết nếu có */}
                        {post.image_url && (
                            <div className="mt-4 rounded-lg overflow-hidden border border-gray-100">
                                <img src={`${API_URL}${post.image_url}`} alt="Post content" className="w-full h-auto object-cover"/>
                            </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                            {post.tags?.split(',').map((t,i) => (
                                <span key={i} className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded-full">#{t.trim()}</span>
                            ))}
                        </div>

                        <div className="mt-4 py-2 border-t border-b flex justify-between text-sm text-gray-500">
                            <span>{post.votes} lượt thích</span>
                            <span>{comments.length} bình luận</span>
                        </div>

                        <div className="flex gap-1 mt-2">
                            <button onClick={() => onVote(post.id)} className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 font-semibold transition ${post.is_voted ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}>
                                <ThumbsUp size={18} className={post.is_voted ? "fill-current" : ""}/> Thích
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {comments.length === 0 ? <p className="text-center text-gray-400 my-8">Chưa có bình luận nào.</p> : comments.map((cmt, i) => (
                            <div key={i} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs shrink-0 overflow-hidden">
                                    {cmt.avatar ? <img src={cmt.avatar} alt="avt" className="w-full h-full object-cover"/> : <User size={14}/>}
                                </div>
                                <div className="flex flex-col max-w-[85%]">
                                    <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border">
                                        <div className="font-bold text-sm text-gray-900">{cmt.username}</div>
                                        <p className="text-gray-800 text-sm mt-1">{cmt.content}</p>
                                    </div>
                                    <span className="text-xs text-gray-500 mt-1 ml-2">{formatTime(cmt.created_at)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Input */}
                <div className="p-4 bg-white border-t flex items-center gap-3 shrink-0">
                    <input 
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        className="w-full bg-gray-100 rounded-full px-4 py-2 pr-10 outline-none text-sm focus:ring-2 ring-blue-200 transition"
                        placeholder="Viết bình luận..."
                    />
                    <button onClick={handleSend} disabled={isSending} className="text-blue-600 hover:bg-blue-100 p-2 rounded-full transition">
                        {isSending ? <Loader2 size={20} className="animate-spin"/> : <Send size={20}/>}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// 3. POST CARD (Feed)
const PostCard = ({ post, onVote, onClick }) => {
    // Hàm copy link
    const handleShare = (e) => {
        e.stopPropagation();
        const link = `${window.location.origin}/community/posts/${post.id}`; // Giả lập link
        navigator.clipboard.writeText(link);
        alert("Đã copy link bài viết vào clipboard!");
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
            <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {post.avatar ? <img src={post.avatar} alt="avt" className="w-full h-full object-cover"/> : <User className="text-gray-500"/>}
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 cursor-pointer hover:underline">{post.username}</h4>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                            {formatTime(post.created_at)} • <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-600 font-medium">Member</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="cursor-pointer" onClick={onClick}>
                <h3 className="text-lg font-bold text-gray-800 mb-2 hover:text-blue-600 transition">{post.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-3 whitespace-pre-wrap">{post.content}</p>
                
                {/* Hiển thị ảnh thu nhỏ (nếu có) */}
                {post.image_url && (
                    <div className="mb-3 rounded-lg overflow-hidden border border-gray-100 max-h-60">
                        <img src={`${API_URL}${post.image_url}`} alt="Post content" className="w-full h-full object-cover"/>
                    </div>
                )}

                {post.tags && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.split(',').map((tag, i) => (
                            <span key={i} className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${topicColors[tag.trim()] || 'text-gray-600 bg-gray-100'}`}>
                                #{tag.trim()}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex justify-between text-xs text-gray-500 border-b pb-2 mb-2">
                <div className="flex items-center gap-1">
                    <div className="bg-blue-500 rounded-full p-1"><ThumbsUp size={10} className="text-white fill-current"/></div>
                    <span>{post.votes}</span>
                </div>
                <div className="flex gap-3">
                    <span>{post.answers_count || 0} bình luận</span>
                    <span>{post.views || 0} lượt xem</span>
                </div>
            </div>

            <div className="flex gap-1">
                <button 
                    onClick={(e) => { e.stopPropagation(); onVote(post.id); }}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition ${post.is_voted ? 'text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <ThumbsUp size={18} className={post.is_voted ? "fill-current" : ""}/> Thích
                </button>
                <button 
                    onClick={onClick}
                    className="flex-1 py-1.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
                >
                    <MessageSquare size={18}/> Bình luận
                </button>
                <button 
                    onClick={handleShare}
                    className="flex-1 py-1.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
                >
                    <Share2 size={18}/> Chia sẻ
                </button>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---
export default function CommunityPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [filter, setFilter] = useState('newest'); 
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await axios.get(`${API_URL}/api/posts?sort=${filter}&search=${searchTerm}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if(res.data.success) {
                setPosts(res.data.data);
            }
        } catch (error) {
            console.error("Lỗi tải bài viết:", error);
        } finally {
            setLoading(false);
        }
    }, [filter, searchTerm]);

    useEffect(() => {
        const timer = setTimeout(fetchPosts, 500);
        return () => clearTimeout(timer);
    }, [fetchPosts]);

    // Xử lý tạo bài (Gửi FormData)
    const handleCreatePost = async (formData) => {
        const token = localStorage.getItem("accessToken");
        if(!token) return alert("Bạn cần đăng nhập!");
        try {
            await axios.post(`${API_URL}/api/posts`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data' // Bắt buộc khi upload file
                }
            });
            fetchPosts(); 
        } catch (error) {
            alert("Lỗi đăng bài: " + (error.response?.data?.message || error.message));
        }
    };

    const handleVote = async (postId) => {
        const token = localStorage.getItem("accessToken");
        if(!token) return alert("Bạn cần đăng nhập!");
        
        const updatedPosts = posts.map(p => {
            if(p.id === postId) {
                return { ...p, is_voted: !p.is_voted, votes: p.is_voted ? p.votes - 1 : p.votes + 1 };
            }
            return p;
        });
        setPosts(updatedPosts);
        if(selectedPost && selectedPost.id === postId) {
            setSelectedPost(updatedPosts.find(p => p.id === postId));
        }

        try {
            await axios.post(`${API_URL}/api/posts/${postId}/vote`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            fetchPosts();
        }
    };

    const handleComment = async (postId, content) => {
        const token = localStorage.getItem("accessToken");
        try {
            const res = await axios.post(`${API_URL}/api/posts/${postId}/comments`, { content }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if(res.data.success) {
                setPosts(prev => prev.map(p => p.id === postId ? {...p, answers_count: (p.answers_count||0) + 1} : p));
                return res.data.data;
            }
        } catch (error) {
            alert("Lỗi bình luận");
            return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 pt-20 px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* MENU LEFT */}
                <div className="hidden lg:block lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24">
                        <div className="space-y-1">
                            <button onClick={() => setFilter('newest')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 font-medium transition ${filter === 'newest' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>
                                <Clock size={20}/> Mới nhất
                            </button>
                            <button onClick={() => setFilter('trending')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 font-medium transition ${filter === 'trending' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>
                                <TrendingUp size={20}/> Nổi bật
                            </button>
                            <div className="border-t my-2"></div>
                            <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase">Chủ đề</div>
                            {['Sorting', 'Graph', 'DP', 'Tree'].map(tag => (
                                <button key={tag} onClick={() => setSearchTerm(tag)} className="w-full text-left px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-2">
                                    <Hash size={16}/> {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* FEED CENTER */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                        <div className="flex gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                <User className="text-gray-500"/>
                            </div>
                            <div 
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-gray-500 cursor-pointer hover:bg-gray-200 transition flex items-center"
                            >
                                Bạn đang thắc mắc điều gì?
                            </div>
                        </div>
                        <div className="border-t pt-2 flex justify-between px-2">
                            <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg"><ImageIcon size={18} className="text-green-500"/> Ảnh</button>
                            <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg"><Code size={18} className="text-blue-500"/> Code Block</button>
                        </div>
                    </div>

                    <div className="lg:hidden mb-4 relative">
                        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 outline-none" placeholder="Tìm kiếm bài viết..." />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" size={32}/></div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">Chưa có bài viết nào.</div>
                    ) : (
                        <div className="space-y-4">
                            {posts.map(post => (
                                <PostCard 
                                    key={post.id} 
                                    post={post} 
                                    onVote={handleVote}
                                    onClick={() => setSelectedPost(post)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* STATS RIGHT */}
                <div className="hidden lg:block lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24 border border-blue-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <TrendingUp className="text-blue-600"/> Xu hướng
                        </h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-3 items-start">
                                    <span className="text-xl font-bold text-gray-300">0{i}</span>
                                    <div>
                                        <h4 className="font-semibold text-sm text-gray-800 hover:text-blue-600 cursor-pointer line-clamp-2">
                                            Làm sao để tối ưu thuật toán Dijkstra?
                                        </h4>
                                        <div className="text-xs text-gray-500 mt-1">120 lượt xem</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            <CreatePostModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onSubmit={handleCreatePost}
            />
            
            <PostDetailModal 
                post={selectedPost}
                isOpen={!!selectedPost}
                onClose={() => setSelectedPost(null)}
                onVote={handleVote}
                onComment={handleComment}
            />
        </div>
    );
}