import React, { useState, useRef } from 'react';
import * as math from 'mathjs';
import { 
  Calculator as CalcIcon, 
  Delete, 
  RotateCcw, 
  Camera, 
  Loader2, 
  X,
  Zap,
  ArrowRightLeft,
  CircleDollarSign,
  Activity,
  Box,
  Clock,
  Globe,
  Settings,
  ChevronRight
} from 'lucide-react';
import { localAI } from '@/lib/localAI';
import { createWorker } from 'tesseract.js';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';

// Specialized Calculators
import { ScientificCalculator } from './calculators/ScientificCalculator';
import { UnitConverter } from './calculators/UnitConverter';
import { FinanceCalculator } from './calculators/FinanceCalculator';
import { HealthCalculator } from './calculators/HealthCalculator';
import { GeometryCalculator } from './calculators/GeometryCalculator';
import { DateTimeCalculator } from './calculators/DateTimeCalculator';
import { CurrencyConverter } from './calculators/CurrencyConverter';

type CalcMode = 'scientific' | 'converter' | 'finance' | 'health' | 'geometry' | 'datetime' | 'currency';

export const Calculator: React.FC = () => {
  const [mode, setMode] = useState<CalcMode>('scientific');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setScanResult(null);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const lang = localStorage.getItem('tsolver-lang') || 'bn';
      try {
        const worker = await createWorker();
        await worker.loadLanguage('eng+ben');
        await worker.initialize('eng+ben');
        const { data: { text } } = await worker.recognize(base64);
        await worker.terminate();
        
        const res = await localAI.process(text, 'math');
        setScanResult(res);
      } catch (err: any) {
        if (err.message === "API_KEY_MISSING") {
          setScanResult(lang === 'bn' ? "ভুল: API Key পাওয়া যায়নি।" : "Error: API Key Missing.");
        } else {
          setScanResult("Scan failed. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const navItems = [
    { id: 'scientific', label: 'Scientific', icon: <CalcIcon size={16} /> },
    { id: 'converter', label: 'Units', icon: <ArrowRightLeft size={16} /> },
    { id: 'currency', label: 'Currency', icon: <Globe size={16} /> },
    { id: 'finance', label: 'Finance', icon: <CircleDollarSign size={16} /> },
    { id: 'geometry', label: 'Geometry', icon: <Box size={16} /> },
    { id: 'health', label: 'Health', icon: <Activity size={16} /> },
    { id: 'datetime', label: 'Time', icon: <Clock size={16} /> },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-black/5 dark:bg-white flex items-center justify-center shadow-glow">
            <Settings className="text-black dark:text-black" size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter italic text-black dark:text-white">Premium Audit Hub</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 dark:text-white/40">Powered by Tachin Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="h-14 px-8 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl flex items-center gap-3 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all group text-black dark:text-white"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4 group-hover:scale-110 transition-transform" />}
            <span className="text-[10px] font-black uppercase tracking-widest">Scan Equation</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            capture="environment" 
            onChange={handleScan} 
          />
        </div>
      </div>

      {/* Sub-Navigation Hub */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 px-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setMode(item.id as CalcMode)}
            className={`flex items-center gap-3 h-14 px-6 rounded-2xl border transition-all whitespace-nowrap ${
              mode === item.id 
                ? 'bg-black text-white border-black dark:bg-[#fcfcfc] dark:border-[#fcfcfc] dark:text-black shadow-glow' 
                : 'bg-black/5 border-black/5 text-black/40 hover:text-black dark:bg-white/5 dark:border-white/5 dark:text-white/40 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
          >
             {mode === 'scientific' && <ScientificCalculator />}
             {mode === 'converter' && <UnitConverter />}
             {mode === 'finance' && <FinanceCalculator />}
             {mode === 'health' && <HealthCalculator />}
             {mode === 'geometry' && <GeometryCalculator />}
             {mode === 'datetime' && <DateTimeCalculator />}
             {mode === 'currency' && <CurrencyConverter />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Scan Result Overlay/Modal */}
      <AnimatePresence>
        {scanResult && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[40px] p-10 flex flex-col gap-8 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <Zap className="text-white/40" size={16} />
                  </div>
                  <h3 className="text-xl font-black uppercase italic italic">Scan Extracted</h3>
                </div>
                <button 
                  onClick={() => setScanResult(null)}
                  className="h-10 w-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-all"
                >
                  <X size={20} className="text-white/40" />
                </button>
              </div>

              <ScrollArea className="h-[300px] w-full bg-white/5 rounded-3xl p-8">
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{scanResult}</ReactMarkdown>
                </div>
              </ScrollArea>

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    // Find expression in result and set to calculator
                    setScanResult(null);
                    setMode('scientific');
                  }}
                  className="flex-1 h-16 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  Load to Scientific
                  <ChevronRight size={14} />
                </button>
                <button 
                  onClick={() => setScanResult(null)}
                  className="flex-1 h-16 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all"
                >
                  Discard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

