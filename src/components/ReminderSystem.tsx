import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Calendar, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock,
  Layout,
  AlertCircle,
  X
} from 'lucide-react';
import { storage, Reminder, UserProfile } from '../lib/storage';

export const ReminderSystem: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<Reminder['type']>('study');
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    loadReminders();
    requestNotificationPermission();
  }, [user.id]);

  const loadReminders = async () => {
    const data = await storage.getReminders(user.id);
    setReminders(data.sort((a, b) => a.time - b.time));
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const handleAdd = async () => {
    if (!newTitle || !newTime) return;

    const reminder: Reminder = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      title: newTitle,
      type: newType,
      time: new Date(newTime).getTime(),
      status: 'pending'
    };

    await storage.saveReminder(reminder);
    setReminders([...reminders, reminder].sort((a, b) => a.time - b.time));
    setIsAdding(false);
    setNewTitle('');
    setNewTime('');

    // Set local notification timeout
    const delay = reminder.time - Date.now();
    if (delay > 0) {
      setTimeout(() => {
        showNotification(reminder);
      }, delay);
    }
  };

  const showNotification = (reminder: Reminder) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`T-Solver: ${reminder.type.toUpperCase()}`, {
        body: reminder.title,
        icon: '/logo192.png'
      });
    }
  };

  const handleDelete = async (id: string) => {
    await storage.deleteData('reminders', id);
    setReminders(reminders.filter(r => r.id !== id));
  };

  const toggleStatus = async (reminder: Reminder) => {
    const newStatus: Reminder['status'] = reminder.status === 'completed' ? 'pending' : 'completed';
    const updated: Reminder = { ...reminder, status: newStatus };
    await storage.saveReminder(updated);
    setReminders(reminders.map(r => r.id === reminder.id ? updated : r));
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-4">
          <h2 className="text-4xl font-black uppercase tracking-tighter italic flex items-center gap-3">
             Reminders <br/>
             <span className="text-white/40 text-2xl font-bold">(Local Schedule)</span>
          </h2>
          <p className="text-white/40 text-xs font-bold leading-relaxed px-1">
             Manage your study plans and assignment deadlines.
          </p>
        </div>

        <button 
          onClick={() => setIsAdding(true)}
          className="h-14 px-8 bg-white text-black rounded-2xl flex items-center gap-3 font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-glow"
        >
          <Plus size={18} /> New Reminder
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="cyber-panel p-8 space-y-8 relative overflow-hidden"
          >
             <button onClick={() => setIsAdding(false)} className="absolute top-6 right-6 text-white/20 hover:text-white transition-all">
                <X size={20} />
             </button>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-1">Reminder Title</label>
                   <input 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Math Revision"
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-white/30 text-white font-bold"
                   />
                </div>
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-1">Due Date & Time</label>
                   <input 
                    type="datetime-local"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-white/30 text-white font-bold"
                   />
                </div>
             </div>

             <div className="flex flex-wrap items-center gap-3">
                {['study', 'exam', 'revision', 'assignment'].map((type) => (
                   <button 
                    key={type}
                    onClick={() => setNewType(type as Reminder['type'])}
                    className={`h-10 px-6 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${newType === type ? 'bg-white text-black' : 'bg-white/5 border border-white/5 text-white/40'}`}
                   >
                     {type}
                   </button>
                ))}
             </div>

             <button 
              onClick={handleAdd}
              className="w-full h-16 bg-white/5 border border-white/5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-all shadow-glow"
             >
                Create Reminder
             </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {reminders.length === 0 ? (
           <div className="md:col-span-2 py-20 text-center opacity-20 italic font-black uppercase text-xl tracking-tighter">
              No Pending Reminders
           </div>
         ) : (
           reminders.map((r) => (
             <motion.div 
               key={r.id}
               layout
               className={`cyber-panel p-6 flex items-center justify-between group transition-all ${r.status === 'completed' ? 'opacity-40 grayscale' : 'hover:border-white/20'}`}
             >
                <div className="flex items-center gap-5">
                   <button 
                    onClick={() => toggleStatus(r)}
                    className={`h-6 w-6 rounded-lg border flex items-center justify-center transition-all ${r.status === 'completed' ? 'bg-white border-white text-black' : 'border-white/20 text-transparent'}`}
                   >
                      <CheckCircle2 size={14} />
                   </button>
                   <div className="space-y-1">
                      <p className={`text-lg font-bold leading-tight ${r.status === 'completed' ? 'line-through' : ''}`}>{r.title}</p>
                      <div className="flex items-center gap-3">
                         <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-white/5 rounded text-white/40">{r.type}</span>
                         <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-white/20">
                            <Clock size={10} />
                            {new Date(r.time).toLocaleString()}
                         </div>
                      </div>
                   </div>
                </div>
                <button 
                  onClick={() => handleDelete(r.id)}
                  className="opacity-0 group-hover:opacity-100 p-3 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all"
                >
                   <Trash2 size={16} />
                </button>
             </motion.div>
           ))
         )}
      </div>
    </div>
  );
};
