import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { Terminal } from "lucide-react";

const LinearSearch = ({ isPlaying, data, onFinish }) => {
  const svgRef = useRef();
  const logContainerRef = useRef(null);
  
  const TARGET = 34; 

  const [array, setArray] = useState(data || []);
  const [searching, setSearching] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [foundIndex, setFoundIndex] = useState(-1);     
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
    if (data) {
        setArray(data);
        setCurrentIndex(-1);
        setFoundIndex(-1);
        setSearching(false);
        setLogs([{ message: `Sẵn sàng tìm kiếm số ${TARGET}. Nhấn 'Chạy'...`, type: 'system' }]);
        
        if (svgRef.current) d3.select(svgRef.current).selectAll('*').remove();
    }
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

    // Vẽ cột
    svg.selectAll('rect')
      .data(array)
      .join('rect')
      .attr('x', (_, i) => xScale(i))
      .attr('y', d => yScale(d))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - 40 - yScale(d))
      .attr('fill', (_, i) => {
          if (i === foundIndex) return '#22c55e'; 
          if (i === currentIndex) return '#ef4444'; 
          return '#3b82f6'; 
      })
      .attr('rx', 4);

    // Vẽ số
    svg.selectAll('text')
      .data(array)
      .join('text')
      .attr('x', (_, i) => xScale(i) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d) - 5)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '14px')
      .text(d => d);
      
    // Vẽ chú thích Target
    svg.append("text")
       .attr("x", 20)
       .attr("y", 30)
       .attr("fill", "#fbbf24")
       .attr("font-weight", "bold")
       .text(`Target: ${TARGET}`);

  }, [array, currentIndex, foundIndex]);

  useEffect(() => {
    if (isPlaying && !searching) {
      runLinearSearch();
    }
  }, [isPlaying]);

  const runLinearSearch = async () => {
    setSearching(true);
    setLogs([]);
    addLog(`Bắt đầu tìm kiếm số ${TARGET}...`, "system");
    
    let found = false;
    for (let i = 0; i < array.length; i++) {
        setCurrentIndex(i);
        addLog(`Xét index [${i}]: Giá trị là ${array[i]}`, "header");
        
        await new Promise(r => setTimeout(r, 800));

        if (array[i] === TARGET) {
            addLog(`  > ${array[i]} == ${TARGET}: TÌM THẤY!`, "success");
            setFoundIndex(i);
            setCurrentIndex(-1); 
            found = true;
            break; 
        } else {
            addLog(`  > ${array[i]} != ${TARGET}: Không khớp, qua tiếp.`, "info");
        }
    }

    if (!found) {
        addLog(`Đã duyệt hết mảng. Không tìm thấy số ${TARGET}.`, "error");
        setCurrentIndex(-1);
    } else {
        addLog("Hoàn thành thuật toán.", "success");
    }

    setSearching(false);
    if (onFinish) onFinish();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4">
      <svg ref={svgRef} width="100%" height="300" viewBox="0 0 500 300" className="bg-slate-900/50 rounded-lg shadow-inner border border-slate-700 w-full max-w-[500px]"></svg>
      
      <div className="w-full max-w-[500px] h-40 bg-[#1e1e1e] rounded-lg border border-slate-700 flex flex-col overflow-hidden shadow-lg">
        <div className="bg-[#252526] px-3 py-1 border-b border-black/40 flex justify-between items-center">
             <span className="text-xs font-bold text-slate-400 flex items-center gap-2"><Terminal size={12} /> Log Tracer</span>
             {searching && <span className="text-[10px] text-green-500 animate-pulse">● Searching</span>}
        </div>
        <div ref={logContainerRef} className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-1 scroll-smooth">
            {logs.length === 0 && <span className="text-slate-600 italic">Logs...</span>}
            {logs.map((log) => (
                <div key={log.id} className={`${
                    log.type === 'success' ? 'text-green-400 font-bold' :
                    log.type === 'header' ? 'text-blue-400 font-bold mt-1' :
                    log.type === 'error' ? 'text-red-400 font-bold' :
                    log.type === 'system' ? 'text-slate-500 italic' : 'text-slate-300 pl-2'
                }`}>
                    {log.type === 'info' ? '> ' : ''} {log.message}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default LinearSearch;