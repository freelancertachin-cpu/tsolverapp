import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, 
  Zap, 
  Target, 
  Brain, 
  ChevronRight, 
  CheckCircle2, 
  X, 
  Timer,
  Trophy,
  Sparkles,
  Lightbulb
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EducationalEngine, QuizQuestion } from '../lib/educationalEngine';

export const PracticeEngine: React.FC<{ subject?: string, mode?: string }> = ({ subject = 'Mathematics', mode = 'Rapid' }) => {
  const [activeQuestion, setActiveQuestion] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Fetch real questions from EducationalEngine
  const [questions] = useState<QuizQuestion[]>(() => {
    const realQuestions = EducationalEngine.generateQuiz(subject, mode === 'Rapid' ? 'multiple-choice' : 'rapid-fire');
    return realQuestions.length > 0 ? realQuestions : [
      {
        id: 'fallback-1',
        type: 'multiple-choice',
        question: "If P ⟹ Q and Q ⟹ R, what can we conclude about P and R?",
        options: ["P ⟹ R", "R ⟹ P", "P ⇔ R", "No conclusion possible"],
        answer: "P ⟹ R",
        explanation: "By the law of Syllogism (transitivity), if P implies Q and Q implies R, then P must imply R."
      }
    ] as QuizQuestion[];
  });

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelectedOption(idx);
    setShowResult(true);
    
    const currentQ = questions[activeQuestion];
    const isCorrect = currentQ.options ? currentQ.options[idx] === currentQ.answer : false;

    if (isCorrect) {
      setScore(prev => prev + 1);
      confetti({
        particleCount: 40,
        spread: 40,
        origin: { y: 0.8 },
        colors: ['#00ff88', '#00f2ff']
      });
    }
  };

  const nextQuestion = () => {
    if (activeQuestion < questions.length - 1) {
      setActiveQuestion(prev => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setIsFinished(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <AnimatePresence mode="wait">
        {!isFinished ? (
          <motion.div 
            key="practice"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            {/* HUD */}
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-6">
                  <div className="h-16 w-16 bg-white/5 border border-white/10 rounded-[28px] flex items-center justify-center">
                     <Target className="text-primary h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">{subject} Mastery</h3>
                    <div className="flex items-center gap-2">
                       <div className="h-1.5 w-48 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${(activeQuestion / questions.length) * 100}%` }}
                          />
                       </div>
                       <span className="text-[10px] font-black uppercase text-white/20">{activeQuestion + 1}/{questions.length} Nodes</span>
                    </div>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                     <Sparkles className="text-yellow-500" size={16} />
                     <span className="text-xl font-black italic">{score * 100}</span>
                  </div>
               </div>
            </div>

            {/* Question UI */}
            <div className="space-y-8">
              <div className="p-12 pb-0">
                 <h2 className="text-4xl font-black leading-tight italic tracking-tight text-white/90">
                    {questions[activeQuestion].question}
                 </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questions[activeQuestion].options?.map((option, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(idx)}
                    disabled={showResult}
                    className={`p-8 text-left rounded-[32px] border transition-all relative overflow-hidden group ${
                      showResult 
                        ? option === questions[activeQuestion].answer 
                          ? 'bg-[#00ff88]/10 border-[#00ff88]/40 text-[#00ff88]'
                          : selectedOption === idx 
                            ? 'bg-red-500/10 border-red-500/40 text-red-500'
                            : 'bg-white/5 border-white/5 opacity-40'
                        : 'bg-white/5 border-white/5 hover:border-primary/40 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-6 relative z-10">
                       <span className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black italic text-lg border transition-all ${
                         showResult && option === questions[activeQuestion].answer 
                           ? 'bg-[#00ff88] text-black border-[#00ff88]' 
                           : 'bg-white/5 border-white/10'
                       }`}>
                         {String.fromCharCode(65 + idx)}
                       </span>
                       <span className="text-xl font-bold">{option}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {showResult && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-12 rounded-[56px] border border-white/10 bg-white/5 space-y-6"
              >
                  <div className="flex items-center gap-3">
                     <Lightbulb className="text-yellow-500" size={24} />
                     <h4 className="text-sm font-black uppercase tracking-widest italic">Neural Explanation</h4>
                  </div>
                  <p className="text-lg font-bold italic leading-relaxed text-white/60">
                    {questions[activeQuestion].explanation}
                  </p>
                  <button 
                    onClick={nextQuestion}
                    className="h-16 px-12 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest mt-4 hover:scale-105 transition-all shadow-glow flex items-center gap-3"
                  >
                     Analyze Next <ChevronRight size={16} />
                  </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="cyber-panel p-20 text-center space-y-10"
          >
             <div className="h-32 w-32 bg-white/5 rounded-[64px] border border-white/10 flex items-center justify-center mx-auto shadow-glow">
                <Trophy size={64} className="text-[#00ff88]" />
             </div>
             <div className="space-y-4">
                <h3 className="text-6xl font-black uppercase italic tracking-tighter">Neural Mastery</h3>
                <p className="text-sm font-bold text-white/40 uppercase tracking-widest">Rapid Practice Module Complete</p>
             </div>
             <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto pt-8">
                <div className="space-y-1">
                   <p className="text-3xl font-black italic">{score}/{questions.length}</p>
                   <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Accuracy</p>
                </div>
                <div className="space-y-1">
                   <p className="text-3xl font-black italic text-[#00ff88]">+{(score / (questions.length || 1)) * 1000} XP</p>
                   <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Growth</p>
                </div>
                <div className="space-y-1">
                   <p className="text-3xl font-black italic">Rank 42</p>
                   <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Global Node</p>
                </div>
             </div>
             <button 
               onClick={() => window.location.reload()}
               className="h-20 px-20 bg-white text-black rounded-[32px] font-black uppercase text-xs tracking-[0.3em] shadow-glow hover:scale-[1.05] transition-all"
             >
                Resync Session
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
