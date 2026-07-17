import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { Terminal } from "lucide-react";

const MergeSort = ({ isPlaying, data, onFinish }) => {
  const svgRef = useRef();
  const logContainerRef = useRef(null); 
  const [array, setArray] = useState(data || []);
  const [sorting, setSorting] = useState(false);
  const [compareIndices, setCompareIndices] = useState([]); 
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
          if (compareIndices.includes(i)) return '#ef4444'; // Red for comparing/merging
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
  }, [array, compareIndices, activeRange]);

  useEffect(() => {
    if (isPlaying && !sorting) {
      runMergeSort();
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

  const merge = async (arr, l, m, r) => {
    addLog(`Gộp 2 mảng con: [${l}..${m}] và [${m+1}..${r}]`, "header");
    setActiveRange([l, r]);
    
    let n1 = m - l + 1;
    let n2 = r - m;

    let L = new Array(n1);
    let R = new Array(n2);

    for (let i = 0; i < n1; i++) L[i] = arr[l + i];
    for (let j = 0; j < n2; j++) R[j] = arr[m + 1 + j];

    let i = 0, j = 0, k = l;

    while (i < n1 && j < n2) {
      if (await checkPauseState()) return;

      setCompareIndices([l + i, m + 1 + j]);
      addLog(`So sánh ${L[i]} và ${R[j]}`);
      await sleep(800);

      if (L[i] <= R[j]) {
        addLog(`> Chọn ${L[i]} vào vị trí [${k}]`, "info");
        arr[k] = L[i];
        i++;
      } else {
        addLog(`> Chọn ${R[j]} vào vị trí [${k}]`, "swap");
        arr[k] = R[j];
        j++;
      }
      setArray([...arr]);
      await sleep(500);
      k++;
    }

    while (i < n1) {
      if (await checkPauseState()) return;
      arr[k] = L[i];
      addLog(`> Đưa phần tử còn lại ${L[i]} vào vị trí [${k}]`, "info");
      setArray([...arr]);
      await sleep(400);
      i++;
      k++;
    }

    while (j < n2) {
      if (await checkPauseState()) return;
      arr[k] = R[j];
      addLog(`> Đưa phần tử còn lại ${R[j]} vào vị trí [${k}]`, "info");
      setArray([...arr]);
      await sleep(400);
      j++;
      k++;
    }
  };

  const mergeSortHelper = async (arr, l, r) => {
    if (l >= r) return;
    if (await checkPauseState()) return;

    let m = l + parseInt((r - l) / 2);
    
    addLog(`Chia mảng [${l}..${r}] tại mid=${m}`);
    setActiveRange([l, r]);
    await sleep(500);

    await mergeSortHelper(arr, l, m);
    if (await checkPauseState()) return;

    await mergeSortHelper(arr, m + 1, r);
    if (await checkPauseState()) return;

    await merge(arr, l, m, r);
  };

  const runMergeSort = async () => {
    setSorting(true);
    abortRef.current = false; 
    setLogs([]);
    addLog("Bắt đầu thuật toán Merge Sort...", "system");
    
    const arr = [...array];
    await mergeSortHelper(arr, 0, arr.length - 1);
    
    setCompareIndices([]);
    setActiveRange([]);
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

export default MergeSort;
