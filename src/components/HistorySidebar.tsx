import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { History, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface HistoryItem {
  id: string;
  type: 'math' | 'assignment' | 'business';
  query: string;
  result: string;
  timestamp: number;
}

import { useTranslation } from '../lib/useTranslation';

export const HistorySidebar: React.FC = () => {
  const { t } = useTranslation();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const loadHistory = () => {
      const saved = localStorage.getItem('tsolver_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    };

    loadHistory();
    window.addEventListener('storage', loadHistory);
    // Custom event for same-window updates
    window.addEventListener('tsolver_history_update', loadHistory);
    
    return () => {
      window.removeEventListener('storage', loadHistory);
      window.removeEventListener('tsolver_history_update', loadHistory);
    };
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('tsolver_history');
    setHistory([]);
    window.dispatchEvent(new Event('tsolver_history_update'));
  };

  return (
    <>
      <Button
        variant="secondary"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-50 rounded-full shadow-lg border border-border glass neon-glow"
      >
        {isOpen ? <ChevronLeft className="h-5 w-5" /> : <History className="h-5 w-5" />}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed left-0 top-0 h-full w-72 bg-background/80 backdrop-blur-xl border-r border-border z-40 p-4 pt-20 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <History className="h-5 w-5" />
                {t.history}
              </h3>
              <Button variant="ghost" size="icon" onClick={clearHistory} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-120px)]">
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">{t.noHistory}</p>
              ) : (
                <div className="space-y-3 pr-4">
                  {history.sort((a, b) => b.timestamp - a.timestamp).map((item) => (
                    <div 
                      key={item.id} 
                      className="p-3 rounded-lg bg-secondary/30 border border-border hover:border-primary/50 transition-colors cursor-default group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] uppercase font-bold text-primary/70">{item.type}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs font-medium line-clamp-2 mb-1">{item.query}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1 italic">{item.result}</p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export const addToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
  const saved = localStorage.getItem('tsolver_history');
  const history: HistoryItem[] = saved ? JSON.parse(saved) : [];
  
  const newItem: HistoryItem = {
    ...item,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now()
  };
  
  const updated = [newItem, ...history].slice(0, 50); // Keep last 50
  localStorage.setItem('tsolver_history', JSON.stringify(updated));
  window.dispatchEvent(new Event('tsolver_history_update'));
};
