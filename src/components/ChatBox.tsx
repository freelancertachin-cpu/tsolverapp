import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Brain, 
  Trash2, 
  Sparkles, 
  Image as ImageIcon,
  Loader2,
  User,
  Bot,
  Cpu,
  Zap,
  Mic,
  FileText,
  LineChart,
  Calculator as CalcIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { storage, ChatMessage, UserProfile } from '../lib/storage';
import { localAI } from '../lib/localAI';
import { useTranslation } from '../lib/useTranslation';
import ReactMarkdown from 'react-markdown';

export const ChatBox: React.FC<{ user: UserProfile }> = ({ user }) => {
  if (!user) return null;
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<string | null>(null);

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

  useEffect(() => {
    const loadChats = async () => {
      if (!user?.id) return;
      const history = await storage.getChats(user.id);
      setMessages(history);
    };
    loadChats();
  }, [user?.id]);

  useEffect(() => {
    const tempSolve = localStorage.getItem('tsolver_temp_solve');
    if (tempSolve) {
      setInput(tempSolve);
      localStorage.removeItem('tsolver_temp_solve');
      // Auto-send if it's substantial
      if (tempSolve.length > 5) {
        handleSend(tempSolve);
      }
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (customInput?: string) => {
    const textToSend = customInput || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      text: textToSend,
      sender: 'user',
      timestamp: Date.now(),
      category: 'general',
      imageBase64: imageFile || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const sentImage = imageFile;
    setImageFile(null);
    setLoading(true);

    try {
      await storage.saveChat(userMsg);
      const response = await localAI.process(textToSend, 'general', useThinking, user.level, sentImage || undefined);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        userId: user.id,
        text: response,
        sender: 'bot',
        timestamp: Date.now(),
        category: 'general'
      };

      await storage.saveChat(botMsg);
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[85vh] md:h-[75vh] bg-[#1a1a1a] border border-white/10 rounded-[24px] md:rounded-[40px] overflow-hidden shadow-2xl">
       {/* Header */}
      <div className="px-4 md:px-8 py-6 md:py-8 border-b border-white/5 space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 md:gap-5">
            <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
               <div className="h-5 w-5 border-2 border-white/20 rounded-md" />
            </div>
            <div className="space-y-0.5 md:space-y-1">
              <h3 className="text-lg md:text-2xl font-black tracking-tight text-white uppercase italic">T-Solver Assistant</h3>
              <div className="flex items-center gap-2 text-white/40">
                <Sparkles size={10} className="text-white/20" />
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">{t.greeting}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between md:justify-end gap-3">
            <div className="flex items-center gap-3 md:gap-4 px-4 md:px-6 h-10 md:h-12 rounded-xl md:rounded-2xl bg-white/5 border border-white/10">
               <Brain size={14} className={`h-3.5 w-3.5 md:h-4 md:w-4 ${useThinking ? 'text-white animate-pulse' : 'text-white/20'}`} />
               <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em]">THINKING</span>
               <Switch checked={useThinking} onCheckedChange={setUseThinking} className="scale-75" />
            </div>
          </div>
        </div>

        {/* Quick Action Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => handleSend("Solve Math")}
            className="shrink-0 h-9 px-4 rounded-full bg-white/5 border border-white/10 flex items-center gap-2 text-[9px] font-black uppercase tracking-wide hover:bg-white/10 transition-all text-white/60"
          >
            <Zap size={10} /> Solve Math
          </button>
          <button 
            onClick={() => handleSend("Translate")}
            className="shrink-0 h-9 px-4 rounded-full bg-white/5 border border-white/10 flex items-center gap-2 text-[9px] font-black uppercase tracking-wide hover:bg-white/10 transition-all text-white/60"
          >
            <Zap size={10} /> Translate
          </button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-8" ref={scrollRef}>
        <div className="space-y-10">
          {messages.length === 0 && (
            <div className="py-12 flex flex-col items-center text-center space-y-12">
               <motion.div 
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="h-24 w-24 rounded-[32px] border-2 border-white/5 flex items-center justify-center bg-white/5 shadow-glow"
               >
                  <Bot className="h-10 w-10 text-white/40" />
               </motion.div>
               <div className="space-y-2">
                 <p className="text-xl font-black uppercase italic tracking-tighter">AI Assistant Active</p>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">{t.desc.substring(0, 30)}...</p>
               </div>
            </div>
          )}
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-4 max-w-[85%] ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${m.sender === 'user' ? 'bg-white' : 'bg-black border border-white/20'}`}>
                  {m.sender === 'user' ? (
                    user.thumbnail || user.avatar ? (
                      <img src={user.thumbnail || user.avatar} className="h-8 w-8 rounded-xl object-cover border border-white/20" alt="Me" />
                    ) : (
                      <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center">
                        <User size={18} className="text-black" />
                      </div>
                    )
                  ) : (
                    <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center">
                      <Bot size={18} className="text-white" />
                    </div>
                  )}
                </div>
                <div className={`p-6 rounded-3xl text-[13px] leading-relaxed flex flex-col gap-3 ${m.sender === 'user' ? 'bg-white text-black font-bold rounded-tr-none' : 'bg-[#1a1a1a] border border-white/5 rounded-tl-none text-white'}`}>
                   {(m as any).imageBase64 && (
                     <img src={(m as any).imageBase64} alt="Attachment" className="max-w-[200px] rounded-xl border border-black/10 dark:border-white/10" />
                   )}
                   <div className="markdown-body">
                      <ReactMarkdown>{m.text}</ReactMarkdown>
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-4 items-center">
                <div className="h-10 w-10 rounded-2xl bg-black border border-white/20 flex items-center justify-center">
                  <Bot size={18} className="text-white animate-pulse" />
                </div>
                <div className="p-5 rounded-3xl bg-[#1a1a1a] border border-white/5 rounded-tl-none">
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map(i => (
                      <motion.div 
                        key={i}
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        className="h-1.5 w-1.5 bg-white rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-8 bg-black border-t border-white/5 space-y-6">
        {/* Dynamic Action Ribbons (Always Visible Below Input logic) */}
        <div className="flex flex-col gap-4">
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
          {imageFile && (
            <div className="relative h-16 w-16 rounded-xl overflow-hidden border border-white/20">
              <img src={imageFile} alt="Preview" className="h-full w-full object-cover" />
              <button onClick={() => setImageFile(null)} className="absolute top-1 right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-black">X</button>
            </div>
          )}
          <div className="flex items-center gap-4 p-2 pl-6 bg-white/5 border border-white/10 rounded-3xl focus-within:border-white/40 transition-all shadow-glow">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.greeting + "..."}
              className="flex-1 bg-transparent border-none outline-none py-4 text-sm font-bold text-white placeholder:text-white/10"
            />
            <div className="flex items-center gap-2 pr-2">
              <button onClick={() => fileInputRef.current?.click()} className="h-11 w-11 text-white/20 hover:text-white transition-all flex items-center justify-center rounded-xl hover:bg-white/5">
                <ImageIcon size={20} />
              </button>
              <button className="h-11 w-11 text-white/20 hover:text-white transition-all flex items-center justify-center rounded-xl hover:bg-white/5">
                <Mic size={20} />
              </button>
              <button 
                onClick={() => handleSend()} 
                disabled={loading || !input.trim()}
                className="h-11 w-11 bg-white text-black rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>

          {/* Quick Actions & Local Shortcuts */}
          <div className="flex flex-wrap items-center gap-2">
            <ShortcutBtn icon={<ImageIcon size={12} />} label="OCR SCAN" onClick={() => handleSend("Trigger local OCR scan...")} />
            <ShortcutBtn icon={<LineChart size={12} />} label="Plot Graph" onClick={() => handleSend("Open Graph Engine")} />
            <ShortcutBtn icon={<CalcIcon size={12} />} label="Calculator" onClick={() => handleSend("Activate Calc")} />
            <ShortcutBtn icon={<Zap size={12} />} label="Math Solve" onClick={() => handleSend("Explain formula...")} />
            <ShortcutBtn icon={<FileText size={12} />} label="Assignments" onClick={() => handleSend("Assignment help")} />
          </div>

          {/* Prompt Suggestions */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
             {['Explain Photosynthesis', 'Newton second law', 'Solve x^2+5x+6=0', 'Physics Formula', 'English Grammar'].map((prompt) => (
               <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="shrink-0 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-white hover:bg-white/10 transition-all"
               >
                 {prompt}
               </button>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function ShortcutBtn({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="h-9 px-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5 text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all group"
    >
      <span className="text-white/40 group-hover:text-black transition-colors">{icon}</span>
      <span className="text-white/60 group-hover:text-black transition-colors">{label}</span>
    </button>
  );
}
