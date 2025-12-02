import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, LogIn, X, ArrowRight, KeyRound, CheckCircle } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // --- STATE CHO FORGOT PASSWORD MODAL ---
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Nhập Email, 2: Nhập OTP & Pass mới
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // --- LOGIC ĐĂNG NHẬP ---
  const handleLogin = async () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = "Vui lòng nhập Username.";
    if (!password) newErrors.password = "Vui lòng nhập Mật khẩu.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    setMessage(null);

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", { username, password });

      if (response.data.success) {
        const token = response.data.accessToken; 
        localStorage.setItem("accessToken", token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        
        if (login) login(response.data.user, token);
        window.dispatchEvent(new Event("storage"));

        navigate("/");
      } else {
        setMessage(response.data.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || err.response?.data?.msg || "Lỗi kết nối Server.");
    }
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  // --- LOGIC QUÊN MẬT KHẨU ---
  const handleSendOtp = async () => {
    if (!forgotEmail) { setForgotMsg("Vui lòng nhập email"); return; }
    setForgotLoading(true);
    setForgotMsg("");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", { email: forgotEmail });
      setForgotMsg(res.data.message);
      if (res.status === 200) {
        setForgotStep(2); 
      }
    } catch (err) {
      setForgotMsg(err.response?.data?.message || "Lỗi gửi OTP");
    }
    setForgotLoading(false);
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword) { setForgotMsg("Vui lòng nhập đủ thông tin"); return; }
    setForgotLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/reset-password", { 
        email: forgotEmail, otp, newPassword 
      });
      setForgotMsg(res.data.message);
      if (res.status === 200) {
        setTimeout(() => {
          setShowForgotModal(false);
          setMessage("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
          setForgotStep(1); setForgotEmail(""); setOtp(""); setNewPassword("");
        }, 2000);
      }
    } catch (err) {
      setForgotMsg(err.response?.data?.message || "Lỗi đặt lại mật khẩu");
    }
    setForgotLoading(false);
  };

  return (
    // SỬA Ở ĐÂY: Thêm 'pt-24' (padding-top: 96px) để đẩy nội dung xuống dưới Navbar
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 pt-24 overflow-hidden relative">
      
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl" />
        <motion.div animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-6xl relative z-10">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left Side */}
            <div className="hidden md:flex bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-12 flex-col justify-center items-center relative overflow-hidden">
               <div className="absolute inset-0 bg-black/10"></div>
               <div className="relative z-10 text-white text-center">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <LogIn className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">Chào mừng trở lại!</h2>
                  <p className="text-white/80">Đăng nhập để tiếp tục hành trình chinh phục thuật toán cùng Algoverse</p>
               </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Đăng nhập</h1>
                <p className="text-gray-600">Nhập thông tin tài khoản để truy cập</p>
              </div>

              <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl p-4 font-semibold text-gray-700 transition-all duration-200 shadow-sm hover:shadow-md mb-6">
                <FcGoogle size={24} /> Tiếp tục với Google
              </button>

              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-sm text-gray-500 font-medium">HOẶC</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Nhập tên đăng nhập" className={`w-full pl-12 pr-4 py-3 bg-gray-50 border-2 ${errors.username ? "border-red-400" : "border-gray-200"} rounded-xl focus:border-purple-500 focus:bg-white outline-none transition-all duration-200`} />
                  </div>
                  {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nhập mật khẩu" className={`w-full pl-12 pr-12 py-3 bg-gray-50 border-2 ${errors.password ? "border-red-400" : "border-gray-200"} rounded-xl focus:border-purple-500 focus:bg-white outline-none transition-all duration-200`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                    <span className="ml-2 text-sm text-gray-700">Ghi nhớ đăng nhập</span>
                  </label>
                  <button type="button" onClick={() => setShowForgotModal(true)} className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors">
                    Quên mật khẩu?
                  </button>
                </div>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleLogin} disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50">
                  {loading ? "Đang xử lý..." : "Đăng nhập"}
                </motion.button>
                
                {message && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center font-medium">{message}</div>}
              </div>

              <p className="text-center text-sm text-gray-600 mt-8">
                Chưa có tài khoản? <button onClick={() => navigate("/register")} className="font-semibold text-purple-600 hover:text-purple-700 transition-colors">Đăng ký ngay</button>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* --- MODAL FORGOT PASSWORD (Giữ nguyên) --- */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForgotModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex justify-between items-center text-white">
                <h3 className="text-xl font-bold flex items-center gap-2">
                   <KeyRound size={20} /> Khôi phục mật khẩu
                </h3>
                <button onClick={() => setShowForgotModal(false)} className="bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition"><X size={18} /></button>
              </div>

              <div className="p-6 md:p-8">
                {forgotStep === 1 ? (
                  <div className="space-y-4">
                    <p className="text-gray-600 text-sm text-center">Nhập email đăng ký của bạn. Chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.</p>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="vidu@email.com" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" />
                    </div>
                    {forgotMsg && <p className={`text-sm text-center ${forgotMsg.includes("thành công") ? "text-green-600" : "text-red-500"}`}>{forgotMsg}</p>}
                    <button onClick={handleSendOtp} disabled={forgotLoading} className="w-full bg-black text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition">
                      {forgotLoading ? "Đang gửi..." : <>Gửi OTP <ArrowRight size={18}/></>}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 bg-green-50 text-green-700 p-3 rounded-lg text-xs font-medium border border-green-200">
                       <CheckCircle size={14} /> OTP đã được gửi đến {forgotEmail}
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Mã OTP</label>
                       <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Nhập mã 6 số" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-mono text-center text-lg tracking-widest" />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                       <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nhập mật khẩu mới" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" />
                    </div>
                    {forgotMsg && <p className={`text-sm text-center ${forgotMsg.includes("thành công") ? "text-green-600" : "text-red-500"}`}>{forgotMsg}</p>}
                    <button onClick={handleResetPassword} disabled={forgotLoading} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition">
                      {forgotLoading ? "Đang xử lý..." : "Xác nhận đổi mật khẩu"}
                    </button>
                    <button onClick={() => setForgotStep(1)} className="w-full text-sm text-gray-500 hover:text-gray-800 py-2">Quay lại nhập Email</button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;