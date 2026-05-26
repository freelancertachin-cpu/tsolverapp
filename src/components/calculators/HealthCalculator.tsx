import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Dna,
  Flame,
  Droplets,
  Activity
} from 'lucide-react';

const HEALTH_TOOLS = [
  { id: 'bmi', name: 'BMI Index', icon: <Activity size={14} /> },
  { id: 'calories', name: 'Daily Cal', icon: <Flame size={14} /> },
  { id: 'water', name: 'Hydration', icon: <Droplets size={14} /> },
  { id: 'bodyfat', name: 'Body Fat', icon: <Dna size={14} /> }
];

export const HealthCalculator: React.FC = () => {
  const [tool, setTool] = useState(HEALTH_TOOLS[0]);
  const [params, setParams] = useState({
    weight: '70',
    height: '175',
    age: '25',
    gender: 'male',
    activity: '1.2'
  });
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    calculate();
  }, [params, tool]);

  const calculate = () => {
    const W = parseFloat(params.weight);
    const H = parseFloat(params.height) / 100; // to meters
    const A = parseFloat(params.age);
    const activity = parseFloat(params.activity);

    switch(tool.id) {
      case 'bmi':
        const bmi = W / (H * H);
        let status = 'Normal';
        if (bmi < 18.5) status = 'Underweight';
        else if (bmi >= 25 && bmi < 30) status = 'Overweight';
        else if (bmi >= 30) status = 'Obese';
        setResult({
          main: bmi.toFixed(1),
          label: 'BMI Result',
          sub: status,
          info: 'Metric: kg/m²'
        });
        break;
      case 'calories':
        // Harris-Benedict Equation
        let bmr = 0;
        if (params.gender === 'male') {
          bmr = 88.362 + (13.397 * W) + (4.799 * parseFloat(params.height)) - (5.677 * A);
        } else {
          bmr = 447.593 + (9.247 * W) + (3.098 * parseFloat(params.height)) - (4.330 * A);
        }
        const calories = bmr * activity;
        setResult({
          main: Math.round(calories).toString(),
          label: 'Daily Calories',
          sub: 'Maintenance',
          info: 'kcal/day'
        });
        break;
      case 'water':
        const water = W * 0.033;
        setResult({
          main: water.toFixed(1),
          label: 'Daily Water',
          sub: 'Hydration Target',
          info: 'Liters/day'
        });
        break;
      default:
        setResult(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {HEALTH_TOOLS.map((t) => (
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

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-6 space-y-6">
          <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[32px] space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/20">Biometric Input</h3>
            
            <HealthInput 
              label="Weight (kg)" 
              value={params.weight} 
              onChange={(val) => setParams({ ...params, weight: val })} 
            />
            
            <HealthInput 
              label="Height (cm)" 
              value={params.height} 
              onChange={(val) => setParams({ ...params, height: val })} 
            />

            {(tool.id === 'calories' || tool.id === 'bodyfat') && (
              <HealthInput 
                label="Age (Years)" 
                value={params.age} 
                onChange={(val) => setParams({ ...params, age: val })} 
              />
            )}

            {tool.id === 'calories' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Gender</label>
                <div className="flex gap-2">
                  {['male', 'female'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setParams({ ...params, gender: g })}
                      className={`flex-1 h-12 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
                        params.gender === g ? 'bg-white text-black border-white' : 'bg-white/5 text-white/40 border-white/5'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-6">
          <div className="bg-white text-black p-8 rounded-[32px] h-full flex flex-col justify-between shadow-glow">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{result?.label || 'Score'}</p>
              <h2 className="text-6xl font-mono font-black tracking-tighter">{result?.main || '0.0'}</h2>
              <p className="text-sm font-black uppercase tracking-widest">{result?.info}</p>
            </div>
            
            <div className="pt-12 border-t border-black/5">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Classification</span>
                <span className="text-xl font-mono font-black uppercase italic">{result?.sub || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function HealthInput({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) {
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
