import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hàm đăng xuất chuẩn: Xóa sạch mọi thứ
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    // Có thể điều hướng về login nếu cần, nhưng thường để component con tự xử lý
  };

  const login = (userData, token) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // KIỂM TRA ĐĂNG NHẬP KHI MỞ WEB (QUAN TRỌNG)
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");

      // 1. Nếu không có token -> Coi như chưa đăng nhập
      if (!token) {
        logout();
        setLoading(false);
        return;
      }

      // 2. Nếu có token, thử gọi API lấy profile để xem token còn sống không
      try {
        // Cập nhật User từ LocalStorage trước để giao diện hiện nhanh
        if (storedUser) setUser(JSON.parse(storedUser));

        const res = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          // Token ngon -> Cập nhật thông tin mới nhất từ server
          setUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        } else {
          // Token lởm -> Đăng xuất
          throw new Error("Token invalid");
        }
      } catch (err) {
        console.error("Phiên đăng nhập hết hạn:", err);
        logout(); // Token hết hạn -> Xóa sạch để ko hiện tên ảo nữa
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};