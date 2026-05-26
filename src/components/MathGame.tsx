import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, 
  Zap, 
  Trophy, 
  Heart, 
  Timer, 
  ChevronRight, 
  Sparkles, 
  X,
  Target,
  Brain
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const MathGame: React.FC<{ subject?: string }> = ({ subject = "Logical Arithmetic" }) => {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(10);
  const [currentProblem, setCurrentProblem] = useState({ q: '', a: 0 });
  const [options, setOptions] = useState<number[]>([]);

  useEffect(() => {
    let timer: any;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      handleWrong();
    }
    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  const generateProblem = () => {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let ans = 0;
    if (op === '+') ans = a + b;
    if (op === '-') ans = a - b;
    if (op === '*') ans = a * b;

    setCurrentProblem({ q: `${a} ${op} ${b}`, a: ans });

    const newOptions = [ans];
    while (newOptions.length < 4) {
      const wrong = ans + (Math.floor(Math.random() * 10) - 5);
      if (!newOptions.includes(wrong)) newOptions.push(wrong);
    }
    setOptions(newOptions.sort(() => Math.random() - 0.5));
    setTimeLeft(10);
  };

  const startGame = () => {
    setScore(0);
    setLives(3);
    setGameState('playing');
    generateProblem();
  };

  const handleAnswer = (ans: number) => {
    if (ans === currentProblem.a) {
      setScore(prev => prev + 10);
      confetti({
        particleCount: 20,
        spread: 30,
        origin: { y: 0.9 },
        colors: ['#00f2ff', '#00ff88']
      });
      generateProblem();
    } else {
      handleWrong();
    }
  };

  const handleWrong = () => {
    if (lives > 1) {
      setLives(prev => prev - 1);
      generateProblem();
    } else {
      setGameState('gameover');
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.5 }
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-32">
       <div className="flex items-center justify-between">
         <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                  <Gamepad2 size={20} className="text-[#ffd600]" />
               </div>
               <h2 className="text-4xl font-black italic uppercase tracking-tighter">Logic Playground</h2>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">{subject} • Node Level 4</p>
         </div>
         <div className="flex items-center gap-12">
            <div className="flex items-center gap-4">
               {[...Array(3)].map((_, i) => (
                 <Heart key={i} size={24} className={i < lives ? 'text-red-500 fill-red-500' : 'text-white/10'} />
               ))}
            </div>
            <div className="flex flex-col items-end">
               <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Score</p>
               <p className="text-3xl font-black italic">{score}</p>
            </div>
         </div>
      </div>

      <div className="cyber-panel min-h-[500px] flex items-center justify-center bg-gradient-to-br from-white/[0.01] to-transparent relative overflow-hidden">
        <AnimatePresence mode="wait">
          {gameState === 'start' && (
            <motion.div 
               key="start"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 1.1 }}
               className="text-center space-y-10"
            >
               <div className="h-40 w-40 rounded-[64px] bg-white/5 border border-white/10 flex items-center justify-center mx-auto shadow-glow">
                  <Brain size={80} className="text-[#00f2ff]" />
               </div>
               <div className="space-y-4">
                  <h3 className="text-5xl font-black uppercase italic tracking-tighter">Neural Reflexes</h3>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">Test your logical arithmetic at hyper-speed.</p>
               </div>
               <button 
                  onClick={startGame}
                  className="h-20 px-20 bg-white text-black rounded-[32px] font-black uppercase text-xs tracking-[0.3em] shadow-glow hover:scale-[1.05] transition-all"
               >
                  Initiate Core
               </button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div 
               key="playing"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="w-full max-w-2xl px-12 space-y-16"
            >
               <div className="flex items-center justify-between">
                  <div className="h-2 flex-1 bg-white/5 rounded-full overflow-hidden mr-8">
                     <motion.div 
                        className="h-full bg-gradient-to-r from-[#00f2ff] to-[#00ff88]"
                        animate={{ width: `${(timeLeft / 10) * 100}%` }}
                        transition={{ duration: 1, ease: 'linear' }}
                     />
                  </div>
                  <div className="flex items-center gap-3 text-white/40">
                     <Timer size={18} />
                     <span className="font-mono text-xl font-black">{timeLeft}s</span>
                  </div>
               </div>

               <div className="text-center py-10">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.8em] text-white/20 mb-8">Current Equation</h4>
                  <p className="text-9xl font-black italic uppercase tracking-tighter animate-pulse">{currentProblem.q}</p>
               </div>

               <div className="grid grid-cols-2 gap-8">
                  {options.map((opt, i) => (
                    <button 
                      key={i}
                      onClick={() => handleAnswer(opt)}
                      className="h-24 bg-white/5 border border-white/10 rounded-[32px] text-3xl font-black italic transition-all hover:bg-white hover:text-black hover:border-white shadow-glow active:scale-90"
                    >
                      {opt}
                    </button>
                  ))}
               </div>
            </motion.div>
          )}

          {gameState === 'gameover' && (
            <motion.div 
               key="over"
               initial={{ opacity: 0, scale: 1.1 }}
               animate={{ opacity: 1, scale: 1 }}
               className="text-center space-y-10"
            >
               <div className="h-40 w-40 rounded-[64px] bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto shadow-[0_0_80px_rgba(239,68,68,0.2)]">
                  <Trophy size={80} className="text-yellow-500" />
               </div>
               <div className="space-y-4">
                  <h3 className="text-6xl font-black uppercase italic tracking-tighter">Session Terminated</h3>
                  <p className="text-sm font-bold text-white/40 uppercase tracking-widest">Global Rank: #4,209</p>
               </div>
               <div className="p-8 bg-white/5 border border-white/5 rounded-[40px] max-w-sm mx-auto">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">XP Synchronization</p>
                  <p className="text-4xl font-black italic text-[#00ff88]">+{score * 5} XP</p>
               </div>
               <button 
                  onClick={startGame}
                  className="h-20 px-20 bg-white text-black rounded-[32px] font-black uppercase text-xs tracking-[0.3em] shadow-glow hover:scale-[1.05] transition-all"
               >
                  Resync Node
               </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { icon: <Target className="text-[#00f2ff]" />, label: 'Accuracy', value: '94%' },
           { icon: <Zap className="text-[#ffd600]" />, label: 'Fastest Solve', value: '1.2s' },
           { icon: <Sparkles className="text-purple-500" />, label: 'Neural Streak', value: '12' },
         ].map((stat, i) => (
           <div key={i} className="p-8 rounded-[40px] bg-white/5 border border-white/5 flex items-center gap-6">
              <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center">
                 {stat.icon}
              </div>
              <div>
                 <p className="text-[9px] font-black uppercase tracking-widest text-white/20">{stat.label}</p>
                 <p className="text-xl font-black italic">{stat.value}</p>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};
