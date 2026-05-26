import React, { useState } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  X,
  FileText,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserProfile } from '../lib/storage';
import Tesseract from 'tesseract.js';

export const ImageScanner: React.FC<{ user: UserProfile }> = ({ user }) => {
  if (!user) return null;
  const [image, setImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const startScan = async () => {
    if (!image) return;
    setScanning(true);
    try {
      const { data: { text } } = await Tesseract.recognize(image, 'eng+ben');
      setResult(text);
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
          <Camera className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Scanner</h2>
          <p className="text-sm text-muted-foreground">Extract text & solve from images</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="space-y-4">
           {!image ? (
             <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-3xl cursor-pointer bg-muted/50 hover:bg-muted transition-all group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                   <div className="p-4 rounded-2xl bg-background shadow-sm mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                   </div>
                   <p className="mb-2 text-sm text-muted-foreground font-bold uppercase tracking-wider">Click to upload</p>
                </div>
                <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
             </label>
           ) : (
             <div className="relative rounded-3xl overflow-hidden border border-border aspect-square bg-muted">
               <img src={image} alt="Upload" className="w-full h-full object-contain" />
               <Button variant="destructive" size="icon" onClick={() => setImage(null)} className="absolute top-4 right-4 rounded-full h-8 w-8">
                  <X className="h-4 w-4" />
               </Button>
               <div className="absolute bottom-6 left-6 right-6">
                  <Button onClick={startScan} disabled={scanning} className="w-full h-12 rounded-xl gap-2 font-semibold">
                    {scanning ? <Loader2 className="animate-spin h-4 w-4" /> : <><Sparkles className="h-4 w-4" /> Start AI Scan</>}
                  </Button>
               </div>
             </div>
           )}
        </div>

        <div className="space-y-4">
           <Card className="rounded-3xl border-border bg-card shadow-sm h-full min-h-[300px]">
              <CardContent className="p-6">
                 <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Captured Text</span>
                 </div>
                 {result ? (
                   <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-muted/30 border border-border text-sm leading-relaxed max-h-[300px] overflow-auto">
                         {result}
                      </div>
                      <div className="flex gap-2">
                         <Button 
                           variant="outline" 
                           className="flex-1 rounded-xl text-xs font-semibold"
                           onClick={() => {
                             navigator.clipboard.writeText(result || '');
                             alert('Copied to clipboard!');
                           }}
                         >
                            Copy
                         </Button>
                         <Button 
                           className="flex-1 rounded-xl text-xs font-semibold"
                           onClick={() => {
                              // Custom event to start chat in main app
                              const event = new CustomEvent('start-ai-solve', { detail: result });
                              window.dispatchEvent(event);
                           }}
                         >
                            Solve
                         </Button>
                      </div>
                   </div>
                 ) : (
                   <div className="h-64 flex flex-col items-center justify-center opacity-20 text-center">
                     <Search className="h-12 w-12 mb-4" />
                     <p className="text-sm font-medium">Capture results will appear here</p>
                   </div>
                 )}
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
};
