import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { Terminal } from "lucide-react";

const InsertionSort = ({ isPlaying, data, onFinish }) => {
  const svgRef = useRef();
  const logContainerRef = useRef(null); 
  
  const [array, setArray] = useState(data || []);
  const [sorting, setSorting] = useState(false);
  const [compareIndices, setCompareIndices] = useState([]); 
  const [logs, setLogs] = useState([]); 

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, id: Date.now() + Math.random() }]);
  };

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    setArray(data);
    setCompareIndices([]);
    setSorting(false);
    setLogs([{ message: "Sẵn sàng. Nhấn 'Chạy' để bắt đầu...", type: 'system' }]);
  }, [data]);

  // Vẽ biểu đồ
  useEffect(() => {
    if (!svgRef.current) return;
    
    const width = 500;
    const height = 300;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const xScale = d3.scaleBand()
      .domain(array.map((_, i) => i))
      .range([0, width])
      .padding(0.2);

    const maxValue = Math.max(...array, 100);
    const yScale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([height - 40, 20]);

    svg.selectAll('rect')
      .data(array)
      .join('rect')
      .attr('x', (_, i) => xScale(i))
      .attr('y', d => yScale(d))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - 40 - yScale(d))
      .attr('fill', (_, i) => compareIndices.includes(i) ? '#ef4444' : '#3b82f6') // Đỏ khi đang xét
      .attr('rx', 4);

    svg.selectAll('text')
      .data(array)
      .join('text')
      .attr('x', (_, i) => xScale(i) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d) - 5)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '14px')
      .text(d => d);
      
  }, [array, compareIndices]);

  useEffect(() => {
    if (isPlaying && !sorting) {
      runInsertionSort();
    }
  }, [isPlaying]);

  const runInsertionSort = async () => {
    setSorting(true);
    setLogs([]);
    addLog("Bắt đầu thuật toán Insertion Sort...", "system");
    
    const arr = [...array];
    const n = arr.length;
    
    for (let i = 1; i < n; i++) {
      let key = arr[i]; 
      let j = i - 1;
      
      addLog(`--- Xét phần tử index [${i}] (Giá trị: ${key}) ---`, "header");
      setCompareIndices([i]); 
      await new Promise(resolve => setTimeout(resolve, 800));

      while (j >= 0 && arr[j] > key) {
        addLog(`  > ${arr[j]} > ${key}: Dời ${arr[j]} sang phải`, "info");
        
        setCompareIndices([j, j + 1]); 
        
        arr[j + 1] = arr[j]; 
        setArray([...arr]); 
        
        await new Promise(resolve => setTimeout(resolve, 600));
        j = j - 1;
      }
      
      if (j + 1 !== i) {
          arr[j + 1] = key;
          addLog(`  > Chèn Key (${key}) vào vị trí [${j + 1}]`, "swap");
          setArray([...arr]);
          setCompareIndices([j + 1]); 
      } else {
          addLog(`  > Key (${key}) giữ nguyên vị trí.`, "success");
      }
      
      await new Promise(resolve => setTimeout(resolve, 600));
    }
    
    setCompareIndices([]);
    setSorting(false);
    addLog("Hoàn thành sắp xếp!", "success");
    if (onFinish) onFinish();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4">
      <svg 
        ref={svgRef} 
        width="100%" 
        height="300" 
        viewBox="0 0 500 300" 
        className="bg-slate-900/50 rounded-lg shadow-inner border border-slate-700 w-full max-w-[500px]"
      ></svg>
      
      <div className="w-full max-w-[500px] h-40 bg-[#1e1e1e] rounded-lg border border-slate-700 flex flex-col overflow-hidden shadow-lg">
        <div className="bg-[#252526] px-3 py-1 border-b border-black/40 flex justify-between items-center">
             <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                <Terminal size={12} /> Log Tracer (Insertion Sort)
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

export default InsertionSort;