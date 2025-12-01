import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { Terminal } from "lucide-react";

const BubbleSort = ({ isPlaying, data, onFinish }) => {
  const svgRef = useRef();
  const logContainerRef = useRef(null); 
  
  const [array, setArray] = useState(data || []);
  const [sorting, setSorting] = useState(false);
  const [compareIndices, setCompareIndices] = useState([]); 
  const [logs, setLogs] = useState([]); 

  // Hàm thêm log
  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, id: Date.now() + Math.random() }]);
  };

  // Auto-scroll log xuống dưới cùng khi có log mới
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Reset trạng thái khi dữ liệu đầu vào (data) thay đổi
  useEffect(() => {
    setArray(data);
    setCompareIndices([]);
    setSorting(false);
    setLogs([{ message: "Sẵn sàng. Nhấn 'Chạy' để bắt đầu...", type: 'system' }]);
  }, [data]);

  // Vẽ biểu đồ bằng D3.js
  useEffect(() => {
    if (!svgRef.current) return;
    
    // Kích thước chuẩn của viewBox
    const width = 500;
    const height = 300;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Xóa nội dung cũ để vẽ lại

    // Tạo thang đo (Scale)
    const xScale = d3.scaleBand()
      .domain(array.map((_, i) => i))
      .range([0, width])
      .padding(0.2);

    const maxValue = Math.max(...array, 100); // Đảm bảo cột không bị tràn nếu giá trị nhỏ
    const yScale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([height - 40, 20]); // Chừa lề dưới cho text

    // Vẽ các cột (rect)
    svg.selectAll('rect')
      .data(array)
      .join('rect')
      .attr('x', (_, i) => xScale(i))
      .attr('y', d => yScale(d))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - 40 - yScale(d))
      .attr('fill', (_, i) => compareIndices.includes(i) ? '#ef4444' : '#3b82f6') // Đỏ nếu đang so sánh, Xanh nếu bình thường
      .attr('rx', 4); // Bo góc

    // Vẽ số liệu (text)
    svg.selectAll('text')
      .data(array)
      .join('text')
      .attr('x', (_, i) => xScale(i) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d) - 5)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '14px')
      .text(d => d);
      
  }, [array, compareIndices]); // Vẽ lại khi mảng thay đổi hoặc đang so sánh index khác

  // Trigger chạy thuật toán khi props isPlaying = true
  useEffect(() => {
    if (isPlaying && !sorting) {
      runBubbleSort();
    }
  }, [isPlaying]);

  // Logic thuật toán Bubble Sort
  const runBubbleSort = async () => {
    setSorting(true);
    setLogs([]); // Xóa log cũ
    addLog("Bắt đầu thuật toán Bubble Sort...", "system");
    
    const arr = [...array];
    const n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
      addLog(`--- Bắt đầu vòng lặp i = ${i} ---`, "header");
      let swapped = false;
      
      for (let j = 0; j < n - i - 1; j++) {
        // Highlight 2 cột đang so sánh
        setCompareIndices([j, j + 1]);
        addLog(`So sánh index [${j}] (${arr[j]}) và [${j+1}] (${arr[j+1]})`);
        
        // Delay để người dùng nhìn thấy
        await new Promise(resolve => setTimeout(resolve, 800)); 

        if (arr[j] > arr[j + 1]) {
          addLog(`  > ${arr[j]} > ${arr[j+1]}: Hoán đổi vị trí!`, "swap");
          
          // Hoán đổi
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setArray([...arr]); // Cập nhật state để D3 vẽ lại
          swapped = true;
          
          // Delay sau khi hoán đổi
          await new Promise(resolve => setTimeout(resolve, 800)); 
        } else {
            addLog(`  > ${arr[j]} <= ${arr[j+1]}: Giữ nguyên.`, "info");
        }
      }
      
      if (!swapped) {
          addLog("Không có hoán đổi nào. Dãy đã sắp xếp!", "success");
          break;
      }
    }
    
    setCompareIndices([]);
    setSorting(false);
    addLog("Hoàn thành sắp xếp!", "success");
    if (onFinish) onFinish(); // Báo cho component cha biết đã xong
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4">
      {/* 1. Đồ thị SVG */}
      <svg 
        ref={svgRef} 
        width="100%" 
        height="300" 
        viewBox="0 0 500 300" 
        className="bg-slate-900/50 rounded-lg shadow-inner border border-slate-700 w-full max-w-[500px]"
      ></svg>
      
      {/* 2. Log Trace Panel */}
      <div className="w-full max-w-[500px] h-40 bg-[#1e1e1e] rounded-lg border border-slate-700 flex flex-col overflow-hidden shadow-lg">
        <div className="bg-[#252526] px-3 py-1 border-b border-black/40 flex justify-between items-center">
             <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                <Terminal size={12} /> Log Tracer
             </span>
             {sorting && <span className="text-[10px] text-green-500 animate-pulse">● Running</span>}
        </div>
        <div 
            ref={logContainerRef}
            className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-1 scroll-smooth"
        >
            {logs.length === 0 && <span className="text-slate-600 italic">Nhật ký thuật toán sẽ hiện ở đây...</span>}
            {logs.map((log) => (
                <div key={log.id} className={`${
                    log.type === 'swap' ? 'text-yellow-400 pl-4' : 
                    log.type === 'header' ? 'text-blue-400 font-bold mt-2 border-t border-slate-700 pt-1' :
                    log.type === 'success' ? 'text-green-400 font-bold' :
                    log.type === 'system' ? 'text-slate-500 italic' :
                    'text-slate-300 pl-2'
                }`}>
                    {log.type === 'swap' || log.type === 'info' ? '> ' : ''} {log.message}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default BubbleSort;