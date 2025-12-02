import React, { useState } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
    const [contestForm, setContestForm] = useState({ title: '', description: '', startTime: '', durationMinutes: 120 });
    const [problemForm, setProblemForm] = useState({ contestId: '', problemId: '', index: 'A', points: 100 });

    const token = localStorage.getItem("accessToken");

    const createContest = async () => {
        try {
            const res = await axios.post('http://localhost:5000/api/contests/create', contestForm, { headers: { Authorization: `Bearer ${token}` } });
            alert(`Tạo Contest thành công! ID: ${res.data.contestId}`);
        } catch (e) { alert("Lỗi tạo contest"); }
    };

    const addProblem = async () => {
        try {
            await axios.post('http://localhost:5000/api/contests/add-problem', problemForm, { headers: { Authorization: `Bearer ${token}` } });
            alert("Đã thêm bài vào contest!");
        } catch (e) { alert("Lỗi thêm bài"); }
    };

    return (
        <div className="min-h-screen bg-slate-100 pt-24 px-6">
            <h1 className="text-3xl font-black text-slate-800 mb-8">Admin Dashboard</h1>
            
            <div className="grid md:grid-cols-2 gap-8">
                {/* 1. Form Tạo Contest */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-bold mb-4 text-blue-600">1. Tạo Cuộc Thi Mới</h2>
                    <div className="space-y-3">
                        <input className="w-full border p-2 rounded" placeholder="Tên cuộc thi" onChange={e => setContestForm({...contestForm, title: e.target.value})} />
                        <textarea className="w-full border p-2 rounded" placeholder="Mô tả" onChange={e => setContestForm({...contestForm, description: e.target.value})} />
                        <div className="flex gap-2">
                            <input type="datetime-local" className="border p-2 rounded flex-1" onChange={e => setContestForm({...contestForm, startTime: e.target.value})} />
                            <input type="number" className="border p-2 rounded w-24" placeholder="Phút" value={contestForm.durationMinutes} onChange={e => setContestForm({...contestForm, durationMinutes: e.target.value})} />
                        </div>
                        <button onClick={createContest} className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">Tạo Contest</button>
                    </div>
                </div>

                {/* 2. Form Up Đề Thi (Link bài tập vào Contest) */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-bold mb-4 text-green-600">2. Up Đề Thi Vào Contest</h2>
                    <p className="text-sm text-gray-500 mb-3">Nhập ID cuộc thi vừa tạo và ID bài tập có sẵn trong kho.</p>
                    <div className="space-y-3">
                        <input className="w-full border p-2 rounded" placeholder="Contest ID (VD: 1)" onChange={e => setProblemForm({...problemForm, contestId: e.target.value})} />
                        <input className="w-full border p-2 rounded" placeholder="Problem ID trong kho (VD: 101)" onChange={e => setProblemForm({...problemForm, problemId: e.target.value})} />
                        <div className="flex gap-2">
                            <input className="border p-2 rounded flex-1" placeholder="Mã bài (A, B, C...)" onChange={e => setProblemForm({...problemForm, index: e.target.value})} />
                            <input className="border p-2 rounded flex-1" placeholder="Điểm (100)" onChange={e => setProblemForm({...problemForm, points: e.target.value})} />
                        </div>
                        <button onClick={addProblem} className="w-full bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700">Thêm Bài Này Vào Contest</button>
                    </div>
                </div>
            </div>
        </div>
    );
}