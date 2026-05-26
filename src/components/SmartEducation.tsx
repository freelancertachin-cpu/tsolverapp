import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Loader2, 
  Search,
  Camera,
  Cpu,
  Mic,
  Image as ImageIcon,
  SendHorizontal,
  ChevronDown,
  Brain,
  BarChart,
  Bell,
  FileText,
  Lightbulb,
  Gamepad2,
  Trophy,
  History,
  Zap
} from 'lucide-react';
import { localAI } from '@/lib/localAI';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

import { UserProfile } from '../lib/storage';
import { QuizSystem } from './QuizSystem';
import { QuizAnalytics } from './QuizAnalytics';
import { ReminderSystem } from './ReminderSystem';
import { SmartNotes } from './SmartNotes';
import { AssignmentRecommender } from './AssignmentRecommender';
import { GamificationSystem } from './GamificationSystem';

const SUBJECTS = [
  "বীজগণিত", 
  "পাটিগণিত", 
  "জ্যামিতি", 
  "ত্রিকোণমিতি", 
  "শতকরা (%)", 
  "পরিসংখ্যান", 
  "বাংলা", 
  "English", 
  "Science"
];

export const SmartEducation: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'study' | 'quiz' | 'analytics' | 'reminders' | 'notes' | 'recommend' | 'gamify'>('study');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [useThinking, setUseThinking] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [imageFile, setImageFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSolve = async () => {
    if (!input.trim() && !imageFile) return;
    setLoading(true);
    setResult(null);
    try {
      const prompt = `Topic: ${subject}. Problem: ${input}. Provide a step-by-step solution in Bengali.`;
      const res = await localAI.process(prompt, 'general', useThinking, undefined, imageFile || undefined);
      setResult(res);
    } catch (err) {
      setResult("Failed to solve. Please try again.");
    } finally {
      setLoading(false);
      setImageFile(null); // Clear image after solving
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-16 pb-32">
      {/* Sub Navigation - Glassmorphic Dock */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1 p-1.5 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-[24px] backdrop-blur-3xl overflow-x-auto no-scrollbar max-w-full">
          <SubNavItem active={activeTab === 'study'} onClick={() => setActiveTab('study')} icon={<Brain size={16}/>} label="Study Help" />
          <SubNavItem active={activeTab === 'quiz'} onClick={() => setActiveTab('quiz')} icon={<Gamepad2 size={16}/>} label="Quiz" />
          <SubNavItem active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<BarChart size={16}/>} label="Analytics" />
          <SubNavItem active={activeTab === 'reminders'} onClick={() => setActiveTab('reminders')} icon={<Bell size={16}/>} label="Reminders" />
          <SubNavItem active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} icon={<FileText size={16}/>} label="Smart Notes" />
          <SubNavItem active={activeTab === 'recommend'} onClick={() => setActiveTab('recommend')} icon={<Lightbulb size={16}/>} label="Suggest" />
          <SubNavItem active={activeTab === 'gamify'} onClick={() => setActiveTab('gamify')} icon={<Trophy size={16}/>} label="Journey" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'study' && (
          <motion.div 
            key="study"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-12"
          >
            <div className="cyber-panel p-10 md:p-16 space-y-12 relative overflow-visible border-black/5 dark:border-white/5">
              {/* Header Section */}
              <div className="flex flex-col lg:flex-row justify-between items-start gap-10">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                    <Zap size={10} className="text-blue-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">Neural Solve Engine</span>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic leading-none">
                    Student <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-black/20 to-black dark:from-white/20 dark:to-white">Intelligence</span>
                  </h2>
                  <p className="text-black/40 dark:text-white/30 text-sm font-bold leading-relaxed max-w-md italic">
                    Establish a neural connection with our solver engine. Input any complex scholastic problem for immediate resolution.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <button className="h-14 px-8 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl flex items-center gap-3 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all group shadow-glow">
                    <Camera className="h-5 w-5 text-black/40 dark:text-white/40 group-hover:text-current" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Visual Scan</span>
                  </button>
                  <div className="flex items-center gap-6 px-8 h-14 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 backdrop-blur-xl">
                     <div className="flex items-center gap-3">
                        <Cpu className={`h-5 w-5 ${useThinking ? 'text-blue-500 animate-pulse' : 'text-black/20 dark:text-white/20'}`} />
                        <Label htmlFor="think-student" className="text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hidden sm:block">Deep Thinking</Label>
                     </div>
                     <Switch id="think-student" checked={useThinking} onCheckedChange={setUseThinking} className="scale-90" />
                  </div>
                </div>
              </div>

              {/* Form Section */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 pt-8 border-t border-black/5 dark:border-white/5">
                <div className="xl:col-span-3 space-y-4">
                  <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-black/30 dark:text-white/20 px-1">Select Sector</Label>
                  <div className="relative">
                    <button 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full h-16 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl px-6 flex items-center justify-between hover:bg-black/10 dark:hover:bg-white/10 transition-all text-sm font-black uppercase tracking-widest"
                    >
                      {subject} <ChevronDown className={`h-5 w-5 transition-transform duration-500 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute top-20 left-0 w-full bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 rounded-3xl overflow-hidden z-50 shadow-2xl p-3"
                        >
                          <div className="max-h-[300px] overflow-y-auto no-scrollbar space-y-1">
                            {SUBJECTS.map((s) => (
                              <button
                                key={s}
                                onClick={() => { setSubject(s); setIsDropdownOpen(false); }}
                                className={`w-full text-left px-5 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${subject === s ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-black/60 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5'}`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <div className="pt-8 space-y-4 hidden xl:block">
                     <div className="flex items-center gap-3 text-black/20 dark:text-white/20">
                        <History size={16} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Recent Queries</span>
                     </div>
                     <div className="space-y-2">
                        <div className="h-10 w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-xl animate-pulse" />
                        <div className="h-10 w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-xl animate-pulse" />
                     </div>
                  </div>
                </div>

                <div className="xl:col-span-9 space-y-6">
                   <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-[40px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none" />
                      <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Establish query parameters here..."
                        className="relative w-full min-h-[280px] bg-black/5 dark:bg-white/[0.03] border border-black/5 dark:border-white/10 rounded-[40px] p-10 text-xl font-bold placeholder:text-black/10 dark:placeholder:text-white/10 focus:outline-none focus:border-black/20 dark:focus:border-white/20 transition-all resize-none no-scrollbar"
                      />
                      
                      <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button className="h-12 w-12 flex items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-black dark:hover:bg-white text-black/40 dark:text-white/40 hover:text-white dark:hover:text-black transition-all group">
                            <Mic size={20} className="group-hover:scale-110 transition-transform" />
                          </button>
                          <button onClick={() => fileInputRef.current?.click()} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-black dark:hover:bg-white text-black/40 dark:text-white/40 hover:text-white dark:hover:text-black transition-all group">
                            <ImageIcon size={20} className="group-hover:scale-110 transition-transform" />
                          </button>
                          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                          {imageFile && (
                            <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-black/10 dark:border-white/10">
                              <img src={imageFile} alt="Upload preview" className="w-full h-full object-cover" />
                              <button onClick={() => setImageFile(null)} className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[8px] font-black">X</button>
                            </div>
                          )}
                        </div>
                        
                        <button 
                          onClick={handleSolve}
                          disabled={loading || (!input.trim() && !imageFile)}
                          className="h-16 px-12 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center gap-4 font-black uppercase text-xs tracking-[0.3em] hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none shadow-2xl"
                        >
                          {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <><SendHorizontal size={20} /> Establish Solve</>}
                        </button>
                      </div>
                   </div>
                </div>
              </div>

              {/* Result Area */}
              <AnimatePresence>
                {result && (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-12 border-t border-black/5 dark:border-white/5 space-y-8"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="h-12 w-12 rounded-2xl bg-black dark:bg-white flex items-center justify-center shadow-glow">
                           <Sparkles className="h-6 w-6 text-white dark:text-black" />
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-black/60 dark:text-white/40">Neural Output Terminal</span>
                            <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest">Resolution Successful</span>
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                         <div className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
                         <span className="text-[9px] font-black uppercase tracking-widest text-black/20 dark:text-white/20">Synced with Local Node</span>
                      </div>
                    </div>

                    <ScrollArea className="h-fit max-h-[600px] w-full bg-black/[0.02] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 rounded-[40px] p-10 md:p-16">
                      <div className="markdown-body">
                        <ReactMarkdown>{result}</ReactMarkdown>
                      </div>
                    </ScrollArea>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {activeTab === 'quiz' && <motion.div key="quiz" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}><QuizSystem user={user} /></motion.div>}
        {activeTab === 'analytics' && <motion.div key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}><QuizAnalytics user={user} /></motion.div>}
        {activeTab === 'reminders' && <motion.div key="reminders" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}><ReminderSystem user={user} /></motion.div>}
        {activeTab === 'notes' && <motion.div key="notes" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}><SmartNotes userId={user.id} /></motion.div>}
        {activeTab === 'recommend' && <motion.div key="recommend" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}><AssignmentRecommender user={user} /></motion.div>}
        {activeTab === 'gamify' && <motion.div key="gamify" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}><GamificationSystem user={user} /></motion.div>}
      </AnimatePresence>
    </div>
  );
};

function SubNavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`px-8 py-3.5 rounded-[20px] flex items-center gap-3 transition-all whitespace-nowrap text-[10px] font-black uppercase tracking-widest relative group ${active ? 'text-black dark:text-white' : 'text-black/30 dark:text-white/20 hover:text-black/50 dark:hover:text-white/40'}`}
    >
      {active && (
        <motion.div 
          layoutId="subnav-active"
          className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-[18px] shadow-xl"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className="relative z-10">{icon}</span>
      <span className="relative z-10">{label}</span>
    </button>
  );
}

