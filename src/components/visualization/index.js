// src/components/visualizations/index.js
import React from 'react';
import { Activity, Construction } from 'lucide-react';

// --- 1. IMPORT CÁC COMPONENT THUẬT TOÁN ---
import BubbleSort from './BubbleSort';
import SelectionSort from './SelectionSort'; // <--- Import SelectionSort mới thêm

// --- 2. BẢNG ÁNH XẠ (MAPPING) ---
// Key bên trái phải trùng khớp với 'alg_key' trong Database hoặc URL
const ALGORITHM_COMPONENTS = {
  'bubble-sort': BubbleSort,
  'selection-sort': SelectionSort, // <--- Đăng ký SelectionSort vào đây
  
  // Placeholder cho các thuật toán chưa làm
  'quick-sort': () => <Placeholder name="Quick Sort" />,
  'merge-sort': () => <Placeholder name="Merge Sort" />,
  'insertion-sort': () => <Placeholder name="Insertion Sort" />,
};

// --- 3. COMPONENT QUẢN LÝ CHÍNH ---
const AlgorithmVisualizer = ({ algKey, ...props }) => {
  // Lấy ra Component tương ứng với key
  const VisualizerComponent = ALGORITHM_COMPONENTS[algKey];

  // Nếu không tìm thấy thuật toán nào khớp với key (ví dụ nhập URL bậy)
  if (!VisualizerComponent) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full text-slate-500 gap-3 bg-slate-950/30 rounded-lg border border-dashed border-slate-800">
        <Construction size={48} className="opacity-20" />
        <div className="text-center">
          <p className="font-medium text-slate-400">Chưa có mô phỏng</p>
          <p className="text-xs opacity-50 mt-1">
            Thuật toán "{algKey}" đang được phát triển hoặc không tồn tại.
          </p>
        </div>
      </div>
    );
  }

  // Render Component tìm thấy và truyền toàn bộ props (data, isPlaying...) xuống dưới
  return <VisualizerComponent {...props} />;
};

// Component hiển thị tạm cho các thuật toán chưa làm xong
const Placeholder = ({ name }) => (
  <div className="flex flex-col items-center justify-center h-full w-full text-slate-500">
    <Activity size={40} className="mb-2 text-blue-500/50 animate-pulse" />
    <span className="text-sm font-mono text-blue-400">Đang xây dựng: {name}...</span>
  </div>
);

export default AlgorithmVisualizer;