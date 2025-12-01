import React, { useState } from "react";

export default function PracticeTab({ onSolved }) {
  const [inputText, setInputText] = useState("5,3,1,4,2");
  const [result, setResult] = useState(null);
  const [solved, setSolved] = useState(false);

  function runCheck() {
    const arr = inputText.split(",").map((n) => Number(n.trim())).filter((n) => !isNaN(n));
    const expected = bubbleSort(arr.slice());
    setResult(expected);
    setSolved(true);
    if (onSolved) onSolved();
  }

  return (
    <div className="practice-tab">
      <h3>Bài tập: Viết thuật toán sắp xếp tăng dần</h3>
      <p>Nhập mảng số, phân cách bằng dấu phẩy (ví dụ: 5,3,1,4,2)</p>

      <div className="practice-input">
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Nhập dãy số"
        />
        <button className="btn primary" onClick={runCheck}>
          ▶️ Chạy thử
        </button>
      </div>

      {result && (
        <div className="practice-result">
          <p>
            ✅ Kết quả sắp xếp: <strong>[{result.join(", ")}]</strong>
          </p>
          {solved && <div className="xp">🎉 Bạn đã nhận +10 XP!</div>}
        </div>
      )}

      <div className="practice-code">
        <h4>Khung code (mẫu)</h4>
        <textarea
          readOnly
          rows={8}
          value={`function bubbleSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        const t = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = t;
      }
    }
  }
  return arr;
}`}
        />
      </div>
    </div>
  );
}

// hàm mẫu để kiểm tra kết quả người dùng
function bubbleSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        const t = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = t;
      }
    }
  }
  return arr;
}
