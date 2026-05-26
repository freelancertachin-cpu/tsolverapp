import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Send, 
  Loader2, 
  BookOpen, 
  Sparkles, 
  CheckCircle2,
  Copy,
  PenTool,
  Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserProfile, storage } from '../lib/storage';
import { localAI } from '../lib/localAI';
import { useOCR } from '../hooks/useOCR';
import ReactMarkdown from 'react-markdown';

export const AssignmentSolver: React.FC<{ user: UserProfile }> = ({ user }) => {
  if (!user) return null;
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { scanImage, loading: scanning } = useOCR();

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const result = await scanImage(file);
      if (result) setSolution(result);
    }
  };

  const handleSolve = async () => {
    if (!problem.trim() || loading) return;
    setLoading(true);
    try {
      const result = await localAI.process(problem, 'math');
      setSolution(result);
      
      await storage.saveAssignment({
        id: Date.now().toString(),
        userId: user.id,
        topic: problem.slice(0, 50),
        content: result,
        timestamp: Date.now()
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex items-center gap-6 mb-12">
        <div className="p-5 rounded-3xl bg-white border border-white">
          <PenTool className="h-8 w-8 text-black" />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase italic underline decoration-white/10 underline-offset-8">Academic Solver</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">Expert explanations for math, science & history</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-4">
           <div className="glass-card shadow-2xl shadow-white/5 space-y-6">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="h-1 w-4 bg-white" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Input Problem</h3>
                 </div>
                 <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="h-9 px-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                 >
                   <Camera size={14} />
                   <span>Scan</span>
                 </button>
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleScan} />
              </div>
              <textarea 
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="Paste your question or equation here..."
                className="w-full min-h-[250px] border border-white/5 bg-black/40 rounded-2xl p-6 text-sm font-bold text-white focus:border-white/40 transition-all outline-none placeholder:text-white/10"
              />
              <button 
                onClick={handleSolve} 
                disabled={loading} 
                className="w-full h-14 bg-white text-black rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <><Sparkles size={16} /> কুইক সলভ</>}
              </button>
           </div>
        </div>

        <div className="lg:col-span-3">
           <div className="bg-white/5 border border-white/5 backdrop-blur-xl shadow-2xl shadow-white/5 rounded-[40px] min-h-[400px] p-10 relative overflow-hidden flex flex-col">
              <AnimatePresence mode="wait">
                {solution ? (
                  <motion.div
                    key="solution"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 flex-1"
                  >
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                       <div className="flex items-center gap-3">
                          <Brain size={14} className="text-white" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">AI Engine Result</span>
                       </div>
                       <button onClick={() => navigator.clipboard.writeText(solution)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                          <Copy className="h-4 w-4 text-white" />
                       </button>
                    </div>
                    <div className="markdown-body text-white/90 font-bold leading-loose">
                       <ReactMarkdown>{solution}</ReactMarkdown>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 py-20 opacity-20">
                    <div className="h-24 w-24 rounded-full border-2 border-dashed border-white flex items-center justify-center">
                       <Brain className="h-12 w-12 text-white" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] max-w-[200px]">Waiting for localized intelligence query</p>
                  </div>
                )}
              </AnimatePresence>
              <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
                 <CheckCircle2 className={`h-64 w-64 transition-all duration-1000 ${solution ? 'scale-100' : 'scale-50'}`} />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
