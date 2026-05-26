import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CircleDollarSign, 
  TrendingUp, 
  Percent, 
  Receipt, 
  PiggyBank,
  Briefcase
} from 'lucide-react';

const FINANCE_TOOLS = [
  { id: 'emi', name: 'EMI', icon: <CircleDollarSign size={14} /> },
  { id: 'loan', name: 'Loan', icon: <Briefcase size={14} /> },
  { id: 'compound', name: 'Compound', icon: <TrendingUp size={14} /> },
  { id: 'tax', name: 'Tax', icon: <Receipt size={14} /> },
  { id: 'discount', name: 'Discount', icon: <Percent size={14} /> },
  { id: 'roi', name: 'ROI', icon: <PiggyBank size={14} /> }
];

export const FinanceCalculator: React.FC = () => {
  const [tool, setTool] = useState(FINANCE_TOOLS[0]);
  const [params, setParams] = useState({
    principal: '100000',
    rate: '10',
    time: '12',
    tax: '15',
    discount: '10'
  });
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    calculate();
  }, [params, tool]);

  const calculate = () => {
    const P = parseFloat(params.principal);
    const R = parseFloat(params.rate) / 12 / 100;
    const N = parseFloat(params.time);

    switch(tool.id) {
      case 'emi':
        const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
        setResult({
          main: emi.toFixed(2),
          label: 'Monthly Payment',
          total: (emi * N).toFixed(2),
          interest: ((emi * N) - P).toFixed(2)
        });
        break;
      case 'loan':
        const totalInterest = (P * parseFloat(params.rate) * (N / 12)) / 100;
        setResult({
          main: (P + totalInterest).toFixed(2),
          label: 'Total Repayment',
          total: (P + totalInterest).toFixed(2),
          interest: totalInterest.toFixed(2)
        });
        break;
      case 'compound':
        const r = parseFloat(params.rate) / 100;
        const n = 12; // monthly compounding
        const t = parseFloat(params.time) / 12;
        const amount = P * Math.pow(1 + (r/n), n * t);
        setResult({
          main: amount.toFixed(2),
          label: 'Maturity Amount',
          total: amount.toFixed(2),
          interest: (amount - P).toFixed(2)
        });
        break;
      case 'tax':
        const taxAmount = (P * parseFloat(params.tax)) / 100;
        setResult({
          main: (P + taxAmount).toFixed(2),
          label: 'Total with Tax',
          total: (P + taxAmount).toFixed(2),
          interest: taxAmount.toFixed(2)
        });
        break;
      case 'discount':
        const discountAmount = (P * parseFloat(params.discount)) / 100;
        setResult({
          main: (P - discountAmount).toFixed(2),
          label: 'Discounted Price',
          total: (P - discountAmount).toFixed(2),
          interest: discountAmount.toFixed(2)
        });
        break;
      default:
        setResult(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {FINANCE_TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t)}
            className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${
              tool.id === t.id 
                ? 'bg-white border-white text-black shadow-glow' 
                : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white'
            }`}
          >
            {t.icon}
            <span className="text-[8px] font-black uppercase tracking-widest">{t.name}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[32px] space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/20">Parameter Input</h3>
            
            <FinanceInput 
              label="Principal / Base Amount" 
              value={params.principal} 
              onChange={(val) => setParams({ ...params, principal: val })} 
            />
            
            {(tool.id === 'emi' || tool.id === 'loan' || tool.id === 'compound') && (
              <FinanceInput 
                label="Annual Interest Rate (%)" 
                value={params.rate} 
                onChange={(val) => setParams({ ...params, rate: val })} 
              />
            )}

            {(tool.id === 'emi' || tool.id === 'loan' || tool.id === 'compound') && (
              <FinanceInput 
                label={tool.id === 'compound' ? "Time (Months)" : "Tenure (Months)"} 
                value={params.time} 
                onChange={(val) => setParams({ ...params, time: val })} 
              />
            )}

            {tool.id === 'tax' && (
              <FinanceInput 
                label="Tax Rate (%)" 
                value={params.tax} 
                onChange={(val) => setParams({ ...params, tax: val })} 
              />
            )}

            {tool.id === 'discount' && (
              <FinanceInput 
                label="Discount (%)" 
                value={params.discount} 
                onChange={(val) => setParams({ ...params, discount: val })} 
              />
            )}
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="bg-white text-black p-8 rounded-[32px] h-full flex flex-col justify-between shadow-glow">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{result?.label || 'Total Output'}</p>
              <h2 className="text-6xl font-mono font-black tracking-tighter">${result?.main || '0.00'}</h2>
            </div>
            
            <div className="space-y-6 pt-12 border-t border-black/5">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Breakdown: Interest/Tax</span>
                <span className="text-sm font-mono font-bold">${result?.interest || '0.00'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Cumulative Sum</span>
                <span className="text-sm font-mono font-bold">${result?.total || '0.00'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function FinanceInput({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-white/20">{label}</label>
      <input 
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-2xl font-mono font-black tracking-tighter text-white focus:outline-none placeholder:text-white/5 border-b border-white/10 pb-2"
      />
    </div>
  );
}
