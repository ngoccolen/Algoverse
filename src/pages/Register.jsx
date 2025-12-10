import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, UserPlus } from "lucide-react";
import axios from "axios";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = "Username không được để trống.";
    if (!email.trim()) newErrors.email = "Email không được để trống.";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email không hợp lệ.";
    if (!password) newErrors.password = "Mật khẩu không được để trống.";
    else if (password.length < 6) newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    if (!confirmPassword) newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setMessage(null);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        username, email, password,
      });

      if (res.data.success) {
        setMessage("Đăng ký thành công! Đang chuyển hướng...");
        
        localStorage.setItem("accessToken", res.data.accessToken);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        window.dispatchEvent(new Event("storage"));

        setTimeout(() => {
          navigate("/"); 
           window.location.reload(); 
        }, 1000);
      } else {
        setMessage(res.data.message || "Đăng ký thất bại.");
      }
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Lỗi kết nối Server");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-start justify-center p-4 pt-32 pb-12 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl relative z-10"
      >
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className="grid md:grid-cols-2 gap-0">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden md:flex bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-12 flex-col justify-center items-center relative overflow-hidden min-h-[500px]"
            >
              <div className="absolute inset-0 bg-black/10" />
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <div className="w-64 h-64 bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 flex flex-col items-center justify-center space-y-6">
                    <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                      <UserPlus className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white text-center">Tham gia với chúng tôi ngay!</h2>
                    <p className="text-white/80 text-center text-sm">Tạo tài khoản và bắt đầu 1 hành trình đầy thú vị</p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="p-8 md:p-12 flex flex-col justify-center"
            >
              <div className="mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Tạo tài khoản</h1>
                <p className="text-gray-600">Nhập đầy đủ thông tin để đăng ký tài khoản</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Gõ tên đăng nhập" className={`w-full pl-12 pr-4 py-3 bg-gray-50 border-2 ${errors.username ? "border-red-400" : "border-gray-200"} rounded-xl focus:border-purple-500 focus:bg-white outline-none transition-all duration-200`} />
                  </div>
                  {errors.username && <p className="text-red-500 text-sm mt-2">{errors.username}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Nhập email của bạn" className={`w-full pl-12 pr-4 py-3 bg-gray-50 border-2 ${errors.email ? "border-red-400" : "border-gray-200"} rounded-xl focus:border-purple-500 focus:bg-white outline-none transition-all duration-200`} />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Tạo mật khẩu" className={`w-full pl-12 pr-12 py-3 bg-gray-50 border-2 ${errors.password ? "border-red-400" : "border-gray-200"} rounded-xl focus:border-purple-500 focus:bg-white outline-none transition-all duration-200`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-600 transition-colors">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-sm mt-2">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Xác nhận mật khẩu" className={`w-full pl-12 pr-12 py-3 bg-gray-50 border-2 ${errors.confirmPassword ? "border-red-400" : "border-gray-200"} rounded-xl focus:border-purple-500 focus:bg-white outline-none transition-all duration-200`} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-600 transition-colors">
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-2">{errors.confirmPassword}</p>}
                </div>
              </div>

              {message && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 p-3 rounded-lg text-center font-medium border ${message.includes("thành công") ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                  {message}
                </motion.div>
              )}

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleRegister} disabled={loading} className="w-full mt-6 py-3 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? "Processing..." : "Tạo tài khoản"}
              </motion.button>

              <p className="text-center text-gray-600 mt-6">
                Đã có tài khoản? <Link to="/login" className="text-purple-600 font-bold hover:underline">Đăng nhập</Link>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;