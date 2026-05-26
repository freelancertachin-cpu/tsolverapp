import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';

export const SplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-black"
        >
          <div className="relative flex flex-col items-center gap-12">
            <Logo size="xl" />
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-center space-y-4"
            >
              <h1 className="text-4xl font-black uppercase italic tracking-tighter text-black dark:text-white">
                T-Solver
              </h1>
              <div className="flex flex-col items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.6em] text-black/40 dark:text-white/20">
                  Powered by Tachin Ahmed
                </p>
                <div className="w-48 h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.5, ease: "easeInOut" }}
                    className="h-full bg-black dark:bg-white shadow-glow"
                  />
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-12 text-[8px] font-black uppercase tracking-[1em] text-black/20 dark:text-white/10"
          >
            Tactical student logic engine
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
