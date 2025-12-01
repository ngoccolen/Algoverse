import React from "react";

export default function ProgressTab({ progress }) {
  return (
    <div className="progress-tab">
      <h3>Tiến trình học tập của bạn</h3>

      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="progress-info">
        <p>📊 Tiến độ: <strong>{progress}%</strong></p>
        <p>🏅 XP hiện tại: <strong>{Math.floor(progress * 1.5)} XP</strong></p>
      </div>

      <div className="progress-cards">
        <div className="progress-card">
          <h4>Bubble Sort</h4>
          <p>✅ Hoàn thành</p>
        </div>
        <div className="progress-card">
          <h4>Insertion Sort</h4>
          <p>🔜 Đang học</p>
        </div>
        <div className="progress-card">
          <h4>Merge Sort</h4>
          <p>🔲 Chưa học</p>
        </div>
      </div>

      {progress >= 100 && (
        <div className="progress-badge">
          🎉 Chúc mừng! Bạn đã hoàn thành tất cả bài học trong module Sorting!
        </div>
      )}
    </div>
  );
}
