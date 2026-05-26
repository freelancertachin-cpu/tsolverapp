import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  FileText, 
  Video, 
  MessageSquare, 
  BarChart3, 
  Camera, 
  Gamepad2, 
  Languages, 
  BookOpen, 
  Rocket, 
  ArrowRight,
  Sparkles,
  ChevronLeft,
  Activity,
  Cpu,
  Globe,
  Zap
} from 'lucide-react';
import { SmartNotes } from './SmartNotes';
import { OCREngine } from './OCREngine';
import { AITeacher } from './AITeacher';
import { LanguageLearning } from './LanguageLearning';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { AssignmentSector } from './AssignmentSector';
import { PracticeEngine } from './PracticeEngine';
import { MathGame } from './MathGame';

export const ExploreHub: React.FC<{ user: any }> = ({ user }) => {
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const [globalSettings, setGlobalSettings] = useState({
    enableGames: true,
  });

  React.useEffect(() => {
    const savedSettings = localStorage.getItem('tsolver_global_settings');
    if (savedSettings) {
      try {
        setGlobalSettings(JSON.parse(savedSettings));
      } catch (e) {}
    }
  }, []);

  const MODULES = [
    { id: 'ai-teacher', icon: MessageSquare, title: 'AI Neural Teacher', desc: 'Step-by-step tutoring engine', color: 'from-[#00f2ff] to-[#0060ff]', shadow: 'shadow-[#00f2ff]/20' },
    { id: 'notes', icon: FileText, title: 'Smart Archive', desc: 'AI-Enhanced local note system', color: 'from-[#ff0080] to-[#7928ca]', shadow: 'shadow-[#ff0080]/20' },
    { id: 'ocr', icon: Camera, title: 'Neural Scan', desc: 'OCR script & diagram recognition', color: 'from-[#00ff88] to-[#0088ff]', shadow: 'shadow-[#00ff88]/20' },
    { id: 'languages', icon: Languages, title: 'Lingo Core', desc: 'Duolingo-style language evolution', color: 'from-[#ffd600] to-[#ff6b00]', shadow: 'shadow-[#ffd600]/20' },
    { id: 'practice', icon: Rocket, title: 'Rapid Practice', desc: 'Adaptive problem set generator', color: 'from-[#4ade80] to-[#3b82f6]', shadow: 'shadow-[#4ade80]/20' },
    ...(globalSettings.enableGames ? [{ id: 'games', icon: Gamepad2, title: 'Logic Playground', desc: '50+ Colorful educational experiences', color: 'from-[#f472b6] to-[#8b5cf6]', shadow: 'shadow-[#f472b6]/20' }] : []),
    { id: 'analytics', icon: BarChart3, title: 'Telemetry Hub', desc: 'Deep performance analytics', color: 'from-[#94a3b8] to-[#1e293b]', shadow: 'shadow-[#94a3b8]/20' },
    { id: 'assignments', icon: BookOpen, title: 'Task Sector', desc: 'Assignment solver & manager', color: 'from-[#fb7185] to-[#e11d48]', shadow: 'shadow-[#fb7185]/20' },
  ];

  return (
    <div className="relative min-h-screen bg-transparent pt-32 pb-64 px-8 overflow-y-auto overflow-x-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[5%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] dark:opacity-[0.05]" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <AnimatePresence mode="wait">
        {!activeModule ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-7xl mx-auto space-y-24 relative z-10"
          >
            <div className="space-y-8 text-center max-w-4xl mx-auto">
               <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md"
               >
                  <div className="relative">
                    <Sparkles size={14} className="text-[#00f2ff] animate-pulse" />
                    <div className="absolute inset-0 bg-[#00f2ff]/50 blur-sm animate-ping opacity-50" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">Ecosystem Central Hub</p>
               </motion.div>
               
               <h1 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.85] py-4">
                  <span className="block overflow-hidden">
                    <motion.span 
                      initial={{ y: '100%' }} 
                      animate={{ y: 0 }} 
                      transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="block"
                    >
                      Explore The
                    </motion.span>
                  </span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40 overflow-hidden">
                    <motion.span 
                      initial={{ y: '100%' }} 
                      animate={{ y: 0 }} 
                      transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="block"
                    >
                      Neural Web
                    </motion.span>
                  </span>
               </h1>

               <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-12 pt-8"
               >
                  <div className="flex flex-col items-center gap-2">
                    <Activity size={16} className="text-white/20" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Active Node</span>
                  </div>
                  <div className="h-8 w-[1px] bg-white/10" />
                  <div className="flex flex-col items-center gap-2">
                    <Cpu size={16} className="text-white/20" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Sync Rate: 100%</span>
                  </div>
                  <div className="h-8 w-[1px] bg-white/10" />
                  <div className="flex flex-col items-center gap-2">
                    <Globe size={16} className="text-white/20" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Global Grid</span>
                  </div>
               </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {MODULES.map((module, i) => (
                  <motion.button 
                    key={module.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i, duration: 0.5 }}
                    onClick={() => setActiveModule(module.id)}
                    className="group relative h-[380px] w-full rounded-[40px] border border-white/5 bg-white/[0.02] dark:bg-black/40 backdrop-blur-3xl p-10 text-left flex flex-col justify-between overflow-hidden transition-all hover:border-white/20 hover:bg-white/[0.04] active:scale-[0.98]"
                  >
                    {/* Hover Gradient Glow */}
                    <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${module.color} blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-700`} />
                    
                    <div className="space-y-8 relative z-10">
                      <div className={`h-20 w-20 rounded-[30px] bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-white group-hover:border-transparent ${module.shadow} group-hover:shadow-2xl`}>
                        <module.icon className="h-9 w-9 text-white/40 group-hover:text-black transition-colors duration-500" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${module.color}`} />
                          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 group-hover:text-white/60 transition-colors">Sector {i + 1}</span>
                        </div>
                        <h3 className="text-3xl font-black uppercase italic tracking-tight leading-none">{module.title}</h3>
                        <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest leading-relaxed group-hover:text-white/50 transition-colors">{module.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between relative z-10 pt-4">
                       <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                          <Zap size={16} className="text-white/20 group-hover:text-white/80 transition-colors" />
                       </div>
                       <div className="flex items-center gap-3 text-white/20 group-hover:text-white transition-all text-[9px] font-black uppercase tracking-[0.2em]">
                          Initialize <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                       </div>
                    </div>
                  </motion.button>
               ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="module"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto relative z-10"
          >
            <div className="flex items-center justify-between mb-12">
              <button 
                onClick={() => setActiveModule(null)}
                className="flex items-center gap-5 text-white/40 hover:text-white transition-all group"
              >
                <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all">
                  <ChevronLeft size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Back to Hub</span>
                  <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">Disconnecting current node...</span>
                </div>
              </button>

              <div className="hidden md:flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                 <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">Module Active: {MODULES.find(m => m.id === activeModule)?.title}</span>
              </div>
            </div>

            <div className="cyber-panel p-8 md:p-12 min-h-[60vh] border-white/5">
              {activeModule === 'notes' && <SmartNotes userId={user.id} />}
              {activeModule === 'ocr' && <OCREngine />}
              {activeModule === 'ai-teacher' && <AITeacher subject="General Systems" user={user} />}
              {activeModule === 'languages' && <LanguageLearning />}
              {activeModule === 'practice' && <PracticeEngine subject="all" mode="rapid" />}
              {activeModule === 'analytics' && <AnalyticsDashboard subject="all" />}
              {activeModule === 'games' && <MathGame subject="T-Solver Global" />}
              {activeModule === 'assignments' && <AssignmentSector />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

