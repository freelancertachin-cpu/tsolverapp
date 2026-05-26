import React, { useState, useEffect, useRef } from 'react';
import * as math from 'mathjs';
import nerdamer from 'nerdamer';
import 'nerdamer/Algebra';
import 'nerdamer/Calculus';
import 'nerdamer/Solve';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Delete, 
  RotateCcw, 
  History as HistoryIcon, 
  Save, 
  ChevronDown, 
  Settings2,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export const ScientificCalculator: React.FC = () => {
  const [input, setInput] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('tsolver_calc_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('tsolver_calc_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (input.trim()) {
      try {
        const res = math.evaluate(input);
        setPreview(res.toString());
      } catch {
        setPreview(null);
      }
    } else {
      setPreview(null);
    }
  }, [input]);

  const handleAction = (val: string) => {
    if (val === '=') {
      try {
        const result = math.evaluate(input).toString();
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          expression: input,
          result: result,
          timestamp: Date.now(),
        };
        setHistory([newItem, ...history].slice(0, 50));
        setInput(result);
        setPreview(null);
      } catch {
        setInput('Error');
      }
      return;
    }

    if (val === 'C') {
      setInput('');
      setPreview(null);
      return;
    }

    if (val === 'DEL') {
      setInput(prev => prev.slice(0, -1));
      return;
    }

    setInput(prev => prev + val);
  };

  const clearHistory = () => setHistory([]);

  const buttons = [
    ['C', '(', ')', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', 'DEL', '=']
  ];

  const scientificButtons = [
    ['sin', 'cos', 'tan', 'log'],
    ['ln', 'π', 'e', '^'],
    ['sqrt', '!', 'abs', 'mod'],
  ];

  const mapBtn = (btn: string) => {
    const m: Record<string, string> = {
      '÷': '/',
      '×': '*',
      'sqrt': 'sqrt(',
      'sin': 'sin(',
      'cos': 'cos(',
      'tan': 'tan(',
      'ln': 'log(', // mathjs uses log for natural log
      'log': 'log10(',
      '^': '^',
      'π': 'pi',
    };
    return m[btn] || btn;
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* Search / History Toggle */}
      <div className="flex items-center justify-between px-2">
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all"
        >
          <HistoryIcon size={12} />
          {showHistory ? 'Hide History' : 'Show History'}
        </button>
        <div className="flex items-center gap-4">
          <Settings2 size={12} className="text-white/20" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
        {/* Main Display & Pad */}
        <div className={`space-y-6 ${showHistory ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-500`}>
          <div className="relative bg-[#0a0a0a] rounded-[32px] border border-white/5 p-8 flex flex-col justify-end items-end min-h-[160px] shadow-2xl overflow-hidden group">
            <div className="absolute top-6 left-8">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Live Sync</span>
              </div>
            </div>
            
            <AnimatePresence>
              {preview && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-white/30 text-lg font-mono mb-2"
                >
                  {preview}
                </motion.div>
              )}
            </AnimatePresence>
            
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-transparent border-none text-right text-5xl font-mono font-black tracking-tighter text-white focus:outline-none placeholder:text-white/5"
              placeholder="0"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {/* Scientific Grid */}
            <div className="grid grid-cols-4 gap-2">
              {scientificButtons.flat().map((btn) => (
                <CalcButton 
                  key={btn} 
                  label={btn} 
                  onClick={() => handleAction(mapBtn(btn))} 
                  variant="secondary"
                />
              ))}
            </div>

            {/* Standard Grid */}
            <div className="grid grid-cols-4 gap-2">
              {buttons.flat().map((btn) => (
                <CalcButton 
                  key={btn} 
                  label={btn} 
                  onClick={() => handleAction(btn === '=' ? '=' : mapBtn(btn))}
                  variant={btn === '=' ? 'primary' : btn === 'C' ? 'destructive' : 'default'}
                />
              ))}
            </div>
          </div>
        </div>

        {/* History Sidebar */}
        <AnimatePresence>
          {showHistory && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-4 bg-[#0a0a0a] border border-white/5 rounded-[32px] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/60">Recent Audit</h3>
                <button onClick={clearHistory} className="text-white/20 hover:text-red-500 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  {history.length === 0 && (
                    <div className="py-20 text-center space-y-4 opacity-20">
                      <HistoryIcon size={24} className="mx-auto" />
                      <p className="text-[9px] font-black uppercase tracking-widest">No logs found</p>
                    </div>
                  )}
                  {history.map((item) => (
                    <div 
                      key={item.id} 
                      className="space-y-1 group cursor-pointer"
                      onClick={() => setInput(item.expression)}
                    >
                      <p className="text-[10px] font-mono text-white/30 group-hover:text-white/50 transition-all">{item.expression}</p>
                      <p className="text-xl font-mono font-black text-white">{item.result}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

function CalcButton({ label, onClick, variant = 'default' }: { label: string, onClick: () => void, variant?: 'default' | 'primary' | 'secondary' | 'destructive' }) {
  const styles = {
    default: 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white',
    primary: 'bg-white text-black font-black hover:scale-105 active:scale-95 shadow-glow',
    secondary: 'bg-white/10 border-white/10 text-white/40 hover:bg-white/20 hover:text-white',
    destructive: 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20'
  };

  return (
    <button 
      onClick={onClick}
      className={`h-14 rounded-2xl border flex items-center justify-center text-[10px] font-black uppercase tracking-widest transition-all ${styles[variant]}`}
    >
      {label}
    </button>
  );
}
