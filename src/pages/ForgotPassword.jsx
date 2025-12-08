import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const sendOtp = async () => {
    const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setMsg(data.message);

    if (res.ok) {
      // chuyển sang trang nhập OTP
      navigate("/reset-otp", { state: { email } });
    }
  };

  return (
     <div className="w-full h-screen flex justify-center items-center bg-gray-100 z-[100] relative">
      <div className="bg-white p-8 rounded-xl shadow-lg w-[400px]">
        <h2 className="text-2xl font-bold text-center mb-5">
          Forgot Password
        </h2>

        <input
          type="email"
          placeholder="Nhập email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded-md mb-4"
        />

        <button
          onClick={sendOtp}
          className="w-full bg-black text-white p-3 rounded-md"
        >
          Gửi OTP
        </button>

        {msg && (
          <p className="text-center text-red-600 font-semibold mt-4">
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}