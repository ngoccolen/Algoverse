import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Import các component
import Navbar from "./components/Navbar/Navbar";
import AlgorithmExplorer from "./pages/Explore";
import AuthPage from "./pages/Login";
import ContestPage from "./pages/Contest";
import CommunityPage from "./pages/Community";
import HomePage from "./pages/Home";
import PracticePage from "./pages/practice";
import PracticeDetail from "./pages/practiceDetail";
import RegisterPage from "./pages/Register";
import ProfilePage from "./pages/profile";
import ForgotPassword from "./pages/ForgotPassword";
import LoginSuccess from "./pages/LoginSuccess";
import ResetPasswordOTP from "./pages/ResetPasswordOTP";
import LearningPath from './pages/LearningPath';
import LabDetail from './pages/LabDetail'; 
import AdminDashboard from "./pages/AdminDashboard";

// Import Context
import { AuthContext } from "./context/AuthContext";

// --- [SỬA LỖI QUAN TRỌNG Ở ĐÂY] ---
const PrivateRoute = ({ children }) => {
  // 1. Lấy thêm biến 'loading' từ AuthContext
  const { user, loading } = useContext(AuthContext);

  // 2. Nếu đang tải thông tin user từ LocalStorage -> Hiện màn hình chờ (Spinner)
  // Việc này ngăn chặn React chuyển hướng sai khi chưa kịp đọc Token
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  // 3. Tải xong rồi mới kiểm tra: Có user thì cho vào, không có thì về Login
  return user ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<AlgorithmExplorer />} />
        <Route path="/contests" element={<ContestPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/login-success" element={<LoginSuccess />} />
        <Route path="/reset-otp" element={<ResetPasswordOTP />} />

        <Route path="/practice" element={<PracticePage />} />
        <Route path="/path/:categoryId" element={<LearningPath />} />
        <Route path="/lab/:algKey" element={<LabDetail />} />

        {/* Practice Detail - Yêu cầu đăng nhập */}
        <Route
          path="/practice/:id"
          element={
            <PrivateRoute>
              <PracticeDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />

        {/* Trang Admin - Yêu cầu đăng nhập */}
        <Route 
          path="/admin" 
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          } 
        />

        {/* Route bắt tất cả các link sai (LUÔN ĐỂ CUỐI CÙNG) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}