// src/components/ProblemEditor.jsx
import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Style cho editor

const ProblemEditor = ({ contestId, problemToEdit, onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    index: '',
    title: '',
    difficulty: 'Easy',
    contentHtml: '',
    sampleInput: '',
    sampleOutput: ''
  });

  // Nếu là chế độ Sửa (problemToEdit có dữ liệu) -> Đổ dữ liệu vào form
  useEffect(() => {
    if (problemToEdit) {
      setFormData({
        index: problemToEdit.index || '', // A, B, C...
        title: problemToEdit.title,
        difficulty: problemToEdit.difficulty,
        contentHtml: problemToEdit.content_html || '', // HTML đề bài cũ
        sampleInput: problemToEdit.sample_input || '',
        sampleOutput: problemToEdit.sample_output || ''
      });
    }
  }, [problemToEdit]);

  const handleSave = async () => {
    try {
      const url = problemToEdit 
        ? `http://localhost:5000/api/problems/${problemToEdit.id}` // Link Sửa
        : `http://localhost:5000/api/problems/create`;            // Link Tạo mới

      const method = problemToEdit ? 'PUT' : 'POST';
      
      const bodyData = {
        ...formData,
        contestId: contestId // Gửi kèm ID cuộc thi để biết bài này thuộc về đâu
      };

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      const data = await res.json();
      if (data.success) {
        alert(problemToEdit ? "Đã cập nhật bài tập!" : "Đã thêm bài tập mới!");
        onRefresh(); // Load lại danh sách bài
        onClose();   // Đóng form
      } else {
        alert("Lỗi: " + data.error);
      }
    } catch (err) {
      alert("Lỗi kết nối server");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
          <h2 className="font-bold text-lg">
            {problemToEdit ? `Sửa bài: ${problemToEdit.title}` : "Thêm bài tập thủ công"}
          </h2>
          <button onClick={onClose} className="text-red-400 font-bold hover:text-red-300">Đóng X</button>
        </div>

        {/* Body Form */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
               <label className="block text-sm font-bold mb-1">Mã bài (A,B..)</label>
               <input 
                 className="w-full border p-2 rounded" 
                 value={formData.index}
                 onChange={e => setFormData({...formData, index: e.target.value})}
                 placeholder="VD: A"
                 disabled={!!problemToEdit} // Khi sửa thì không đổi mã bài
               />
            </div>
            <div className="col-span-2">
               <label className="block text-sm font-bold mb-1">Tên bài</label>
               <input 
                 className="w-full border p-2 rounded" 
                 value={formData.title}
                 onChange={e => setFormData({...formData, title: e.target.value})}
                 placeholder="VD: Tổng hai số"
               />
            </div>
            <div>
               <label className="block text-sm font-bold mb-1">Độ khó</label>
               <select 
                 className="w-full border p-2 rounded"
                 value={formData.difficulty}
                 onChange={e => setFormData({...formData, difficulty: e.target.value})}
               >
                 <option value="Easy">Easy</option>
                 <option value="Medium">Medium</option>
                 <option value="Hard">Hard</option>
               </select>
            </div>
          </div>

          {/* EDITOR SOẠN THẢO */}
          <div>
            <label className="block text-sm font-bold mb-1">Nội dung đề bài (Tiếng Việt)</label>
            <ReactQuill 
              theme="snow" 
              value={formData.contentHtml} 
              onChange={(value) => setFormData({...formData, contentHtml: value})}
              className="h-64 mb-12" // mb-12 để chừa chỗ cho thanh công cụ
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <div>
              <label className="block text-sm font-bold mb-1">Sample Input</label>
              <textarea 
                className="w-full border p-2 rounded h-32 font-mono text-sm bg-gray-50"
                value={formData.sampleInput}
                onChange={e => setFormData({...formData, sampleInput: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Sample Output</label>
              <textarea 
                className="w-full border p-2 rounded h-32 font-mono text-sm bg-gray-50"
                value={formData.sampleOutput}
                onChange={e => setFormData({...formData, sampleOutput: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded">Hủy</button>
          <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700">
            {problemToEdit ? "Cập nhật đề" : "Lưu bài tập"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProblemEditor;