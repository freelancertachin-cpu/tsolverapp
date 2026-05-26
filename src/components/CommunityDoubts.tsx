import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Bookmark, CheckCircle2, ChevronRight, Hash, HelpCircle, Image as ImageIcon, MessageSquare, Plus, Search, Send, Share2, ThumbsUp, X } from 'lucide-react';
import { UserProfile } from '../lib/storage';
import { useTranslation } from '../lib/useTranslation';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Comments } from './Comments';
import { getSubjectsForProfile } from '../lib/subjects';
import { getChaptersForSubject } from '../lib/chapters';
import { securityEngine } from '../services/security';
import { realtimeBus } from '../services/realtime';

interface Doubt {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  subject: string;
  chapter: string;
  title: string;
  content: string;
  imageUrl?: string[];
  likes: number;
  replies: number;
  bookmarks: number;
  anonymous?: boolean;
  status: 'pending' | 'approved' | 'resolved';
  timestamp: number;
}

const STORAGE_KEY = 'tsolver_community_doubts';

const demoDoubts: Doubt[] = [];


const loadDoubts = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Doubt[];
    return saved;
  } catch {
    return [];
  }
};

export const CommunityDoubts: React.FC<{ user: UserProfile }> = ({ user }) => {
  const { t } = useTranslation();
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [sortMode, setSortMode] = useState<'newest' | 'liked' | 'answered' | 'unanswered'>('newest');

  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [duplicateHint, setDuplicateHint] = useState('');
  const [success, setSuccess] = useState(false);
  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);

  const subjects = useMemo(() => getSubjectsForProfile(user.level), [user.level]);
  const chapters = useMemo(() => getChaptersForSubject(subject), [subject]);

  useEffect(() => {
    setDoubts(loadDoubts());
  }, []);

  useEffect(() => {
    if (!content.trim() || content.trim().length < 20) {
      setDuplicateHint('');
      return;
    }
    const query = content.toLowerCase().slice(0, 80);
    const similar = doubts.find((doubt) => doubt.subject === subject && doubt.content.toLowerCase().includes(query.split(' ').slice(0, 5).join(' ')));
    setDuplicateHint(similar ? `Similar doubt may exist: ${similar.title || similar.content.slice(0, 48)}` : 'No strong duplicate found.');
  }, [content, doubts, subject]);

  const persist = (items: Doubt[]) => {
    setDoubts(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    realtimeBus.publish('study:progress', { type: 'community-doubts-updated', count: items.length }, user.id);
  };

  const handleSubmit = async () => {
    if (!subject || !content.trim()) return;
    const limit = securityEngine.rateLimit(`doubt-${user.id}`, 8, 60_000);
    if (!limit.allowed) {
      setDuplicateHint('Too many posts. Try again after a short cooldown.');
      return;
    }

    setLoading(true);
    const cleanContent = securityEngine.sanitizeText(content);
    const cleanTitle = securityEngine.sanitizeText(title || cleanContent.slice(0, 60));

    const newDoubt: Doubt = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: anonymous ? 'Anonymous Student' : user.name,
      userAvatar: anonymous ? undefined : user.avatar,
      subject,
      chapter: chapter || getChaptersForSubject(subject)[0],
      title: cleanTitle,
      content: cleanContent,
      likes: 0,
      replies: 0,
      bookmarks: 0,
      anonymous,
      status: 'pending',
      timestamp: Date.now()
    };

    window.setTimeout(() => {
      persist([newDoubt, ...doubts]);
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setIsAsking(false);
        setSuccess(false);
        setSubject('');
        setChapter('');
        setTitle('');
        setContent('');
        setAnonymous(false);
      }, 1200);
    }, 600);
  };

  const reactToDoubt = (id: string, field: 'likes' | 'bookmarks') => {
    persist(doubts.map((doubt) => doubt.id === id ? { ...doubt, [field]: doubt[field] + 1 } : doubt));
  };

  const filteredDoubts = useMemo(() => {
    const filtered = doubts.filter((doubt) =>
      (selectedSubject === 'All' || doubt.subject === selectedSubject) &&
      (doubt.content.toLowerCase().includes(searchQuery.toLowerCase()) || doubt.title.toLowerCase().includes(searchQuery.toLowerCase()) || doubt.subject.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return filtered.sort((a, b) => {
      if (sortMode === 'liked') return b.likes - a.likes;
      if (sortMode === 'answered') return b.replies - a.replies;
      if (sortMode === 'unanswered') return a.replies - b.replies;
      return b.timestamp - a.timestamp;
    });
  }, [doubts, searchQuery, selectedSubject, sortMode]);

  return (
    <div className="w-full space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-4">
          <h2 className="text-5xl font-black uppercase tracking-tighter italic lg:text-7xl">{t.doubts}</h2>
          <p className="text-black/50 dark:text-white/40 text-xs font-bold uppercase tracking-widest flex items-center gap-3">
            Reddit + Quora style study community <span className="h-1 w-1 bg-black/20 dark:bg-white/20 rounded-full" /> {doubts.length} Doubts
          </p>
        </div>

        <button onClick={() => setIsAsking(true)} className="h-16 px-10 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-glow flex items-center gap-3">
          <Plus size={20} /> Ask Your Doubt
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-black/25 dark:text-white/20 group-hover:text-black/45 dark:group-hover:text-white/40 transition-colors" size={20} />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search community doubts..." className="h-14 pl-16 bg-white dark:bg-white/5 border-black/10 dark:border-white/10 rounded-2xl text-sm font-bold text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/10" />
          </div>
          <select value={sortMode} onChange={(e) => setSortMode(e.target.value as any)} className="h-14 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-6 outline-none text-[10px] font-black uppercase tracking-widest text-black dark:text-white">
            <option value="newest" className="bg-white text-black dark:bg-black dark:text-white">Newest</option>
            <option value="liked" className="bg-white text-black dark:bg-black dark:text-white">Most Liked</option>
            <option value="answered" className="bg-white text-black dark:bg-black dark:text-white">Most Answered</option>
            <option value="unanswered" className="bg-white text-black dark:bg-black dark:text-white">Unanswered</option>
          </select>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {['All', ...subjects].map((item) => (
            <button key={item} onClick={() => setSelectedSubject(item)} className={`h-12 px-6 rounded-2xl border transition-all text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${selectedSubject === item ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-glow' : 'bg-white border-black/10 text-black/55 hover:bg-black/5 dark:bg-white/5 dark:border-white/10 dark:text-white/40 dark:hover:bg-white/10'}`}>
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredDoubts.length === 0 && (
          <div className="cyber-panel p-10 text-center space-y-3">
            <p className="text-sm font-black uppercase tracking-widest text-white/45">No doubts found</p>
            <p className="text-xs font-bold text-white/30">Ask the first real question from your class or subject.</p>
          </div>
        )}
        <AnimatePresence mode="popLayout">
          {filteredDoubts.map((doubt, idx) => (
            <motion.div key={doubt.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.03 }} className="cyber-panel p-8 space-y-7 group relative overflow-hidden">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-[20px] bg-white/5 border border-white/10 overflow-hidden">
                    {doubt.userAvatar ? <img src={doubt.userAvatar} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-white/20 uppercase font-black text-xs">{doubt.userName.charAt(0)}</div>}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black uppercase italic tracking-tight">{doubt.userName}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">{doubt.subject}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/20">{doubt.chapter}</span>
                    </div>
                  </div>
                </div>
                <div className="text-[9px] font-black uppercase tracking-widest text-white/10">{new Date(doubt.timestamp).toLocaleDateString()}</div>
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-black uppercase italic tracking-tight text-white/90">{doubt.title}</h3>
                <p className="text-base font-bold text-white/65 leading-relaxed">{doubt.content}</p>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/5">
                <button onClick={() => reactToDoubt(doubt.id, 'likes')} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors group"><ThumbsUp size={16} className="group-hover:scale-125 transition-transform" /> {doubt.likes} Reacts</button>
                <button onClick={() => setSelectedDoubt(doubt)} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors group"><MessageSquare size={16} className="group-hover:rotate-12 transition-transform" /> {doubt.replies} Replies</button>
                <button onClick={() => reactToDoubt(doubt.id, 'bookmarks')} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors group"><Bookmark size={16} /> {doubt.bookmarks} Saves</button>
                <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors ml-auto group"><Share2 size={16} /> Share</button>
              </div>

              {doubt.status === 'pending' && <div className="absolute top-4 right-4 flex items-center gap-2 text-amber-500/60 font-black uppercase text-[8px] tracking-[0.3em] bg-amber-500/5 px-4 py-2 rounded-full border border-amber-500/20"><AlertCircle size={10} /> Pending</div>}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isAsking && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-3xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-2xl bg-black border border-white/10 rounded-[56px] overflow-hidden shadow-2xl relative">
              <div className="p-8 md:p-12 space-y-9 max-h-[85vh] overflow-y-auto no-scrollbar">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <h3 className="text-4xl font-black uppercase italic tracking-tighter">Ask The Community</h3>
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">Dynamic subject + chapter + duplicate warning</p>
                  </div>
                  <button onClick={() => setIsAsking(false)} className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all border border-white/10"><X size={24} /></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 ml-2">Subject</Label>
                    <select value={subject} onChange={(e) => { setSubject(e.target.value); setChapter(''); }} className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 outline-none text-[10px] font-black uppercase tracking-widest text-white appearance-none cursor-pointer focus:border-white/30 transition-all">
                      <option value="" className="bg-black">Select Subject</option>
                      {subjects.map((item) => <option key={item} value={item} className="bg-black">{item}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 ml-2">Chapter</Label>
                    <select value={chapter} onChange={(e) => setChapter(e.target.value)} className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 outline-none text-[10px] font-black uppercase tracking-widest text-white appearance-none cursor-pointer focus:border-white/30 transition-all">
                      <option value="" className="bg-black">Auto / Select Chapter</option>
                      {chapters.map((item) => <option key={item} value={item} className="bg-black">{item}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 ml-2">Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short title" className="h-14 bg-white/5 border-white/10 rounded-2xl pl-6 text-sm font-bold text-white" />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 ml-2">Doubt Content</Label>
                  <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your academic challenge here..." className="w-full h-44 bg-white/5 border border-white/10 rounded-[32px] p-7 outline-none text-sm font-bold text-white placeholder:text-white/10 focus:border-white/30 transition-all resize-none no-scrollbar" />
                  {duplicateHint && <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-200/60">{duplicateHint}</p>}
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <button className="flex-1 h-14 bg-white/5 border border-dashed border-white/20 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all group"><ImageIcon size={18} className="text-white/20 group-hover:text-white transition-colors" /><span className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white transition-colors">Attach Image</span></button>
                  <button onClick={() => setAnonymous(!anonymous)} className={`h-14 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${anonymous ? 'bg-purple-500/20 border-purple-400/40 text-purple-100' : 'bg-white/5 border-white/10 text-white/30'}`}>Anonymous: {anonymous ? 'On' : 'Off'}</button>
                </div>

                <Button onClick={handleSubmit} disabled={loading || success || !subject || !content.trim()} className="w-full h-16 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest shadow-glow hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20 flex items-center justify-center gap-4">
                  {loading ? <Loader2 /> : success ? <><CheckCircle2 size={20} /> Success</> : <><Send size={18} /> Post Doubt</>}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedDoubt && (
          <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-2xl overflow-y-auto no-scrollbar">
            <div className="max-w-4xl mx-auto p-6 md:p-20 space-y-16">
              <div className="flex items-center justify-between">
                <button onClick={() => setSelectedDoubt(null)} className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"><ChevronRight size={24} className="rotate-180" /></button>
                <button className="h-14 px-10 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Share Node</button>
              </div>

              <div className="space-y-12">
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-[32px] bg-white/5 border border-white/10 overflow-hidden">{selectedDoubt.userAvatar ? <img src={selectedDoubt.userAvatar} /> : <div className="h-full w-full flex items-center justify-center font-black text-2xl text-white/10">{selectedDoubt.userName.charAt(0)}</div>}</div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">{selectedDoubt.title}</h2>
                    <div className="flex items-center gap-4"><span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/20">{selectedDoubt.subject}</span><span className="text-[10px] font-black uppercase tracking-widest text-white/20">{new Date(selectedDoubt.timestamp).toLocaleString()}</span></div>
                  </div>
                </div>

                <div className="p-10 bg-white/[0.03] border border-white/10 rounded-[48px] space-y-8">
                  <div className="space-y-4"><span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Query Content</span><p className="text-2xl md:text-3xl font-black italic uppercase leading-relaxed text-white/90">{selectedDoubt.content}</p></div>
                  <div className="grid grid-cols-2 gap-8 text-[11px] font-black uppercase tracking-widest text-white/20 pt-8 border-t border-white/5"><div className="flex items-center gap-4"><Hash size={16} /> Chapter: {selectedDoubt.chapter}</div><div className="flex items-center gap-4"><HelpCircle size={16} /> Status: {selectedDoubt.status}</div></div>
                </div>
                <Comments contentId={selectedDoubt.id} user={user} />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

function Loader2() {
  return <div className="animate-spin"><ChevronRight /></div>;
}
