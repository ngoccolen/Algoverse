import React from 'react';
import { Activity, Construction } from 'lucide-react';

import BubbleSort from './BubbleSort';
import SelectionSort from './SelectionSort';
import LinearSearch from './LinearSearch'; 
import MergeSort from './MergeSort';
import QuickSort from './QuickSort';

const ALGORITHM_COMPONENTS = {
  'bubble-sort': BubbleSort,
  'selection-sort': SelectionSort,
  'linear-search': LinearSearch, 
  'quick-sort': QuickSort,
  'merge-sort': MergeSort,
  'insertion-sort': () => <Placeholder name="Insertion Sort" />,
};

const AlgorithmVisualizer = ({ algKey, ...props }) => {
  // Lấy ra Component tương ứng với key
  const VisualizerComponent = ALGORITHM_COMPONENTS[algKey];

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

  return <VisualizerComponent {...props} />;
};

const Placeholder = ({ name }) => (
  <div className="flex flex-col items-center justify-center h-full w-full text-slate-500">
    <Activity size={40} className="mb-2 text-blue-500/50 animate-pulse" />
    <span className="text-sm font-mono text-blue-400">Đang xây dựng: {name}...</span>
  </div>
);

export default AlgorithmVisualizer;