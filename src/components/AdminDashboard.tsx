import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  Clock3,
  Crown,
  Database,
  Eye,
  Gift,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  MoreVertical,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  TimerReset,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  X,
  Zap
} from 'lucide-react';
import { storage } from '../lib/storage';
import { supabase, isFirebaseConfigured } from '../lib/supabase';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AdminAffiliatePanel } from './admin/AdminAffiliatePanel';

type AdminView = 'stats' | 'users' | 'payments' | 'affiliate' | 'feedback' | 'settings' | 'mockTests';

type DbCounts = {
  profiles: number;
  studyRecords: number;
  completions: number;
  monthlyPlans: number;
  resources: number;
  chatMessages: number;
  coachSettings: number;
  timerSessions: number;
  dailyTasks: number;
  totalStudySeconds: number;
};

const emptyCounts: DbCounts = {
  profiles: 0,
  studyRecords: 0,
  completions: 0,
  monthlyPlans: 0,
  resources: 0,
  chatMessages: 0,
  coachSettings: 0,
  timerSessions: 0,
  dailyTasks: 0,
  totalStudySeconds: 0
};

const sideNav: Array<{ id: AdminView; label: string; icon: React.ElementType }> = [
  { id: 'stats', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'feedback', label: 'Analytics', icon: BarChart3 },
  { id: 'payments', label: 'Subscriptions', icon: Crown },
  { id: 'affiliate', label: 'Promo Codes', icon: Gift },
  { id: 'settings', label: 'Broadcast', icon: Megaphone },
  { id: 'mockTests', label: 'Mock Tests', icon: BookOpen }
];

const countStore = (db: IDBDatabase, storeName: string) =>
  new Promise<number>((resolve) => {
    if (!db.objectStoreNames.contains(storeName)) return resolve(0);
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).count();
    req.onsuccess = () => resolve(Number(req.result || 0));
    req.onerror = () => resolve(0);
  });

const readStore = <T,>(db: IDBDatabase, storeName: string) =>
  new Promise<T[]>((resolve) => {
    if (!db.objectStoreNames.contains(storeName)) return resolve([]);
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve((req.result || []) as T[]);
    req.onerror = () => resolve([]);
  });

const loadIndexedDbCounts = async (): Promise<DbCounts> => {
  if (!('indexedDB' in window)) return emptyCounts;

  return new Promise((resolve) => {
    const request = indexedDB.open('t_solver_db');
    request.onerror = () => resolve(emptyCounts);
    request.onsuccess = async () => {
      const db = request.result;
      try {
        const [
          profiles,
          chats,
          assignments,
          quizAttempts,
          reminders,
          notes,
          smartNotes,
          gameSessions,
          payments,
          studySessions
        ] = await Promise.all([
          countStore(db, 'users'),
          countStore(db, 'chats'),
          countStore(db, 'assignments'),
          countStore(db, 'quiz_attempts'),
          countStore(db, 'reminders'),
          countStore(db, 'notes'),
          countStore(db, 'smart_notes'),
          countStore(db, 'game_sessions'),
          countStore(db, 'payments'),
          readStore<any>(db, 'study_sessions')
        ]);

        const totalStudySeconds = studySessions.reduce((sum, item) => sum + Number(item.duration || 0), 0);

        resolve({
          profiles,
          studyRecords: chats + assignments + quizAttempts + notes + smartNotes + gameSessions + studySessions.length,
          completions: quizAttempts + gameSessions,
          monthlyPlans: payments,
          resources: notes + smartNotes,
          chatMessages: chats,
          coachSettings: Math.max(0, Number(localStorage.getItem('tsolver_coach_settings_count') || 0)),
          timerSessions: studySessions.length,
          dailyTasks: reminders,
          totalStudySeconds
        });
      } catch {
        resolve(emptyCounts);
      } finally {
        db.close();
      }
    };
  });
};

const formatStudyTime = (seconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(seconds || 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  return `${hours}h\n${minutes}m`;
};

const formatMoney = (amount: number) => `৳${Math.round(amount || 0).toLocaleString()}`;

export const AdminDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<AdminView>('stats');
  const [users, setUsers] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [dbCounts, setDbCounts] = useState<DbCounts>(emptyCounts);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifyUser, setNotifyUser] = useState<any | null>(null);
  const [notificationText, setNotificationText] = useState('');
  const [globalNotificationText, setGlobalNotificationText] = useState('');

  const [settings, setSettings] = useState({
    maintenanceMode: false,
    publicRegistration: true,
    announcementText: '',
    enableGames: true,
    enableCommunity: true,
    aiProvider: 'local'
  });

  useEffect(() => {
    loadData();
    const savedSettings = localStorage.getItem('tsolver_global_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch {
        console.warn('Failed to parse settings');
      }
    }

    const interval = setInterval(() => loadData(false), 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView]);

  const loadData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const [allUsers, allPayments, localCounts] = await Promise.all([
        storage.getAllUsers(),
        storage.getAllPayments(),
        loadIndexedDbCounts()
      ]);

      setUsers(allUsers || []);
      setPayments(allPayments || []);
      setDbCounts(localCounts);

      if (isFirebaseConfigured()) {
        try {
          const { data } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
          setFeedback(data || []);
        } catch {
          setFeedback([]);
        }
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    `${user.name || ''} ${user.email || ''}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const approvedPayments = payments.filter((payment) => payment.status === 'approved');
  const pendingPayments = payments.filter((payment) => payment.status === 'pending');
  const revenueToday = approvedPayments
    .filter((payment) => new Date(payment.timestamp || Date.now()).toDateString() === new Date().toDateString())
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const revenueThisMonth = approvedPayments
    .filter((payment) => {
      const date = new Date(payment.timestamp || Date.now());
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const activeToday = users.filter((user) => {
    const last = user.session?.lastLogin || user.lastActive || user.joinDate;
    return last && Date.now() - Number(last) < 24 * 60 * 60 * 1000;
  }).length;

  const avgProgress = users.length
    ? Math.min(100, Math.round(users.reduce((sum, user) => sum + Number(user.progress || user.stats?.progress || 0), 0) / users.length))
    : 0;

  const totalRecords = useMemo(() => {
    return Object.entries(dbCounts)
      .filter(([key]) => key !== 'totalStudySeconds')
      .reduce((sum, [, value]) => sum + Number(value || 0), 0);
  }, [dbCounts]);

  const updateSetting = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('tsolver_global_settings', JSON.stringify(newSettings));
    window.dispatchEvent(new CustomEvent('tsolver-settings-updated', { detail: newSettings }));
  };

  const sendCustomNotification = () => {
    if (!notifyUser || !notificationText.trim()) return;

    const currentNotifications = JSON.parse(localStorage.getItem('tsolver_notifications') || '[]');
    currentNotifications.push({
      id: crypto.randomUUID(),
      targetUserId: notifyUser.id,
      message: notificationText,
      timestamp: Date.now(),
      read: false
    });

    localStorage.setItem('tsolver_notifications', JSON.stringify(currentNotifications));
    setNotifyUser(null);
    setNotificationText('');
    alert(`Notification sent to ${notifyUser.name}`);
  };

  const sendGlobalNotification = () => {
    if (!globalNotificationText.trim()) return;

    const currentNotifications = JSON.parse(localStorage.getItem('tsolver_notifications') || '[]');
    const newNotifs = users.map((user) => ({
      id: crypto.randomUUID(),
      targetUserId: user.id,
      message: globalNotificationText,
      timestamp: Date.now(),
      read: false
    }));

    localStorage.setItem('tsolver_notifications', JSON.stringify([...currentNotifications, ...newNotifs]));
    setGlobalNotificationText('');
    alert(`Global notification sent to ${users.length} users!`);
  };

  const handlePaymentAction = async (paymentId: string, status: 'approved' | 'rejected', userId: string) => {
    if (confirm(`Are you sure you want to ${status} this payment?`)) {
      await storage.updatePaymentStatus(paymentId, status, userId);
      loadData(false);
    }
  };

  return (
    <div className="min-h-[90vh] -mx-4 sm:-mx-6 lg:-mx-10 -my-4 bg-[#070b18] text-slate-100 overflow-hidden rounded-[1.75rem] border border-white/10 shadow-2xl animate-fade-in">
      <div className="flex min-h-[90vh]">
        <aside className="hidden lg:flex w-[280px] shrink-0 flex-col border-r border-white/10 bg-[#0b1020]/95">
          <div className="flex items-center gap-4 px-7 py-6 border-b border-white/10">
            <div className="h-12 w-12 rounded-2xl bg-blue-600/20 text-blue-300 flex items-center justify-center shadow-[0_0_35px_rgba(37,99,235,.35)]">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Admin Panel</h2>
              <p className="text-xs font-semibold text-slate-400">HSC Science Tracker</p>
            </div>
          </div>

          <div className="px-6 py-7">
            <p className="text-[11px] font-black tracking-[0.18em] uppercase text-slate-500 mb-5">Main Menu</p>
            <nav className="space-y-2">
              {sideNav.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full h-12 rounded-2xl px-4 flex items-center gap-4 text-sm font-bold transition-all ${
                    activeView === item.id
                      ? 'bg-blue-600/15 text-blue-300 ring-2 ring-white/80 shadow-[0_0_25px_rgba(59,130,246,.22)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon size={19} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto px-6 py-6 border-t border-white/10">
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-emerald-400" />
                <div>
                  <p className="text-sm font-black">Firebase Mode</p>
                  <p className="text-xs text-slate-500">{isFirebaseConfigured() ? 'Connected' : 'Local fallback'}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-x-hidden">
          <div className="sticky top-0 z-20 border-b border-white/10 bg-[#070b18]/85 backdrop-blur-xl lg:hidden px-4 py-4">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {sideNav.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`h-10 px-4 rounded-xl flex items-center gap-2 whitespace-nowrap text-xs font-black ${
                    activeView === item.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-300'
                  }`}
                >
                  <item.icon size={15} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 md:p-8 lg:p-9 space-y-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight">{activeView === 'stats' ? 'Dashboard Overview' : sideNav.find((item) => item.id === activeView)?.label}</h1>
                <p className="text-sm md:text-base text-slate-400 mt-2">Real-time database stats and revenue control center</p>
              </div>
              <button
                onClick={() => loadData(true)}
                disabled={loading}
                className="h-12 px-6 rounded-2xl border border-blue-500/20 bg-blue-600/10 hover:bg-blue-600/20 text-slate-100 font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-60"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeView === 'stats' && (
                <motion.div
                  key="stats"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    <TopMetric title="Total Users" value={users.length.toLocaleString()} icon={Users} tone="blue" />
                    <TopMetric title="Active Today" value={activeToday.toLocaleString()} icon={Activity} tone="emerald" />
                    <TopMetric title="Avg Progress" value={`${avgProgress}%`} icon={TrendingUp} tone="amber" />
                    <TopMetric title="Total Study Time" value={formatStudyTime(dbCounts.totalStudySeconds)} icon={TimerReset} tone="slate" />
                  </div>

                  <SectionCard
                    title="Revenue Summary"
                    subtitle="Premium subscriptions"
                    icon={Wallet}
                    right={<span className="text-xs font-bold text-slate-400">Premium subscriptions</span>}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                      <MiniMetric icon={Wallet} label="Revenue Today" value={formatMoney(revenueToday)} tone="emerald" />
                      <MiniMetric icon={CalendarDays} label="Revenue This Month" value={formatMoney(revenueThisMonth)} tone="cyan" />
                      <MiniMetric icon={Clock3} label="Pending Payments" value={pendingPayments.length.toLocaleString()} tone="amber" />
                      <MiniMetric icon={Crown} label="Active Premium" value={approvedPayments.length.toLocaleString()} tone="yellow" />
                      <MiniMetric icon={UserCheck} label="Expired Users" value="0" tone="rose" />
                    </div>
                  </SectionCard>

                  <SectionCard
                    title="Database Overview"
                    subtitle={`${totalRecords.toLocaleString()} total records`}
                    icon={Database}
                    right={<MiniTotal value={formatStudyTime(dbCounts.totalStudySeconds)} label="Total Study Time" />}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                      <MiniMetric icon={Users} label="Profiles" value={dbCounts.profiles.toLocaleString()} tone="blue" />
                      <MiniMetric icon={BookOpen} label="Study Records" value={dbCounts.studyRecords.toLocaleString()} tone="emerald" />
                      <MiniMetric icon={Check} label="Completions" value={dbCounts.completions.toLocaleString()} tone="green" />
                      <MiniMetric icon={CalendarDays} label="Monthly Plans" value={dbCounts.monthlyPlans.toLocaleString()} tone="purple" />
                      <MiniMetric icon={Zap} label="Resources" value={dbCounts.resources.toLocaleString()} tone="orange" />
                      <MiniMetric icon={MessageSquare} label="Chat Messages" value={dbCounts.chatMessages.toLocaleString()} tone="cyan" />
                      <MiniMetric icon={Settings} label="Coach Settings" value={dbCounts.coachSettings.toLocaleString()} tone="pink" />
                      <MiniMetric icon={Clock3} label="Timer Sessions" value={dbCounts.timerSessions.toLocaleString()} tone="amber" />
                      <MiniMetric icon={Bell} label="Daily Tasks" value={dbCounts.dailyTasks.toLocaleString()} tone="violet" />
                    </div>
                  </SectionCard>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                    <GlassInfoCard title="Community Reports" value={feedback.length.toLocaleString()} icon={MessageSquare} tone="blue" />
                    <GlassInfoCard title="System Health" value={isFirebaseConfigured() ? 'Online' : 'Local'} icon={ShieldCheck} tone="emerald" />
                    <GlassInfoCard title="Last Refresh" value={new Date().toLocaleTimeString()} icon={RefreshCw} tone="purple" />
                  </div>
                </motion.div>
              )}

              {activeView === 'users' && (
                <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-5 h-14">
                    <Search size={18} className="text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name or email..."
                      className="flex-1 bg-transparent border-none outline-none text-sm font-bold placeholder:text-slate-600"
                    />
                  </div>

                  <DataPanel>
                    <table className="w-full text-left min-w-[840px]">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/[0.02]">
                          {['User ID', 'Profile', 'Email', 'Level', 'Joined', 'Actions'].map((head) => (
                            <th key={head} className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 last:text-right">{head}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-white/[0.03] transition-colors group">
                            <td className="px-6 py-5 text-xs font-mono text-slate-500">#{String(user.id).substring(0, 8)}</td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-4">
                                <div className="h-11 w-11 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                                  {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="" /> : <Users size={16} className="text-slate-500" />}
                                </div>
                                <span className="text-sm font-black">{user.name || 'Unknown'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-sm font-semibold text-slate-400">{user.email || 'No email'}</td>
                            <td className="px-6 py-5"><BadgeText>{user.level || 'Student'}</BadgeText></td>
                            <td className="px-6 py-5 text-xs font-bold text-slate-500">{new Date(user.joinDate || Date.now()).toLocaleDateString()}</td>
                            <td className="px-6 py-5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <ActionButton onClick={() => setNotifyUser(user)} icon={Megaphone} tone="blue" />
                                <ActionButton icon={Eye} tone="slate" />
                                <ActionButton icon={Trash2} tone="red" />
                              </div>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-500 font-bold">No users found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </DataPanel>
                </motion.div>
              )}

              {activeView === 'payments' && (
                <motion.div key="payments" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <DataPanel>
                    <table className="w-full text-left min-w-[840px]">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/[0.02]">
                          {['User', 'Amount', 'TXID', 'Status', 'Date', 'Actions'].map((head) => (
                            <th key={head} className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 last:text-right">{head}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {payments.length > 0 ? payments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-white/[0.03] transition-colors">
                            <td className="px-6 py-5 text-xs font-bold text-slate-400">{users.find((user) => user.id === payment.userId)?.name || String(payment.userId).substring(0, 8)}</td>
                            <td className="px-6 py-5 text-sm font-black">৳{payment.amount}</td>
                            <td className="px-6 py-5 text-xs font-mono text-slate-500">{payment.txid}</td>
                            <td className="px-6 py-5"><StatusBadge status={payment.status} /></td>
                            <td className="px-6 py-5 text-xs text-slate-500">{new Date(payment.timestamp || Date.now()).toLocaleString()}</td>
                            <td className="px-6 py-5 text-right">
                              {payment.status === 'pending' && (
                                <div className="flex justify-end gap-2">
                                  <ActionButton onClick={() => handlePaymentAction(payment.id, 'approved', payment.userId)} icon={Check} tone="green" />
                                  <ActionButton onClick={() => handlePaymentAction(payment.id, 'rejected', payment.userId)} icon={X} tone="red" />
                                </div>
                              )}
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-500 font-bold">No payments found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </DataPanel>
                </motion.div>
              )}

              {activeView === 'affiliate' && (
                <motion.div key="affiliate" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
                  <AdminAffiliatePanel />
                </motion.div>
              )}

              {activeView === 'feedback' && (
                <motion.div key="feedback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                  <GlassInfoCard title="Reports" value={feedback.length.toLocaleString()} icon={MessageSquare} tone="blue" />
                  <GlassInfoCard title="User Growth" value={users.length.toLocaleString()} icon={TrendingUp} tone="emerald" />
                  <GlassInfoCard title="Revenue" value={formatMoney(revenueThisMonth)} icon={Wallet} tone="amber" />
                  <div className="xl:col-span-3">
                    <SectionCard title="Latest Reports" subtitle="User feedback and community signals" icon={MessageSquare}>
                      <div className="space-y-3">
                        {feedback.length > 0 ? feedback.map((item, index) => (
                          <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                            <p className="text-sm font-semibold text-slate-200">{item.content}</p>
                            <div className="flex justify-between text-xs text-slate-500 mt-3"><span>{item.type || 'General'}</span><span>{new Date(item.created_at || Date.now()).toLocaleString()}</span></div>
                          </div>
                        )) : <EmptyState text="No analytics/reports found yet." />}
                      </div>
                    </SectionCard>
                  </div>
                </motion.div>
              )}

              {(activeView === 'settings' || activeView === 'mockTests') && (
                <motion.div key={activeView} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                  <SectionCard title="Access Control" subtitle="Global feature switches" icon={ShieldCheck}>
                    <SettingsRow label="Maintenance Mode" hint="Block non-admins" checked={settings.maintenanceMode} onChange={(value) => updateSetting('maintenanceMode', value)} />
                    <SettingsRow label="Public Registration" hint="Allow new user signups" checked={settings.publicRegistration} onChange={(value) => updateSetting('publicRegistration', value)} />
                    <SettingsRow label="Community Features" hint="Enable doubts & feed" checked={settings.enableCommunity} onChange={(value) => updateSetting('enableCommunity', value)} />
                    <SettingsRow label="Logic Playground" hint="Enable educational games" checked={settings.enableGames} onChange={(value) => updateSetting('enableGames', value)} />
                  </SectionCard>

                  <SectionCard title="Broadcast" subtitle="Send notice to all students" icon={Megaphone}>
                    <textarea
                      value={globalNotificationText}
                      onChange={(event) => setGlobalNotificationText(event.target.value)}
                      placeholder="Write broadcast notification..."
                      className="w-full h-32 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 text-sm font-semibold outline-none focus:border-blue-400"
                    />
                    <button
                      onClick={sendGlobalNotification}
                      disabled={!globalNotificationText.trim()}
                      className="mt-4 h-12 w-full rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-black flex items-center justify-center gap-2 transition-all"
                    >
                      <Megaphone size={17} /> Send to {users.length} Users
                    </button>
                  </SectionCard>

                  <SectionCard title="Mock Tests" subtitle="Exam module control" icon={BookOpen}>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                      <p className="text-sm font-bold text-slate-300">Mock test admin area is ready for question import, schedule control and result monitoring.</p>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <MiniMetric icon={BookOpen} label="Tests" value="0" tone="blue" />
                      <MiniMetric icon={Check} label="Results" value="0" tone="green" />
                    </div>
                  </SectionCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {notifyUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b1020] p-7 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black">Custom Notification</h3>
                  <p className="text-sm text-slate-500">To: {notifyUser.name}</p>
                </div>
                <button onClick={() => setNotifyUser(null)} className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10"><X size={16} /></button>
              </div>
              <textarea
                value={notificationText}
                onChange={(event) => setNotificationText(event.target.value)}
                placeholder="Type your notification..."
                className="w-full h-32 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm font-semibold outline-none focus:border-blue-400"
                autoFocus
              />
              <div className="flex justify-end gap-3 pt-5">
                <button onClick={() => setNotifyUser(null)} className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-bold">Cancel</button>
                <button onClick={sendCustomNotification} disabled={!notificationText.trim()} className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm font-black">Send</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function TopMetric({ title, value, icon: Icon, tone }: { title: string; value: string; icon: React.ElementType; tone: 'blue' | 'emerald' | 'amber' | 'slate' }) {
  const tones = {
    blue: 'border-blue-500/20 bg-blue-600/10 text-blue-300',
    emerald: 'border-emerald-500/20 bg-emerald-600/10 text-emerald-300',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
    slate: 'border-white/10 bg-white/[0.03] text-slate-100'
  };

  return (
    <div className={`rounded-3xl border p-6 min-h-[150px] ${tones[tone]} shadow-[0_0_40px_rgba(15,23,42,.25)]`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-black text-slate-400 mb-4">{title}</p>
          <p className="text-4xl font-black whitespace-pre-line leading-none tracking-tight">{value}</p>
        </div>
        <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center">
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, icon: Icon, children, right }: { title: string; subtitle?: string; icon: React.ElementType; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 md:p-6 shadow-[0_0_50px_rgba(0,0,0,.25)]">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-blue-600/10 text-blue-300 flex items-center justify-center"><Icon size={19} /></div>
          <div>
            <h3 className="text-lg font-black">{title}</h3>
            {subtitle && <p className="text-sm text-slate-500 font-semibold">{subtitle}</p>}
          </div>
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function MiniMetric({ icon: Icon, label, value, tone }: { icon: React.ElementType; label: string; value: string; tone: string }) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-600/10',
    emerald: 'text-emerald-400 bg-emerald-600/10',
    green: 'text-green-400 bg-green-600/10',
    cyan: 'text-cyan-400 bg-cyan-600/10',
    amber: 'text-amber-400 bg-amber-600/10',
    yellow: 'text-yellow-400 bg-yellow-600/10',
    purple: 'text-purple-400 bg-purple-600/10',
    violet: 'text-violet-400 bg-violet-600/10',
    pink: 'text-pink-400 bg-pink-600/10',
    rose: 'text-rose-400 bg-rose-600/10',
    orange: 'text-orange-400 bg-orange-600/10',
    slate: 'text-slate-300 bg-white/5'
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1020]/70 p-4 min-h-[76px] flex items-center gap-4">
      <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${colorMap[tone] || colorMap.slate}`}><Icon size={18} /></div>
      <div className="min-w-0">
        <p className="text-xl font-black leading-tight truncate">{value}</p>
        <p className="text-xs font-semibold text-slate-500 truncate">{label}</p>
      </div>
    </div>
  );
}

function MiniTotal({ value, label }: { value: string; label: string }) {
  return (
    <div className="hidden md:flex items-center gap-3 rounded-2xl border border-blue-500/20 bg-blue-600/10 px-5 py-3">
      <Clock3 size={18} className="text-blue-300" />
      <div>
        <p className="text-sm font-black text-blue-300 whitespace-pre-line leading-none">{value}</p>
        <p className="text-xs font-semibold text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function GlassInfoCard({ title, value, icon: Icon, tone }: { title: string; value: string; icon: React.ElementType; tone: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 flex items-center gap-4">
      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${tone === 'emerald' ? 'bg-emerald-600/10 text-emerald-300' : tone === 'amber' ? 'bg-amber-600/10 text-amber-300' : tone === 'purple' ? 'bg-purple-600/10 text-purple-300' : 'bg-blue-600/10 text-blue-300'}`}><Icon size={22} /></div>
      <div>
        <p className="text-2xl font-black">{value}</p>
        <p className="text-sm font-semibold text-slate-500">{title}</p>
      </div>
    </div>
  );
}

function DataPanel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl border border-white/10 bg-white/[0.025] overflow-hidden"><div className="overflow-x-auto">{children}</div></div>;
}

function BadgeText({ children }: { children: React.ReactNode }) {
  return <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-black text-slate-300">{children}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const cls = status === 'approved'
    ? 'bg-green-500/10 border-green-500/20 text-green-400'
    : status === 'rejected'
      ? 'bg-red-500/10 border-red-500/20 text-red-400'
      : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
  return <span className={`px-3 py-1 rounded-xl border text-xs font-black uppercase ${cls}`}>{status}</span>;
}

function ActionButton({ icon: Icon, tone, onClick }: { icon: React.ElementType; tone: 'blue' | 'green' | 'red' | 'slate'; onClick?: () => void }) {
  const cls = tone === 'blue' ? 'text-blue-400 hover:bg-blue-600 hover:text-white' : tone === 'green' ? 'text-green-400 hover:bg-green-600 hover:text-white' : tone === 'red' ? 'text-red-400 hover:bg-red-600 hover:text-white' : 'text-slate-400 hover:bg-white/10';
  return <button onClick={onClick} className={`h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center transition-all ${cls}`}><Icon size={15} /></button>;
}

function SettingsRow({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-white/10 last:border-b-0">
      <div>
        <Label className="text-sm font-black">{label}</Label>
        <p className="text-xs text-slate-500 mt-1">{hint}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="py-16 text-center text-slate-500 font-bold">{text}</div>;
}
