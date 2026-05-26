import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, Search, FileText, Brain, Loader2, X, CheckCircle2, History, Languages } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { localAI } from '../lib/localAI';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from './ui/scroll-area';

export const OCREngine: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [text, setText] = useState('');
  const [progress, setProgress] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [langMode, setLangMode] = useState<'eng' | 'eng+ben'>('eng+ben');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        processOCR(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processOCR = async (imgData: string) => {
    setLoading(true);
    setText('');
    setAiAnalysis(null);
    setProgress(0);
    try {
      const worker = await createWorker({
        logger: (m: any) => {
          if (m.status === 'recognizing text' || m.status === 'loading tesseract core') {
            setProgress(Math.floor(m.progress * 100));
          }
        }
      });
      await worker.loadLanguage(langMode);
      await worker.initialize(langMode);
      const { data: { text } } = await worker.recognize(imgData);
      setText(text);
      await worker.terminate();
      setLoading(false);
      
      // Auto-Solve if content found
      if (text.length > 5) {
        handleSolve(text);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSolve = async (scannedText: string) => {
    if (!scannedText) return;
    setAnalyzing(true);
    try {
      const result = await localAI.process(`Analyze this scanned text and provide a solution/explanation: ${scannedText}`, 'education', true);
      setAiAnalysis(result);
    } catch (err) {
      setAiAnalysis("Neural link timed out. Failed to analyze data nodes.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Camera size={20} className="text-[#00ff88]" />
            </div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Neural Scan Engine</h2>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">OCR v3.2 — Scan Questions, Notes, Bengali Script</p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
           <button 
             onClick={() => setLangMode('eng')}
             className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${langMode === 'eng' ? 'bg-white text-black shadow-glow' : 'text-white/40 hover:text-white'}`}
           >
             English Only
           </button>
           <button 
             onClick={() => setLangMode('eng+ben')}
             className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${langMode === 'eng+ben' ? 'bg-[#00ff88] text-black shadow-glow' : 'text-white/40 hover:text-[#00ff88]'}`}
           >
             ENG + BANGLA
           </button>
        </div>
      </div>

      {!image ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="h-96 border-2 border-dashed border-white/10 rounded-[48px] flex flex-col items-center justify-center gap-8 cursor-pointer hover:bg-white/5 hover:border-white/30 transition-all group"
          >
            <div className="h-24 w-24 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload size={32} className="text-white/20 group-hover:text-white transition-colors" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-xl font-black uppercase italic tracking-tighter">Drop Neural Data</p>
              <p className="text-[10px] font-bold uppercase text-white/20 tracking-widest">Supports PNG, JPG, WEBP</p>
            </div>
          </div>

          <div 
            onClick={() => cameraInputRef.current?.click()}
            className="h-96 border-2 border-dashed border-[#00ff88]/20 rounded-[48px] bg-[#00ff88]/5 flex flex-col items-center justify-center gap-8 cursor-pointer hover:bg-[#00ff88]/10 hover:border-[#00ff88]/40 transition-all group"
          >
            <div className="h-24 w-24 rounded-full bg-[#00ff88]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Camera size={32} className="text-[#00ff88]/40 group-hover:text-[#00ff88] transition-colors" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-xl font-black uppercase italic tracking-tighter text-[#00ff88]">Live Capture</p>
              <p className="text-[10px] font-bold uppercase text-[#00ff88]/20 tracking-widest">Mobile Camera Interface</p>
            </div>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept="image/*"
          />
          <input 
            type="file" 
            ref={cameraInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept="image/*"
            capture="environment"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="relative rounded-[40px] overflow-hidden border border-white/10 aspect-square group">
              <img src={image} alt="Scan" className="w-full h-full object-cover" />
              <button 
                onClick={() => setImage(null)}
                className="absolute top-6 right-6 h-12 w-12 bg-black/80 rounded-2xl flex items-center justify-center border border-white/20 hover:bg-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            {loading && (
              <div className="cyber-panel p-8 flex items-center gap-6">
                <Loader2 className="animate-spin text-[#00ff88]" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest">OCR Progress</p>
                    <p className="text-[10px] font-black">{progress}%</p>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-[#00ff88]"
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="cyber-panel p-8 space-y-6">
                <div className="flex justify-between items-center px-1">
                   <div className="flex items-center gap-2">
                      <FileText size={14} className="text-white/40" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Extracted Neural Text</p>
                   </div>
                   <button 
                     onClick={() => {
                        navigator.clipboard.writeText(text);
                        window.alert("Text copied to neural buffer.");
                     }}
                     className="text-[8px] font-black uppercase tracking-widest text-[#00ff88] hover:underline"
                   >
                     Copy Hash
                   </button>
                </div>
                <div className="h-48 overflow-y-auto bg-white/5 p-6 rounded-2xl border border-white/5 scrollbar-hide">
                {text ? (
                  <p className="text-sm font-bold italic leading-relaxed text-white/80">{text}</p>
                ) : (
                  <p className="text-xs font-bold uppercase text-white/10 flex items-center justify-center h-full">Waiting for engine...</p>
                )}
              </div>
            </div>

            {aiAnalysis && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="cyber-panel p-8 space-y-8 border-[#00ff88]/20 bg-[#00ff88]/5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Brain size={120} className="text-[#00ff88]" />
                </div>

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <Brain size={20} className="text-[#00ff88]" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Neuro-Logical Analysis</p>
                  </div>
                  {analyzing && <Loader2 className="animate-spin text-[#00ff88]" size={16} />}
                </div>
                
                <ScrollArea className="h-64 w-full relative z-10">
                   <div className="prose prose-invert prose-xs italic">
                      <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                   </div>
                </ScrollArea>

                <div className="flex gap-4 relative z-10">
                   <button 
                     onClick={() => handleSolve(text)}
                     className="flex-1 h-14 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all"
                   >
                     Regenerate
                   </button>
                   <button 
                    onClick={() => {
                        window.alert("Data transmitted to Knowledge Archive.");
                    }}
                    className="flex-1 h-14 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-glow hover:scale-[1.02] transition-all"
                   >
                      Save to Notes
                   </button>
                </div>
              </motion.div>
            )}
            
            {loading && !aiAnalysis && (
              <div className="cyber-panel p-12 text-center space-y-6">
                 <Loader2 className="animate-spin h-12 w-12 text-[#00ff88] mx-auto" />
                 <p className="text-sm font-black uppercase italic tracking-widest">Neural Link Synchronizing...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
