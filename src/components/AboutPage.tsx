import React from 'react';
import { motion } from 'framer-motion';
import { 
  Info, 
  MapPin, 
  Calendar, 
  Mail, 
  Facebook, 
  Instagram, 
  Youtube, 
  ArrowUpRight,
  ChevronRight,
  Sparkles,
  Shield,
  Code
} from 'lucide-react';
import { Logo } from './Logo';

export const AboutPage: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-20 pb-20">
      <div className="flex flex-col items-center text-center space-y-10">
         <motion.div 
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="relative"
         >
            <div className="absolute inset-0 bg-white/40 blur-[80px] rounded-full scale-150 animate-pulse" />
            <Logo size="xl" />
         </motion.div>

         <div className="space-y-4 relative z-10">
            <h2 className="text-6xl font-black uppercase italic tracking-tighter lg:text-8xl">T-Solver</h2>
            <p className="text-[10px] font-black uppercase tracking-[1em] text-white/40">Architected by Tachin Ahmed Rion</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="cyber-panel p-10 space-y-8">
            <div className="flex items-center gap-4">
               <Info className="text-white/40" size={24} />
               <h3 className="text-xs font-black uppercase tracking-widest">Structural Mission</h3>
            </div>
            <p className="text-lg font-bold text-white/80 leading-relaxed uppercase tracking-tight italic">
               T-Solver is a next-generation AI educational ecosystem designed to bridge the gap between traditional learning and neural optimization.
            </p>
            <div className="space-y-4">
               {[
                 'AI Powered Tutoring',
                 'Gamified Knowledge Retention',
                 'Community Intelligence Sharing',
                 'Secure Offline Data Nodes'
               ].map(point => (
                 <div key={point} className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-white/30">
                    <ChevronRight size={14} className="text-white/20" /> {point}
                 </div>
               ))}
            </div>
         </div>

         <div className="grid grid-cols-1 gap-6">
            <div className="cyber-panel p-8 flex items-center justify-between group cursor-pointer hover:border-white/20 transition-all">
               <div className="space-y-1">
                  <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Operational Origin</p>
                  <p className="text-xl font-black italic uppercase tracking-tighter">Dhaka, Bangladesh</p>
               </div>
               <MapPin className="text-white/10 group-hover:text-white transition-colors" size={24} />
            </div>

            <div className="cyber-panel p-8 flex items-center justify-between group cursor-pointer hover:border-white/20 transition-all">
               <div className="space-y-1">
                  <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">System Inception</p>
                  <p className="text-xl font-black italic uppercase tracking-tighter">May 2026</p>
               </div>
               <Calendar className="text-white/10 group-hover:text-white transition-colors" size={24} />
            </div>

            <div className="cyber-panel p-8 flex items-center justify-between group cursor-pointer hover:border-white/20 transition-all">
               <div className="space-y-1">
                  <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Core Architect</p>
                  <p className="text-xl font-black italic uppercase tracking-tighter">Tachin Ahmed Rion</p>
               </div>
               <Code className="text-white/10 group-hover:text-white transition-colors" size={24} />
            </div>
         </div>
      </div>

      {/* Social Nodes */}
      <div className="space-y-10">
         <h3 className="text-[10px] font-black uppercase tracking-[0.8em] text-center text-white/20">Establish Social Links</h3>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'fb', icon: <Facebook size={24} />, label: 'Facebook', link: '#' },
              { id: 'ig', icon: <Instagram size={24} />, label: 'Instagram', link: '#' },
              { id: 'yt', icon: <Youtube size={24} />, label: 'YouTube', link: '#' },
              { id: 'mail', icon: <Mail size={24} />, label: 'Email', link: 'mailto:tsolverofficial@gmail.com' },
            ].map(social => (
              <a 
                key={social.id}
                href={social.link}
                className="cyber-panel p-8 flex flex-col items-center gap-4 group hover:border-white/40 transition-all bg-white/[0.02]"
              >
                 <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                    {social.icon}
                 </div>
                 <span className="text-[9px] font-black uppercase tracking-widest opacity-20 group-hover:opacity-100">{social.label}</span>
              </a>
            ))}
         </div>
      </div>

      <div className="text-center py-20 border-t border-white/5 space-y-6">
         <p className="text-sm font-bold text-white/10 uppercase tracking-[0.5em] italic">Built for the future of Bangladeshi Education.</p>
         <div className="flex items-center justify-center gap-8">
            <span className="text-[8px] font-black uppercase tracking-widest text-white/20 hover:text-white cursor-pointer transition-colors">Privacy Protocol</span>
            <span className="text-[8px] font-black uppercase tracking-widest text-white/20 hover:text-white cursor-pointer transition-colors">Usage Terms</span>
            <span className="text-[8px] font-black uppercase tracking-widest text-white/20 hover:text-white cursor-pointer transition-colors">Security Node</span>
         </div>
      </div>
    </div>
  );
};
