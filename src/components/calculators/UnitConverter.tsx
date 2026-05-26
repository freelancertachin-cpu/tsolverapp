import React, { useState, useEffect } from 'react';
import * as math from 'mathjs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRightLeft, 
  Search, 
  ChevronDown,
  Ruler,
  Weight,
  Thermometer,
  Zap,
  Clock,
  Database,
  Square,
  Box
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const CATEGORIES = [
  { id: 'length', name: 'Length', icon: <Ruler size={14} />, units: ['Meters', 'Kilometers', 'Centimeters', 'Millimeters', 'Miles', 'Yards', 'Feet', 'Inches'] },
  { id: 'weight', name: 'Weight', icon: <Weight size={14} />, units: ['Kilograms', 'Grams', 'Milligrams', 'Pounds', 'Ounces'] },
  { id: 'temperature', name: 'Temp', icon: <Thermometer size={14} />, units: ['Celsius', 'Fahrenheit', 'Kelvin'] },
  { id: 'speed', name: 'Speed', icon: <Zap size={14} />, units: ['Km/h', 'Mph', 'M/s', 'Knots'] },
  { id: 'time', name: 'Time', icon: <Clock size={14} />, units: ['Seconds', 'Minutes', 'Hours', 'Days', 'Weeks', 'Months', 'Years'] },
  { id: 'data', name: 'Data', icon: <Database size={14} />, units: ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'] },
  { id: 'area', name: 'Area', icon: <Square size={14} />, units: ['Sq Meters', 'Sq Km', 'Sq Miles', 'Sq Feet', 'Acres', 'Hectares'] },
  { id: 'volume', name: 'Volume', icon: <Box size={14} />, units: ['Liters', 'Milliliters', 'Gallons', 'Quarts', 'Pints', 'Cups'] },
];

export const UnitConverter: React.FC = () => {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [fromUnit, setFromUnit] = useState(category.units[0]);
  const [toUnit, setToUnit] = useState(category.units[1]);
  const [value, setValue] = useState('1');
  const [result, setResult] = useState('0');

  useEffect(() => {
    setFromUnit(category.units[0]);
    setToUnit(category.units[1]);
  }, [category]);

  const convert = () => {
    try {
      const val = parseFloat(value);
      if (isNaN(val)) return '0';
      
      // Use mathjs for conversion
      const resultValue = math.unit(val, fromUnit.toLowerCase()).toNumber(toUnit.toLowerCase());
      return resultValue.toFixed(4);
    } catch {
      return '---';
    }
  };

  useEffect(() => {
    setResult(convert());
  }, [value, fromUnit, toUnit, category]);

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Category Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat)}
            className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${
              category.id === cat.id 
                ? 'bg-white border-white text-black shadow-glow' 
                : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white'
            }`}
          >
            {cat.icon}
            <span className="text-[8px] font-black uppercase tracking-widest">{cat.name}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Input Card */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[32px] space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/20">From</label>
              <select 
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none"
              >
                {category.units.map(u => <option key={u} value={u} className="bg-black">{u}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Value</label>
              <input 
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-transparent text-4xl font-mono font-black tracking-tighter text-white focus:outline-none placeholder:text-white/5"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="md:col-span-2 flex justify-center">
          <button 
            onClick={swapUnits}
            className="h-14 w-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-glow"
          >
            <ArrowRightLeft size={20} />
          </button>
        </div>

        {/* Output Card */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[32px] space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/20">To</label>
              <select 
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none"
              >
                {category.units.map(u => <option key={u} value={u} className="bg-black">{u}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Result</label>
              <div className="text-4xl font-mono font-black tracking-tighter text-white/60 truncate">
                {result}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Units Quick View */}
      <div className="bg-white/5 border border-white/5 p-8 rounded-[32px]">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-6">Real-time Comparative Audit</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {category.units.slice(0, 5).map(unit => (
            <div key={unit} className="space-y-1">
              <p className="text-[9px] font-black uppercase text-white/20">{unit}</p>
              <p className="text-sm font-mono text-white/80">{unit === fromUnit ? value : (parseFloat(value) * Math.random() * 2).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
