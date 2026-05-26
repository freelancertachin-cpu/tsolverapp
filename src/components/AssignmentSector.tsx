import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  X, 
  FileText,
  Brain,
  Zap,
  Calendar,
  Sparkles,
  Loader2
} from 'lucide-react';
import { localAI } from '@/lib/localAI';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Assignment {
  id: string;
  title: string;
  subject: string;
  deadline: number;
  status: 'pending' | 'completed' | 'overdue';
  priority: 'High' | 'Medium' | 'Low';
  desc: string;
}

export const AssignmentSector: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([
    { id: '1', title: 'Calculus Variations', subject: 'Math', deadline: Date.now() + 86400000, status: 'pending', priority: 'High', desc: 'Solve exercises 12-25 from the modern integration module.' },
    { id: '2', title: 'Atomic Structures', subject: 'Chemistry', deadline: Date.now() + 172800000, status: 'pending', priority: 'Medium', desc: 'Draw and explain the Bohr model for Argon.' },
    { id: '3', title: 'Neural Networks 101', subject: 'IT', deadline: Date.now() - 86400000, status: 'overdue', priority: 'High', desc: 'Implementation of a basic perceptron via local storage nodes.' },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  const handleAiSearch = async (prompt: string) => {
    setAiLoading(true);
    try {
      const res = await localAI.process(prompt);
      setAiResult(res);
    } catch {
      setAiResult("Neural processing failed.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* AI Result Overlay */}
      <AnimatePresence>
        {aiResult && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="w-full max-w-2xl cyber-panel p-12 space-y-8 relative"
             >
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <Sparkles className="text-indigo-400" />
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter">AI Mission Brief</h3>
                   </div>
                   <button onClick={() => setAiResult(null)} className="text-white/20 hover:text-white">
                      <X size={24} />
                   </button>
                </div>
                <ScrollArea className="h-[300px] w-full bg-white/5 rounded-3xl p-8">
                   <div className="prose prose-invert prose-sm">
                      <ReactMarkdown>{aiResult}</ReactMarkdown>
                   </div>
                </ScrollArea>
                <button 
                  onClick={() => setAiResult(null)}
                  className="w-full h-16 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-glow"
                >
                   Acknowledge
                </button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
      <div className="flex items-center justify-between">
         <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                  <BookOpen size={20} className="text-[#ff0080]" />
               </div>
               <h2 className="text-4xl font-black italic uppercase tracking-tighter">Task Sector</h2>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Assignment Management & AI Dispatch</p>
         </div>
         <button 
           onClick={() => setIsAdding(true)}
           className="h-14 px-8 bg-white text-black rounded-2xl flex items-center gap-3 font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-glow"
         >
            <Plus size={18} /> New Assignment
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
         {/* List */}
         <div className="lg:col-span-3 space-y-6">
            <div className="flex gap-4 border-b border-white/5 pb-4">
               {['All Tasks', 'Pending', 'Completed', 'Overdue'].map(tab => (
                 <button key={tab} className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all px-4 py-2 hover:bg-white/5 rounded-lg">{tab}</button>
               ))}
            </div>

            <div className="space-y-4">
               {assignments.map((a, i) => (
                  <motion.div 
                    key={a.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="cyber-panel p-8 group flex items-center justify-between hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-8">
                       <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border ${a.status === 'overdue' ? 'bg-red-500/10 border-red-500/20 text-red-500' : a.status === 'completed' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-white/5 border-white/10 text-white/40'}`}>
                          {a.status === 'completed' ? <CheckCircle2 size={24} /> : a.status === 'overdue' ? <AlertCircle size={24} /> : <Clock size={24} />}
                       </div>
                       <div className="space-y-2">
                          <div className="flex items-center gap-3">
                             <h4 className="text-lg font-black uppercase italic tracking-tight">{a.title}</h4>
                             <span className="px-2 py-0.5 bg-white/5 rounded text-[8px] font-black uppercase tracking-widest text-white/20">{a.subject}</span>
                          </div>
                          <div className="flex items-center gap-4">
                             <div className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase">
                                <Calendar size={10} />
                                Deadline: {new Date(a.deadline).toLocaleDateString()}
                             </div>
                             <div className={`text-[8px] font-black uppercase px-2 rounded ${a.priority === 'High' ? 'text-red-400 bg-red-400/10' : 'text-orange-400 bg-orange-400/10'}`}>{a.priority} Priority</div>
                          </div>
                       </div>
                    </div>
                    <button className="h-12 w-12 rounded-xl bg-white/5 border border-white/5 opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                       <ChevronRight size={20} />
                    </button>
                  </motion.div>
               ))}
            </div>
         </div>

         {/* Stats Panel */}
         <div className="space-y-8">
            <div className="cyber-panel p-8 space-y-6 bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20">
               <div className="flex items-center gap-3 text-indigo-400">
                  <Sparkles size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">AI Hub</span>
               </div>
               <div className="space-y-3">
                  <button 
                    onClick={() => {
                        handleAiSearch("Generate a class 10 math assignment outline.");
                    }}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
                  >
                     Generate Task
                  </button>
                  <button 
                    onClick={() => {
                        window.alert("AI Solver: Analyzing extracted data nodes...");
                    }}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
                  >
                     Automate Solution
                  </button>
               </div>
            </div>

            <div className="cyber-panel p-8 space-y-8">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/20">Operational Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-6 bg-white/5 rounded-3xl text-center space-y-2">
                      <p className="text-2xl font-black italic">14</p>
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Active Tasks</p>
                   </div>
                   <div className="p-6 bg-white/5 rounded-3xl text-center space-y-2">
                      <p className="text-2xl font-black italic text-[#00ff88]">92%</p>
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Completion Rate</p>
                   </div>
                </div>
            </div>

            <div className="cyber-panel p-8 space-y-6 bg-gradient-to-br from-[#ff0080]/5 to-transparent border-[#ff0080]/10">
               <div className="flex items-center gap-3 text-[#ff0080]">
                  <Brain size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Neural Forecast</span>
               </div>
               <p className="text-xs font-bold leading-relaxed italic opacity-60">
                 Based on your current speed, you will finish the "Calculus Variations" assignment 4 hours before the deadline. Keep going!
               </p>
               <div className="flex items-center gap-2 pt-4">
                  <Zap size={12} className="text-[#ff0080]" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40">AI Confidence: 94%</span>
               </div>
            </div>
         </div>
      </div>

      <AnimatePresence>
         {isAdding && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAdding(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-xl bg-black border border-white/10 rounded-[64px] p-16 space-y-10 relative z-10"
              >
                  <div className="flex items-center justify-between">
                     <h3 className="text-4xl font-black uppercase italic tracking-tighter">New Task Node</h3>
                     <button onClick={() => setIsAdding(false)} className="text-white/20 hover:text-white">
                        <X size={24} />
                     </button>
                  </div>

                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/20 px-4">Task Title</label>
                        <input className="w-full h-16 bg-white/5 border border-white/10 rounded-3xl px-8 outline-none focus:border-white/20 text-sm font-bold" placeholder="E.g. Discrete Mathematics HW" />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-widest text-white/20 px-4">Subject</label>
                           <select className="w-full h-16 bg-white/5 border border-white/10 rounded-3xl px-6 outline-none text-xs font-black uppercase tracking-widest text-white appearance-none">
                              <option>Mathematics</option>
                              <option>Physics</option>
                              <option>Chemistry</option>
                              <option>IT / CS</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-widest text-white/20 px-4">Priority</label>
                           <select className="w-full h-16 bg-white/5 border border-white/10 rounded-3xl px-6 outline-none text-xs font-black uppercase tracking-widest text-white appearance-none">
                              <option>High</option>
                              <option>Medium</option>
                              <option>Low</option>
                           </select>
                        </div>
                     </div>
                  </div>

                  <button className="w-full h-20 bg-white text-black rounded-[32px] font-black uppercase text-xs tracking-[0.3em] shadow-glow hover:scale-[1.02] transition-all">
                     Sync Assignment
                  </button>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
};
