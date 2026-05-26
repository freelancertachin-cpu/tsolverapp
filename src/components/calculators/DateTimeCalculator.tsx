import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar,
  Clock,
  History,
  Hourglass
} from 'lucide-react';

export const DateTimeCalculator: React.FC = () => {
  const [mode, setMode] = useState<'age' | 'diff'>('age');
  const [birthDate, setBirthDate] = useState('2000-01-01');
  const [date1, setDate1] = useState(new Date().toISOString().split('T')[0]);
  const [date2, setDate2] = useState(new Date().toISOString().split('T')[0]);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (mode === 'age') {
      const birth = new Date(birthDate);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        age--;
      }
      setResult({ main: age, label: 'Years Old', sub: 'Current Age' });
    } else {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setResult({ main: diffDays, label: 'Days', sub: 'Difference' });
    }
  }, [birthDate, date1, date2, mode]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex gap-2">
        <button 
          onClick={() => setMode('age')}
          className={`flex-1 h-16 rounded-2xl border flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${
            mode === 'age' ? 'bg-white text-black border-white shadow-glow' : 'bg-white/5 text-white/40 border-white/5'
          }`}
        >
          <Calendar size={14} />
          Age Audit
        </button>
        <button 
          onClick={() => setMode('diff')}
          className={`flex-1 h-16 rounded-2xl border flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${
            mode === 'diff' ? 'bg-white text-black border-white shadow-glow' : 'bg-white/5 text-white/40 border-white/5'
          }`}
        >
          <History size={14} />
          Date Diff
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-6 space-y-6">
          <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[32px] space-y-6">
             {mode === 'age' ? (
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Date of Birth</label>
                  <input 
                    type="date" 
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none"
                  />
                </div>
             ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Start Date</label>
                    <input 
                      type="date" 
                      value={date1}
                      onChange={(e) => setDate1(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20">End Date</label>
                    <input 
                      type="date" 
                      value={date2}
                      onChange={(e) => setDate2(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none"
                    />
                  </div>
                </div>
             )}
          </div>
        </div>

        <div className="md:col-span-6">
          <div className="bg-white text-black p-8 rounded-[32px] h-full flex flex-col justify-between shadow-glow">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{result?.sub}</p>
              <h2 className="text-7xl font-mono font-black tracking-tighter">{result?.main}</h2>
              <p className="text-sm font-black uppercase tracking-widest">{result?.label}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
