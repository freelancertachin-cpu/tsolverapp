
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Play, Trophy, Home, HelpCircle, CheckCircle2 } from 'lucide-react';

interface WordScrambleProps {
  onFinish: (score: number) => void;
}

const WORDS = [
  { word: 'PHYSICS', hint: 'The study of matter and energy' },
  { word: 'ALGORITHM', hint: 'Step-by-step procedure for calculation' },
  { word: 'CHEMISTRY', hint: 'Study of substances and their reactions' },
  { word: 'BIOLOGY', hint: 'Study of living organisms' },
  { word: 'GEOMETRY', hint: 'Study of shapes and sizes' },
  { word: 'CALCULUS', hint: 'Mathematical study of continuous change' },
  { word: 'SOFTWARE', hint: 'Programs used by a computer' },
  { word: 'HISTORY', hint: 'The study of past events' },
  { word: 'POETRY', hint: 'Literary work in which special intensity is given to feelings' },
  { word: 'ASTRONOMY', hint: 'Study of celestial objects' }
];

export const WordScramble: React.FC<WordScrambleProps> = ({ onFinish }) => {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver'>('start');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [scrambled, setScrambled] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showHint, setShowHint] = useState(false);

  const shuffleWord = (word: string) => {
    return word.split('').sort(() => Math.random() - 0.5).join('');
  };

  const nextWord = () => {
    if (currentWordIndex + 1 < WORDS.length) {
      setCurrentWordIndex(prev => prev + 1);
      setScrambled(shuffleWord(WORDS[currentWordIndex + 1].word));
      setUserInput('');
      setFeedback(null);
      setShowHint(false);
    } else {
      setGameState('gameOver');
    }
  };

  const handleStart = () => {
    setCurrentWordIndex(0);
    setScrambled(shuffleWord(WORDS[0].word));
    setScore(0);
    setUserInput('');
    setFeedback(null);
    setGameState('playing');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.toUpperCase() === WORDS[currentWordIndex].word) {
      setScore(prev => prev + (showHint ? 5 : 10));
      setFeedback('correct');
      setTimeout(nextWord, 1000);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-6 bg-[#0a0a0a] text-white">
       <AnimatePresence mode="wait">
          {gameState === 'start' && (
            <motion.div 
              key="start"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8"
            >
               <div className="h-32 w-32 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto border border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
                  <RefreshCw size={64} className="text-purple-400 animate-spin-slow" />
               </div>
               <div className="space-y-2">
                  <h1 className="text-5xl font-black uppercase italic tracking-tighter">Word Scramble</h1>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Lexical Decoding System</p>
               </div>
               <button 
                 onClick={handleStart}
                 className="h-16 px-12 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest shadow-glow hover:scale-105 transition-all"
               >
                  Sync Database
               </button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div 
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-xl space-y-12"
            >
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <span>Sequence {currentWordIndex + 1}/{WORDS.length}</span>
                  <span className="text-purple-400">Total XP: {score}</span>
               </div>

               <div className="space-y-8 text-center">
                  <div className="relative">
                    <motion.h2 
                      key={scrambled}
                      initial={{ letterSpacing: '1em', opacity: 0 }}
                      animate={{ letterSpacing: '0.3em', opacity: 1 }}
                      className="text-6xl md:text-7xl font-black italic uppercase text-purple-400 drop-shadow-glow"
                    >
                       {scrambled}
                    </motion.h2>
                  </div>

                  <AnimatePresence>
                    {showHint && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-bold uppercase tracking-widest leading-relaxed text-white/50"
                      >
                         Hint: {WORDS[currentWordIndex].hint}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="relative">
                        <input 
                          autoFocus
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          placeholder="Decrypt Word..."
                          className={`w-full h-20 bg-white/5 border-2 rounded-2xl text-center text-2xl font-black italic uppercase tracking-widest outline-none transition-all ${feedback === 'correct' ? 'border-emerald-500 bg-emerald-500/10' : feedback === 'wrong' ? 'border-red-500 bg-red-500/10 shake' : 'border-white/10 focus:border-white/40'}`}
                        />
                        {feedback === 'correct' && <CheckCircle2 className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500" size={24} />}
                     </div>

                     <div className="flex gap-4">
                        <button 
                          type="button"
                          onClick={() => setShowHint(true)}
                          disabled={showHint}
                          className="flex-1 h-14 bg-white/5 border border-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2 disabled:opacity-30"
                        >
                           <HelpCircle size={14} /> Knowledge Inject
                        </button>
                        <button 
                          type="submit"
                          className="flex-[2] h-14 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest shadow-glow hover:scale-[1.02] active:scale-95 transition-all"
                        >
                           Execute Verify
                        </button>
                     </div>
                  </form>
               </div>
            </motion.div>
          )}

          {gameState === 'gameOver' && (
            <motion.div 
              key="gameOver"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-12"
            >
               <div className="space-y-4">
                  <div className="h-24 w-24 bg-emerald-500/20 rounded-[32px] flex items-center justify-center mx-auto border border-emerald-500/40">
                     <Trophy size={48} className="text-emerald-500" />
                  </div>
                  <h2 className="text-5xl font-black uppercase italic tracking-tighter">Database Decrypted</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 text-center">Lexical accuracy synchronized</p>
               </div>

               <div className="grid grid-cols-2 gap-6 cyber-panel p-10">
                  <div className="space-y-1">
                     <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Total Score</p>
                     <p className="text-4xl font-black italic">{score}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[8px] font-black uppercase tracking-widest text-white/30">XP Rewarded</p>
                     <p className="text-4xl font-black italic text-emerald-400">+{score * 2}</p>
                  </div>
               </div>

               <div className="flex justify-center gap-4">
                  <button 
                    onClick={handleStart}
                    className="h-16 px-12 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-all"
                  >
                     Retry Sync
                  </button>
                  <button 
                    onClick={() => onFinish(score)}
                    className="h-16 px-12 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest shadow-glow"
                  >
                     Exit Module
                  </button>
               </div>
            </motion.div>
          )}
       </AnimatePresence>
    </div>
  );
};
