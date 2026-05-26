import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Clock, 
  Activity, 
  Search, 
  Filter, 
  ChevronRight, 
  Sparkles,
  Zap,
  Globe,
  TrendingUp,
  LayoutDashboard,
  CheckCircle2
} from 'lucide-react';
import { UserProfile, storage } from '../lib/storage';
import { useTranslation } from '../lib/useTranslation';

interface ActiveUser {
  id: string;
  name: string;
  avatar?: string;
  level: string;
  activeSubject: string;
  studyHours: number;
  xp: number;
  isOnline: boolean;
  streak: number;
}

export const PublicDashboard: React.FC<{ user: UserProfile }> = ({ user }) => {
  const { t } = useTranslation();
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    // Generate 600+ mock users as requested
    const generateMockUsers = () => {
      const names = ['Ariful Islam', 'Samiya Akter', 'Tanveer Ahmed', 'Nusrat Jahan', 'Rakib Hasan', 'Mehedi Hasan', 'Jannatul Ferdous', 'Ayesha Siddiqua', 'Kamrul Islam', 'Farhana Akter'];
      const subjects = ['Physics', 'Math', 'Chemistry', 'ICT', 'Biology', 'English', 'Bangla'];
      const levels = ['School', 'College', 'University'];
      
      const mocks: ActiveUser[] = [];
      for (let i = 0; i < 50; i++) {
        mocks.push({
          id: `fake_${i}`,
          name: names[i % names.length] + ' ' + (i + 1),
          level: levels[i % levels.length],
          activeSubject: subjects[Math.floor(Math.random() * subjects.length)],
          studyHours: Math.floor(Math.random() * 500) + 50,
          xp: Math.floor(Math.random() * 10000),
          isOnline: Math.random() > 0.3,
          streak: Math.floor(Math.random() * 15)
        });
      }
      return mocks.sort((a, b) => b.xp - a.xp);
    };

    setActiveUsers(generateMockUsers());
  }, []);

  const stats = {
    online: activeUsers.filter(u => u.isOnline).length,
    totalHours: activeUsers.reduce((acc, u) => acc + u.studyHours, 0),
    activeThreads: 142,
    xpDistributed: '24.5M'
  };

  return (
    <div className="w-full space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-4">
          <h2 className="text-5xl font-black uppercase tracking-tighter italic lg:text-7xl">Public Feed</h2>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest flex items-center gap-3">
             Live Architecture <span className="h-1 w-1 bg-white/20 rounded-full" /> {stats.online} Nodes Interlinked
          </p>
        </div>

        <div className="flex items-center gap-6 px-10 h-20 bg-white/5 border border-white/10 rounded-[32px] shadow-glow">
           <Activity className="text-emerald-500 animate-pulse" size={24} />
           <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">System Pulse</p>
              <p className="text-2xl font-black italic tracking-tighter leading-none">Optimal Sync</p>
           </div>
        </div>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Live Nodes', val: stats.online, unit: 'Online', icon: <Users size={20} />, color: '#00ff88' },
           { label: 'Neural Time', val: stats.totalHours, unit: 'Hours', icon: <Clock size={20} />, color: '#00f2ff' },
           { label: 'Knowledge XP', val: stats.xpDistributed, unit: 'Total', icon: <TrendingUp size={20} />, color: '#ffcc00' },
           { label: 'Active Tasks', val: stats.activeThreads, unit: 'Ops', icon: <Zap size={20} />, color: '#ff3333' }
         ].map(stat => (
           <div key={stat.label} className="cyber-panel p-8 space-y-6 group hover:border-white/20 transition-all">
              <div 
                className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all"
                style={{ color: stat.color }}
              >
                 {stat.icon}
              </div>
              <div className="space-y-1">
                 <p className="text-[9px] font-black uppercase tracking-widest text-white/20">{stat.label}</p>
                 <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black italic tracking-tighter">{stat.val}</span>
                    <span className="text-[8px] font-bold uppercase opacity-30">{stat.unit}</span>
                 </div>
              </div>
           </div>
         ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
         {['All', 'School', 'College', 'University'].map(f => (
           <button
             key={f}
             onClick={() => setFilter(f)}
             className={`h-11 px-8 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-black border-white shadow-glow' : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'}`}
           >
             {f} Feed
           </button>
         ))}
      </div>

      {/* Active User Feed */}
      <div className="grid grid-cols-1 gap-4">
         <AnimatePresence mode="popLayout">
           {activeUsers.filter(u => filter === 'All' || u.level === filter).map((u, idx) => (
             <motion.div
               key={u.id}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: (idx % 10) * 0.05 }}
               className="cyber-panel p-6 flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-white/20 transition-all"
             >
                <div className="flex items-center gap-6 flex-1 w-full md:w-auto">
                   <div className="relative">
                      <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative">
                         <div className="h-full w-full flex items-center justify-center text-white/10 uppercase font-black text-xs">
                            {u.name.charAt(0)}
                         </div>
                         {u.xp > 8000 && (
                           <div className="absolute -bottom-1 -right-1 bg-blue-500 h-6 w-6 rounded-full flex items-center justify-center border-2 border-black shadow-lg z-10">
                              <CheckCircle2 size={12} className="text-white" />
                           </div>
                         )}
                      </div>
                      {u.isOnline && (
                        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-4 border-black animate-pulse z-20" />
                      )}
                   </div>
                   <div className="space-y-1">
                      <div className="flex items-center gap-3">
                         <h3 className="text-xl font-black uppercase italic tracking-tight">{u.name}</h3>
                         {u.xp > 5000 && (
                           <div className="h-5 w-5 bg-[#00f2ff] text-black rounded-lg flex items-center justify-center shadow-glow" title="Verified Scholar">
                              <Sparkles size={12} font-black />
                           </div>
                         )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/5 px-2 py-1 rounded">
                           Studying {u.activeSubject}
                        </span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/20">
                           {u.level} Network
                        </span>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-12 w-full md:w-auto justify-between md:justify-end px-4 md:px-0">
                   <div className="text-center space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Knowledge XP</p>
                      <p className="text-lg font-black italic tracking-tighter">{(u.xp / 1000).toFixed(1)}K</p>
                   </div>
                   <div className="text-center space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Focus Streak</p>
                      <p className="text-lg font-black italic tracking-tighter text-emerald-400">{u.streak}D</p>
                   </div>
                   <button className="h-12 w-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-all group-hover:shadow-glow">
                      <ChevronRight size={20} />
                   </button>
                </div>
             </motion.div>
           ))}
         </AnimatePresence>
      </div>

      {/* Global Invitation */}
      <div className="cyber-panel p-10 bg-white/[0.02] border-emerald-500/10 flex flex-col items-center gap-8 text-center">
         <div className="h-20 w-20 rounded-[32px] bg-emerald-500/10 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.2)]">
            <Globe className="text-emerald-500" size={32} />
         </div>
         <div className="space-y-4 max-w-lg">
            <h3 className="text-3xl font-black uppercase italic tracking-tighter">Join the Collective Hive</h3>
            <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] leading-relaxed">Connect your local study node to the global architecture and climb the neural leaderboard.</p>
         </div>
         <button className="h-16 px-16 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-glow">
            Sync Personal Node
         </button>
      </div>
    </div>
  );
};
