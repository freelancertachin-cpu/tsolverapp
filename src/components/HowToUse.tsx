
import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Gamepad2, 
  Zap, 
  Users, 
  Brain, 
  ChevronRight,
  ShieldCheck,
  Smartphone,
  LayoutDashboard
} from 'lucide-react';

export const HowToUse: React.FC = () => {
  const steps = [
    {
      title: 'Initialize Node',
      desc: 'Create your academic profile and select your frequency (School, College, or University).',
      icon: <Smartphone size={32} />,
      color: '#00f2ff'
    },
    {
      title: 'Sync Subjects',
      desc: 'Explore your personalized dashboard with modules tailored to your specific curriculum.',
      icon: <LayoutDashboard size={32} />,
      color: '#ffcc00'
    },
    {
      title: 'Neural Training',
      desc: 'Engage with AI Teacher for deep conceptual clarity or solve community doubts.',
      icon: <Brain size={32} />,
      color: '#00ff88'
    },
    {
      title: 'Gamified Victory',
      desc: 'Play educational games to archive XP and climb the global leaderboard.',
      icon: <Gamepad2 size={32} />,
      color: '#ff00ff'
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-24 pb-32">
      <div className="text-center space-y-4">
         <h2 className="text-6xl font-black italic uppercase tracking-tighter lg:text-8xl">Operations Manual</h2>
         <p className="text-[11px] font-black uppercase tracking-[1em] text-white/20">System Onboarding Protocol v2.6</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="cyber-panel p-12 space-y-8 group hover:border-white/20 transition-all relative overflow-hidden"
            >
               <div 
                 className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity scale-150 rotate-12"
                 style={{ color: step.color }}
               >
                  {step.icon}
               </div>
               
               <div className="h-20 w-20 bg-white/5 border border-white/5 rounded-[32px] flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                  {React.cloneElement(step.icon as React.ReactElement, { size: 36 })}
               </div>

               <div className="space-y-4">
                  <div className="flex items-center gap-4">
                     <span className="text-xs font-black text-white/20">0{i+1}</span>
                     <h3 className="text-3xl font-black italic uppercase tracking-tight">{step.title}</h3>
                  </div>
                  <p className="text-sm font-bold text-white/40 leading-relaxed uppercase tracking-widest">{step.desc}</p>
               </div>
            </motion.div>
         ))}
      </div>

      <div className="cyber-panel p-12 bg-white/[0.02] border-blue-500/10 flex flex-col items-center gap-10 text-center">
         <div className="h-24 w-24 rounded-[40px] bg-blue-500/10 flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.2)]">
            <Zap className="text-blue-500" size={40} />
         </div>
         <div className="space-y-4 max-w-2xl">
            <h3 className="text-4xl font-black italic uppercase tracking-tight">Need Real-Time Assistance?</h3>
            <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] leading-relaxed">Our AI Teacher is available 24/7 to guide you through any architectural complexity within the platform.</p>
         </div>
         <button className="h-20 px-16 bg-white text-black rounded-3xl font-black uppercase text-xs tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-glow">
            Engage AI Support
         </button>
      </div>
    </div>
  );
};
