import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { Terminal } from "lucide-react";

const SelectionSort = ({ isPlaying, data, onFinish }) => {
  const svgRef = useRef();
  const logContainerRef = useRef(null); 
  
  const [array, setArray] = useState(data || []);
  const [sorting, setSorting] = useState(false);
  const [logs, setLogs] = useState([]); 
  const [colors, setColors] = useState([]); 

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, id: Date.now() + Math.random() }]);
  };

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    if (data && data.length > 0) {
        setArray([...data]);
        setColors(new Array(data.length).fill(0));
        setSorting(false);
        setLogs([{ message: "Dữ liệu mới đã nạp. Nhấn 'Chạy'...", type: 'system' }]);
        
        // Xóa sạch biểu đồ cũ 
        if (svgRef.current) {
            d3.select(svgRef.current).selectAll('*').remove();
        }
    }
  }, [data]); 

  // Vẽ biểu đồ
  useEffect(() => {
    if (!svgRef.current || array.length === 0) return;
    
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

    const getFillColor = (idx) => {
        const status = colors[idx];
        if (status === 3) return '#22c55e'; 
        if (status === 2) return '#eab308'; 
        if (status === 1) return '#ef4444'; 
        return '#3b82f6'; 
    };

    svg.selectAll('rect')
      .data(array)
      .join('rect')
      .attr('x', (_, i) => xScale(i))
      .attr('y', d => yScale(d))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - 40 - yScale(d))
      .attr('fill', (_, i) => getFillColor(i))
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

  }, [array, colors]); 

  // Chạy thuật toán
  useEffect(() => {
    if (isPlaying && !sorting) {
        runSelectionSort();
    }
  }, [isPlaying]);

  const runSelectionSort = async () => {
    setSorting(true);
    setLogs([]);
    addLog("Bắt đầu thuật toán Selection Sort...", "system");

    let currentArr = [...array];
    const n = currentArr.length;
    let colorState = new Array(n).fill(0);

    for (let i = 0; i < n - 1; i++) {
        
        
        let min_idx = i;
        colorState[i] = 2; 
        setColors([...colorState]);
        
        addLog(`Tìm Min từ index [${i}] (${currentArr[i]})...`, "header");
        await new Promise(r => setTimeout(r, 600));

        for (let j = i + 1; j < n; j++) {
            colorState[j] = 1; 
            setColors([...colorState]);
            await new Promise(r => setTimeout(r, 300));

            if (currentArr[j] < currentArr[min_idx]) {
                if(min_idx !== i) colorState[min_idx] = 0; 
                min_idx = j;
                colorState[min_idx] = 2; 
                addLog(`  > Min mới: ${currentArr[j]}`, "swap");
            } else {
                colorState[j] = 0;
            }
            setColors([...colorState]);
        }

        if (min_idx !== i) {
            addLog(`=> Hoán đổi ${currentArr[i]} và ${currentArr[min_idx]}`, "success");
            [currentArr[i], currentArr[min_idx]] = [currentArr[min_idx], currentArr[i]];
            
            setArray([...currentArr]); 
            await new Promise(r => setTimeout(r, 800));
        }
        
        colorState[min_idx] = 0;
        colorState[i] = 3; 
        setColors([...colorState]);
    }
    
    colorState[n-1] = 3;
    setColors([...colorState]);
    
    setSorting(false);
    addLog("Hoàn thành!", "success");
    if (onFinish) onFinish();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4">
      <svg ref={svgRef} width="100%" height="300" viewBox="0 0 500 300" className="bg-slate-900/50 rounded-lg shadow-inner border border-slate-700 w-full max-w-[500px]"></svg>
      
      <div className="w-full max-w-[500px] h-40 bg-[#1e1e1e] rounded-lg border border-slate-700 flex flex-col overflow-hidden shadow-lg">
        <div className="bg-[#252526] px-3 py-1 border-b border-black/40 flex justify-between items-center">
             <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                <Terminal size={12} /> Log Tracer
             </span>
             {sorting && <span className="text-[10px] text-green-500 animate-pulse">● Running</span>}
        </div>
        <div ref={logContainerRef} className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-1 scroll-smooth">
            {logs.length === 0 && <span className="text-slate-600 italic">Nhật ký thuật toán sẽ hiện ở đây...</span>}
            {logs.map((log) => (
                <div key={log.id} className={`${
                    log.type === 'swap' ? 'text-yellow-400 pl-4 font-bold' : 
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

export default SelectionSort;