
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Book, 
  PenTool, 
  Calculator, 
  Lightbulb, 
  Trophy, 
  BarChart, 
  ChevronRight,
  Play,
  FileText,
  Brain,
  Rocket,
  Atom,
  Pi,
  Microscope,
  Languages,
  Database,
  TrendingUp,
  Globe2,
  Briefcase,
  Shield,
  MessageSquare,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Star,
  Zap
} from 'lucide-react';
import { UserProfile } from '../lib/storage';
import { EducationalEngine, TopicContent } from '../lib/educationalEngine';
import { translations, SupportedLanguage } from '../lib/translations';
import { AITeacher } from './AITeacher';
import { GraphPlotterReal } from './GraphPlotterReal';
import { AssignmentSector } from './AssignmentSector';
import { PracticeEngine } from './PracticeEngine';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { MathGame } from './MathGame';
import { NeuralSolver } from './NeuralSolver';
import { Logo } from './Logo';

interface SubjectDashboardProps {
  subjectId: string;
  user: UserProfile;
  onClose: () => void;
}

const User = ({ size, className }: any) => <FileText size={size} className={className} />;

const SUBJECT_DETAILS: Record<string, {
  name: string;
  icon: any;
  color: string;
  description: string;
  topics: string[];
  tools: { id: string; name: string; icon: any }[];
}> = {
  math: {
    name: 'Mathematics',
    icon: Pi,
    color: '#00f2ff',
    description: 'Master the language of the universe through logic, patterns, and structure.',
    topics: ['Algebra', 'Geometry', 'Calculus', 'Trigonometry', 'Statistics', 'Linear Algebra'],
    tools: [
      { id: 'plot', name: 'Graph Plotter', icon: Calculator },
      { id: 'solve', name: 'Equation Solver', icon: Brain },
      { id: 'derive', name: 'Step-by-Step', icon: Rocket }
    ]
  },
  physics: {
    name: 'Physics',
    icon: Atom,
    color: '#ff7700',
    description: 'Explore the fundamental laws governing energy, matter, space, and time.',
    topics: ['Mechanics', 'Electricity', 'Magnetism', 'Quantum Physics', 'Relativity', 'Waves'],
    tools: [
      { id: 'simulate', name: 'Motion Sim', icon: Play },
      { id: 'force', name: 'Force Calc', icon: Calculator },
      { id: 'optics', name: 'Ray Tracing', icon: Lightbulb }
    ]
  },
  chemistry: {
    name: 'Chemistry',
    icon: Microscope,
    color: '#00ff88',
    description: 'Discover the composition of substances and the reactions between them.',
    topics: ['Organic', 'Inorganic', 'Physical', 'Biochemistry', 'Analytical', 'Equations'],
    tools: [
      { id: 'ptable', name: 'Periodic Table', icon: Book },
      { id: 'balance', name: 'Equation Balancer', icon: Calculator },
      { id: 'molecule', name: '3D Viewer', icon: Rocket }
    ]
  },
  biology: {
    name: 'Biology',
    icon: Book,
    color: '#ff00aa',
    description: 'Study living organisms, their structure, function, growth, and evolution.',
    topics: ['Genetics', 'Human Body', 'Cell Systems', 'Botany', 'Zoology', 'Ecology'],
    tools: [
      { id: 'micro', name: 'Cell Explorer', icon: Microscope },
      { id: 'dna', name: 'Helix Builder', icon: Rocket },
      { id: 'anatomy', name: 'Human Body', icon: User }
    ]
  },
  ict: {
    name: 'ICT',
    icon: Database,
    color: '#aa00ff',
    description: 'Information technology, programming, and the digital architecture of the future.',
    topics: ['Programming', 'Networking', 'Cyber Security', 'Web Dev', 'Algorithms', 'Hardware'],
    tools: [
      { id: 'code', name: 'Node Editor', icon: Rocket },
      { id: 'net', name: 'Net Topology', icon: Globe2 },
      { id: 'sql', name: 'SQL Query', icon: Database }
    ]
  },
  english: {
    name: 'English',
    icon: Languages,
    color: '#3366ff',
    description: 'Master literature, grammar, and professional writing skills.',
    topics: ['Grammar', 'Literature', 'Poetry', 'Professional Writing', 'Creative Writing', 'Vocab'],
    tools: [
      { id: 'write', name: 'Writing AI', icon: PenTool },
      { id: 'vocab', name: 'Vocab Hero', icon: Trophy },
      { id: 'gram', name: 'Syntax Check', icon: FileText }
    ]
  },
  accounting: {
    name: 'Accounting',
    icon: Briefcase,
    color: '#cc6600',
    description: 'The art of recording, summarizing, and analyzing financial transactions.',
    topics: ['Financial Accounting', 'Cost Accounting', 'Auditing', 'Taxation', 'Management Accounting'],
    tools: [
      { id: 'ledger', name: 'Quick Ledger', icon: Book },
      { id: 'audit', name: 'Auto Audit', icon: Shield },
      { id: 'bal', name: 'Balance Sheet', icon: Calculator }
    ]
  },
  economics: {
    name: 'Economics',
    icon: TrendingUp,
    color: '#00cccc',
    description: 'Analyze the production, distribution, and consumption of goods and services.',
    topics: ['Microeconomics', 'Macroeconomics', 'International Trade', 'Development Economics', 'Econometrics'],
    tools: [
      { id: 'market', name: 'Market Sim', icon: Globe2 },
      { id: 'policy', name: 'Policy Lab', icon: Lightbulb },
      { id: 'index', name: 'Price Tracker', icon: BarChart }
    ]
  },
  bangla: {
    name: 'Bangla',
    icon: Globe2,
    color: '#ffcc00',
    description: 'আমাদের মাতৃভাষা বাংলা - সাহিত্য ও ব্যাকরণের গভীরতায় প্রবেশ করুন।',
    topics: ['ব্যাকরণ (Grammar)', 'সাহিত্য (Literature)', 'রচনা (Essay)', 'বিরাম চিহ্ন (Punctuation)'],
    tools: [
      { id: 'poetry', name: 'ছন্দ বিশ্লেষণ', icon: PenTool },
      { id: 'grammar', name: 'ব্যাকরণ গুরু', icon: Brain },
      { id: 'dict', name: 'অভিধান', icon: Book }
    ]
  }
};

export const SubjectDashboard: React.FC<SubjectDashboardProps> = ({ subjectId, user, onClose }) => {
  const lang = (localStorage.getItem('tsolver-lang') || 'en') as SupportedLanguage;
  const t = translations[lang] || translations.en;
  
  const details = SUBJECT_DETAILS[subjectId] || SUBJECT_DETAILS.math;
  const displayName = (t as any)[subjectId] || details.name;
  const [activeTab, setActiveTab] = useState<'overview' | 'topics' | 'practice' | 'analytics'>('overview');
  const [subView, setSubView] = useState<string | null>(null);
  const [activeTopic, setActiveTopic] = useState<TopicContent | null>(null);
  const [practiceMode, setPracticeMode] = useState<'rapid' | 'conceptual' | 'generator' | null>(null);

  const handleStartLearning = () => {
    setActiveTab('topics');
    setSubView(null);
  };

  const openTopic = (topicName: string) => {
    const content = EducationalEngine.getTopic(subjectId, topicName);
    if (content) {
      setActiveTopic(content);
      setSubView('topic-content');
    } else {
      setSubView('coming-soon');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 bg-black overflow-y-auto no-scrollbar"
    >
       {/* Cinematic Background */}
       <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
          <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] blur-[150px] rounded-full" style={{ backgroundColor: details.color + '20' }} />
          <div className="absolute bottom-[-10%] left-[-20%] w-[600px] h-[600px] blur-[120px] rounded-full" style={{ backgroundColor: details.color + '10' }} />
       </div>

       {/* Header */}
       <header className="sticky top-0 z-10 p-8 flex items-center justify-between backdrop-blur-3xl border-b border-white/5">
          <div className="flex items-center gap-4 md:gap-6">
             <button onClick={() => { if (subView) setSubView(null); else onClose(); }} className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all group">
                {subView ? <ChevronRight size={18} className="rotate-180" /> : <X size={18} className="group-hover:rotate-90 transition-transform" />}
             </button>
             <div className="h-10 w-[1px] bg-white/10" />
             <Logo size="sm" />
             <div className="space-y-1">
                <div className="flex items-center gap-2">
                   <details.icon size={16} className="opacity-40" />
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">{subjectId} Hub node</span>
                </div>
                <h1 className="text-3xl font-black italic uppercase tracking-tighter">{displayName}</h1>
             </div>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
             {['overview', 'topics', 'practice', 'analytics'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab as any); setSubView(null); }}
                  className={`h-10 md:h-11 px-4 md:px-6 rounded-xl md:rounded-2xl font-black uppercase text-[8px] md:text-[9px] tracking-widest transition-all border whitespace-nowrap ${activeTab === tab ? 'bg-white text-black border-white' : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'}`}
                >
                   {tab}
                </button>
             ))}
          </div>
       </header>

       <main className="max-w-7xl mx-auto p-8 pt-16 space-y-12 relative z-10 pb-32">
          <AnimatePresence mode="wait">
             {activeTab === 'overview' && (
                <motion.div 
                   key="overview"
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 20 }}
                   className="grid grid-cols-1 lg:grid-cols-3 gap-12"
                >
                   <div className="lg:col-span-2 space-y-12">
                      <div className="cyber-panel p-12 space-y-8 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-12 opacity-[0.05] scale-[2] pointer-events-none">
                            <details.icon size={100} />
                         </div>
                         <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-tight max-w-xl">
                            The ultimate control center for {details.name} studies.
                         </h2>
                         <p className="text-white/60 text-lg font-bold leading-relaxed max-w-2xl italic">
                            "{details.description}"
                         </p>
                         <div className="flex gap-4 pt-4">
                            <button 
                              onClick={handleStartLearning}
                              className="h-16 px-10 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest shadow-glow flex items-center gap-3 hover:scale-105 transition-all"
                            >
                               Start Learning <ChevronRight size={18} />
                            </button>
                            <button 
                              onClick={() => setSubView('ai-teacher')}
                              className="h-16 px-10 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all flex items-center gap-3"
                            >
                               <MessageSquare size={18} /> Ask AI Teacher
                            </button>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="cyber-panel p-8 space-y-6">
                            <div className="flex items-center gap-4">
                               <PenTool className="text-white/40" />
                               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Assignment Sector</h3>
                            </div>
                            <div className="space-y-4">
                               <p className="text-xs font-bold text-white/60 uppercase">Local Repository Status: ACTIVE</p>
                               <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-white w-2/3 shadow-glow" />
                               </div>
                               <button 
                                 onClick={() => setSubView('assignments')}
                                 className="w-full h-12 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                               >
                                  Submit Report
                               </button>
                            </div>
                         </div>
                         <div className="cyber-panel p-8 space-y-6">
                            <div className="flex items-center gap-4">
                               <Trophy className="text-white/40" />
                               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Achievement Node</h3>
                            </div>
                            <div className="flex items-center gap-6">
                               <div className="h-16 w-16 rounded-2xl bg-[#ffcc00]/10 border border-[#ffcc00]/20 flex items-center justify-center text-[#ffcc00]">
                                  <Trophy size={32} />
                               </div>
                               <div>
                                  <p className="text-xs font-black uppercase tracking-widest">Master of Logic</p>
                                  <p className="text-[8px] font-bold uppercase text-white/20">Unlocked 2 days ago</p>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-8">
                      <div className="cyber-panel p-8 space-y-8">
                         <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Digital Tools</h3>
                         <div className="space-y-4">
                            {details.tools.map(tool => (
                               <button 
                                key={tool.id}
                                onClick={() => setSubView(tool.id)}
                                className="w-full h-20 bg-white/5 border border-white/5 rounded-2xl px-6 flex items-center gap-6 hover:bg-white hover:text-black transition-all group"
                               >
                                  <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-black/5 group-hover:border-black/10 transition-all">
                                     <tool.icon size={20} />
                                  </div>
                                  <div className="flex-1 text-left">
                                     <p className="text-[10px] font-black uppercase tracking-widest">{tool.name}</p>
                                     <p className="text-[8px] font-bold uppercase opacity-40">Integrated module</p>
                                  </div>
                                  <ChevronRight size={16} className="opacity-20 group-hover:translate-x-1 transition-transform" />
                               </button>
                            ))}
                         </div>
                      </div>

                      <div className="cyber-panel p-8 space-y-6">
                         <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Weekly Progress</h3>
                         <div className="h-32 flex items-end gap-2 px-2">
                             {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                               <div 
                                 key={i} 
                                 className="flex-1 bg-white/5 rounded-t-lg relative group transition-all hover:bg-white/10" 
                                 style={{ height: `${h}%` }}
                               >
                                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg shadow-glow" />
                               </div>
                             ))}
                         </div>
                         <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/20 px-1">
                            <span>MON</span>
                            <span>SUN</span>
                         </div>
                      </div>
                   </div>
                </motion.div>
             )}

             {activeTab === 'topics' && !subView && (
                <motion.div 
                   key="topics"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                   className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                   {details.topics.map((topic, i) => (
                      <div key={topic} className="cyber-panel p-8 space-y-6 group hover:border-white/20 cursor-pointer overflow-hidden relative">
                         <div className="absolute -top-4 -right-4 h-24 w-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all" />
                         <div className="space-y-4">
                            <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20">Module {i + 1}</p>
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter">{topic}</h3>
                            <div className="flex gap-2">
                               <div className="h-1 w-8 bg-white rounded-full" />
                               <div className="h-1 w-8 bg-white/10 rounded-full" />
                               <div className="h-1 w-8 bg-white/10 rounded-full" />
                            </div>
                         </div>
                         <p className="text-[10px] font-bold text-white/40 leading-relaxed uppercase">
                            Unlock advanced concepts and smart revision notes for {topic}.
                         </p>
                         <button 
                           onClick={() => openTopic(topic)}
                           className="h-12 w-full bg-white text-black rounded-xl font-black uppercase text-[9px] tracking-widest hover:scale-105 transition-all shadow-glow flex items-center justify-center gap-2"
                         >
                            Enter Module <ArrowRight size={14} />
                         </button>
                      </div>
                   ))}
                </motion.div>
             )}

             {activeTab === 'practice' && !subView && (
                <motion.div 
                   key="practice"
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="space-y-12"
                >
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="cyber-panel p-12 space-y-8">
                         <h3 className="text-4xl font-black uppercase italic tracking-tighter">AI Practice Generator</h3>
                         <p className="text-white/40 font-bold uppercase text-[10px] tracking-widest">Generating custom problem sets based on your level.</p>
                         <div className="grid grid-cols-2 gap-4">
                            <button 
                              onClick={() => { setPracticeMode('rapid'); setSubView('practice-session'); }}
                              className="h-20 bg-white text-black rounded-2xl flex flex-col items-center justify-center gap-2 group hover:scale-[1.02] transition-all shadow-glow"
                            >
                               <Play size={20} />
                               <span className="text-[9px] font-black uppercase tracking-widest">Rapid Fire</span>
                            </button>
                            <button 
                              onClick={() => { setPracticeMode('conceptual'); setSubView('practice-session'); }}
                              className="h-20 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-all group"
                            >
                               <Brain size={20} />
                               <span className="text-[9px] font-black uppercase tracking-widest">Conceptual</span>
                            </button>
                         </div>
                         <button 
                           onClick={() => { setPracticeMode('generator'); setSubView('practice-session'); }}
                           className="w-full h-14 bg-white/5 border border-white/10 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-white hover:text-black transition-all"
                         >
                            Deep Brain Synthesis
                         </button>
                      </div>
                      
                      <div className="cyber-panel p-12 space-y-6">
                         <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Subject Games</h3>
                         <div className="grid grid-cols-1 gap-4">
                             <div 
                               onClick={() => setSubView('game-marathon')}
                               className="h-24 bg-white/5 rounded-2xl border border-white/5 p-6 flex items-center justify-between group cursor-pointer hover:border-white transition-all"
                             >
                                <div className="flex items-center gap-6">
                                   <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-glow">
                                      <Rocket size={24} />
                                   </div>
                                   <div>
                                      <p className="text-sm font-black uppercase italic tracking-tight">The {details.name} Marathon</p>
                                      <p className="text-[8px] font-bold uppercase text-white/20">Unlocked for {user.level} Level</p>
                                   </div>
                                </div>
                                <Play size={16} className="opacity-20" fill="currentColor" />
                             </div>
                         </div>
                      </div>
                   </div>
                </motion.div>
             )}

             {activeTab === 'analytics' && !subView && (
                <motion.div 
                   key="analytics"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                >
                   <AnalyticsDashboard subject={subjectId} />
                </motion.div>
             )}

             {/* Sub-Views */}
             {subView === 'ai-teacher' && (
                <motion.div key="ai-teacher" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
                   <AITeacher subject={details.name} user={user} />
                </motion.div>
             )}

             {subView === 'plot' && (
                <motion.div key="plot" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-6xl mx-auto h-[600px]">
                   <GraphPlotterReal />
                </motion.div>
             )}

             {subView === 'solve' && (
                <motion.div key="solve" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                   <NeuralSolver type="solve" />
                </motion.div>
             )}

             {subView === 'derive' && (
                <motion.div key="derive" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                   <NeuralSolver type="derive" />
                </motion.div>
             )}

             {subView === 'assignments' && (
                <motion.div key="assignments" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                   <AssignmentSector />
                </motion.div>
             )}

             {subView === 'practice-session' && practiceMode && (
                <motion.div key="practice-session" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                   <PracticeEngine subject={subjectId} mode={practiceMode} />
                </motion.div>
             )}

             {subView === 'game-marathon' && (
                <motion.div key="game-marathon" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}>
                   <MathGame subject={details.name} />
                </motion.div>
             )}

             {subView === 'topic-content' && activeTopic && (
                <motion.div key="topic-content" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto space-y-16 pb-32">
                   <div className="space-y-6">
                      <div className="inline-flex items-center gap-3 px-6 py-2 bg-white text-black rounded-full font-black uppercase text-[9px] tracking-[0.2em]">
                         <Brain size={14} /> Neural Exploration Active
                      </div>
                      <h2 className="text-7xl font-black italic uppercase tracking-tighter leading-none">{activeTopic.topic}</h2>
                      <div className="h-1 w-32 bg-white" />
                   </div>

                   <section className="cyber-panel p-12 space-y-8">
                      <h3 className="text-2xl font-black italic uppercase tracking-tight">Theoretical Benchmark</h3>
                      <p className="text-white/80 text-lg leading-relaxed font-bold italic">{activeTopic.explanation}</p>
                   </section>

                   {activeTopic.formulas && (
                      <section className="space-y-8">
                         <h3 className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40">Core Formulas</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {activeTopic.formulas.map((f, i) => (
                               <div key={i} className="cyber-panel p-10 space-y-6 relative group border-white/5">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  <p className="text-[10px] font-black uppercase tracking-widest text-[#00f2ff]">{f.name}</p>
                                  <p className="text-3xl font-black italic tracking-tighter leading-tight bg-white/5 p-6 rounded-2xl">{f.formula}</p>
                                  <p className="text-[10px] font-bold text-white/40 leading-relaxed uppercase">{f.explanation}</p>
                               </div>
                            ))}
                         </div>
                      </section>
                   )}

                   <section className="space-y-8">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40">Logic Benchmarks</h3>
                      <div className="space-y-6">
                         {activeTopic.examples.map((ex, i) => (
                            <div key={i} className="cyber-panel p-10 space-y-8 border-white/5">
                               <div className="space-y-4">
                                  <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Case study {i + 1}</p>
                                  <h4 className="text-2xl font-black uppercase italic tracking-tight">{ex.question}</h4>
                               </div>
                               <div className="space-y-4 p-8 bg-white/5 rounded-3xl border border-white/5">
                                  {ex.steps.map((step, si) => (
                                    <p key={si} className="text-xs font-bold italic text-white/60">• {step}</p>
                                  ))}
                               </div>
                               <div className="flex items-center gap-4">
                                  <CheckCircle2 size={18} className="text-white/40" />
                                  <p className="text-2xl font-black italic">{ex.answer}</p>
                               </div>
                            </div>
                         ))}
                      </div>
                   </section>
                </motion.div>
             )}

             {subView === 'coming-soon' && (
                <div className="h-96 flex flex-col items-center justify-center space-y-6 text-center">
                   <Rocket size={48} className="text-white/10 animate-bounce" />
                   <div className="space-y-2">
                      <h3 className="text-4xl font-black uppercase italic tracking-tighter">Node Under Construction</h3>
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Neural data for this specific topic is currently being extracted.</p>
                   </div>
                   <button onClick={() => setSubView(null)} className="h-12 px-8 bg-white/5 border border-white/10 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-white hover:text-black transition-all">
                      Return to Hub
                   </button>
                </div>
             )}
          </AnimatePresence>
       </main>
    </motion.div>
  );
};
