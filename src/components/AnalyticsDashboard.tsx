import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Clock, 
  Zap, 
  Award, 
  Brain,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { storage } from '../lib/storage';

export const AnalyticsDashboard: React.FC<{ subject?: string }> = ({ subject = 'Global' }) => {
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalTime: 0, accuracy: 92, speed: 42 });

  useEffect(() => {
    const loadData = async () => {
      const user = await storage.getCurrentUser();
      if (!user) return;

      const sessions = await storage.getStudySessions(user.id);
      
      // Process sessions for chart
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return { name: days[d.getDay()], score: 0, xp: 0, fullDate: d.toLocaleDateString() };
      });

      let totalMinutes = 0;
      sessions.forEach(s => {
        const sDate = new Date(s.timestamp).toLocaleDateString();
        const dayMatch = last7Days.find(d => d.fullDate === sDate);
        if (dayMatch) {
          dayMatch.score += Math.floor(s.duration / 60);
          dayMatch.xp += Math.floor(s.duration / 6) ; // XP
        }
        totalMinutes += (s.duration / 60);
      });

      setData(last7Days);
      setStats(prev => ({ ...prev, totalTime: Math.round(totalMinutes / 6 * 10) / 100 }));
    };
    loadData();
  }, [subject]);

  const chartData = data.length > 0 ? data : [
    { name: 'Mon', score: 0 }, { name: 'Tue', score: 0 }, { name: 'Wed', score: 0 },
    { name: 'Thu', score: 0 }, { name: 'Fri', score: 0 }, { name: 'Sat', score: 0 }, { name: 'Sun', score: 0 }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
         <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                  <BarChart3 size={20} className="text-[#00f2ff]" />
               </div>
               <h2 className="text-4xl font-black italic uppercase tracking-tighter">Telemetry Hub</h2>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Learning Analytics • {subject} Node</p>
         </div>
         <div className="flex gap-4">
            <select className="h-12 px-6 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white outline-none">
               <option>Last 7 Days</option>
               <option>Last 30 Days</option>
               <option>All Time</option>
            </select>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 cyber-panel p-10 space-y-10">
            <div className="flex items-center justify-between">
               <div className="space-y-1">
                  <h3 className="text-xl font-black uppercase italic tracking-tight">Intelligence Growth</h3>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Mastery level vs XP Gain</p>
               </div>
               <TrendingUp className="text-[#00ff88]" size={20} />
            </div>
            <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                     <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                     <XAxis 
                        dataKey="name" 
                        stroke="#ffffff20" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fontWeight: 900 }}
                     />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff10', borderRadius: '16px' }}
                        itemStyle={{ fontSize: '10px', fontWeight: 900 }}
                     />
                     <Area type="monotone" dataKey="score" stroke="#00f2ff" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="space-y-8">
            <div className="cyber-panel p-8 space-y-6">
               <div className="flex items-center gap-3">
                  <Target size={18} className="text-purple-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Topic Mastery</span>
               </div>
               <div className="space-y-6">
                  {[
                    { label: 'Algebra', value: 85, color: 'bg-blue-500' },
                    { label: 'Physics Logic', value: 62, color: 'bg-purple-500' },
                    { label: 'Neural Grammar', value: 94, color: 'bg-green-500' },
                  ].map(topic => (
                    <div key={topic.label} className="space-y-2">
                       <div className="flex justify-between text-[9px] font-black uppercase">
                          <span className="text-white/40">{topic.label}</span>
                          <span>{topic.value}%</span>
                       </div>
                       <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${topic.value}%` }}
                            className={`h-full ${topic.color}`}
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="cyber-panel p-8 bg-[#00ff88]/5 border-[#00ff88]/10 space-y-4">
               <div className="flex items-center gap-3">
                  <Award size={18} className="text-[#00ff88]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#00ff88]">System Advice</span>
               </div>
               <p className="text-xs font-bold italic leading-relaxed">Your neural integration with Physics is currently at 62%. We recommend 3 extra practice modules today to reach the 80% baseline.</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { icon: <Clock />, label: 'Study Time', value: `${stats.totalTime}h`, sub: 'Total Deep Work' },
           { icon: <Zap />, label: 'Avg Speed', value: `${stats.speed}s`, sub: 'Neural Processing' },
           { icon: <CheckCircle2 />, label: 'Accuracy', value: `${stats.accuracy}%`, sub: 'Verified Logic' },
           { icon: <AlertCircle />, label: 'Peak Subject', value: 'Math', sub: 'High Engagement' },
         ].map((stat, i) => (
           <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-[40px] bg-white/5 border border-white/5 space-y-4"
           >
              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                 {stat.icon}
              </div>
              <div>
                 <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">{stat.label}</p>
                 <p className="text-2xl font-black italic">{stat.value}</p>
                 <p className="text-[8px] font-bold text-[#00ff88] uppercase tracking-widest mt-1">{stat.sub}</p>
              </div>
           </motion.div>
         ))}
      </div>
    </div>
  );
};
