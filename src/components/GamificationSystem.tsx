import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Flame, 
  Star, 
  Zap, 
  Crown, 
  Target, 
  ShieldCheck,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { storage, UserStats, UserProfile } from '../lib/storage';

export const GamificationSystem: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    loadStats();
  }, [user.id]);

  const loadStats = async () => {
    const data = await storage.getStats(user.id);
    setStats(data);
  };

  if (!stats) return null;

  const xpToNextLevel = stats.level * 1000;
  const progress = ((stats.xp % 1000) / 1000) * 100;

  return (
    <div className="w-full space-y-12">
      {/* Level and XP Header */}
      <div className="flex flex-col md:flex-row items-center gap-12">
         <div className="relative">
            <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
               className="absolute -inset-6 border border-white/5 rounded-full"
            />
            <div className="h-40 w-40 rounded-[48px] bg-white text-black flex flex-col items-center justify-center shadow-glow relative z-10">
               <span className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1 leading-none">Level</span>
               <span className="text-6xl font-black italic tracking-tighter leading-none">{stats.level}</span>
            </div>
            
            <div className="absolute -bottom-2 -right-2 h-16 w-16 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center shadow-2xl z-20">
               <Flame className={`h-8 w-8 ${stats.streak > 0 ? 'text-red-500 animate-pulse' : 'text-white/10'}`} />
            </div>
         </div>

         <div className="flex-1 space-y-8 w-full">
            <div className="flex items-center justify-between">
               <div className="space-y-2">
                  <h3 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Scholar's Journey</h3>
                  <div className="flex items-center gap-6">
                     <p className="text-white/40 text-xs font-bold uppercase tracking-widest flex items-center gap-2"><Zap size={10} /> {stats.xp} Total XP</p>
                     <p className="text-white/40 text-xs font-bold uppercase tracking-widest flex items-center gap-2"><Trophy size={10} /> {stats.streak} Day Streak</p>
                     <p className="text-white/40 text-xs font-bold uppercase tracking-widest flex items-center gap-2"><TrendingUp size={10} /> Rank #1,204</p>
                  </div>
               </div>
               <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                  <Crown size={24} className="text-white/20" />
               </div>
            </div>

            <div className="space-y-4">
               <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-white/40 mb-1 px-1">
                  <span>Level Progress</span>
                  <span>{stats.xp % 1000} / 1000 XP to Level {stats.level + 1}</span>
               </div>
               <div className="h-8 w-full bg-white/5 border border-white/10 rounded-full overflow-hidden p-1.5 shadow-inner">
                  <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${progress}%` }}
                     className="h-full bg-white rounded-full shadow-glow"
                  />
               </div>
            </div>
         </div>
      </div>

      {/* Badges and Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="md:col-span-2 space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Achievements</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
               <BadgeCard 
                  unlocked={stats.totalQuestionsSolved >= 1} 
                  icon={<Target size={24} />} 
                  title="First Step" 
                  desc="Solve your first problem" 
               />
               <BadgeCard 
                  unlocked={stats.streak >= 7} 
                  icon={<Flame size={24} />} 
                  title="7-Day Streak" 
                  desc="Study every day for a week" 
               />
               <BadgeCard 
                  unlocked={stats.level >= 5} 
                  icon={<ShieldCheck size={24} />} 
                  title="Novice Scholar" 
                  desc="Reach Level 5" 
               />
               <BadgeCard 
                  unlocked={stats.xp >= 10000} 
                  icon={<Star size={24} />} 
                  title="XP Hunter" 
                  desc="Collect 10,000 Total XP" 
               />
               <BadgeCard 
                  unlocked={stats.badges.includes('math_master')} 
                  icon={<Zap size={24} />} 
                  title="Math Master" 
                  desc="Perfect quiz accuracy 5 times" 
               />
               <BadgeCard 
                  unlocked={false} 
                  icon={<Crown size={24} />} 
                  title="Grand Architect" 
                  desc="Reach Level 100" 
               />
            </div>
         </div>

         <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Stats Breakdown</h3>
            <div className="cyber-panel p-8 space-y-8">
               <StatItem label="Questions Solved" value={stats.totalQuestionsSolved} />
               <StatItem label="Active Days" value={stats.streak} />
               <StatItem label="Quizzes Taken" value={Math.floor(stats.xp / 500)} />
               <StatItem label="World Ranking" value="#4,201" />
               
               <button className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between px-6 hover:bg-white hover:text-black transition-all group">
                  <span className="text-[9px] font-black uppercase tracking-widest">Leaderboard</span>
                  <ChevronRight size={16} />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

function BadgeCard({ unlocked, icon, title, desc }: any) {
  return (
    <div className={`p-6 rounded-[32px] border flex flex-col items-center text-center space-y-4 group transition-all ${unlocked ? 'bg-white/5 border-white/10 hover:border-white/30' : 'bg-transparent border-white/5 opacity-20 filter grayscale blur-[1px]'}`}>
       <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all ${unlocked ? 'bg-white text-black shadow-glow group-hover:scale-110' : 'bg-white/10 text-white/10'}`}>
          {icon}
       </div>
       <div className="space-y-1">
          <p className="text-[11px] font-black uppercase tracking-tighter">{title}</p>
          <p className="text-[8px] font-bold text-white/30 leading-relaxed uppercase">{desc}</p>
       </div>
    </div>
  );
}

function StatItem({ label, value }: any) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5">
       <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{label}</span>
       <span className="text-xl font-black italic uppercase tracking-tighter">{value}</span>
    </div>
  );
}
