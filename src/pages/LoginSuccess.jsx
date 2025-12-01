import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const token = params.get("token");
    const id = params.get("id");
    const username = params.get("username");
    const email = params.get("email");
    const avatar = params.get("avatar");

    if (token) {
      const user = { id, username, email, avatar };

      // --- SỬA QUAN TRỌNG: Phải là "accessToken" để khớp với cả hệ thống ---
      localStorage.setItem("accessToken", token);
      
      localStorage.setItem("user", JSON.stringify(user));

      // Dispatch sự kiện để Navbar cập nhật ngay lập tức (giống Register/Login)
      window.dispatchEvent(new Event("storage"));

      // Chuyển hướng
      setTimeout(() => {
          navigate("/"); 
      }, 100);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Đang xử lý đăng nhập Google...</p>
      </div>
    </div>
  );
}