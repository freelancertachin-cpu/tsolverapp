import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BookOpen, Search, Mic, Image as ImageIcon, Download, LineChart, Loader2, X, Sparkles, Camera, Plus, Trash2, } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { localAI } from '@/lib/localAI';
import { createWorker } from 'tesseract.js';
import { VoiceInput } from './VoiceInput';
import { jsPDF } from 'jspdf';
import ReactMarkdown from 'react-markdown';
import * as math from 'mathjs';
import Plotly from 'plotly.js-dist-min';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from 'framer-motion';

const FORMULAS = [
  // Algebra
  { name: "(a + b)²", result: "a² + 2ab + b²", category: "Algebra", equation: null },
  { name: "(a - b)²", result: "a² - 2ab + b²", category: "Algebra", equation: null },
  { name: "a² - b²", result: "(a - b)(a + b)", category: "Algebra", equation: null },
  { name: "Quadratic Formula", result: "x = [-b ± √(b² - 4ac)] / 2a", category: "Algebra", equation: null },
  { name: "Linear Equation", result: "y = mx + c", category: "Algebra", equation: "1*x + 2" },
  { name: "Quadratic Equation", result: "y = ax² + bx + c", category: "Algebra", equation: "x^2" },
  { name: "Cubic Equation", result: "y = x³", category: "Algebra", equation: "x^3" },
  
  // Trigo
  { name: "Sine Wave", result: "y = sin(x)", category: "Trigonometry", equation: "sin(x)" },
  { name: "Cosine Wave", result: "y = cos(x)", category: "Trigonometry", equation: "cos(x)" },
  { name: "Tangent", result: "y = tan(x)", category: "Trigonometry", equation: "tan(x)" },
  { name: "Pythagorean Identity", result: "sin²θ + cos²θ = 1", category: "Trigonometry", equation: null },

  // Geometry
  { name: "Pythagorean Theorem", result: "a² + b² = c²", category: "Geometry", equation: null },
  { name: "Area of Circle", result: "πr²", category: "Geometry", equation: null },
  { name: "Circumference", result: "2πr", category: "Geometry", equation: null },
  
  // Calculus
  { name: "Exponential Growth", result: "y = e^x", category: "Calculus", equation: "exp(x)" },
  { name: "Natural Log", result: "y = ln(x)", category: "Calculus", equation: "log(x)" },
  { name: "Euler's Identity", result: "e^(iπ) + 1 = 0", category: "Calculus", equation: null },

  // Chemistry
  { name: "Ideal Gas Law", result: "PV = nRT", category: "Chemistry", equation: null },
  { name: "Molarity", result: "M = n / V", category: "Chemistry", equation: null },
  { name: "pH Calculation", result: "pH = -log[H+]", category: "Chemistry", equation: null },

  // ICT / CS
  { name: "Time Complexity", result: "O(n log n)", category: "ICT", equation: null },
  { name: "Binary Conversion", result: "base 10 -> base 2", category: "ICT", equation: null },
  { name: "Boolean Algebra", result: "A + A' = 1", category: "ICT", equation: null },

  // Biology
  { name: "Hardy-Weinberg", result: "p² + 2pq + q² = 1", category: "Biology", equation: null },
  { name: "Respiration", result: "C6H12O6 + 6O2", category: "Biology", equation: null },
];

export const FormulaFinder: React.FC = () => {
  const [search, setSearch] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [activeEquation, setActiveEquation] = useState<string | null>(null);
  const [latexPreview, setLatexPreview] = useState<string | null>(null);
  const plotRef = useRef<HTMLDivElement>(null);
  const katexRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const lang = localStorage.getItem('tsolver-lang') || 'bn';

  const translate = (text: string) => {
    if (lang !== 'bn') return text;
    return text
      .replace(/Algebra/g, 'বীজগণিত')
      .replace(/Geometry/g, 'জ্যামিতি')
      .replace(/Calculus/g, 'কলনবিদ্যা')
      .replace(/Trigonometry/g, 'ত্রিকোণমিতি')
      .replace(/Formula Finder/g, 'সূত্র অনুসন্ধান')
      .replace(/Quick reference for common mathematical formulas./g, 'সাধারণ গাণিতিক সূত্রের দ্রুত রেফারেন্স।')
      .replace(/Search formulas/g, 'সূত্র খুঁজুন')
      .replace(/No formulas found matching your search./g, 'আপনার অনুসন্ধানের সাথে মিলে এমন কোন সূত্র পাওয়া যায়নি।')
      .replace(/AI Formula Search/g, 'AI সূত্র অনুসন্ধান')
      .replace(/Class-wise Pack/g, 'ক্লাস ভিত্তিক প্যাক')
      .replace(/Download PDF/g, 'PDF ডাউনলোড')
      .replace(/Graph/g, 'গ্রাফ');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        handleAiSearch("Image Formula Detection", true, base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiSearch = async (input: string, isImage: boolean = false, imageOverride?: string) => {
    setLoading(true);
    setAiResult(null);
    setActiveEquation(null);

    try {
      let textToProcess = input;

      if (isImage) {
        const worker = await createWorker();
        await worker.loadLanguage('eng+ben');
        await worker.initialize('eng+ben');
        const { data: { text } } = await worker.recognize(imageOverride || image || '');
        await worker.terminate();
        textToProcess = text;
      }

      const res = await localAI.process(textToProcess);
      setAiResult(res);
      
      const lower = textToProcess.toLowerCase();
      if (lower.includes('graph') || lower.includes('plot') || lower.includes('draw')) {
         const eq = textToProcess.replace(/graph|plot|draw|show/gi, '').trim() || 'x^2';
         setActiveEquation(eq);
      }

    } catch (err: any) {
      console.error(err);
      setAiResult("Local processing failed.");
    } finally {
      setLoading(false);
    }
  };

  const plotGraphs = () => {
    if (!plotRef.current || !activeEquation) return;

    try {
      const xValues = math.range(-10, 10, 0.1).toArray() as number[];
      const yValues = xValues.map(x => {
        try {
          // Clean equation for mathjs
          let cleanEq = activeEquation;
          if (cleanEq.includes('=')) {
            cleanEq = cleanEq.split('=')[1].trim();
          }
          return math.evaluate(cleanEq, { x });
        } catch {
          return null;
        }
      });

      const data: any[] = [{
        x: xValues,
        y: yValues,
        type: 'scatter',
        mode: 'lines',
        name: `y = ${activeEquation}`,
        line: { color: '#00f2ff', width: 3, shape: 'spline' },
        fill: 'tozeroy',
        fillcolor: 'rgba(0, 242, 255, 0.05)'
      }];

      const layout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#ffffff', family: 'Inter', size: 10 },
        margin: { t: 20, r: 20, b: 40, l: 40 },
        xaxis: { gridcolor: 'rgba(255,255,255,0.05)', zerolinecolor: 'rgba(255,255,255,0.2)' },
        yaxis: { gridcolor: 'rgba(255,255,255,0.05)', zerolinecolor: 'rgba(255,255,255,0.2)' },
        showlegend: false,
        hovermode: 'closest'
      };

      Plotly.newPlot(plotRef.current, data, layout, { responsive: true, displayModeBar: false });
    } catch (e) {
      console.error("Plot error:", e);
    }
  };

  useEffect(() => {
    if (activeEquation) {
      setTimeout(plotGraphs, 100); // Small delay to ensure container is ready
    }
  }, [activeEquation]);

  useEffect(() => {
    if (search.length > 0) {
      try {
        const node = math.parse(search);
        const tex = node.toTex();
        setLatexPreview(tex);
      } catch (e) {
        setLatexPreview(null);
      }
    } else {
      setLatexPreview(null);
    }
  }, [search]);

  useEffect(() => {
    if (latexPreview && katexRef.current) {
      katex.render(latexPreview, katexRef.current, {
        throwOnError: false,
        displayMode: true
      });
    }
  }, [latexPreview]);

  const downloadPDF = () => {
    if (!aiResult) return;
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(aiResult, 180);
    doc.text(splitText, 10, 10);
    doc.save("T-Solver-Formulas.pdf");
  };

  const filtered = FORMULAS.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) || 
    f.result.toLowerCase().includes(search.toLowerCase()) ||
    f.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="glass border-none neon-glow border border-white/10 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-3 text-primary font-black italic uppercase tracking-tighter text-3xl">
            <BookOpen className="h-7 w-7" />
            {translate('Formula Finder')}
          </CardTitle>
          <CardDescription className="text-xs font-semibold opacity-40 uppercase tracking-widest">{translate('Quick reference for common mathematical formulas.')}</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => cameraInputRef.current?.click()}
            disabled={loading}
            className="gap-2 h-10 border-white/10 bg-white/5 hover:bg-white/10 rounded-xl"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            Scan
          </Button>
          <input 
            type="file" 
            ref={cameraInputRef} 
            className="hidden" 
            accept="image/*" 
            capture="environment" 
            onChange={handleImageUpload} 
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-8 pt-4">
        {/* Search & AI Tools */}
        <div className="space-y-6">
          <div className="flex gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                placeholder={translate('Search formulas or ask AI (e.g. Class 10 physics)...')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiSearch(search)}
                className="pl-12 h-14 bg-white/5 border-white/10 text-base font-bold rounded-2xl focus:border-primary/50 focus:ring-0"
              />
            </div>
            <VoiceInput onResult={(text) => { setSearch(text); handleAiSearch(text); }} />
            <Button variant="outline" size="icon" className="h-14 w-14 border-white/10 bg-white/5 rounded-2xl" onClick={() => fileInputRef.current?.click()}>
              <ImageIcon className="h-5 w-5" />
            </Button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            <Button onClick={() => handleAiSearch(search)} disabled={loading} className="h-14 w-14 rounded-2xl bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-glow">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            </Button>
          </div>

          <AnimatePresence>
            {latexPreview && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden cursor-pointer group/preview"
                onClick={() => {
                  try {
                    // Test if it's plottable
                    let clean = search;
                    if (clean.includes('=')) clean = clean.split('=')[1].trim();
                    math.evaluate(clean, { x: 0 });
                    setActiveEquation(clean);
                  } catch (e) {
                    // Not plottable
                  }
                }}
              >
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center min-h-[80px] group-hover/preview:bg-primary/5 group-hover/preview:border-primary/30 transition-all">
                  <span className="text-[8px] font-black uppercase tracking-widest text-primary/40 mb-2 group-hover/preview:text-primary">Formula Preview (Click to Graph)</span>
                  <div ref={katexRef} className="text-xl text-primary" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Filter Bubbles */}
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 no-scrollbar">
            {['Class 8', 'SSC', 'HSC', 'Algebra', 'Chemistry', 'ICT', 'Biology', 'Calculus', 'Trigonometry'].map((tag) => (
              <Badge 
                key={tag} 
                variant={search.toLowerCase() === tag.toLowerCase() ? 'default' : 'secondary'}
                className={`cursor-pointer transition-all px-4 py-1.5 text-[10px] uppercase font-black tracking-widest border border-white/5 h-8 ${search.toLowerCase() === tag.toLowerCase() ? 'bg-primary text-primary-foreground' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
                onClick={() => setSearch(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Dynamic Area (Plot or AI) */}
        <AnimatePresence mode="wait">
          {(activeEquation || aiResult) && (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="space-y-6"
            >
              {activeEquation && (
                <div className="p-8 bg-secondary/30 border border-white/10 rounded-3xl space-y-6 relative group overflow-hidden">
                  <div className="flex justify-between items-center relative z-10">
                    <div className="space-y-1">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 text-primary">
                        <LineChart className="h-4 w-4" /> Neural Graphing Node
                      </h3>
                      <p className="text-xl font-black italic tracking-tight">y = {activeEquation}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setActiveEquation(null)} className="h-10 w-10 p-0 rounded-xl bg-white/5 hover:bg-red-500 hover:text-white transition-all">
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <div ref={plotRef} className="h-[350px] w-full rounded-2xl bg-black/40 border border-white/5 overflow-hidden" />
                </div>
              )}

              {aiResult && (
                <div className="p-8 bg-primary/5 border border-primary/20 rounded-3xl space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                    <Sparkles size={120} />
                  </div>
                  <div className="flex justify-between items-center relative z-10">
                    <h3 className="text-[10px] font-black uppercase text-primary tracking-[0.4em] flex items-center gap-2">
                       Neural Extraction Result
                    </h3>
                    <div className="flex gap-2">
                       <Button variant="ghost" size="sm" onClick={downloadPDF} className="h-10 px-4 gap-2 text-[10px] font-black uppercase tracking-widest bg-white/5 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all">
                        <Download className="h-4 w-4" /> PDF
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setAiResult(null)} className="h-10 w-10 p-0 bg-white/5 rounded-xl hover:bg-white hover:text-black transition-all">
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  <div className="prose prose-sm prose-invert max-w-none text-white/70 font-semibold leading-relaxed relative z-10">
                    <ReactMarkdown>{aiResult}</ReactMarkdown>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Formulas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((f, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => f.equation && setActiveEquation(f.equation)}
              className={`group p-6 bg-white/5 border border-white/5 rounded-[28px] flex flex-col gap-4 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer relative overflow-hidden ${activeEquation === f.equation ? 'border-primary/60 bg-primary/10' : ''}`}
            >
              <div className="flex justify-between items-start relative z-10">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/40 group-hover:text-primary/80 transition-colors">{translate(f.category)}</span>
                {f.equation && (
                  <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <LineChart className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div className="space-y-2 relative z-10">
                <h4 className="font-black italic uppercase tracking-tight text-white/90 group-hover:text-white transition-colors text-lg">{f.name}</h4>
                <div className="py-2">
                   <code className="text-xl font-bold text-white/20 group-hover:text-primary transition-all font-mono block overflow-x-auto no-scrollbar scroll-smooth">{f.result}</code>
                </div>
              </div>
              <div className="absolute bottom-0 right-0 p-4 translate-x-4 translate-y-4 opacity-0 group-hover:opacity-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-all pointer-events-none">
                 <Sparkles size={64} className="text-primary" />
              </div>
            </motion.div>
          ))}
          
          {filtered.length === 0 && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="col-span-full py-20 text-center space-y-6"
            >
              <div className="h-24 w-24 bg-white/5 rounded-full flex items-center justify-center mx-auto grayscale opacity-10 animate-pulse">
                <Search size={48} />
              </div>
              <div className="space-y-2">
                 <p className="text-sm font-black uppercase tracking-widest opacity-20">{translate('No formulas found matching your search.')}</p>
                 <p className="text-[10px] font-bold text-primary/20 uppercase tracking-[0.4em]">Try adjusting your neural filters</p>
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
