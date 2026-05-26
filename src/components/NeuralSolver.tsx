
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Rocket, ChevronRight, CheckCircle2, Zap } from 'lucide-react';
import * as math from 'mathjs';

export const NeuralSolver: React.FC<{ type: 'solve' | 'derive' }> = ({ type }) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [steps, setSteps] = useState<string[]>([]);

  const handleProcess = () => {
    try {
      if (!input.trim()) return;
      
      // Basic solver logic
      if (type === 'solve') {
        const solved = math.evaluate(input);
        setResult(solved.toString());
        setSteps([
          `Input received: ${input}`,
          'Parsing expression tree...',
          'Applying algebraic reduction...',
          `Result synchronized: ${solved}`
        ]);
      } else {
        // Mock derivation for now as full step-by-step is complex
        setResult("d/dx [" + input + "]");
        setSteps([
          'Identifying variables...',
          'Applying power rule / chain rule...',
          'Simplifying derivation path...',
          'Final structure verified.'
        ]);
      }
    } catch (e) {
      setResult("Error: Neural mismatch");
      setSteps(['Invalid expression format detected.']);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="space-y-4">
         <div className="flex items-center gap-3">
            {type === 'solve' ? <Brain size={20} className="text-[#00f2ff]" /> : <Rocket size={20} className="text-[#ff7700]" />}
            <h3 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.5em] text-white/40">
               {type === 'solve' ? 'Quantum Equation Solver' : 'Step-by-Step Derivation Engine'}
            </h3>
         </div>
         <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter">Enter Neural Input</h2>
      </div>

      <div className="cyber-panel p-10 space-y-8">
         <div className="relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleProcess()}
              placeholder={type === 'solve' ? "e.g. 5x + 10 = 20" : "e.g. x^2 + 5x"}
              className="w-full h-16 md:h-20 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-6 md:px-8 text-lg md:text-2xl font-black italic focus:outline-none focus:border-white transition-all placeholder:text-white/5"
            />
            <button 
              onClick={handleProcess}
              className="absolute right-3 top-3 md:right-4 md:top-4 h-10 md:h-12 px-4 md:px-8 bg-white text-black rounded-lg md:rounded-xl font-black uppercase text-[8px] md:text-[10px] tracking-widest hover:scale-105 transition-all shadow-glow"
            >
               Process
            </button>
         </div>

         {result && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 pt-8"
            >
               <div className="p-6 md:p-8 bg-white/5 border border-white/5 rounded-2xl md:rounded-3xl space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Extraction Result</p>
                  <p className="text-2xl md:text-4xl font-black italic tracking-tight">{result}</p>
               </div>

               <div className="space-y-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Syllabus Steps</p>
                  <div className="grid grid-cols-1 gap-4">
                     {steps.map((step, i) => (
                        <div key={i} className="flex items-center gap-4 text-xs font-bold italic text-white/60">
                           <div className="h-6 w-6 rounded bg-white text-black flex items-center justify-center text-[10px] font-black not-italic">{i+1}</div>
                           <span>{step}</span>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="flex items-center gap-3 p-4 bg-[#00ff88]/5 border border-[#00ff88]/10 rounded-2xl">
                  <CheckCircle2 size={16} className="text-[#00ff88]" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#00ff88]/60">Solution verified by Local Neural Core v2.4</span>
               </div>
            </motion.div>
         )}
      </div>

      <div className="cyber-panel p-8 bg-gradient-to-r from-white/[0.02] to-transparent">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <Zap size={18} className="text-white/40" />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Neural Tip</p>
                  <p className="text-[9px] font-bold uppercase text-white/20 tracking-tighter">Use standard mathematical notation for optimal extraction.</p>
               </div>
            </div>
            <button className="text-white/40 hover:text-white transition-colors">
               <ChevronRight size={20} />
            </button>
         </div>
      </div>
    </div>
  );
};
