
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Clock, 
  Trophy, 
  Settings, 
  X,
  Smartphone,
  ChevronRight,
  Bell,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { storage, UserProfile } from '../lib/storage';

interface StudyTimerProps {
  user: UserProfile;
}

export const StudyTimer: React.FC<StudyTimerProps> = ({ user }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break' | 'long'>('focus');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [isGuest, setIsGuest] = useState(user.id.startsWith('guest_'));
  const [showSettings, setShowSettings] = useState(false);
  const [showFinished, setShowFinished] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('General');
  
  // Custom durations
  const [durations, setDurations] = useState({
    focus: 25 * 60,
    break: 5 * 60,
    long: 15 * 60
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleFinished();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  // Sync with background/localStorage to prevent data loss on Refresh
  useEffect(() => {
    const saved = localStorage.getItem('tsolver_timer_state');
    if (saved) {
      const { time, running, lastSync, mode: savedMode } = JSON.parse(saved);
      if (running) {
        const elapsed = Math.floor((Date.now() - lastSync) / 1000);
        const newTime = Math.max(0, time - elapsed);
        setTimeLeft(newTime);
        setIsActive(newTime > 0);
        setMode(savedMode);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tsolver_timer_state', JSON.stringify({
      time: timeLeft,
      running: isActive,
      lastSync: Date.now(),
      mode
    }));
  }, [timeLeft, isActive, mode]);

  const handleFinished = async () => {
    setIsActive(false);
    setShowFinished(true);
    
    if (mode === 'focus') {
      const durationSeconds = durations.focus;
      const minutes = durationSeconds / 60;
      setSessionsCompleted(prev => prev + 1);

      // Record study session in the new store
      await storage.recordStudySession({
        userId: user.id,
        duration: durationSeconds,
        subject: selectedSubject,
        focusScore: 95
      });

      // Maintain legacy game sessions
      await storage.saveGameSession({
        id: crypto.randomUUID(),
        userId: user.id,
        gameId: 'study_timer',
        score: minutes,
        xpEarned: minutes * 10,
        duration: durationSeconds,
        difficulty: 'Medium',
        timestamp: Date.now()
      });
    }

    // Play sound or notification if possible
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Session Finished!', {
        body: mode === 'focus' ? 'Time for a break!' : 'Ready for deep focus?',
        icon: '/logo.png'
      });
    }
  };

  const toggleTimer = () => {
    if (isGuest && !isActive) {
      // Just a warning, not blocking
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(durations[mode]);
  };

  const changeMode = (newMode: 'focus' | 'break' | 'long') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(durations[newMode]);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = 1 - (timeLeft / durations[mode]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 pb-20">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
        <div className="space-y-2 text-center md:text-left">
           <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                 <Zap size={18} />
              </div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-foreground italic">Deep Focus Node</h2>
           </div>
           <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Optimize your neural learning cycles.</p>
        </div>

        <div className="flex items-center gap-4">
           <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="h-12 px-6 bg-muted border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground outline-none focus:border-foreground/30 transition-all cursor-pointer"
            >
               <option>General</option>
               <option>Mathematics</option>
               <option>Physics</option>
               <option>Chemistry</option>
               <option>ICT</option>
               <option>Biology</option>
               <option>English</option>
               <option>Bangla</option>
            </select>
            <div className="cyber-panel px-6 py-3 flex items-center gap-4">
              <div className="text-right">
                 <p className="text-[8px] font-black uppercase tracking-widest text-foreground/20 italic">Global Streak</p>
                 <p className="text-sm font-black italic">{sessionsCompleted} Cycles</p>
              </div>
              <Trophy size={20} className="text-[#ffd700]" />
           </div>
        </div>
      </div>

      {/* Main Timer */}
      <div className="relative flex flex-col items-center justify-center pt-8">
         {/* Circular Progress (Visual only, CSS borders) */}
         <div className="relative h-80 w-80 md:h-96 md:w-96 rounded-full border-[16px] border-muted flex items-center justify-center shadow-2xl overflow-hidden group">
            {/* Background Glow */}
            <div className={`absolute inset-0 opacity-20 transition-all duration-1000 ${isActive ? 'scale-125' : 'scale-100'}`} 
              style={{ backgroundColor: mode === 'focus' ? '#ff3333' : '#00ff88' }} 
            />
            
            {/* Animated Ring */}
            <svg className="absolute inset-0 h-full w-full -rotate-90">
               <circle 
                 cx="50%" 
                 cy="50%" 
                 r="48%" 
                 fill="none" 
                 stroke="currentColor" 
                 strokeWidth="16"
                 className={`transition-all duration-300 ${mode === 'focus' ? 'text-red-500' : 'text-green-500'}`}
                 strokeDasharray="100 100"
                 strokeDashoffset={100 - (progress * 100)}
                 pathLength="100"
               />
            </svg>

            <div className="relative z-10 text-center space-y-2">
               <motion.h3 
                 key={timeLeft}
                 initial={{ scale: 0.9, opacity: 0.5 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className="text-8xl md:text-9xl font-black italic tracking-tighter text-foreground"
               >
                  {formatTime(timeLeft)}
               </motion.h3>
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground/30 italic">
                  {mode === 'focus' ? 'Pulse Inversion' : 'Static Rebuild'}
               </p>
            </div>
         </div>

         {/* Guest Warning */}
         {isGuest && (
           <motion.button 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="mt-8 px-6 py-3 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-2xl flex items-center gap-3 hover:bg-orange-500 hover:text-white transition-all group"
           >
              <AlertCircle size={16} />
              <span className="text-[9px] font-black uppercase tracking-widest">Connect ID to persistent session memory</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
           </motion.button>
         )}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10">
         <div className="cyber-panel p-8 space-y-8 flex flex-col justify-center">
            <div className="flex justify-center gap-4">
               {['focus', 'break', 'long'].map((m) => (
                  <button
                    key={m}
                    onClick={() => changeMode(m as any)}
                    className={`h-14 px-6 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border ${mode === m ? 'bg-foreground text-background border-foreground shadow-glow' : 'bg-muted text-foreground/20 border-border hover:border-foreground/30'}`}
                  >
                     {m}
                  </button>
               ))}
            </div>
            
            <div className="flex items-center justify-center gap-4">
               <button 
                 onClick={resetTimer}
                 className="h-20 w-20 rounded-3xl bg-muted border border-border flex items-center justify-center text-foreground/40 hover:text-foreground hover:border-foreground transition-all active:scale-90"
               >
                  <RotateCcw size={28} />
               </button>
               <button 
                 onClick={toggleTimer}
                 className={`h-24 px-12 rounded-[36px] flex items-center justify-center gap-4 transition-all hover:scale-105 active:scale-95 shadow-glow-hover ${isActive ? 'bg-muted text-foreground border border-border' : 'bg-foreground text-background shadow-glow'}`}
               >
                  {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
                  <span className="text-xl font-black uppercase italic tracking-tighter">{isActive ? 'Pause' : 'Start'}</span>
               </button>
               <button 
                 onClick={() => setShowSettings(true)}
                 className="h-20 w-20 rounded-3xl bg-muted border border-border flex items-center justify-center text-foreground/40 hover:text-foreground hover:border-foreground transition-all active:scale-90"
               >
                  <Settings size={28} />
               </button>
            </div>
         </div>

         {/* Analytics Panel */}
         <div className="cyber-panel p-8 space-y-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <Clock className="text-foreground/20" size={18} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/20">Session Metrics</h4>
               </div>
               <span className="text-[9px] font-black text-[#00ff88] uppercase tracking-widest animate-pulse">Live Tracking</span>
            </div>

            <div className="space-y-4">
               <div className="flex items-center justify-between p-4 bg-muted rounded-2xl border border-border/5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 italic">Deep Work Yield</span>
                  <span className="text-lg font-black italic">{(sessionsCompleted * 25).toString().padStart(2, '0')}:00</span>
               </div>
               <div className="flex items-center justify-between p-4 bg-muted rounded-2xl border border-border/5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 italic">Neural Exhaustion</span>
                  <div className="flex gap-1">
                     {[1, 2, 3, 4, 5].map(i => (
                       <div key={i} className={`h-4 w-1 rounded-full ${i <= 2 ? 'bg-red-500' : 'bg-white/5'}`} />
                     ))}
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                     <p className="text-[8px] font-black uppercase tracking-widest text-foreground/20 mb-1">XP Mult</p>
                     <p className="text-xl font-black italic">x1.5</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                     <p className="text-[8px] font-black uppercase tracking-widest text-foreground/20 mb-1">Efficency</p>
                     <p className="text-xl font-black italic text-[#00ff88]">94%</p>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Finished Modal */}
      <AnimatePresence>
         {showFinished && (
           <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFinished(false)}
                className="absolute inset-0 bg-background/90 backdrop-blur-2xl"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="w-full max-w-sm bg-secondary border border-border rounded-[56px] p-12 text-center space-y-8 relative z-10 shadow-2xl"
              >
                 <div className="h-24 w-24 rounded-[40px] bg-[#00ff88]/10 border border-[#00ff88]/20 flex items-center justify-center mx-auto text-[#00ff88]">
                    <CheckCircle2 size={48} />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-4xl font-black italic uppercase tracking-tighter">Cycle Complete</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 italic">Neural memory node synchronized</p>
                 </div>
                 <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => { setShowFinished(false); changeMode(mode === 'focus' ? 'break' : 'focus'); }}
                      className="h-16 w-full bg-foreground text-background rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-glow"
                    >
                       Start {mode === 'focus' ? 'Break' : 'Focus'}
                    </button>
                    <button 
                      onClick={() => setShowFinished(false)}
                      className="h-14 w-full bg-muted text-foreground/40 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-foreground transition-all"
                    >
                       Acknowledge
                    </button>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
         {showSettings && (
           <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSettings(false)}
                className="absolute inset-0 bg-background/90 backdrop-blur-2xl"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="w-full max-w-md bg-secondary border border-border rounded-[56px] p-12 space-y-10 relative z-10 shadow-2xl"
              >
                 <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">Timer Protocols</h3>
                    <button onClick={() => setShowSettings(false)} className="h-10 w-10 rounded-xl bg-muted border border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-all">
                       <X size={20} />
                    </button>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-foreground/20 italic">Focus Interval (MIN)</label>
                       <input 
                         type="number" 
                         value={durations.focus / 60} 
                         onChange={(e) => setDurations({...durations, focus: Number(e.target.value) * 60})}
                         className="w-full h-14 bg-muted border border-border rounded-2xl px-6 outline-none text-xl font-black italic focus:border-foreground/30 transition-all"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-foreground/20 italic">Short Break (MIN)</label>
                       <input 
                         type="number" 
                         value={durations.break / 60} 
                         onChange={(e) => setDurations({...durations, break: Number(e.target.value) * 60})}
                         className="w-full h-14 bg-muted border border-border rounded-2xl px-6 outline-none text-xl font-black italic focus:border-foreground/30 transition-all"
                       />
                    </div>
                    <div className="space-y-3 flex items-center justify-between p-6 bg-muted rounded-3xl border border-border">
                       <div className="flex items-center gap-4">
                          <Bell size={20} className="text-foreground/20" />
                          <span className="text-[10px] font-black uppercase tracking-widest italic">Notifications</span>
                       </div>
                       <input type="checkbox" className="h-6 w-12 accent-foreground cursor-pointer" defaultChecked />
                    </div>
                 </div>

                 <button 
                   onClick={() => { setShowSettings(false); resetTimer(); }}
                   className="h-16 w-full bg-foreground text-background rounded-2xl font-black uppercase text-xs tracking-widest shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
                 >
                    Overwrite Cycles
                 </button>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
};
