import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  RefreshCw,
  Search,
  ArrowRightLeft
} from 'lucide-react';

const FALLBACK_RATES: Record<string, number> = {
  'USD': 1,
  'BDT': 110.5,
  'EUR': 0.92,
  'GBP': 0.79,
  'INR': 83.2,
  'JPY': 150.4,
  'SAR': 3.75,
  'AED': 3.67,
  'CAD': 1.35,
  'AUD': 1.52
};

export const CurrencyConverter: React.FC = () => {
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('BDT');
  const [value, setValue] = useState('1');
  const [result, setResult] = useState('0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const rate1 = FALLBACK_RATES[from];
    const rate2 = FALLBACK_RATES[to];
    const val = parseFloat(value) || 0;
    setResult(((val / rate1) * rate2).toFixed(2));
  }, [from, to, value]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[32px] space-y-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 space-y-2 w-full">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Source Asset</label>
            <select 
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-mono text-xl"
            >
              {Object.keys(FALLBACK_RATES).map(curr => <option key={curr} value={curr} className="bg-black">{curr}</option>)}
            </select>
          </div>

          <button 
            onClick={swap}
            className="h-14 w-14 rounded-full bg-white text-black flex items-center justify-center shrink-0 hover:rotate-180 transition-all duration-500 shadow-glow"
          >
            <ArrowRightLeft size={20} />
          </button>

          <div className="flex-1 space-y-2 w-full">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Target Asset</label>
            <select 
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-mono text-xl"
            >
              {Object.keys(FALLBACK_RATES).map(curr => <option key={curr} value={curr} className="bg-black">{curr}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-4 pt-8 border-t border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Value to Convert</span>
            <div className="flex items-center gap-2">
              <RefreshCw size={10} className="text-white/20 animate-spin-slow" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Live Rates Local</span>
            </div>
          </div>
          <input 
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full bg-transparent text-6xl font-mono font-black tracking-tighter text-white focus:outline-none placeholder:text-white/5"
            placeholder="0"
          />
        </div>
      </div>

      <div className="bg-white text-black p-10 rounded-[40px] shadow-glow">
        <div className="flex items-center gap-4 mb-2">
          <Globe size={14} className="opacity-20" />
          <span className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">Exchange Result</span>
        </div>
        <h2 className="text-7xl font-mono font-black tracking-tighter leading-none">{result}</h2>
        <p className="text-2xl font-mono font-black tracking-tighter opacity-20 uppercase mt-2">{to} Output</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['EUR', 'GBP', 'INR', 'JPY'].map(curr => (
          <div key={curr} className="p-6 bg-white/5 border border-white/5 rounded-3xl">
            <p className="text-[9px] font-black uppercase text-white/20 mb-1">{curr}</p>
            <p className="text-xl font-mono font-black text-white">{((parseFloat(value) / FALLBACK_RATES[from]) * FALLBACK_RATES[curr]).toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
