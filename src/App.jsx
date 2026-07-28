import React, { useContext } from "react";
import ChatBot from "./components/ChatBot/ChatBot";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

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
import LearningPathSurvey from './pages/LearningPathSurvey';
import PersonalizedLearningPath from './pages/PersonalizedLearningPath';
import LabDetail from './pages/LabDetail'; 
import AdminDashboard from "./pages/AdminDashboard";
import { AuthContext } from "./context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }
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
        <Route path="/learning-path/survey" element={<LearningPathSurvey />} />
        <Route path="/learning-path" element={<PersonalizedLearningPath />} />
        <Route path="/lab/:algKey" element={<LabDetail />} />
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

        <Route 
          path="/admin" 
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ChatBot />
    </Router>
  );
}
