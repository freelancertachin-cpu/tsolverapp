import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, ChevronRight } from 'lucide-react';

interface Era {
  id: string;
  year: string;
  title: string;
  event: string;
  fact: string;
}

const HISTORY_DATA: Era[] = [
  { id: '1', year: '1971', title: 'Independence of Bangladesh', event: 'The Liberation War', fact: 'Bangladesh emerged as an independent nation after a nine-month war.' },
  { id: '2', year: '1952', title: 'Language Movement', event: 'State Language Day', fact: 'Students sacrificed their lives for the right to speak Bangla.' },
  { id: '3', year: '1921', title: 'University of Dhaka', event: 'Foundation', fact: 'DHU was established as a premier educational institute.' },
  { id: '4', year: '1757', title: 'Battle of Plassey', event: 'British Rule Begins', fact: 'The defeat of Nawab Siraj ud-Daulah marked the start of colonial rule.' },
];

export const HistoryTimeTraveler: React.FC<{ onFinish: (score: number) => void }> = ({ onFinish }) => {
  const [currentEra, setCurrentEra] = useState(0);

  const handleNext = () => {
    if (currentEra < HISTORY_DATA.length - 1) {
      setCurrentEra(prev => prev + 1);
    } else {
      onFinish(100);
    }
  };

  return (
    <div className="relative w-full h-[600px] bg-[#2c1e16] rounded-[48px] overflow-hidden border border-white/5 flex flex-col p-12 paper-texture">
      <div className="absolute top-10 left-10 space-y-2 z-10">
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#5e412f]">Codex Archive</p>
         <h2 className="text-4xl font-black italic uppercase tracking-tighter ink-text">Chronicle of Eras</h2>
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10">
         <AnimatePresence mode="wait">
            <motion.div 
             key={HISTORY_DATA[currentEra].id}
             initial={{ opacity: 0, scale: 0.9, rotate: -1 }}
             animate={{ opacity: 1, scale: 1, rotate: 0 }}
             exit={{ opacity: 0, scale: 1.1, rotate: 1 }}
             className="bg-white/10 backdrop-blur-sm p-12 w-full max-w-2xl space-y-12 text-center rounded-[64px] border border-[#2c1e16]/10 relative shadow-2xl"
            >
               {/* Decorative border */}
               <div className="absolute inset-4 border-2 border-dashed border-[#2c1e16]/20 rounded-[48px]" />

               <div className="text-8xl font-black italic text-[#2c1e16]/20 select-none ink-text">{HISTORY_DATA[currentEra].year}</div>
               
               <div className="space-y-6">
                  <h3 className="text-5xl font-black uppercase italic tracking-tighter ink-text leading-tight">{HISTORY_DATA[currentEra].title}</h3>
                  <div className="flex items-center justify-center gap-4">
                     <div className="h-[1px] w-12 bg-[#2c1e16]/20" />
                     <p className="text-[#5e412f] text-[11px] font-black uppercase tracking-[0.6em]">{HISTORY_DATA[currentEra].event}</p>
                     <div className="h-[1px] w-12 bg-[#2c1e16]/20" />
                  </div>
               </div>

               <div className="p-10 border-y border-[#2c1e16]/10 italic">
                  <p className="text-xl font-bold leading-relaxed ink-text opacity-80">
                     "{HISTORY_DATA[currentEra].fact}"
                  </p>
               </div>
            </motion.div>
         </AnimatePresence>
      </div>

      <div className="flex justify-between items-center px-4 relative z-10">
         <div className="flex gap-3">
            {HISTORY_DATA.map((_, i) => (
              <div key={i} className={`h-1.5 w-12 rounded-full transition-all duration-500 ${i === currentEra ? 'bg-[#2c1e16] shadow-xl' : 'bg-[#2c1e16]/10'}`} />
            ))}
         </div>
         <button 
          onClick={handleNext}
          className="h-20 px-16 bg-[#2c1e16] text-[#f4e4bc] font-black uppercase text-xs tracking-widest rounded-[32px] flex items-center gap-4 hover:scale-105 transition-all shadow-2xl active:scale-95"
         >
            {currentEra === HISTORY_DATA.length - 1 ? 'Archive Wisdom' : 'Leap Forward'} <ChevronRight size={20} />
         </button>
      </div>

      {/* Decorative corners */}
      <div className="absolute top-0 left-0 p-10 opacity-10"><History size={40} className="text-[#2c1e16]" /></div>
      <div className="absolute bottom-0 right-0 p-10 opacity-10 rotate-180"><History size={40} className="text-[#2c1e16]" /></div>
    </div>
  );
};
