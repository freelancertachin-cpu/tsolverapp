
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Lock, Database, ChevronRight } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  const sections = [
    {
      title: 'Data Collection Node',
      content: 'We collect encrypted neural tokens including your Academic Frequency, study duration, and interaction metrics to optimize your learning path.'
    },
    {
      title: 'Neural Encryption',
      content: 'All personal data is encrypted at the storage level using Firebase security rules and encrypted transport. We never transmit PII (Personally Identifiable Information) to third-party sub-grids.'
    },
    {
      title: 'Cookie Architecture',
      content: 'Local storage is utilized only for session persistence and offline knowledge accessibility. No cross-site architectural tracking is performed.'
    },
    {
      title: 'User Sovereignty',
      content: 'You retain full control over your academic data. You may purge your neural identity and associated records at any time via the profile settings.'
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-20 pb-32">
      <div className="space-y-6">
         <div className="flex items-center gap-4 text-emerald-500">
            <Shield size={24} />
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Secured Protocol</span>
         </div>
         <h2 className="text-6xl font-black italic uppercase tracking-tighter">Privacy Policy</h2>
         <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Last Updated Node: May 2026 • Build v2.6.4</p>
      </div>

      <div className="space-y-12">
         {sections.map((section, i) => (
            <motion.div 
               key={i}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.1 }}
               className="cyber-panel p-10 space-y-6 border-white/5 bg-white/[0.01]"
            >
               <h3 className="text-xl font-black uppercase italic tracking-widest flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" /> {section.title}
               </h3>
               <p className="text-sm font-bold text-white/40 leading-relaxed uppercase tracking-wide">
                  {section.content}
               </p>
            </motion.div>
         ))}
      </div>

      <div className="cyber-panel p-12 text-center space-y-8 bg-emerald-500/[0.02] border-emerald-500/10">
         <p className="text-[11px] font-black uppercase tracking-widest text-emerald-500/60 leading-relaxed underline decoration-emerald-500/20 underline-offset-8">
            Detailed technical whitepaper available upon architectural request.
         </p>
         <div className="flex justify-center gap-12 pt-8">
            <Lock size={32} className="text-white/10" />
            <Eye size={32} className="text-white/10" />
            <Database size={32} className="text-white/10" />
         </div>
      </div>
    </div>
  );
};
