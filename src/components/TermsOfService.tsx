
import React from 'react';
import { motion } from 'framer-motion';
import { Scale, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

export const TermsOfService: React.FC = () => {
  const clauses = [
    {
      id: '01',
      title: 'Identity Verification',
      text: 'Users must provide accurate neural credentials. Impersonation of other intellectual nodes result in immediate platform extraction.'
    },
    {
      id: '02',
      title: 'Knowledge Integrity',
      text: 'Community contributions must adhere to scientific and linguistic accuracy standards. Spreading false data nodes is strictly prohibited.'
    },
    {
      id: '03',
      title: 'Premium Access',
      text: 'Subscription tokens are non-transferable. Manual verification of payments via bKash usually takes 6-12 operational hours.'
    },
    {
      id: '04',
      title: 'AI Utilization',
      text: 'The AI Teacher is a supportive educational module. Users may not use platform resources to train external competitive neural networks.'
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-20 pb-32">
      <div className="space-y-6">
         <div className="flex items-center gap-4 text-amber-500">
            <Scale size={24} />
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Legal Framework</span>
         </div>
         <h2 className="text-6xl font-black italic uppercase tracking-tighter">Usage Terms</h2>
         <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Operational Directive 2026.05</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
         {clauses.map((clause, i) => (
            <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="cyber-panel p-12 flex gap-10 border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors"
            >
               <span className="text-4xl font-black italic text-white/5">{clause.id}</span>
               <div className="space-y-4">
                  <h3 className="text-2xl font-black italic uppercase italic tracking-tighter">{clause.title}</h3>
                  <p className="text-sm font-bold text-white/40 leading-relaxed uppercase tracking-wider">{clause.text}</p>
               </div>
            </motion.div>
         ))}
      </div>

      <div className="text-center py-20 opacity-20">
         <FileText size={48} className="mx-auto" />
         <p className="mt-8 text-[9px] font-black uppercase tracking-[1em]">END OF DIRECTIVE</p>
      </div>
    </div>
  );
};
