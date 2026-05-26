import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  FileText, 
  Star, 
  Trash2, 
  Tag, 
  Brain, 
  Zap, 
  ChevronRight,
  Clock,
  Sparkles,
  SearchIcon
} from 'lucide-react';
import { storage, SmartNote } from '../lib/storage';

export const SmartNotes: React.FC<{ userId: string }> = ({ userId }) => {
  const [notes, setNotes] = useState<SmartNote[]>([]);
  const [activeNote, setActiveNote] = useState<SmartNote | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', category: 'General' });

  useEffect(() => {
    loadNotes();
  }, [userId]);

  const loadNotes = async () => {
    const allNotes = await storage.getNotes(userId);
    setNotes(allNotes.sort((a, b) => b.timestamp - a.timestamp));
  };

  const handleSave = async () => {
    const note: SmartNote = {
      id: activeNote?.id || crypto.randomUUID(),
      userId,
      title: newNote.title,
      content: newNote.content,
      category: newNote.category,
      tags: [],
      isFavorite: false,
      timestamp: Date.now(),
      summary: 'Auto-generating...',
      keywords: ['Concept', 'Logic']
    };
    await storage.saveNote(note);
    setIsCreating(false);
    setActiveNote(null);
    setNewNote({ title: '', content: '', category: 'General' });
    loadNotes();
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto h-[70vh] flex gap-8">
      {/* Sidebar */}
      <div className="w-80 flex flex-col gap-6 h-full">
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <input 
            type="text" 
            placeholder="Search neural notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 text-sm font-bold focus:outline-none focus:border-white/30 transition-all"
          />
        </div>

        <button 
          onClick={() => { setIsCreating(true); setActiveNote(null); }}
          className="h-16 bg-white text-black rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest shadow-glow hover:scale-[1.02] transition-all"
        >
          <Plus size={18} /> Create New Note
        </button>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
          {filteredNotes.map(note => (
            <motion.div 
              key={note.id}
              onClick={() => setActiveNote(note)}
              className={`p-6 rounded-3xl border transition-all cursor-pointer group ${activeNote?.id === note.id ? 'bg-white text-black border-white' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${activeNote?.id === note.id ? 'bg-black/10 text-black' : 'bg-white/10 text-white/40'}`}>
                  {note.category}
                </div>
                {note.isFavorite && <Star size={12} fill="currentColor" />}
              </div>
              <h4 className="text-sm font-black uppercase italic tracking-tighter line-clamp-1">{note.title}</h4>
              <p className={`text-[10px] font-bold mt-1 line-clamp-1 opacity-40`}>
                {new Date(note.timestamp).toLocaleDateString()}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 cyber-panel flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {isCreating || activeNote ? (
            <motion.div 
              key={activeNote?.id || 'new'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col p-12 overflow-y-auto scrollbar-hide"
            >
              <div className="flex items-center justify-between mb-12">
                <input 
                  type="text"
                  placeholder="Note Title"
                  value={isCreating ? newNote.title : activeNote?.title}
                  onChange={(e) => isCreating ? setNewNote({...newNote, title: e.target.value}) : setActiveNote({...activeNote!, title: e.target.value})}
                  className="bg-transparent text-5xl font-black italic uppercase tracking-tighter focus:outline-none placeholder:text-white/10 w-full"
                />
                <div className="flex items-center gap-4">
                  <button className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                    <Star size={18} />
                  </button>
                  <button onClick={handleSave} className="h-12 px-8 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest shadow-glow">
                    Sync
                  </button>
                </div>
              </div>

              <textarea 
                placeholder="Start writing neural concepts..."
                value={isCreating ? newNote.content : activeNote?.content}
                onChange={(e) => isCreating ? setNewNote({...newNote, content: e.target.value}) : setActiveNote({...activeNote!, content: e.target.value})}
                className="flex-1 bg-transparent text-lg font-bold italic leading-relaxed focus:outline-none placeholder:text-white/5 min-h-[400px] resize-none"
              />

              {(activeNote?.summary || isCreating) && (
                <div className="mt-12 p-8 bg-white/5 border border-white/5 rounded-[40px] space-y-6">
                  <div className="flex items-center gap-3">
                    <Brain size={20} className="text-white/40" />
                    <p className="text-[10px] font-black uppercase tracking-widest">AI Neural Summary</p>
                  </div>
                  <p className="text-xs font-bold leading-relaxed text-white/40 italic">
                    {activeNote?.summary || "Neural summary will be generated after synchronization."}
                  </p>
                  <div className="flex gap-3">
                    {(activeNote?.keywords || ['Logic', 'Study']).map(kw => (
                      <span key={kw} className="px-4 py-1.5 bg-white/5 rounded-full text-[9px] font-black uppercase tracking-widest text-white/60">#{kw}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 p-24">
              <div className="h-24 w-24 rounded-[40px] bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
                <FileText size={40} className="text-white/10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-4xl font-black uppercase italic tracking-tighter">Select Neural Note</h3>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">All your study concepts archived locally.</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
