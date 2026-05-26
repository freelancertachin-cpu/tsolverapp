import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Lightbulb, 
  Target, 
  ChevronRight, 
  BookOpen, 
  Zap,
  BarChart,
  Brain,
  Camera,
  Search,
  CheckCircle2,
  Loader2,
  FileText
} from 'lucide-react';
import { storage, UserProfile } from '../lib/storage';
import { localEngine } from '../lib/localEngine';
import Tesseract from 'tesseract.js';

interface Recommendation {
  id: string;
  title: string;
  subject: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Expert';
  description: string;
  tags: string[];
}

const MASTER_ASSIGNMENTS: Recommendation[] = [
  { id: '1', title: "Basic Equations", subject: "Algebra", difficulty: "Beginner", description: "Practice solving single variable linear equations.", tags: ["Math", "Basics"] },
  { id: '2', title: "Geometry Basics", subject: "Geometry", difficulty: "Beginner", description: "Learn about angles and triangles.", tags: ["Shapes", "Angles"] },
  { id: '3', title: "Advanced Calculus", subject: "Mathematics", difficulty: "Expert", description: "High-level integration and differentiation.", tags: ["Math", "University"] },
  { id: '4', title: "Physics: Motion", subject: "Science", difficulty: "Intermediate", description: "Understanding velocity and acceleration.", tags: ["Physics", "Science"] },
  { id: '5', title: "English Grammar", subject: "English", difficulty: "Intermediate", description: "Review sentence structures and tense usage.", tags: ["Language", "Grammar"] },
];

export const AssignmentRecommender: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    generateRecommendations();
  }, [user.id]);

  const generateRecommendations = async () => {
    setLoading(true);
    const analytics = await localEngine.analyzeQuizPerformance(user.id);
    
    let matched: Recommendation[] = [];
    if (analytics && analytics.weakSubjects.length > 0) {
      matched = MASTER_ASSIGNMENTS.filter(m => 
        analytics.weakSubjects.some(ws => m.subject.includes(ws) || m.tags.some(t => t.includes(ws)))
      );
    }

    if (matched.length === 0) {
      matched = MASTER_ASSIGNMENTS.slice(0, 3);
    }

    setTimeout(() => {
      setRecommendations(matched);
      setLoading(false);
    }, 800);
  };

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;
     setOcrLoading(true);
     try {
        const { data: { text } } = await Tesseract.recognize(file, 'eng+ben');
        setOcrResult(text);
     } catch (err) {
        console.error(err);
     } finally {
        setOcrLoading(false);
     }
  };

  return (
    <div className="w-full space-y-12 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-4">
          <h2 className="text-5xl font-black uppercase tracking-tighter italic">Assignment</h2>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest flex items-center gap-3">
             Solve & Manage <span className="h-1 w-1 bg-white/20 rounded-full" /> Gemini AI Intelligence
          </p>
        </div>

        <div className="flex items-center gap-3">
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="h-14 px-8 bg-white text-black rounded-2xl flex items-center gap-3 font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-glow"
           >
             {ocrLoading ? <Loader2 className="animate-spin" /> : <Camera size={18} />} Scan Assignment
           </button>
           <input type="file" ref={fileInputRef} onChange={handleScan} className="hidden" accept="image/*" />
        </div>
      </div>

      <AnimatePresence>
         {ocrResult && (
           <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="cyber-panel p-8 space-y-6 relative"
           >
              <button onClick={() => setOcrResult('')} className="absolute top-6 right-6 text-white/20 hover:text-white">Close</button>
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Extracted Text</h3>
              <div className="p-6 bg-white/5 rounded-2xl text-sm font-bold leading-loose">
                 {ocrResult}
              </div>
              <button className="h-12 px-8 bg-white/10 border border-white/10 text-white rounded-xl font-black uppercase text-[9px] tracking-widest">
                 Ask Assistant to Solve
              </button>
           </motion.div>
         )}
      </AnimatePresence>

      <div className="space-y-8">
         <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Personalized Tasks</h3>
            <button 
               onClick={generateRecommendations}
               className="text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all flex items-center gap-2"
            >
               <Sparkles size={12} /> Refresh
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-[280px] cyber-panel animate-pulse bg-white/5" />
              ))
            ) : (
              recommendations.map((r, idx) => (
                <motion.div 
                  key={r.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="cyber-panel p-8 flex flex-col justify-between group hover:border-white/20 transition-all cursor-pointer"
                >
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${r.difficulty === 'Expert' ? 'bg-white text-black' : 'bg-white/5 text-white/40 border border-white/5'}`}>
                            {r.difficulty}
                         </div>
                         <BookOpen size={16} className="text-white/20" />
                      </div>
                      
                      <div className="space-y-3">
                         <h3 className="text-xl font-black uppercase italic tracking-tighter leading-tight">{r.title}</h3>
                         <p className="text-white/40 text-[10px] font-bold leading-relaxed uppercase pr-4">{r.description}</p>
                      </div>
                   </div>

                   <div className="pt-8 space-y-6">
                      <div className="flex flex-wrap gap-2">
                         {r.tags.map(t => (
                           <span key={t} className="text-[8px] font-black uppercase tracking-widest text-white/20">#{t}</span>
                         ))}
                      </div>
                      <button className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between px-6 hover:bg-white hover:text-black transition-all group/btn">
                         <span className="text-[9px] font-black uppercase tracking-widest">Start Task</span>
                         <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                   </div>
                </motion.div>
              ))
            )}
         </div>
      </div>

      <div className="cyber-panel p-8 bg-white/[0.01]">
         <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
               <Brain size={32} className="text-white/40" />
            </div>
            <div className="space-y-2 flex-1">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Smart Recommendation Loop</h4>
               <p className="text-xs font-bold text-white/60 leading-relaxed italic uppercase">
                  "Tasks are generated based on your Quiz Analytics. Solve these to increase your journey level."
               </p>
            </div>
            <button className="h-12 px-8 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
               View All Tasks
            </button>
         </div>
      </div>
    </div>
  );
};
