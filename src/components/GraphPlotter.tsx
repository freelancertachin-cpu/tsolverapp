import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LineChart as ChartIcon, RefreshCw, Sparkles, AlertCircle, Plus, Trash2, Camera } from 'lucide-react';
import Plotly from 'plotly.js-dist-min';
import * as math from 'mathjs';
import { UserProfile } from '../lib/storage';
import { motion, AnimatePresence } from 'framer-motion';

export const GraphPlotter: React.FC<{ user: UserProfile }> = ({ user }) => {
  if (!user) return null;
  const [equations, setEquations] = useState<string[]>(['x^2']);
  const [error, setError] = useState<string | null>(null);
  const plotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!plotRef.current) return;

    try {
      const traces: any[] = equations.map((eq, idx) => {
        const xValues = math.range(-10, 10, 0.1).toArray();
        const node = math.parse(eq);
        const code = node.compile();
        const yValues = xValues.map(x => {
          try {
            const val = code.evaluate({ x });
            return typeof val === 'number' ? val : null;
          } catch (e) {
            return null;
          }
        });

        const colors = ['#ffffff', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
        return {
          x: xValues,
          y: yValues,
          type: 'scatter',
          mode: 'lines',
          name: `f(x) = ${eq}`,
          line: { color: colors[idx % colors.length], width: 3 },
        };
      });

      const layout: any = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: 'rgba(255,255,255,0.4)', size: 10, family: 'JetBrains Mono' },
        margin: { l: 40, r: 20, t: 20, b: 40 },
        xaxis: { 
          gridcolor: 'rgba(255,255,255,0.05)', 
          zerolinecolor: 'rgba(255,255,255,0.2)', 
          tickfont: { color: 'rgba(255,255,255,0.3)' },
          dtick: 2
        },
        yaxis: { 
          gridcolor: 'rgba(255,255,255,0.05)', 
          zerolinecolor: 'rgba(255,255,255,0.2)',
          tickfont: { color: 'rgba(255,255,255,0.3)' },
          dtick: 2
        },
        showlegend: equations.length > 1,
        legend: { font: { color: '#ffffff' } },
        responsive: true,
      };

      Plotly.newPlot(plotRef.current, traces, layout, { responsive: true, displayModeBar: false });
      setError(null);
    } catch (e) {
      setError("Invalid syntax in one of the expressions.");
    }
  }, [equations]);

  const addEquation = () => {
    if (equations.length < 5) {
      setEquations([...equations, '']);
    }
  };

  const removeEquation = (index: number) => {
    if (equations.length > 1) {
      const newEqs = [...equations];
      newEqs.splice(index, 1);
      setEquations(newEqs);
    }
  };

  const updateEquation = (index: number, val: string) => {
    const newEqs = [...equations];
    newEqs[index] = val;
    setEquations(newEqs);
  };

  return (
    <div className="space-y-10 animate-fade-in">
       {/* Branding Header */}
       <div className="flex items-center gap-6">
        <div className="p-5 rounded-3xl bg-white border border-white shadow-glow">
          <ChartIcon className="h-8 w-8 text-black" />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase italic underline decoration-white/10 underline-offset-8">Visual Audit Graph</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">Interactive Function Projection Engine</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor Side */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[40px] space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">Function Stack</h3>
                <button 
                  onClick={addEquation}
                  disabled={equations.length >= 5}
                  className="h-8 px-3 rounded-xl bg-white text-black text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  Add Layer +
                </button>
              </div>

              <div className="space-y-4">
                {equations.map((eq, i) => (
                  <div key={i} className="space-y-2">
                     <div className="relative group">
                        <input 
                          value={eq}
                          onChange={(e) => updateEquation(i, e.target.value)}
                          placeholder="e.g. sin(x)"
                          className="w-full h-14 pl-12 pr-12 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-white/40 outline-none transition-all"
                        />
                        <div className={`absolute left-4 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full ${i === 0 ? 'bg-white' : i === 1 ? 'bg-blue-500' : 'bg-green-500'}`} />
                        {equations.length > 1 && (
                          <button 
                            onClick={() => removeEquation(i)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                     </div>
                  </div>
                ))}

                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}
              </div>
           </div>

           <div className="p-8 rounded-[40px] bg-white text-black space-y-6 shadow-glow">
              <div className="flex items-center gap-3">
                 <Camera size={16} />
                 <h4 className="text-[10px] font-black uppercase tracking-widest italic">Snapshot Export</h4>
              </div>
              <p className="text-[10px] font-bold opacity-60 leading-relaxed italic">Capture the current coordinate audit for offline reference or report generation.</p>
              <button className="w-full h-14 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] active:scale-0.98 transition-all">
                 Generate PNG
              </button>
           </div>
        </div>

        {/* Plot Side */}
        <div className="lg:col-span-8">
           <div className="bg-[#0a0a0a] border border-white/5 rounded-[40px] h-[600px] relative overflow-hidden shadow-2xl overflow-hidden group">
              <div ref={plotRef} className="w-full h-full" />
              
              <div className="absolute top-8 left-8 flex items-center gap-4">
                 <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 backdrop-blur-md">
                    Live Projection Active
                 </div>
              </div>

              <div className="absolute bottom-8 right-8 flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Coordinate System Locked</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

