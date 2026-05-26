import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator as CalcIcon, 
  BookOpen, 
  LineChart, 
  Sparkles, 
  GraduationCap,
  Scale,
  Globe2,
  Wallet,
  Mic2
} from 'lucide-react';
import { UserProfile } from '../lib/storage';
import { useTranslation } from '../lib/useTranslation';

// Tab Components
import { Calculator } from './Calculator';
import { AlgebraSolver } from './AlgebraSolver';
import { FormulaFinder } from './FormulaFinder';
import { GraphPlotter } from './GraphPlotter';
import { SmartEducation } from './SmartEducation';

export const Dashboard: React.FC<{ 
  user: UserProfile, 
  setActiveTab?: (tab: string) => void,
  onExploreHub?: (subject: string | null) => void 
}> = ({ user, setActiveTab, onExploreHub }) => {
  const [activeSubTab, setActiveSubTab] = useState('basic');
  const { t } = useTranslation();

  const [globalSettings, setGlobalSettings] = useState({
    enableGames: true,
    enableCommunity: true,
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('tsolver_global_settings');
    if (savedSettings) {
      try {
        setGlobalSettings(JSON.parse(savedSettings));
      } catch (e) {}
    }
  }, []);

  const getGreetingMessage = () => {
    return `${t.welcome}, ${user.name}. ${t.desc.substring(0, 50)}...`;
  };

  const getEducationLevelLabel = (level: string) => {
    switch(level) {
      case 'School': return t.school;
      case 'College': return t.college;
      case 'University': return t.university;
      default: return level;
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Top Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-secondary border border-border rounded-full px-8 py-3 flex items-center justify-between gap-3 mb-10 overflow-hidden relative group shadow-2xl"
      >
        <Sparkles className="h-3 w-3 text-foreground/40" />
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/50 text-center flex-1">
          {t.greeting.toUpperCase()}
        </span>
        <Sparkles className="h-3 w-3 text-foreground/40" />
      </motion.div>

      {/* Main Branding */}
      <div className="text-center space-y-4 mb-16 px-4">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="space-y-2 relative"
        >
          <h1 className="text-7xl font-black tracking-[-0.08em] uppercase italic text-foreground">T-Solver</h1>
          <div className="flex items-center justify-center gap-2">
            <span className="h-1.5 w-1.5 bg-foreground rounded-full animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-foreground/30">
              {getEducationLevelLabel(user.level)} {t.levelSuffix}
            </span>
            <span className="h-1.5 w-1.5 bg-foreground rounded-full animate-pulse" />
          </div>
        </motion.div>
        <p className="max-w-md mx-auto text-foreground/40 text-sm font-bold leading-relaxed">
          {getGreetingMessage()}
        </p>
      </div>

      {/* Tab Navigation Hub */}
      <div className="w-full max-w-4xl bg-muted border border-border p-1.5 rounded-[32px] flex items-center gap-1 mb-12 overflow-x-auto no-scrollbar shadow-2xl">
        <DashboardTab 
          active={activeSubTab === 'basic'} 
          onClick={() => setActiveSubTab('basic')} 
          icon={<CalcIcon size={16} />} 
          label={t.calc} 
        />
        <DashboardTab 
          active={activeSubTab === 'algebra'} 
          onClick={() => setActiveSubTab('algebra')} 
          icon={<Scale size={16} />} 
          label={t.smartNotes.toUpperCase()} 
        />
        <DashboardTab 
          active={activeSubTab === 'formula'} 
          onClick={() => setActiveSubTab('formula')} 
          icon={<BookOpen size={16} />} 
          label={t.formula} 
        />
        <DashboardTab 
          active={activeSubTab === 'graph'} 
          onClick={() => setActiveSubTab('graph')} 
          icon={<LineChart size={16} />} 
          label={t.graph} 
        />
        <DashboardTab 
          active={activeSubTab === 'student'} 
          onClick={() => setActiveSubTab('student')} 
          icon={<GraduationCap size={16} />} 
          label={t.explore} 
        />
      </div>

      {/* Tab Content Rendering */}
      <div className="w-full mb-20">
        <AnimatePresence mode="wait">
          {activeSubTab === 'basic' && <Calculator key="basic" />}
          {activeSubTab === 'algebra' && <AlgebraSolver key="algebra" />}
          {activeSubTab === 'formula' && <FormulaFinder key="formula" />}
          {activeSubTab === 'graph' && <GraphPlotter key="graph" user={user} />}
          {activeSubTab === 'student' && <SmartEducation key="student" user={user} />}
        </AnimatePresence>
      </div>

      {/* Quick Action Hub */}
      <div className="w-full max-w-5xl space-y-10 px-4">
         <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20">Neural Hub Access</h3>
            <span className="h-px flex-1 mx-8 bg-foreground/5 hidden md:block" />
            <Sparkles className="text-foreground/20" size={16} />
         </div>

         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'ai-voice', label: 'AI Voice', icon: <Mic2 size={24} />, color: '#a855f7' },
              { id: 'affiliate', label: 'Wallet', icon: <Wallet size={24} />, color: '#00ff88' },
              ...(globalSettings.enableGames ? [{ id: 'games', label: t.games, icon: <Sparkles size={24} />, color: '#00f2ff' }] : []),
              ...(globalSettings.enableCommunity ? [
                { id: 'doubts', label: t.doubts, icon: <BookOpen size={24} />, color: '#ffd700' },
                { id: 'feed', label: 'Feeds', icon: <Globe2 size={24} />, color: '#00ff88' },
                { id: 'groups', label: 'Groups', icon: <GraduationCap size={24} />, color: '#ff3333' }
              ] : [])
            ].map(card => (
              <button 
                key={card.id}
                onClick={() => setActiveTab && setActiveTab(card.id)}
                className="cyber-panel p-8 flex flex-col items-center gap-6 group hover:border-foreground/30 transition-all hover:-translate-y-2"
              >
                 <div 
                   className="h-16 w-16 rounded-[24px] bg-foreground/5 border border-foreground/5 flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-all"
                   style={{ color: card.color as any }} 
                 >
                    {card.icon}
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 group-hover:text-foreground transition-all">{card.label}</span>
              </button>
            ))}
         </div>
      </div>
    </div>
  );
};

function DashboardTab({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-4 py-3 px-6 rounded-2xl transition-all whitespace-nowrap group ${
        active 
          ? 'bg-background border border-border shadow-glow' 
          : 'text-foreground/20 hover:text-foreground/40'
      }`}
    >
      <div className={`p-2 rounded-xl border transition-all ${active ? 'bg-foreground border-foreground text-background' : 'border-foreground/10 group-hover:border-foreground/20'}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-black uppercase tracking-[0.15em] transition-all hidden md:inline ${active ? 'text-foreground' : 'text-foreground/20 group-hover:text-foreground/40'}`}>{label}</span>
    </button>
  );
}


