import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  MessageSquare, 
  Timer, 
  Trophy, 
  TrendingUp,
  Search,
  Plus,
  ChevronRight,
  Shield,
  Clock,
  MoreVertical,
  X,
  Mail,
  Zap
} from 'lucide-react';
import { UserProfile, storage } from '../lib/storage';
import { useTranslation } from '../lib/useTranslation';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  members: string[];
  activeTimers: number;
  totalXP: number;
  level: string;
  joinCode: string;
}

interface Invitation {
  id: string;
  groupId: string;
  groupName: string;
  senderName: string;
  timestamp: number;
}

export const StudyGroups: React.FC<{ user: UserProfile }> = ({ user }) => {
  const { t } = useTranslation();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Form stats
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [searchId, setSearchId] = useState('');

  useEffect(() => {
    // Mock user's groups
    setGroups([
      {
        id: 'g1',
        name: 'The Brain Hive',
        description: 'Targeting Physics & Math A+ in HSC 2026',
        creatorId: user.id,
        members: [user.id, 'user2', 'user3'],
        activeTimers: 2,
        totalXP: 4500,
        level: 'College',
        joinCode: 'BRAIN-2026'
      }
    ]);

    // Mock invitations
    setInvitations([
      {
        id: 'i1',
        groupId: 'g2',
        groupName: 'Quantum Scholars',
        senderName: 'Ariful Islam',
        timestamp: Date.now() - 3600000
      }
    ]);
  }, []);

  const handleCreateGroup = () => {
    if (!groupName) return;
    const newGroup: StudyGroup = {
      id: crypto.randomUUID(),
      name: groupName,
      description: groupDesc,
      creatorId: user.id,
      members: [user.id],
      activeTimers: 0,
      totalXP: 0,
      level: user.level,
      joinCode: (groupName.substring(0, 3) + '-' + Math.floor(Math.random() * 1000)).toUpperCase()
    };
    setGroups([...groups, newGroup]);
    setIsCreating(false);
    setGroupName('');
    setGroupDesc('');
  };

  const handleAcceptInvite = (invite: Invitation) => {
    setInvitations(invitations.filter(i => i.id !== invite.id));
    alert(`Decoupling invitation logic... Synced with ${invite.groupName}`);
  };

  return (
    <div className="w-full space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-4">
          <h2 className="text-5xl font-black uppercase tracking-tighter italic lg:text-7xl">Study Collectives</h2>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest flex items-center gap-3">
             Shared Neural Workspace <span className="h-1 w-1 bg-white/20 rounded-full" /> {groups.length} active group nodes
          </p>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => setIsSearching(true)}
            className="h-14 px-8 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all flex items-center gap-3"
          >
            <Search size={18} className="text-white/40" /> Search Nodes
          </button>
          <button 
            onClick={() => setIsCreating(true)}
            className="h-14 px-8 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-glow flex items-center gap-3"
          >
            <Plus size={18} /> Initialize Hive
          </button>
        </div>
      </div>

      {invitations.length > 0 && (
        <div className="space-y-4">
           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 ml-2">Incoming Sync Requests</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {invitations.map(invite => (
               <motion.div 
                key={invite.id} 
                className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-[32px] flex items-center justify-between group overflow-hidden relative"
               >
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                     <Mail size={48} className="text-emerald-500" />
                  </div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10">
                       <Mail size={20} />
                    </div>
                    <div className="space-y-1">
                       <p className="text-sm font-black uppercase italic tracking-tight">{invite.groupName}</p>
                       <p className="text-[9px] font-bold uppercase opacity-30 tracking-widest">Invited by: {invite.senderName}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 relative z-10">
                     <button onClick={() => handleAcceptInvite(invite)} className="h-10 px-6 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Accept</button>
                     <button onClick={() => setInvitations(invitations.filter(i => i.id !== invite.id))} className="h-10 px-4 bg-white/5 border border-white/10 text-white/40 rounded-xl hover:bg-red-500/20 hover:text-red-500 transition-all"><X size={16} /></button>
                  </div>
               </motion.div>
             ))}
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {groups.map((group, idx) => (
           <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="cyber-panel p-10 group hover:border-white/20 transition-all flex flex-col justify-between h-[480px] relative overflow-hidden"
           >
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity translate-x-1/4 -translate-y-1/4 scale-150 rotate-12">
                 <Users size={120} />
              </div>

              <div className="space-y-8 relative z-10">
                 <div className="flex items-center justify-between">
                    <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 group-hover:bg-white group-hover:text-black transition-all">
                       <Shield size={32} />
                    </div>
                    <div className="space-y-1 text-right">
                       <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Frequency Card</p>
                       <p className="text-sm font-black italic tracking-tight">{group.level}</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h3 className="text-4xl font-black uppercase italic tracking-tighter group-hover:tracking-normal transition-all leading-tight">{group.name}</h3>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest leading-relaxed">{group.description}</p>
                 </div>

                 <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                       {group.members.slice(0, 3).map(m => (
                         <div key={m} className="h-10 w-10 rounded-xl bg-white/10 border-2 border-black flex items-center justify-center text-[10px] font-black uppercase">{m.charAt(0)}</div>
                       ))}
                       {group.members.length > 3 && (
                         <div className="h-10 w-10 rounded-xl bg-white/5 border-2 border-black flex items-center justify-center text-[8px] font-black uppercase">+{group.members.length - 3}</div>
                       )}
                    </div>
                    <button className="h-10 px-4 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">Manage Nodes</button>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4 relative z-10">
                 <div className="p-6 rounded-[24px] bg-white/[0.03] border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-500">
                       <Zap size={14} className="animate-pulse" />
                       <span className="text-[9px] font-black uppercase tracking-widest">Active Timers</span>
                    </div>
                    <p className="text-2xl font-black italic tracking-tighter">{group.activeTimers} Sessions</p>
                 </div>
                 <div className="p-6 rounded-[24px] bg-white/[0.03] border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-amber-500">
                       <Trophy size={14} />
                       <span className="text-[9px] font-black uppercase tracking-widest">Collective XP</span>
                    </div>
                    <p className="text-2xl font-black italic tracking-tighter">{group.totalXP / 1000}K Accumulation</p>
                 </div>
              </div>

              <button className="w-full h-14 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl flex items-center justify-center gap-3 shadow-glow group-hover:scale-[1.02] active:scale-95 transition-all mt-8 relative z-10">
                 Enter Shared Workspace <ChevronRight size={18} />
              </button>
           </motion.div>
         ))}

         {/* Create Placeholder */}
         <div 
          onClick={() => setIsCreating(true)}
          className="cyber-panel p-10 flex flex-col items-center justify-center gap-6 border-dashed opacity-40 hover:opacity-100 transition-all cursor-pointer group"
         >
            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
               <Plus size={32} />
            </div>
            <div className="text-center space-y-2">
               <h4 className="text-2xl font-black uppercase italic tracking-tighter">Initialize New Hive</h4>
               <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Connect your study circles</p>
            </div>
         </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-3xl">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="w-full max-w-lg bg-secondary border border-border rounded-[56px] p-10 md:p-14 space-y-12 relative shadow-2xl"
             >
                <div className="space-y-2">
                   <h3 className="text-4xl font-black uppercase italic tracking-tighter">Collective Initializer</h3>
                   <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">Specify Hive Parameters</p>
                </div>

                <div className="space-y-6">
                   <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 ml-2">Hive Designation</Label>
                      <Input 
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="e.g. THE BRAIN HIVE" 
                        className="h-16 bg-white/5 border-white/10 rounded-2xl pl-8 text-lg font-black tracking-tight"
                      />
                   </div>
                   <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 ml-2">Objective Protocol</Label>
                      <textarea 
                        value={groupDesc}
                        onChange={(e) => setGroupDesc(e.target.value)}
                        placeholder="Describe your collective's goal..." 
                        className="w-full h-32 bg-white/5 border-white/10 rounded-2xl p-6 outline-none text-xs font-bold text-white focus:border-white/30 transition-all resize-none mt-2"
                      />
                   </div>
                </div>

                <div className="flex flex-col gap-3">
                   <button 
                    onClick={handleCreateGroup}
                    disabled={!groupName}
                    className="h-16 w-full bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest shadow-glow hover:scale-105 active:scale-95 transition-all disabled:opacity-20"
                   >
                     Initialize Node
                   </button>
                   <button onClick={() => setIsCreating(false)} className="h-14 w-full bg-white/5 border border-white/10 text-white/20 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-white transition-all">Abort Process</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
