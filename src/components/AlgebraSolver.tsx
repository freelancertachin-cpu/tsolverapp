import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VoiceInput } from './VoiceInput';
import { localAI } from '@/lib/localAI';
import { Variable, Send, Loader2, Copy, Check, Brain, Cpu, Sparkles, LineChart as ChartIcon, Camera } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useOCR } from '../hooks/useOCR';
import nerdamer from 'nerdamer';
import 'nerdamer/Algebra';
import 'nerdamer/Solve';
import { motion, AnimatePresence } from 'framer-motion';
import Plotly from 'plotly.js-dist-min';
import * as math from 'mathjs';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export const AlgebraSolver: React.FC = () => {
  const [equation, setEquation] = useState('');
  const [solution, setSolution] = useState<string | null>(null);
  const [symbolicResult, setSymbolicResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [katexError, setKatexError] = useState<string | null>(null);
  const plotRef = useRef<HTMLDivElement>(null);
  const katexRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { scanImage, loading: scanning } = useOCR();

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const result = await scanImage(file);
      if (result) {
         // Try to extract expression from AI response or just set it
         setEquation(result);
      }
    }
  };

  useEffect(() => {
    if (!katexRef.current || !equation) {
      if (katexRef.current) katexRef.current.innerHTML = '';
      return;
    }

    try {
      // Try to render as KaTeX
      // Note: We might need to convert standard math syntax to LaTeX for preview
      // but let's try rendering directly or with simple replacements first
      let tex = equation
        .replace(/\*/g, '\\cdot ')
        .replace(/\//g, '\\div ')
        .replace(/\^/g, '^')
        .replace(/sqrt\((.*?)\)/g, '\\sqrt{$1}')
        .replace(/pi/g, '\\pi ')
        .replace(/theta/g, '\\theta ');

      katex.render(tex, katexRef.current, {
        throwOnError: true,
        displayMode: true
      });
      setKatexError(null);
    } catch (err: any) {
      setKatexError(err.message);
      // Try rendering without throwing just to show what it can
      try {
        katex.render(equation, katexRef.current!, {
          throwOnError: false,
          displayMode: true
        });
      } catch (inner) {}
    }
  }, [equation]);

  useEffect(() => {
    if (!plotRef.current || !equation) return;

    try {
      // Split by '=' to get LHS and RHS
      const parts = equation.split('=');
      let plotExpr = equation;
      
      if (parts.length === 2) {
        // Transform LHS = RHS to f(x) = LHS - (RHS)
        plotExpr = `(${parts[0]}) - (${parts[1]})`;
      }

      const xValues = math.range(-10, 10, 0.1).toArray();
      const node = math.parse(plotExpr);
      const code = node.compile();
      const yValues = xValues.map(x => {
        try {
          const val = code.evaluate({ x });
          return typeof val === 'number' ? val : null;
        } catch (e) {
          return null;
        }
      });

      const trace: any = {
        x: xValues,
        y: yValues,
        type: 'scatter',
        mode: 'lines',
        name: `f(x) = ${equation}`,
        line: { color: '#ffffff', width: 3 },
        fill: 'tozeroy',
        fillcolor: 'rgba(255,255,255,0.03)'
      };

      const layout: any = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: 'rgba(255,255,255,0.4)', size: 8, family: 'JetBrains Mono' },
        margin: { l: 30, r: 10, t: 10, b: 30 },
        xaxis: { 
          gridcolor: 'rgba(255,255,255,0.05)', 
          zerolinecolor: 'rgba(255,255,255,0.2)', 
          tickfont: { color: 'rgba(255,255,255,0.3)' }
        },
        yaxis: { 
          gridcolor: 'rgba(255,255,255,0.05)', 
          zerolinecolor: 'rgba(255,255,255,0.2)',
          tickfont: { color: 'rgba(255,255,255,0.3)' }
        },
        showlegend: false,
        responsive: true,
      };

      Plotly.newPlot(plotRef.current, [trace], layout, { responsive: true, displayModeBar: false });
    } catch (e) {
      console.warn('Plot extraction failed');
    }
  }, [equation, symbolicResult]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSolve = async () => {
    if (!equation) return;
    setLoading(true);
    setSolution(null);
    setSymbolicResult(null);
    const lang = localStorage.getItem('tsolver-lang') || 'bn';
    
    try {
      // 1. Symbolic Solving (Fast, Exact)
      try {
        // @ts-ignore - nerdamer modules add solve at runtime
        const solved = (nerdamer as any).solve(equation, 'x');
        setSymbolicResult(solved.toString());
      } catch (e) {
        console.warn('Symbolic solve failed, falling back to AI');
      }

      // 2. AI Solving (Deep explanation via Gemini API)
      const result = await localAI.process(`Solve equation step by step: ${equation}`);
      setSolution(result || (lang === 'bn' ? "কোন সমাধান পাওয়া যায়নি।" : "No solution found."));
    } catch (err: any) {
      setSolution(`${lang === 'bn' ? 'ভুল' : 'Error'}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
       {/* Branding Header */}
       <div className="flex items-center gap-6">
        <div className="p-5 rounded-3xl bg-white border border-white shadow-glow">
          <Variable className="h-8 w-8 text-black" />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase italic underline decoration-white/10 underline-offset-8">Algebraic Engine</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">Symbolic and Deep-Audit Problem Solving</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input & Symbolic Side */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[40px] space-y-8">
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/20">Equation Input (Multi-line)</Label>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="h-9 px-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                  >
                    <Camera size={14} />
                    <span>OCR</span>
                  </button>
                  <VoiceInput onResult={(text) => setEquation(prev => prev ? prev + '\n' + text : text)} />
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleScan} />
               </div>
               <div className="relative space-y-4">
                <textarea
                  value={equation}
                  onChange={(e) => setEquation(e.target.value)}
                  placeholder="x^2 - 4 = 0"
                  className="w-full min-h-[120px] bg-white/5 border border-white/10 text-xl font-mono font-black placeholder:text-white/5 px-6 py-4 rounded-2xl focus:outline-none focus:border-white/40 transition-all resize-none"
                />
                
                {/* KaTeX Preview Panel */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 min-h-[80px] flex flex-col items-center justify-center relative overflow-hidden">
                   <div className="absolute top-2 left-4 text-[8px] font-black uppercase tracking-widest text-white/20">Real-time Render Audit</div>
                   <div ref={katexRef} className="text-white overflow-x-auto max-w-full" />
                   {katexError && (
                     <div className="mt-2 text-[8px] font-black uppercase tracking-widest text-red-500/50">Syntax Alert: Expression may require refinement</div>
                   )}
                   {!equation && <div className="text-[10px] font-black uppercase tracking-widest text-white/10 italic">Awaiting symbolic input</div>}
                </div>
               </div>
               <Button 
                onClick={handleSolve} 
                disabled={loading || !equation}
                className="w-full h-16 bg-white text-black font-black uppercase text-xs tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
               >
                 {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto text-black" /> : <div className="flex items-center gap-2">Execute Solve <Send size={14} /></div>}
               </Button>
            </div>

            <AnimatePresence>
              {(symbolicResult || loading) && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4"
                >
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20">
                    <Cpu size={12} />
                    Symbolic Output
                  </div>
                  {loading ? (
                    <div className="h-8 w-1/2 bg-white/5 animate-pulse rounded" />
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-mono font-black text-white">{symbolicResult || 'N/A'}</p>
                      <button onClick={() => handleCopy(symbolicResult || '')} className="text-white/20 hover:text-white transition-all">
                        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-8 rounded-[40px] border border-white/5 bg-white/5 space-y-4">
             <div className="flex items-center gap-3">
                <ChartIcon className="text-white/40" size={16} />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Visual Projection</h4>
             </div>
             <div className="h-48 w-full bg-[#050505] rounded-3xl overflow-hidden border border-white/5">
                <div ref={plotRef} className="w-full h-full" />
             </div>
             <p className="text-[9px] font-bold text-white/10 leading-relaxed italic text-center">Root projection for: {equation || 'null'}</p>
          </div>

          <div className="p-8 rounded-[40px] border border-white/5 bg-white/5 space-y-4">
             <div className="flex items-center gap-3">
                <Brain className="text-white/40" size={16} />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">AI Deep Thinking</h4>
             </div>
             <p className="text-[10px] font-bold text-white/20 leading-relaxed italic">Enable background heuristic audit for step-by-step breakdown using Tachin-Engine.</p>
             <div className="pt-2">
                <Switch checked={useThinking} onCheckedChange={setUseThinking} />
             </div>
          </div>
        </div>

        {/* Deep Explanation Side */}
        <div className="lg:col-span-8">
           <div className="bg-[#0a0a0a] border border-white/5 rounded-[40px] overflow-hidden flex flex-col h-full min-h-[500px] shadow-2xl">
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Sparkles className="text-white/20" size={14} />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Step-by-Step Breakdown Audit</h3>
                 </div>
                 {solution && (
                    <button onClick={() => handleCopy(solution)} className="text-[10px] font-black uppercase text-white/20 hover:text-white transition-all">Copy Analysis</button>
                 )}
              </div>
              <ScrollArea className="flex-1 p-10">
                 <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-8"
                      >
                         <div className="space-y-3">
                            <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
                            <div className="h-4 w-1/2 bg-white/5 rounded animate-pulse" />
                         </div>
                         <div className="space-y-3">
                            <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                            <div className="h-4 w-4/5 bg-white/5 rounded animate-pulse" />
                         </div>
                         <div className="h-4 w-1/3 bg-white/5 rounded animate-pulse" />
                      </motion.div>
                    ) : solution ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="prose prose-invert prose-lg max-w-none"
                      >
                        <ReactMarkdown>{solution}</ReactMarkdown>
                      </motion.div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center py-20 opacity-10">
                         <Variable size={64} className="mb-6" />
                         <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Expression</p>
                      </div>
                    )}
                 </AnimatePresence>
              </ScrollArea>
           </div>
        </div>
      </div>
    </div>
  );
};

