import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { Terminal } from "lucide-react";

const QuickSort = ({ isPlaying, data, onFinish }) => {
  const svgRef = useRef();
  const logContainerRef = useRef(null); 
  const [array, setArray] = useState(data || []);
  const [sorting, setSorting] = useState(false);
  const [compareIndices, setCompareIndices] = useState([]); 
  const [pivotIndex, setPivotIndex] = useState(-1);
  const [activeRange, setActiveRange] = useState([]); // [start, end]
  const [logs, setLogs] = useState([]); 
  const isPlayingRef = useRef(isPlaying); 
  const abortRef = useRef(false);         

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, id: Date.now() + Math.random() }]);
  };

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    if (data) {
        abortRef.current = true;
        setArray([...data]);
        setCompareIndices([]);
        setPivotIndex(-1);
        setActiveRange([]);
        setSorting(false);
        setLogs([{ message: "Sẵn sàng. Nhấn 'Chạy' để bắt đầu...", type: 'system' }]);
        setTimeout(() => { abortRef.current = false; }, 100);
    }
  }, [data]);

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
      .attr('fill', (_, i) => {
          if (i === pivotIndex) return '#10b981'; // Green for pivot
          if (compareIndices.includes(i)) return '#ef4444'; // Red for comparing/swapping
          if (activeRange.length === 2 && i >= activeRange[0] && i <= activeRange[1]) return '#f59e0b'; // Yellow for active range
          return '#3b82f6'; // Blue
      })
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
  }, [array, compareIndices, activeRange, pivotIndex]);

  useEffect(() => {
    if (isPlaying && !sorting) {
      runQuickSort();
    }
  }, [isPlaying]);

  const checkPauseState = async () => {
    while (!isPlayingRef.current && !abortRef.current) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return abortRef.current;
  };

  const sleep = async (ms) => {
    await new Promise(resolve => setTimeout(resolve, ms));
  };

  const partition = async (arr, low, high) => {
    let pivot = arr[high];
    setPivotIndex(high);
    addLog(`Chọn Pivot = ${pivot} tại vị trí [${high}]`, "info");
    await sleep(500);

    let i = low - 1;

    for (let j = low; j <= high - 1; j++) {
      if (await checkPauseState()) return -1;
      
      setCompareIndices([j, high]);
      addLog(`So sánh arr[${j}] (${arr[j]}) với Pivot (${pivot})`);
      await sleep(600);

      if (arr[j] < pivot) {
        i++;
        addLog(`> ${arr[j]} < ${pivot}: Đưa về bên trái (Hoán đổi [${i}] và [${j}])`, "swap");
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
        setArray([...arr]);
        setCompareIndices([i, j]);
        await sleep(800);
      }
    }

    if (await checkPauseState()) return -1;
    
    addLog(`> Đưa Pivot (${pivot}) về đúng vị trí (Hoán đổi [${i+1}] và [${high}])`, "header");
    let temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    setArray([...arr]);
    setCompareIndices([i + 1, high]);
    setPivotIndex(-1); // reset pivot highlight
    await sleep(800);

    return i + 1;
  };

  const quickSortHelper = async (arr, low, high) => {
    if (low < high) {
      if (await checkPauseState()) return;

      setActiveRange([low, high]);
      addLog(`Phân chia mảng [${low}..${high}]`, "header");
      await sleep(400);

      let pi = await partition(arr, low, high);
      
      if (pi === -1) return; // Aborted

      addLog(`Chốt đã nằm đúng vị trí tại [${pi}] = ${arr[pi]}`, "success");
      await sleep(400);

      await quickSortHelper(arr, low, pi - 1);
      if (await checkPauseState()) return;

      await quickSortHelper(arr, pi + 1, high);
      if (await checkPauseState()) return;
    }
  };

  const runQuickSort = async () => {
    setSorting(true);
    abortRef.current = false; 
    setLogs([]);
    addLog("Bắt đầu thuật toán Quick Sort...", "system");
    
    const arr = [...array];
    await quickSortHelper(arr, 0, arr.length - 1);
    
    setCompareIndices([]);
    setActiveRange([]);
    setPivotIndex(-1);
    setSorting(false);
    
    if (!abortRef.current) {
        addLog("Hoàn thành sắp xếp!", "success");
        if (onFinish) onFinish();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4">
      <svg ref={svgRef} width="100%" height="300" viewBox="0 0 500 300" className="bg-slate-900/50 rounded-lg shadow-inner border border-slate-700 w-full max-w-[500px]"></svg>
      
      <div className="w-full max-w-[500px] h-40 bg-[#1e1e1e] rounded-lg border border-slate-700 flex flex-col overflow-hidden shadow-lg">
        <div className="bg-[#252526] px-3 py-1 border-b border-black/40 flex justify-between items-center">
             <span className="text-xs font-bold text-slate-400 flex items-center gap-2"><Terminal size={12} /> Log Tracer</span>
             {sorting && <span className="text-[10px] text-green-500 animate-pulse">● Running</span>}
             {!sorting && array.length > 0 && <span className="text-[10px] text-yellow-500">● Paused/Idle</span>}
        </div>
        <div ref={logContainerRef} className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-1 scroll-smooth">
            {logs.length === 0 && <span className="text-slate-600 italic">Nhật ký thuật toán sẽ hiện ở đây...</span>}
            {logs.map((log) => (
                <div key={log.id} className={`${
                    log.type === 'swap' ? 'text-yellow-400 pl-4' : 
                    log.type === 'header' ? 'text-blue-400 font-bold mt-2 border-t border-slate-700 pt-1' :
                    log.type === 'success' ? 'text-green-400 font-bold' :
                    log.type === 'system' ? 'text-slate-500 italic' : 'text-slate-300 pl-2'
                }`}>
                    {log.type === 'swap' || log.type === 'info' ? '> ' : ''} {log.message}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default QuickSort;
