import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, Download, CheckCircle2, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] glass border-none neon-glow p-0 overflow-hidden">
        <div className="bg-primary/10 p-6 flex items-center gap-4 border-b border-primary/20">
          <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Download className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <DialogTitle className="text-xl font-black tracking-tight text-primary">INSTALL T-SOLVER</DialogTitle>
            <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
              Progressive Web App (PWA)
            </DialogDescription>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <section className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-secondary/50 border border-border group transition-all hover:border-primary/50">
              <Smartphone className="h-8 w-8 text-primary mt-1" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold">Mobile (Android/iOS)</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Open in Chrome or Safari. Tap the <span className="font-bold text-foreground">Menu</span> or <span className="font-bold text-foreground">Share</span> icon, then select <span className="text-primary font-bold">"Add to Home Screen"</span>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-secondary/50 border border-border group transition-all hover:border-primary/50">
              <Monitor className="h-8 w-8 text-primary mt-1" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold">Desktop (Windows/Mac)</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Click the <span className="text-primary font-bold">"Install App"</span> icon in the browser address bar (top right) or the Chrome Menu.
                </p>
              </div>
            </div>
          </section>

          <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
            <Info className="h-4 w-4 text-primary shrink-0" />
            <p className="text-[10px] font-medium leading-normal">
              T-Solver is a modern Web App. It doesn't require an APK or EXE. Once installed, it works offline and launches like a real desktop/mobile application.
            </p>
          </div>
        </div>

        <DialogFooter className="p-6 bg-secondary/10">
          <Button onClick={onClose} className="w-full font-black uppercase tracking-[0.2em] text-xs h-12 rounded-xl">
            Understood
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
