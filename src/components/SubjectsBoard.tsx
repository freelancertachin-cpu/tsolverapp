import React from 'react';
import { motion } from 'framer-motion';
import { 
  Book, 
  Microscope, 
  Pi, 
  Atom, 
  Database, 
  Globe2, 
  Languages, 
  Briefcase, 
  TrendingUp,
  Cpu,
  ChevronRight
} from 'lucide-react';
import { UserProfile } from '../lib/storage';

interface Subject {
  id: string;
  name: string;
  icon: React.ReactNode;
  topics: string[];
  levels: ('School' | 'College' | 'University')[];
}

const SUBJECT_LIST: Subject[] = [
  { id: 'math', name: 'Mathematics', icon: <Pi />, topics: ['Algebra', 'Geometry', 'Calculus'], levels: ['School', 'College', 'University'] },
  { id: 'physics', name: 'Physics', icon: <Atom />, topics: ['Mechanics', 'Light', 'Electricity'], levels: ['School', 'College', 'University'] },
  { id: 'chemistry', name: 'Chemistry', icon: <Microscope />, topics: ['Organic', 'Inorganic', 'Reaction'], levels: ['School', 'College', 'University'] },
  { id: 'biology', name: 'Biology', icon: <Book />, topics: ['Genetics', 'Human Body', 'Ecology'], levels: ['School', 'College', 'University'] },
  { id: 'ict', name: 'ICT', icon: <Cpu />, topics: ['Programming', 'Networking', 'Database'], levels: ['School', 'College', 'University'] },
  { id: 'english', name: 'English', icon: <Languages />, topics: ['Grammar', 'Literature', 'Writing'], levels: ['School', 'College', 'University'] },
  { id: 'accounting', name: 'Accounting', icon: <Briefcase />, topics: ['Journal', 'Ledger', 'Audit'], levels: ['College', 'University'] },
  { id: 'economics', name: 'Economics', icon: <TrendingUp />, topics: ['Micro', 'Macro', 'Policy'], levels: ['College', 'University'] },
  { id: 'bangla', name: 'Bangla', icon: <Globe2 />, topics: ['Grammar', 'Prose', 'Poetry'], levels: ['School', 'College'] },
];

export const SubjectsBoard: React.FC<{ user: UserProfile, onExploreHub: (id: string) => void }> = ({ user, onExploreHub }) => {
  const filteredSubjects = SUBJECT_LIST.filter(s => s.levels.includes(user.level as any));

  return (
    <div className="w-full space-y-12 pb-20">
      <div className="space-y-4">
        <h2 className="text-5xl font-black uppercase tracking-tighter italic">Subjects</h2>
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          Dashboard <ChevronRight size={10} /> {user.level} Level Curriculum
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((subject, idx) => (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="cyber-panel p-8 group hover:border-white/20 transition-all cursor-pointer relative overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity translate-x-1/2 -translate-y-1/2 scale-150">
               {subject.icon}
            </div>

            <div className="space-y-8 relative z-10">
               <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all group-hover:shadow-glow">
                  {React.cloneElement(subject.icon as React.ReactElement, { size: 24 })}
               </div>
               
               <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter">{subject.name}</h3>
                  <div className="flex flex-wrap gap-2">
                     {subject.topics.map(t => (
                        <span key={t} className="text-[9px] font-black uppercase tracking-widest text-white/30 bg-white/5 px-2 py-0.5 rounded">
                           {t}
                        </span>
                     ))}
                  </div>
               </div>

               <button 
                  onClick={() => onExploreHub(subject.id)}
                  className="w-full h-12 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between px-6 hover:bg-white/10 transition-all text-[9px] font-black uppercase tracking-widest"
               >
                  Explore Hub <ChevronRight size={14} className="text-white/20" />
               </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Level Specific Tip */}
      <div className="cyber-panel p-8 bg-white/[0.01] border-white/5">
         <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center md:text-left">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Curriculum Insight</h4>
               <p className="text-sm font-bold text-white/60 leading-relaxed uppercase">
                  Showing {filteredSubjects.length} subjects optimized for 
                  <span className="text-white mx-2 italic">{user.level}</span> level students.
               </p>
            </div>
            <button className="h-12 px-10 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-glow whitespace-nowrap">
               Request New Subject
            </button>
         </div>
      </div>
    </div>
  );
};
