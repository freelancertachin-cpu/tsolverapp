import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Brain, 
  Search, 
  Calculator as CalcIcon, 
  LineChart, 
  GraduationCap, 
  BookOpen, 
  Sparkles 
} from 'lucide-react';
import { ChatBox } from './ChatBox';
import { UserProfile } from '../lib/storage';

export const StudyHelp: React.FC<{ user: UserProfile, setActiveTab: (tab: string) => void }> = ({ user, setActiveTab }) => {
  const STUDY_TOOLS = [
    { id: 'scan', label: 'Math Solver', icon: <Zap size={20} />, desc: 'OCR formula recognition', color: '#ff3333' },
    { id: 'graph', label: 'Graph Plotter', icon: <LineChart size={20} />, desc: 'Interactive coordinate graphing', color: '#33ccff' },
    { id: 'assignment', label: 'Assignments', icon: <GraduationCap size={20} />, desc: 'Task manager & generator', color: '#ffaa00' },
    { id: 'subjects', label: 'Subject Library', icon: <BookOpen size={20} />, desc: 'Academic board & topics', color: '#00ff88' },
  ];

  return (
    <div className="w-full space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-4">
          <h2 className="text-5xl font-black uppercase tracking-tighter italic lg:text-7xl">Study Help</h2>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest flex items-center gap-3">
             Academic Assistant <span className="h-1 w-1 bg-white/20 rounded-full" /> Powered by Gemini AI
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Active Assistant</h3>
              <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-emerald-500">
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 Core Engine Ready
              </div>
           </div>
           <ChatBox user={user} />
        </div>

        <div className="space-y-10">
           <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Quick Tools</h3>
              <div className="grid grid-cols-1 gap-4">
                 {STUDY_TOOLS.map((tool) => (
                   <motion.button
                    key={tool.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tool.id)}
                    className="cyber-panel p-6 flex items-center gap-6 group hover:border-white/20 transition-all text-left"
                   >
                      <div 
                        className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all"
                        style={{ color: tool.color }}
                      >
                         {tool.icon}
                      </div>
                      <div className="flex-1">
                         <p className="text-sm font-black uppercase italic tracking-tight">{tool.label}</p>
                         <p className="text-[9px] font-bold uppercase text-white/20 tracking-wider group-hover:text-white/40">{tool.desc}</p>
                      </div>
                   </motion.button>
                 ))}
              </div>
           </div>

           <div className="cyber-panel p-8 bg-white/[0.01] border-dashed space-y-6">
              <div className="flex items-center gap-4">
                 <Sparkles className="text-white/40" size={24} />
                 <h4 className="text-xs font-black uppercase tracking-widest">Study Suggestion</h4>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest leading-loose text-white/30 italic">
                 "Based on your recent graph plotting activity, you should review Quadratic Equations to master parabolas."
              </p>
              <button className="w-full h-12 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                 Generate Revision Plan
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
