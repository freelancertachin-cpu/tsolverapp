import React from 'react';
import { 
  Dialog, 
  DialogContent, 
} from "@/components/ui/dialog";
import { Share, PlusSquare, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface PWAInstallDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallDialog: React.FC<PWAInstallDialogProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-black border border-white/10 p-8 rounded-[40px] shadow-2xl overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-white/40 hover:text-white transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-8 pt-4">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-20 w-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
               <PlusSquare className="h-10 w-10 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tight italic">Install T-Solver</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">iOS / Safari Instructions</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                 <Share className="h-4 w-4 text-white" />
              </div>
              <p className="text-xs font-bold text-white/80">1. Tap the Share button in Safari</p>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                 <PlusSquare className="h-4 w-4 text-white" />
              </div>
              <p className="text-xs font-bold text-white/80">2. Select 'Add to Home Screen'</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full h-14 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Got it
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
