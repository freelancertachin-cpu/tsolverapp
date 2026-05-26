import React from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu, 
  Calculator, 
  LineChart, 
  Camera, 
  FileText, 
  Brain, 
  ShieldCheck, 
  Globe, 
  GraduationCap,
  Database,
  Smartphone,
  CheckCircle2,
  X,
  Facebook,
  Link,
  MapPin,
  Sparkles,
  Gamepad2,
  BarChart3,
  BookOpen,
  MessageSquare,
  Trophy,
  Zap,
  Mic,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Logo } from './Logo';

interface AppDetailsProps {
  onClose: () => void;
  lang: string;
}

export const AppDetails: React.FC<AppDetailsProps> = ({ onClose, lang }) => {
  const features = [
    { icon: <Brain />, title: "AI Neural Teacher", desc: "Advanced step-by-step tutoring engine with localized education modules." },
    { icon: <FileText />, title: "Smart Archive", desc: "AI-enhanced note system with auto-summarization and keyword extraction." },
    { icon: <Camera />, title: "Neural Scan OCR", desc: "Recognizes handwriting (English & Bangla) and diagrams locally via Tesseract." },
    { icon: <Calculator />, title: "Scientific Logic", desc: "High-precision algebraic solver using Math.js for complex equations." },
    { icon: <LineChart />, title: "Dynamic Plotting", desc: "Real-time mathematical visualizations integrated with Plotly.js." },
    { icon: <Gamepad2 />, title: "Logic Playground", desc: "50+ Colorful educational games designed to gamify the learning experience." },
    { icon: <BarChart3 />, title: "Telemetry Hub", desc: "Deep analytics for weak topic detection and progress tracking." },
    { icon: <BookOpen />, title: "Task Sector", desc: "Intelligent assignment manager and generator for subject mastering." },
    { icon: <Trophy />, title: "Gamification Edge", desc: "Daily streaks, XP rewards, and global rank systems similar to Duolingo." },
    { icon: <Zap />, title: "Offline Core", desc: "PWA support ensures 100% functionality without active internet connection." },
    { icon: <Mic />, title: "Voice Tutor", desc: "Acoustic learning paths for pronunciation and linguistic development." },
    { icon: <Database />, title: "Indexed Memory", desc: "Data is anchored to your browser node via high-speed IndexedDB." },
  ];

  const socialLinks = [
    { name: "Vintorex Shop.bd", url: "https://www.facebook.com/share/1EDcvWJVtc/", icon: <Facebook /> },
    { name: "Vintorex Resell", url: "https://www.facebook.com/share/1BR5KJaQM8/", icon: <Facebook /> },
    { name: "Freelancer Tachin", url: "https://www.facebook.com/share/1cYo3ZgQqD/", icon: <Facebook /> },
    { name: "Personal Profile", url: "https://www.facebook.com/share/1AWJjuxJy9/", icon: <Facebook /> },
    { name: "VintoxBd IT Institute", url: "https://www.facebook.com/share/1CNrMcMPYq/", icon: <Facebook /> },
    { name: "Tachin AI", url: "https://tachin-ai-server--tachinahmed.replit.app/", icon: <Link /> },
  ];

  return (
    <div className="space-y-16 pb-32">
      <div className="flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-md py-6 z-10 border-b border-white/5">
        <div className="flex items-center gap-4">
          <Sparkles className="text-white animate-pulse" size={16} />
          <h2 className="text-2xl font-black uppercase tracking-[0.2em] italic">System Blueprints</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-[#00ff88]" />
           <p className="text-[10px] font-black uppercase tracking-widest text-[#00ff88]">v2.5.0-ECOSYSTEM</p>
        </div>
      </div>

      <section className="space-y-8">
        <h3 className="text-[10px] font-black uppercase tracking-[0.8em] text-white/20">Operational Modules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-8 rounded-[40px] bg-white/5 border border-white/5 space-y-6 hover:border-white/20 transition-all group"
            >
              <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-white/40 group-hover:text-white group-hover:bg-white/20 transition-all shadow-glow">
                {React.cloneElement(f.icon as React.ReactElement, { size: 24 })}
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-black uppercase tracking-tight text-white mb-1">{f.title}</h4>
                <p className="text-[10px] text-white/40 font-bold leading-relaxed italic">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="p-12 rounded-[64px] bg-white text-black space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.05] scale-[2]">
          <ShieldCheck size={100} />
        </div>
        <div className="flex items-center gap-3">
          <ShieldCheck size={24} />
          <h4 className="text-lg font-black uppercase tracking-widest italic">Zero-API Mandate</h4>
        </div>
        <p className="text-sm font-bold leading-relaxed italic max-w-2xl">
          T-Solver operates as a sovereign local node. We have completely avoided third-party AI APIs (OpenAI/Gemini) for core logic to ensure your educational telemetry remains private and accessible 100% offline.
        </p>
        <div className="flex flex-wrap gap-3 pt-4">
           {['No Cloud Tracking', 'Offline First Architecture', 'Local Neural Engine', 'IndexedDB Persistence'].map(tag => (
             <span key={tag} className="px-6 py-2 bg-black/5 rounded-full text-[9px] font-black uppercase tracking-widest">{tag}</span>
           ))}
        </div>
      </section>

      <section className="space-y-8">
        <h3 className="text-[10px] font-black uppercase tracking-[0.8em] text-white/20">Neural Connections</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {socialLinks.map((link, i) => (
            <a 
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="cyber-panel p-6 flex items-center justify-between group hover:border-white transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                  {link.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white">{link.name}</span>
              </div>
              <ChevronRight size={16} className="text-white/20 group-hover:translate-x-1 transition-transform" />
            </a>
          ))}
        </div>
      </section>

      <section className="cyber-panel p-10 flex flex-col md:flex-row items-center justify-between gap-8">
         <div className="flex items-center gap-6">
            <div className="h-16 w-16 bg-white/5 rounded-[24px] border border-white/10 flex items-center justify-center">
              <MapPin size={24} className="text-white/40" />
            </div>
            <div>
               <h4 className="text-sm font-black uppercase italic tracking-widest">Base Operations</h4>
               <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Kumail, Islampur, Dhamrai, Dhaka</p>
            </div>
         </div>
         <a 
           href="https://maps.app.goo.gl/5ydxh55iHzWmafMw7" 
           target="_blank"
           className="h-14 px-10 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 group hover:bg-white hover:text-black transition-all"
         >
           <span className="text-[10px] font-black uppercase tracking-widest">Open Visual Map</span>
           <ArrowRight size={16} />
         </a>
      </section>

      <div className="text-center space-y-4 pt-12 border-t border-white/5">
        <Logo size="md" className="opacity-20 mx-auto" />
        <p className="text-[10px] font-black uppercase tracking-[1em] text-white/10">Architected by Tachin Ahmed</p>
      </div>
    </div>
  );
};
