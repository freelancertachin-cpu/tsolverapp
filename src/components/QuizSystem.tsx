import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Timer,
  BookOpen
} from 'lucide-react';
import { storage, QuizAttempt, UserProfile } from '../lib/storage';
import { localEngine } from '../lib/localEngine';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  subject: string;
}

const SAMPLE_QUESTIONS: Question[] = [
  { id: '1', text: "What is 15 * 8?", options: ["100", "120", "110", "130"], correctAnswer: 1, subject: "Mathematics" },
  { id: '2', text: "Solve for x: 2x + 5 = 15", options: ["x=5", "x=10", "x=4", "x=2"], correctAnswer: 0, subject: "Algebra" },
  { id: '3', text: "Which gas do plants absorb from atmosphere?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correctAnswer: 2, subject: "Science" },
  { id: '4', text: "What is the capital of Bangladesh?", options: ["Dhaka", "Chittagong", "Sylhet", "Rajshahi"], correctAnswer: 0, subject: "General Knowledge" },
  { id: '5', text: "Who wrote 'Gitanjali'?", options: ["Kazi Nazrul Islam", "Rabindranath Tagore", "Humayun Ahmed", "Jibananda Das"], correctAnswer: 1, subject: "Literature" },
];

export const QuizSystem: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [startTime, setStartTime] = useState(Date.now());
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  const handleNext = async () => {
    if (selectedOption === null) return;

    const newAnswers = { ...answers, [SAMPLE_QUESTIONS[activeQuestion].id]: selectedOption };
    setAnswers(newAnswers);

    if (activeQuestion < SAMPLE_QUESTIONS.length - 1) {
      setActiveQuestion(activeQuestion + 1);
      setSelectedOption(null);
    } else {
      // Calculate results
      let finalScore = 0;
      const mistakes: string[] = [];
      SAMPLE_QUESTIONS.forEach(q => {
        if (newAnswers[q.id] === q.correctAnswer) {
          finalScore++;
        } else {
          mistakes.push(q.subject);
        }
      });

      const attempt: QuizAttempt = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        subject: "Mixed",
        score: finalScore,
        totalQuestions: SAMPLE_QUESTIONS.length,
        timeSpent: Math.floor((Date.now() - startTime) / 1000),
        mistakes,
        timestamp: Date.now(),
        weakTopics: Array.from(new Set(mistakes)),
        accuracy: (finalScore / SAMPLE_QUESTIONS.length) * 100
      };

      await storage.saveQuizAttempt(attempt);
      await localEngine.awardXP(user.id, finalScore * 100, 'Quiz Completion');
      
      setScore(finalScore);
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="cyber-panel p-10 text-center space-y-8"
      >
        <div className="h-24 w-24 rounded-full bg-white/5 border border-white/10 mx-auto flex items-center justify-center shadow-glow">
          <Trophy className="h-10 w-10 text-white" />
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">Quiz Completed!</h2>
          <p className="text-white/40 text-sm font-bold">You scored {score} out of {SAMPLE_QUESTIONS.length}</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="p-6 rounded-[24px] bg-white/5 border border-white/5 text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Accuracy</p>
            <p className="text-2xl font-black italic">{(score / SAMPLE_QUESTIONS.length * 100).toFixed(0)}%</p>
          </div>
          <div className="p-6 rounded-[24px] bg-white/5 border border-white/5 text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">XP Gained</p>
            <p className="text-2xl font-black italic">+{score * 100}</p>
          </div>
        </div>

        <button 
          onClick={() => window.location.reload()}
          className="h-14 px-12 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-glow"
        >
          Retake Quiz
        </button>
      </motion.div>
    );
  }

  const currentQ = SAMPLE_QUESTIONS[activeQuestion];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
             <BookOpen size={18} className="text-white/60" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Question {activeQuestion + 1} / {SAMPLE_QUESTIONS.length}</span>
            <span className="text-xs font-bold text-white/80">{currentQ.subject}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 text-white/40">
              <Timer size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {Math.floor((Date.now() - startTime) / 1000)}s
              </span>
           </div>
        </div>
      </div>

      <div className="cyber-panel p-8 md:p-12 space-y-12 relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1 bg-white/10 w-full">
           <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((activeQuestion + 1) / SAMPLE_QUESTIONS.length) * 100}%` }}
            className="h-full bg-white shadow-glow" 
           />
        </div>

        <div className="text-2xl md:text-3xl font-bold leading-tight">
          {currentQ.text}
        </div>

        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedOption(idx)}
              className={`w-full p-6 rounded-[24px] text-left text-sm font-bold border transition-all flex items-center justify-between group ${
                selectedOption === idx 
                  ? 'bg-white border-white text-black shadow-glow' 
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/[0.08] hover:border-white/20'
              }`}
            >
              {opt}
              {selectedOption === idx && <CheckCircle2 size={18} />}
            </button>
          ))}
        </div>

        <button 
          onClick={handleNext}
          disabled={selectedOption === null}
          className="h-16 w-full bg-white/5 border border-white/10 text-white rounded-2xl flex items-center justify-center gap-4 font-black uppercase text-xs tracking-[0.2em] hover:bg-white hover:text-black transition-all disabled:opacity-30 shadow-glow"
        >
          {activeQuestion === SAMPLE_QUESTIONS.length - 1 ? 'Finish Quiz' : 'Next Question'}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
