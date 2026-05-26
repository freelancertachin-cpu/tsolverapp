
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  Mail, 
  MessageCircle, 
  Globe, 
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-24 pb-32">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-16">
         <div className="flex-1 space-y-12">
            <div className="space-y-6">
               <h2 className="text-7xl font-black italic uppercase tracking-tighter leading-none">Connect with<br />The Hive</h2>
               <p className="text-[11px] font-black uppercase tracking-[1em] text-white/20">Operational support channel</p>
            </div>

            <div className="space-y-8">
               <div className="flex items-center gap-8 group cursor-pointer">
                  <div className="h-16 w-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                     <Mail size={24} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Direct Transmission</p>
                     <p className="text-xl font-black uppercase tracking-tight">tsolverofficial@gmail.com</p>
                  </div>
               </div>

               <a href="https://wa.me/8801940773721" target="_blank" className="flex items-center gap-8 group cursor-pointer">
                  <div className="h-16 w-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                     <MessageCircle size={24} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Realtime Patch</p>
                     <p className="text-xl font-black uppercase tracking-tight">WhatsApp HQ</p>
                  </div>
               </a>
            </div>

            <div className="cyber-panel p-10 bg-white/[0.01] border-white/5 flex items-center gap-8">
               <Clock size={32} className="text-white/20" />
               <div>
                  <p className="text-xs font-black uppercase tracking-widest">Global Support Uptime</p>
                  <p className="text-[10px] font-bold uppercase text-white/20">Response frequency: 09:00 - 22:00 BST</p>
               </div>
            </div>
         </div>

         <div className="flex-1 w-full lg:w-auto">
            <form onSubmit={handleSubmit} className="cyber-panel p-12 space-y-10 relative">
               <div className="space-y-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Neural Identity</label>
                     <input 
                        required
                        placeholder="Your Name"
                        className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 font-bold uppercase text-xs tracking-widest focus:border-white transition-all outline-none"
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Return Address</label>
                     <input 
                        required
                        type="email"
                        placeholder="your@email.com"
                        className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 font-bold uppercase text-xs tracking-widest focus:border-white transition-all outline-none"
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Message Payload</label>
                     <textarea 
                        required
                        placeholder="Detailed inquiry..."
                        className="w-full h-48 bg-white/5 border border-white/10 rounded-[32px] p-8 font-bold uppercase text-xs tracking-widest focus:border-white transition-all outline-none resize-none no-scrollbar"
                     />
                  </div>
               </div>

               <button 
                  type="submit"
                  disabled={sent}
                  className="w-full h-20 bg-white text-black rounded-3xl font-black uppercase text-xs tracking-[0.4em] shadow-glow hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
               >
                  {sent ? (
                     <><CheckCircle2 size={24} /> Transmission Success</>
                  ) : (
                     <><Send size={20} /> Deploy Signal</>
                  )}
               </button>

               {sent && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-16 left-0 right-0 text-center text-emerald-500 text-[10px] font-black uppercase tracking-widest"
                  >
                     Signal received. Preparing neural response.
                  </motion.div>
               )}
            </form>
         </div>
      </div>
    </div>
  );
};
