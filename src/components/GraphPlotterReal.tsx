
import React, { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-dist-min';
import { motion } from 'framer-motion';
import { Calculator, Plus, Trash2, Maximize2, RefreshCw } from 'lucide-react';
import * as math from 'mathjs';

export const GraphPlotterReal: React.FC = () => {
  const plotRef = useRef<HTMLDivElement>(null);
  const [equations, setEquations] = useState<string[]>(['x^2', 'sin(x)']);
  const [newEq, setNewEq] = useState('');

  const plotGraphs = () => {
    if (!plotRef.current) return;

    const data: any[] = [];
    const xValues = math.range(-10, 10, 0.1).toArray() as number[];

    equations.forEach((eq, idx) => {
      try {
        const yValues = xValues.map(x => {
          try {
            return math.evaluate(eq, { x });
          } catch {
            return null;
          }
        });

        data.push({
          x: xValues,
          y: yValues,
          type: 'scatter',
          mode: 'lines',
          name: `f(x) = ${eq}`,
          line: { 
            color: idx === 0 ? '#00f2ff' : idx === 1 ? '#ff7700' : idx === 2 ? '#00ff88' : '#ffffff',
            width: 3 
          }
        });
      } catch (e) {
        console.error("Plot error:", e);
      }
    });

    const layout = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#ffffff', family: 'Inter', size: 10 },
      margin: { t: 20, r: 20, b: 40, l: 40 },
      xaxis: { gridcolor: 'rgba(255,255,255,0.05)', zerolinecolor: 'rgba(255,255,255,0.2)' },
      yaxis: { gridcolor: 'rgba(255,255,255,0.05)', zerolinecolor: 'rgba(255,255,255,0.2)' },
      showlegend: true,
      legend: { x: 0, y: 1, bgcolor: 'rgba(0,0,0,0.5)' }
    };

    Plotly.newPlot(plotRef.current, data, layout, { responsive: true, displayModeBar: false });
  };

  useEffect(() => {
    plotGraphs();
  }, [equations]);

  const addEquation = () => {
    if (newEq.trim() && equations.length < 4) {
      setEquations([...equations, newEq]);
      setNewEq('');
    }
  };

  const removeEquation = (index: number) => {
    setEquations(equations.filter((_, i) => i !== index));
  };

  return (
    <div className="cyber-panel p-8 space-y-8 flex flex-col h-full">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
            <Calculator size={16} className="text-white/40" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Neural Graphing Node</h3>
         </div>
         <button onClick={plotGraphs} className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
            <RefreshCw size={14} />
         </button>
      </div>

      <div ref={plotRef} className="flex-1 min-h-[300px] w-full bg-black/20 rounded-3xl border border-white/5 overflow-hidden" />

      <div className="space-y-4">
        <div className="flex gap-2">
           <input 
             type="text" 
             value={newEq}
             onChange={(e) => setNewEq(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && addEquation()}
             placeholder="y = x^2 + 5"
             className="flex-1 h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-xs font-bold focus:outline-none focus:border-white/20 transition-all"
           />
           <button 
             onClick={addEquation}
             disabled={equations.length >= 4}
             className="w-12 h-12 bg-white text-black rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
           >
              <Plus size={20} />
           </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
           {equations.map((eq, i) => (
              <div key={i} className="h-10 bg-white/5 border border-white/5 rounded-xl px-4 flex items-center justify-between group">
                 <span className="text-[9px] font-black uppercase tracking-widest truncate max-w-[100px]">{eq}</span>
                 <button onClick={() => removeEquation(i)} className="opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-red-500">
                    <Trash2 size={12} />
                 </button>
              </div>
           ))}
        </div>
      </div>
    </div>
  );
};
