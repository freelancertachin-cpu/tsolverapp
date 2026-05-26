import React from 'react';
import { 
  Dialog, 
  DialogContent, 
} from "@/components/ui/dialog";
import { User, Briefcase, GraduationCap, X, Download, ExternalLink, MapPin, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

interface OwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  isIOS: boolean;
  onInstall: () => void;
}

export const OwnerModal: React.FC<OwnerModalProps> = ({ isOpen, onClose, isInstallable, isIOS, onInstall }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#1a1a1a] border border-white/10 p-0 rounded-[32px] overflow-hidden shadow-2xl no-scrollbar">
        <div className="relative p-10 space-y-12">
          {/* Close Background Button */}
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 text-white/40 hover:text-white transition-all"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shadow-glow">
                <User className="h-8 w-8 text-white/40" />
              </div>
              <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tight text-white leading-tight">Owner Details</h2>
              </div>
            </div>
          </div>

          {(isInstallable || isIOS) && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 rounded-[32px] bg-white text-black space-y-4 shadow-[0_0_40px_rgba(255,255,255,0.2)] border border-white"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-black flex items-center justify-center shadow-lg animate-pulse">
                  <Download className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-black uppercase text-xs tracking-widest">Install T-Solver</h3>
                  <p className="text-[10px] font-bold opacity-60">Experience Gemini AI</p>
                </div>
              </div>
              <button 
                onClick={onInstall}
                className="w-full h-14 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
              >
                Download App
              </button>
            </motion.div>
          )}

          {/* Details Sections */}
          <div className="space-y-10">
            {/* Identity */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 text-white/40 font-black uppercase text-[10px] tracking-[0.2em]">
                <User size={14} /> Full Name / নাম
              </div>
              <div className="space-y-2 pl-7 font-bold">
                <p className="text-white text-lg">EN: Tachin Ahmed Rion</p>
                <p className="text-white/60 text-lg">BN: তাছিন আহমেদ রিয়ন</p>
              </div>
            </div>

            {/* Official Links */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-white/40 font-black uppercase text-[10px] tracking-[0.2em]">
                <Briefcase size={14} /> Official Links
              </div>
              <div className="grid grid-cols-1 gap-2 pl-7">
                {[
                  { name: 'Vintorex Shop.bd', url: 'https://www.facebook.com/share/1EDcvWJVtc/' },
                  { name: 'Vintorex resell', url: 'https://www.facebook.com/share/1BR5KJaQM8/' },
                  { name: 'Freelancer Tachin', url: 'https://www.facebook.com/share/1cYo3ZgQqD/' },
                  { name: 'Personal Profile', url: 'https://www.facebook.com/share/1AWJjuxJy9/' },
                  { name: 'VintoxBd IT Institute', url: 'https://www.facebook.com/share/1CNrMcMPYq/' },
                  { name: 'Tachin AI', url: 'https://tachin-ai-server--tachinahmed.replit.app/?id=4' },
                ].map((link) => (
                  <a 
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
                  >
                    <span className="text-xs font-bold text-white/80 group-hover:text-white">{link.name}</span>
                    <div className="h-6 w-6 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <ExternalLink size={12} className="text-white" />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-6 pt-4 border-t border-white/5">
              <div className="flex items-center gap-3 text-white/40 font-black uppercase text-[10px] tracking-[0.2em]">
                <MapPin size={14} /> Location / ঠিকানা
              </div>
              <div className="pl-7 space-y-4">
                <p className="text-sm font-bold text-white/80">Kumail, Islampur, Dhamrai, Dhaka</p>
                <a 
                  href="https://maps.app.goo.gl/5ydxh55iHzWmafMw7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-4 px-6 h-12 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-[1.05] transition-all"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
            {/* Design Recovery System (Hidden/Dev mode) */}
            <div className="pt-10 border-t border-white/5 space-y-6">
               <div className="flex items-center gap-3 text-white/10 font-black uppercase text-[8px] tracking-[0.5em]">
                  <RotateCcw size={10} /> Design Heritage System
               </div>
               <button 
                onClick={() => {
                  if(confirm("Restore previous stable design? This will reload the app.")) {
                    localStorage.removeItem('tsolver_design_restored');
                    window.location.reload();
                  }
                }}
                className="w-full h-12 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white hover:bg-white/10 transition-all font-mono"
               >
                 Rollback to Original UI
               </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
