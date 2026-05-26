import React, { useState } from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  BarChart3, 
  ShoppingCart, 
  DollarSign, 
  Plus, 
  Trash2,
  Sparkles,
  PieChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserProfile, storage } from '../lib/storage';
import { localAI } from '../lib/localAI';
import ReactMarkdown from 'react-markdown';

export const BusinessMode: React.FC<{ user: UserProfile }> = ({ user }) => {
  if (!user) return null;
  const [ledger, setLedger] = useState<{ id: string, name: string, type: 'income' | 'expense', amount: number }[]>([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [prediction, setPrediction] = useState<string | null>(null);

  const addItem = () => {
    if (!name || !amount) return;
    setLedger(prev => [...prev, { id: Math.random().toString(), name, type, amount: parseFloat(amount) }]);
    setName('');
    setAmount('');
  };

  const removeItem = (id: string) => {
    setLedger(prev => prev.filter(i => i.id !== id));
  };

  const totalIncome = ledger.filter(i => i.type === 'income').reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = ledger.filter(i => i.type === 'expense').reduce((sum, i) => sum + i.amount, 0);
  const profit = totalIncome - totalExpense;

  const handlePredict = async () => {
    if (ledger.length === 0) return;
    const res = await localAI.process(`Business Performance: Income ${totalIncome}, Expense ${totalExpense}. Give 3 strategic tips.`, 'business');
    setPrediction(res);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-6 mb-12">
        <div className="p-5 rounded-3xl bg-white border border-white">
          <Briefcase className="h-8 w-8 text-black" />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase italic underline decoration-white/10 underline-offset-8">Business Suite</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">Ledger tracking & AI-powered market analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
           {/* Ledger Input */}
           <div className="glass-card space-y-6">
              <div className="flex items-center gap-2">
                 <div className="h-1 w-4 bg-white" />
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Input Records</h3>
              </div>
              <div className="space-y-4">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Entry Name" className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-white px-4 outline-none focus:border-white/40 transition-all" />
                <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="Amount" className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-white px-4 outline-none focus:border-white/40 transition-all" />
                <div className="grid grid-cols-2 gap-2">
                   <button onClick={() => setType('income')} className={`h-11 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${type === 'income' ? 'bg-white text-black border-white' : 'border-white/10 text-white/40 hover:bg-white/5'}`}>INCOME</button>
                   <button onClick={() => setType('expense')} className={`h-11 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${type === 'expense' ? 'bg-white text-black border-white' : 'border-white/10 text-white/40 hover:bg-white/5'}`}>EXPENSE</button>
                </div>
                <button onClick={addItem} className="w-full h-14 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all">
                   <Plus size={16} className="mx-auto" />
                </button>
              </div>
           </div>

           {/* Quick Stats */}
           <div className="glass-card shadow-2xl shadow-white/5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">Net Capital Outcome</p>
              <h3 className={`text-4xl font-black uppercase italic tracking-tighter ${profit >= 0 ? 'text-white' : 'text-white underline decoration-white/20'}`}>
                ৳{profit.toFixed(0)}
              </h3>
           </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
           <div className="bg-white/5 border border-white/5 rounded-[40px] min-h-[450px] p-8 backdrop-blur-3xl shadow-2xl shadow-white/5 flex flex-col">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                   <BarChart3 size={14} className="text-white/40" />
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Active Records Log</h3>
                </div>
              </div>
              <div className="space-y-3 flex-1">
                {ledger.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center opacity-[0.05] py-20 grayscale">
                     <TrendingUp className="h-24 w-24 mb-6" />
                     <p className="text-[10px] font-black uppercase tracking-[0.4em]">Zero latency detected</p>
                   </div>
                ) : (
                   ledger.map((item) => (
                     <div key={item.id} className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-transparent hover:border-white/10 transition-all group">
                       <div className="flex items-center gap-4">
                          <div className={`h-2 w-2 rounded-full ${item.type === 'income' ? 'bg-white' : 'bg-white/10'}`} />
                          <span className="text-xs font-black uppercase tracking-tight opacity-70 group-hover:opacity-100 transition-all">{item.name}</span>
                       </div>
                       <div className="flex items-center gap-6">
                          <span className="text-xs font-black italic tracking-tight">
                             {item.type === 'income' ? '+' : '-'} ৳{item.amount.toFixed(0)}
                          </span>
                          <button onClick={() => removeItem(item.id)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 hover:text-red-500 text-white/10 opacity-0 group-hover:opacity-100 transition-all">
                             <Trash2 size={14} />
                          </button>
                       </div>
                     </div>
                   ))
                )}
              </div>
           </div>
        </div>

        <div className="lg:col-span-1">
           <div className="glass-card h-full flex flex-col gap-8 shadow-2xl shadow-white/5">
              <div className="flex items-center gap-3">
                 <div className="p-2 rounded-xl bg-white shadow-xl shadow-white/10">
                    <Sparkles size={14} className="text-black" />
                 </div>
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Intelligence Strategy</h3>
              </div>
              <div className="flex-1">
                <div className="markdown-body text-xs leading-loose font-bold text-white/60">
                   <ReactMarkdown>{prediction || "Input capital logs to initialize strategic localized business analysis and predictive intelligence sequence."}</ReactMarkdown>
                </div>
              </div>
              <button 
                onClick={handlePredict} 
                disabled={ledger.length === 0} 
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-50"
              >
                 Generate Analysis
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
