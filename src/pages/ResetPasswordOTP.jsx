import API_BASE_URL from '../config';
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ResetPasswordOTP() {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  if (!email) return <p>Lỗi: Không có email!</p>;

  const handleReset = async () => {
    const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword }),
    });

    const data = await res.json();
    setMsg(data.message);

    if (res.ok) {
      navigate("/login");
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl shadow-lg w-[350px]">
        <h2 className="text-xl font-bold text-center mb-4">Nhập OTP</h2>

        <p className="text-center text-gray-600 mb-3">
          OTP đã gửi đến email: <b>{email}</b>
        </p>

        <input
          type="text"
          placeholder="Nhập OTP"
          className="border p-2 w-full mb-3 rounded"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <input
          type="password"
          placeholder="Mật khẩu mới"
          className="border p-2 w-full mb-3 rounded"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <button
          className="w-full bg-black text-white p-3 rounded"
          onClick={handleReset}
        >
          Đặt lại mật khẩu
        </button>

        {msg && <p className="text-center text-red-600 mt-3">{msg}</p>}
      </div>
    </div>
  );
}