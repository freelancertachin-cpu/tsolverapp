import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Mic, 
  Headphones, 
  Book, 
  Star, 
  Zap, 
  Heart, 
  CheckCircle2, 
  ChevronRight,
  Trophy,
  Flame,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Lesson {
  id: string;
  title: string;
  type: 'vocab' | 'grammar' | 'speaking' | 'listening';
  xp: number;
  locked: boolean;
  color: string;
}

export const LanguageLearning: React.FC = () => {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [streak, setStreak] = useState(12);
  const [lives, setLives] = useState(5);
  const [xp, setXp] = useState(2450);

  const PATH: Lesson[] = [
    { id: '1', title: 'Neural Vocabulary', type: 'vocab', xp: 50, locked: false, color: 'bg-green-500' },
    { id: '2', title: 'Syntactic Logic', type: 'grammar', xp: 75, locked: false, color: 'bg-blue-500' },
    { id: '3', title: 'Auditory Analysis', type: 'listening', xp: 100, locked: true, color: 'bg-purple-500' },
    { id: '4', title: 'Vocal Pronunciation', type: 'speaking', xp: 150, locked: true, color: 'bg-orange-500' },
    { id: '5', title: 'Deep Contextual Path', type: 'vocab', xp: 200, locked: true, color: 'bg-red-500' },
  ];

  const handleComplete = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00f2ff', '#00ff88', '#ff0080']
    });
    setXp(prev => prev + (activeLesson?.xp || 0));
    setActiveLesson(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header Stats */}
      <div className="flex items-center justify-center gap-12 py-8 bg-white/5 border border-white/5 rounded-[40px]">
        <div className="flex items-center gap-3">
          <Flame size={24} className="text-orange-500" />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase text-white/20">Streak</p>
            <p className="text-2xl font-black italic italic">{streak} Days</p>
          </div>
        </div>
        <div className="h-12 w-[1px] bg-white/10" />
        <div className="flex items-center gap-3">
          <Trophy size={24} className="text-yellow-500" />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase text-white/20">Global XP</p>
            <p className="text-2xl font-black italic italic">{xp}</p>
          </div>
        </div>
        <div className="h-12 w-[1px] bg-white/10" />
        <div className="flex items-center gap-3">
          <Heart size={24} className="text-red-500 fill-red-500" />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase text-white/20">Neural Lives</p>
            <p className="text-2xl font-black italic italic">{lives}</p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!activeLesson ? (
          <motion.div 
            key="path"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-16 py-12"
          >
            {PATH.map((step, i) => (
              <div key={step.id} className="relative flex flex-col items-center">
                {i < PATH.length - 1 && (
                  <div className="absolute top-24 w-1 h-32 bg-white/5 border-l-2 border-dotted border-white/10 -z-10" />
                )}
                
                <motion.button
                  whileHover={!step.locked ? { scale: 1.1 } : {}}
                  whileTap={!step.locked ? { scale: 0.9 } : {}}
                  onClick={() => !step.locked && setActiveLesson(step)}
                  className={`h-24 w-24 rounded-[40px] flex items-center justify-center relative cursor-pointer overflow-hidden border-4 shadow-xl transition-all ${step.locked ? 'bg-white/5 border-white/10 opacity-50 grayscale' : `${step.color} border-white/20 shadow-glow`}`}
                >
                  {step.locked ? <Book size={32} className="text-white/20" /> : <Zap size={32} className="text-white" />}
                  {!step.locked && (
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-1 -right-1 h-8 w-8 bg-black rounded-full flex items-center justify-center border-2 border-white"
                    >
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    </motion.div>
                  )}
                </motion.button>
                <p className={`mt-4 text-[10px] font-black uppercase tracking-widest ${step.locked ? 'text-white/20' : 'text-white/60'}`}>{step.title}</p>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="lesson"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="cyber-panel p-16 space-y-12 bg-gradient-to-br from-white/5 to-transparent"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setActiveLesson(null)} className="text-white/40 hover:text-white">
                  <X size={24} />
                </button>
                <div className="h-2 w-64 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-1/3" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Heart size={20} className="text-red-500 fill-red-500" />
                <span className="font-black italic">{lives}</span>
              </div>
            </div>

            <div className="space-y-8 text-center pt-8">
              <h3 className="text-5xl font-black italic uppercase tracking-tighter">Translate this Logic</h3>
              <p className="text-2xl font-bold text-white/40 italic">"The derivative of a function represents its instantaneous rate of change."</p>
            </div>

            <div className="grid grid-cols-1 gap-6 pt-12">
              <button className="p-8 bg-white/5 border border-white/10 rounded-3xl text-left hover:bg-white hover:text-black transition-all group">
                <p className="text-lg font-bold italic leading-relaxed">একটি ফাংশনের ডেরিভেটিভ তার তাৎক্ষণিক পরিবর্তনের হারকে প্রতিনিধিত্ব করে।</p>
              </button>
              <button className="p-8 bg-white/5 border border-white/10 rounded-3xl text-left hover:bg-white hover:text-black transition-all group">
                <p className="text-lg font-bold italic leading-relaxed">ডেরিভেটিভ হলো একটি স্থির মান যা সময়ের সাথে পরিবর্তিত হয় না।</p>
              </button>
            </div>

            <div className="pt-12 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4 text-white/20">
                <Mic size={24} />
                <Headphones size={24} />
              </div>
              <button 
                onClick={handleComplete}
                className="h-16 px-16 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest shadow-glow hover:scale-105 transition-all"
              >
                Verify Logic
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
