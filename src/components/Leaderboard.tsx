import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Search, 
  Filter,
  TrendingUp,
  Clock,
  Zap,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { UserProfile } from '../lib/storage';

interface RankingUser {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  streak: number;
  studyHours: number;
  isPremium: boolean;
  rank: number;
}

// Generate 600+ mock users with Bangladeshi names
const generateMockUsers = (): RankingUser[] => {
  const banglaSurnames = ['Ahmed', 'Hossain', 'Islam', 'Rahman', 'Khan', 'Miah', 'Chowdhury', 'Uddin', 'Sarker', 'Ali', 'Akter', 'Begum'];
  const banglaFirstNames = ['Tachin', 'Fahad', 'Siam', 'Nabil', 'Afridi', 'Sakib', 'Tamim', 'Mushfiq', 'Rakib', 'Anis', 'Sumon', 'Ariful', 'Sadia', 'Nusrat', 'Mim', 'Jannat', 'Farzana'];
  
  const users: RankingUser[] = [];
  for (let i = 1; i <= 650; i++) {
    const firstName = banglaFirstNames[Math.floor(Math.random() * banglaFirstNames.length)];
    const surname = banglaSurnames[Math.floor(Math.random() * banglaSurnames.length)];
    users.push({
      id: `user-${i}`,
      name: `${firstName} ${surname}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
      xp: Math.floor(Math.random() * 50000) + 1000,
      streak: Math.floor(Math.random() * 60) + 1,
      studyHours: Math.floor(Math.random() * 500) + 10,
      isPremium: Math.random() > 0.8, // 20% premium
      rank: 0
    });
  }

  // Sort by XP and assign rank
  return users.sort((a, b) => b.xp - a.xp).map((u, idx) => ({ ...u, rank: idx + 1 }));
};

const ALL_USERS = generateMockUsers();

export const Leaderboard: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [filter, setFilter] = useState<'xp' | 'streak' | 'hours'>('xp');
  const [search, setSearch] = useState('');
  const [displayUsers, setDisplayUsers] = useState<RankingUser[]>([]);

  useEffect(() => {
    let filtered = [...ALL_USERS];
    
    if (search) {
      filtered = filtered.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));
    }

    if (filter === 'streak') filtered.sort((a, b) => b.streak - a.streak);
    if (filter === 'hours') filtered.sort((a, b) => b.studyHours - a.studyHours);
    if (filter === 'xp') filtered.sort((a, b) => b.xp - a.xp);

    setDisplayUsers(filtered.slice(0, 100)); // Show top 100 for performance
  }, [filter, search]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: 'Weekly Peak', val: '4,289 XP', icon: <TrendingUp size={24} />, color: '#00f2ff' },
           { label: 'Global Hours', val: '12,904 H', icon: <Clock size={24} />, color: '#ffd700' },
           { label: 'Total Scholars', val: '650+', icon: <Zap size={24} />, color: '#ff3333' }
         ].map((stat, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             className="cyber-panel p-10 flex flex-col items-center text-center space-y-4"
           >
              <div className="h-16 w-16 rounded-[24px] bg-white/5 border border-white/5 flex items-center justify-center" style={{ color: stat.color }}>
                 {stat.icon}
              </div>
              <div className="space-y-1">
                 <p className="text-3xl font-black italic tracking-tighter uppercase">{stat.val}</p>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">{stat.label}</p>
              </div>
           </motion.div>
         ))}
      </div>

      {/* Top 3 Podium */}
      <div className="flex flex-col md:flex-row items-end justify-center gap-6 py-12">
         {/* Rank 2 */}
         <PodiumItem user={ALL_USERS[1]} rank={2} height="h-48" />
         {/* Rank 1 */}
         <PodiumItem user={ALL_USERS[0]} rank={1} height="h-64" isMain />
         {/* Rank 3 */}
         <PodiumItem user={ALL_USERS[2]} rank={3} height="h-40" />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-6 items-center">
         <div className="flex-1 w-full relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Global Database..."
              className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 outline-none focus:border-white/40 transition-all font-bold uppercase text-xs tracking-widest placeholder:text-white/10"
            />
         </div>
         <div className="flex gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl overflow-x-auto no-scrollbar max-w-full">
            {(['xp', 'streak', 'hours'] as const).map(f => (
               <button 
                 key={f}
                 onClick={() => setFilter(f)}
                 className={`h-12 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${filter === f ? 'bg-white text-black' : 'text-white/30 hover:bg-white/5'}`}
               >
                 {f}
               </button>
            ))}
         </div>
      </div>

      {/* Leaderboard List */}
      <div className="cyber-panel overflow-hidden">
         <div className="grid grid-cols-1 divide-y divide-white/5">
            {displayUsers.map((u, i) => (
               <motion.div 
                 key={u.id}
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="p-6 flex items-center justify-between group hover:bg-white/[0.02] transition-all"
               >
                  <div className="flex items-center gap-8">
                     <span className="w-8 text-xl font-black italic tracking-tighter text-white/20">#{u.rank}</span>
                     <div className="flex items-center gap-5">
                        <div className="relative">
                          <img src={u.avatar} className="h-14 w-14 rounded-2xl object-cover border border-white/10" alt={u.name} />
                          {u.isPremium && (
                            <div className="absolute -top-2 -right-2 bg-blue-500 h-6 w-6 rounded-full flex items-center justify-center border-2 border-black shadow-lg">
                               <CheckCircle2 size={12} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                           <div className="flex items-center gap-2">
                             <h4 className="text-base font-black italic uppercase tracking-tight">{u.name}</h4>
                              {u.rank <= 10 && <Crown size={14} className="text-yellow-500 italic" />}
                           </div>
                           <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Global Scholar Node</p>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-12">
                     <div className="text-right flex flex-col items-end">
                        <span className="text-xl font-black italic tracking-tighter text-white/80">
                           {filter === 'xp' && `${(u.xp / 1000).toFixed(1)}K XP`}
                           {filter === 'streak' && `${u.streak} Days`}
                           {filter === 'hours' && `${u.studyHours}H`}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                           <div className="h-1 w-20 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-white/20" 
                                style={{ width: `${(u.xp / 51000) * 100}%` }}
                              />
                           </div>
                        </div>
                     </div>
                     <button className="h-10 w-10 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center text-white/20 group-hover:text-white group-hover:bg-white group-hover:text-black transition-all">
                        <ChevronRight size={18} />
                     </button>
                  </div>
               </motion.div>
            ))}
         </div>
         {displayUsers.length === 0 && (
           <div className="p-20 text-center space-y-4 opacity-20">
              <Search size={48} className="mx-auto" />
              <p className="text-xs font-black uppercase tracking-[0.4em]">No Entities Found</p>
           </div>
         )}
         <div className="p-10 border-t border-white/5 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white/10">Viewing Top 100 of 650+ Active Scholars</p>
         </div>
      </div>
    </div>
  );
};

function PodiumItem({ user, rank, height, isMain = false }: { user: RankingUser, rank: number, height: string, isMain?: boolean }) {
  const colors = [null, 'text-yellow-500', 'text-slate-300', 'text-amber-600'];
  return (
    <div className={`flex flex-col items-center gap-6 ${isMain ? 'order-2' : rank === 2 ? 'order-1' : 'order-3'}`}>
        <div className="relative">
           <motion.div 
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
             className={`h-24 w-24 rounded-[32px] border-4 overflow-hidden shadow-2xl relative ${isMain ? 'border-yellow-500/50 scale-125' : 'border-white/10'}`}
           >
              <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
           </motion.div>
           {user.isPremium && (
              <div className={`absolute -top-2 -right-2 bg-blue-500 rounded-full flex items-center justify-center border-2 border-black shadow-lg z-20 ${isMain ? 'h-8 w-8 scale-125 translate-x-2' : 'h-6 w-6'}`}>
                 <CheckCircle2 size={isMain ? 14 : 10} className="text-white" />
              </div>
           )}
           <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-black border-2 flex items-center justify-center font-black italic text-xl shadow-lg ${isMain ? 'border-yellow-500 text-yellow-500' : 'border-white/20 text-white/40'}`}>
              {rank}
           </div>
        </div>
       <div className="text-center space-y-1">
          <h4 className={`text-sm font-black uppercase tracking-tight italic ${isMain ? 'text-lg' : ''}`}>{user.name}</h4>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{(user.xp / 1000).toFixed(1)}K XP</p>
       </div>
       <div className={`w-32 bg-white/5 border border-white/10 rounded-t-[32px] overflow-hidden relative ${height} ${isMain ? 'bg-white/10' : ''}`}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className={`absolute inset-0 flex items-center justify-center opacity-10 ${colors[rank]}`}>
             {rank === 1 ? <Crown size={48} /> : <Medal size={48} />}
          </div>
       </div>
    </div>
  );
}
