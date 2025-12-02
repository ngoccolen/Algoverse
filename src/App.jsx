import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import AlgorithmExplorer from "./pages/Explore";
import AuthPage from "./pages/Login";
import ContestPage from "./pages/Contest";
import CommunityPage from "./pages/Community";
import HomePage from "./pages/Home";
import PracticePage from "./pages/practice";
import PracticeDetail from "./pages/practiceDetail";
// [XÓA DÒNG NÀY]: import PracticeGame from "./pages/PracticeGame"; 
import RegisterPage from "./pages/Register";
import ProfilePage from "./pages/profile";
import ForgotPassword from "./pages/ForgotPassword";
import LoginSuccess from "./pages/LoginSuccess";
import ResetPasswordOTP from "./pages/ResetPasswordOTP";
import LearningPath from './pages/LearningPath';
import LabDetail from './pages/LabDetail'; 
import AdminDashboard from "./pages/AdminDashboard";

import { AuthContext } from "./context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
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

        {/* Practice Detail */}
        <Route
          path="/practice/:id"
          element={
            <PrivateRoute>
              <PracticeDetail />
            </PrivateRoute>
          }
        />

        {/* [XÓA ĐOẠN ROUTE GAME NÀY ĐI] */}
        {/* <Route path="/practice/game/:id" ... /> */}

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}