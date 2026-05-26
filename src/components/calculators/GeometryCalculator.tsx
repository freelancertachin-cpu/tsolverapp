import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Circle, 
  Square, 
  Triangle, 
  Box, 
  Database,
  Diamond
} from 'lucide-react';

const SHAPES = [
  { id: 'circle', name: 'Circle', icon: <Circle size={14} />, params: ['radius'] },
  { id: 'rectangle', name: 'Rect', icon: <Square size={14} />, params: ['width', 'height'] },
  { id: 'triangle', name: 'Tri', icon: <Triangle size={14} />, params: ['base', 'height'] },
  { id: 'sphere', name: 'Sphere', icon: <Database size={14} />, params: ['radius'] },
  { id: 'cube', name: 'Cube', icon: <Box size={14} />, params: ['side'] },
  { id: 'cylinder', name: 'Cyl', icon: <Box size={14} />, params: ['radius', 'height'] }
];

export const GeometryCalculator: React.FC = () => {
  const [shape, setShape] = useState(SHAPES[0]);
  const [params, setParams] = useState<any>({
    radius: '5',
    width: '10',
    height: '10',
    base: '10',
    side: '10'
  });
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    calculate();
  }, [params, shape]);

  const calculate = () => {
    const r = parseFloat(params.radius);
    const w = parseFloat(params.width);
    const h = parseFloat(params.height);
    const b = parseFloat(params.base);
    const s = parseFloat(params.side);

    switch(shape.id) {
      case 'circle':
        setResult({
          area: (Math.PI * r * r).toFixed(2),
          perimeter: (2 * Math.PI * r).toFixed(2),
          label: 'Circle audit'
        });
        break;
      case 'rectangle':
        setResult({
          area: (w * h).toFixed(2),
          perimeter: (2 * (w + h)).toFixed(2),
          label: 'Rectangle audit'
        });
        break;
      case 'triangle':
        setResult({
          area: (0.5 * b * h).toFixed(2),
          perimeter: 'Variable',
          label: 'Triangle audit'
        });
        break;
      case 'sphere':
        setResult({
          volume: ((4/3) * Math.PI * Math.pow(r, 3)).toFixed(2),
          surfaceArea: (4 * Math.PI * r * r).toFixed(2),
          label: 'Sphere audit'
        });
        break;
      case 'cube':
        setResult({
          volume: Math.pow(s, 3).toFixed(2),
          surfaceArea: (6 * s * s).toFixed(2),
          label: 'Cube audit'
        });
        break;
      case 'cylinder':
        setResult({
          volume: (Math.PI * r * r * h).toFixed(2),
          surfaceArea: (2 * Math.PI * r * h + 2 * Math.PI * r * r).toFixed(2),
          label: 'Cylinder audit'
        });
        break;
      default:
        setResult(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {SHAPES.map((s) => (
          <button
            key={s.id}
            onClick={() => setShape(s)}
            className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${
              shape.id === s.id 
                ? 'bg-white border-white text-black shadow-glow' 
                : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white'
            }`}
          >
            {s.icon}
            <span className="text-[8px] font-black uppercase tracking-widest">{s.name}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-6 space-y-6">
          <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[32px] space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/20">Shape Definition</h3>
            {shape.params.map(p => (
              <div key={p} className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/20">{p}</label>
                <input 
                  type="number"
                  value={params[p]}
                  onChange={(e) => setParams({ ...params, [p]: e.target.value })}
                  className="w-full bg-transparent text-2xl font-mono font-black tracking-tighter text-white focus:outline-none border-b border-white/10 pb-2"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-6">
          <div className="bg-white text-black p-8 rounded-[32px] h-full flex flex-col justify-between shadow-glow">
            <div className="space-y-6">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{result?.label}</p>
              
              {result?.area && (
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-30 italic">Area</span>
                  <h2 className="text-4xl font-mono font-black tracking-tighter">{result.area}u²</h2>
                </div>
              )}
              {result?.volume && (
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-30 italic">Volume</span>
                  <h2 className="text-4xl font-mono font-black tracking-tighter">{result.volume}u³</h2>
                </div>
              )}
              {result?.perimeter && (
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-30 italic">Perimeter</span>
                  <h2 className="text-4xl font-mono font-black tracking-tighter">{result.perimeter}u</h2>
                </div>
              )}
              {result?.surfaceArea && (
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-30 italic">Surface Area</span>
                  <h2 className="text-4xl font-mono font-black tracking-tighter">{result.surfaceArea}u²</h2>
                </div>
              )}
            </div>
            
            <div className="pt-12 border-t border-black/5 flex justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest opacity-30 italic">Coordinate Precision</span>
              <span className="text-[9px] font-black uppercase tracking-widest opacity-30 italic">IEEE-754</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
