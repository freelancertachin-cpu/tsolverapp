import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  BookOpen, 
  Lightbulb, 
  Brain,
  MessageSquare,
  ChevronRight,
  Zap,
  Mic,
  Volume2
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

import { storage, UserProfile } from '../lib/storage';

export const AITeacher: React.FC<{ subject: string, user: UserProfile }> = ({ subject, user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `Hello! I am your Neural AI Teacher for ${subject}. How can I assist your learning journey today? I can explain complex theories, solve equations, or generate practice sets.`,
        timestamp: Date.now()
      }]);
    }
  }, [subject]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // AI Logic Simulation (In a real app, this would call a local model or Gemini)
    setTimeout(() => {
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Analysis complete. For your query "${userMsg.content}", I recommend focusing on the fundamental principles of logical deduction. Would you like me to breakdown this topic into step-by-step modules?`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto h-[75vh] flex flex-col cyber-panel overflow-hidden bg-gradient-to-br from-white/[0.02] to-transparent">
      {/* Teacher Header */}
      <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="relative">
             <div className="h-16 w-16 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center">
                <Brain size={32} className="text-[#00f2ff]" />
             </div>
             <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-[#00ff88] rounded-full border-4 border-black" />
          </div>
          <div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Neural AI Teacher</h2>
            <div className="flex items-center gap-3 mt-1">
               <span className="text-[10px] font-black uppercase tracking-widest text-[#00ff88]">Online Node</span>
               <div className="h-1 w-1 rounded-full bg-white/20" />
               <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{subject} Specialization</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <button className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
              <Mic size={18} />
           </button>
           <button className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
              <Volume2 size={18} />
           </button>
        </div>
      </div>

      {/* Chat Space */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide"
      >
        {messages.map((m) => (
          <motion.div 
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-6 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border shrink-0 ${m.role === 'assistant' ? 'bg-[#00f2ff]/10 border-[#00f2ff]/20 text-[#00f2ff]' : 'bg-white/10 border-white/20 text-white overflow-hidden'}`}>
              {m.role === 'assistant' ? (
                <Bot size={20} />
              ) : (
                user.thumbnail || user.avatar ? (
                  <img src={user.thumbnail || user.avatar} className="h-full w-full object-cover" alt="Me" />
                ) : (
                  <User size={20} />
                )
              )}
            </div>
            <div className={`max-w-[70%] space-y-2 ${m.role === 'user' ? 'text-right' : ''}`}>
               <div className={`p-6 rounded-[32px] text-sm font-bold leading-relaxed italic ${m.role === 'assistant' ? 'bg-white/5 text-white/80 rounded-tl-none' : 'bg-white text-black rounded-tr-none'}`}>
                 {m.content}
               </div>
               <p className="text-[8px] font-black uppercase tracking-widest opacity-20">
                 {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </p>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex gap-6">
            <div className="h-12 w-12 rounded-2xl bg-[#00f2ff]/10 border border-[#00f2ff]/20 flex items-center justify-center text-[#00f2ff]">
              <Bot size={20} />
            </div>
            <div className="flex gap-1.5 items-center mt-4">
               {[0, 1, 2].map(i => (
                 <motion.div 
                  key={i}
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  className="h-1.5 w-3 bg-[#00f2ff] rounded-full opacity-40" 
                 />
               ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Module */}
      <div className="p-8 bg-black/40 border-t border-white/5 backdrop-blur-md">
         <div className="relative group max-w-4xl mx-auto">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask your neural teacher anything..."
              className="w-full h-20 bg-white/5 border border-white/10 rounded-[32px] pl-8 pr-32 text-sm font-bold focus:outline-none focus:border-[#00f2ff]/40 transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
               <button 
                onClick={handleSend}
                className="h-14 w-14 bg-white text-black rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-glow"
               >
                  <Send size={20} />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};
