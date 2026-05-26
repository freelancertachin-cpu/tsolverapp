
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Heart, Zap, Play, RotateCcw, Home } from 'lucide-react';

interface MathRunnerProps {
  onFinish: (score: number) => void;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export const MathRunner: React.FC<MathRunnerProps> = ({ onFinish, difficulty }) => {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver'>('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [problem, setProblem] = useState({ q: '2 + 2', a: 4 });
  const [options, setOptions] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(10);
  const [combo, setCombo] = useState(0);

  const generateProblem = useCallback(() => {
    let a, b, op, ans;
    const max = difficulty === 'Hard' ? 50 : difficulty === 'Medium' ? 20 : 10;
    
    a = Math.floor(Math.random() * max) + 1;
    b = Math.floor(Math.random() * max) + 1;
    
    const ops = ['+', '-', '*'];
    op = ops[Math.floor(Math.random() * (difficulty === 'Easy' ? 2 : 3))];

    if (op === '+') ans = a + b;
    else if (op === '-') {
      if (a < b) [a, b] = [b, a];
      ans = a - b;
    }
    else ans = a * b;

    setProblem({ q: `${a} ${op} ${b}`, a: ans });

    // Generate options
    const opts = new Set<number>();
    opts.add(ans);
    while (opts.size < 4) {
      const offset = Math.floor(Math.random() * 10) - 5;
      if (offset !== 0) opts.add(ans + offset);
    }
    setOptions(Array.from(opts).sort(() => Math.random() - 0.5));
    setTimeLeft(difficulty === 'Hard' ? 5 : difficulty === 'Medium' ? 8 : 12);
  }, [difficulty]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (gameState === 'playing' && timeLeft === 0) {
      handleWrong();
    }
  }, [gameState, timeLeft]);

  const handleStart = () => {
    setScore(0);
    setLives(3);
    setCombo(0);
    setGameState('playing');
    generateProblem();
  };

  const handleAnswer = (choice: number) => {
    if (choice === problem.a) {
      setScore(prev => prev + 10 + combo);
      setCombo(prev => prev + 2);
      generateProblem();
    } else {
      handleWrong();
    }
  };

  const handleWrong = () => {
    setLives(prev => prev - 1);
    setCombo(0);
    if (lives <= 1) {
      setGameState('gameOver');
    } else {
      generateProblem();
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-black text-white relative overflow-hidden">
       {/* Background Grid */}
       <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
       
       <AnimatePresence mode="wait">
          {gameState === 'start' && (
            <motion.div 
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center space-y-8 relative z-10"
            >
               <div className="h-32 w-32 bg-blue-500/20 rounded-[40px] flex items-center justify-center mx-auto border border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.3)]">
                  <Zap size={64} className="text-blue-400" />
               </div>
               <div className="space-y-4">
                  <h1 className="text-6xl font-black italic uppercase tracking-tighter">Math Runner</h1>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">Hyper-Speed Academic Protocol</p>
               </div>
               <button 
                 onClick={handleStart}
                 className="h-20 px-16 bg-white text-black rounded-3xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-all shadow-glow flex items-center gap-4"
               >
                  <Play fill="currentColor" /> Initiate Session
               </button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div 
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-2xl space-y-12 relative z-10"
            >
               {/* HUD */}
               <div className="flex justify-between items-center bg-white/5 border border-white/10 p-6 rounded-[32px]">
                  <div className="flex items-center gap-6">
                     <div className="space-y-1">
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Protocol Score</p>
                        <p className="text-2xl font-black italic tracking-tighter">{score}</p>
                     </div>
                     <div className="h-8 w-px bg-white/10" />
                     <div className="space-y-1">
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Combo</p>
                        <p className="text-2xl font-black italic tracking-tighter text-blue-400">x{combo/2}</p>
                     </div>
                  </div>

                  <div className="flex items-center gap-4">
                     <div className="flex gap-2">
                        {[...Array(3)].map((_, i) => (
                           <Heart 
                             key={i} 
                             size={20} 
                             fill={i < lives ? "#ff3333" : "none"} 
                             className={i < lives ? "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "text-white/10"} 
                           />
                        ))}
                     </div>
                  </div>
               </div>

               {/* Central Display */}
               <div className="relative h-64 flex flex-col items-center justify-center">
                  <div className={`absolute inset-0 bg-blue-500/5 blur-[100px] transition-all duration-300 ${timeLeft < 3 ? 'bg-red-500/20' : ''}`} />
                  
                  <div className="space-y-4 text-center">
                     <p className="text-[10px] font-black uppercase tracking-[0.8em] text-white/20">Evaluate Operation</p>
                     <motion.h2 
                       key={problem.q}
                       initial={{ scale: 0.8, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       className="text-8xl md:text-9xl font-black italic tracking-tighter"
                     >
                        {problem.q}
                     </motion.h2>
                  </div>

                  {/* Timer Bar */}
                  <div className="absolute -bottom-4 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                     <motion.div 
                       key={problem.q}
                       initial={{ width: '100%' }}
                       animate={{ width: '0%' }}
                       transition={{ duration: timeLeft, ease: 'linear' }}
                       className={`h-full shadow-glow ${timeLeft < 3 ? 'bg-red-500' : 'bg-blue-500'}`}
                     />
                  </div>
               </div>

               {/* Options */}
               <div className="grid grid-cols-2 gap-4">
                  {options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(opt)}
                      className="h-24 bg-white/5 border border-white/10 rounded-3xl text-3xl font-black italic tracking-tighter hover:bg-white hover:text-black transition-all hover:scale-[1.02] active:scale-95 shadow-glow-hover"
                    >
                       {opt}
                    </button>
                  ))}
               </div>
            </motion.div>
          )}

          {gameState === 'gameOver' && (
            <motion.div 
              key="gameOver"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-12 relative z-10"
            >
               <div className="space-y-4">
                  <h2 className="text-8xl font-black italic uppercase tracking-tighter text-red-500">System Failure</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Academic parameters exceeded</p>
               </div>

               <div className="cyber-panel p-12 inline-block space-y-6 min-w-[300px]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Archived Rewards</p>
                  <div className="flex items-center justify-center gap-8">
                     <div className="text-center">
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Points</p>
                        <p className="text-4xl font-black italic">{score}</p>
                     </div>
                     <div className="h-10 w-px bg-white/10" />
                     <div className="text-center">
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/20">XP Gained</p>
                        <p className="text-4xl font-black italic text-[#00ff88]">+{Math.floor(score/2)}</p>
                     </div>
                  </div>
               </div>

               <div className="flex flex-col md:flex-row gap-4 justify-center">
                  <button 
                    onClick={handleStart}
                    className="h-16 px-12 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest shadow-glow flex items-center justify-center gap-3 hover:scale-105 transition-all"
                  >
                     <RotateCcw size={18} /> Hot Reboot
                  </button>
                  <button 
                    onClick={() => onFinish(score)}
                    className="h-16 px-12 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                  >
                     <Home size={18} /> Archive Results
                  </button>
               </div>
            </motion.div>
          )}
       </AnimatePresence>
    </div>
  );
};
