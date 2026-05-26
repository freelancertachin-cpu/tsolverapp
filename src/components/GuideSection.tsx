import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Book, Sparkles, Loader2, Download, Image as ImageIcon, FileText, ChevronRight } from 'lucide-react';
import { localAI } from '@/lib/localAI';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '@/components/ui/scroll-area';
import { jsPDF } from 'jspdf';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CLASSES = [
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", 
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", 
  "SSC", "HSC", "Varsity"
];

const SUBJECTS = [
  "Bangla", "English", "Math", "Science", "Physics", "Chemistry", "Biology", "ICT", "Accounting"
];

const QUICK_CHARTS = [
  { name: "Bangla Grammar", topic: "bangla grammar", icon: "🇧🇩" },
  { name: "English Tense", topic: "english tense", icon: "🇬🇧" },
  { name: "Math Formulas", topic: "math formula", icon: "📐" },
  { name: "Periodic Table", topic: "periodic table", icon: "🧪" },
];

export const GuideSection: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('Class 9');
  const [selectedSubject, setSelectedSubject] = useState('English');
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [chartImage, setChartImage] = useState<string | null>(null);
  
  const lang = localStorage.getItem('tsolver-lang') || 'bn';

  const handleGetGuide = async () => {
    setLoading(true);
    setContent(null);
    setChartImage(null);

    const prompt = `
      Provide a comprehensive summarized guide for ${selectedClass} ${selectedSubject}.
      Include:
      - Important notes and concepts
      - Grammar rules (if it's a language subject)
      - Key examples and solved problems
      - Important key points for exams
      
      Format the output with clear headings and bullet points.
      Language: ${lang === 'bn' ? 'Bengali' : 'English'}.
    `;

    try {
      const res = await localAI.process(prompt, 'education');
      setContent(res);
    } catch (err: any) {
      if (err.message === "API_KEY_MISSING") {
        setContent(lang === 'bn' ? "ভুল: API Key পাওয়া যায়নি।" : "Error: API Key Missing.");
      } else {
        console.error(err);
        setContent("Failed to load guide content.");
      }
    } finally {
      setLoading(false);
    }
  };

  const showChart = (topic: string) => {
    setContent(null);
    // Using placeholder images as per instructions
    const images: Record<string, string> = {
      "bangla grammar": "https://picsum.photos/seed/bangla/800/1200",
      "english tense": "https://picsum.photos/seed/tense/800/1200",
      "math formula": "https://picsum.photos/seed/math/800/1200",
      "periodic table": "https://picsum.photos/seed/chemistry/800/1200"
    };
    setChartImage(images[topic]);
  };

  const downloadPDF = () => {
    if (!content) return;
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(content, 180);
    doc.text(splitText, 10, 10);
    doc.save(`${selectedClass}_${selectedSubject}_Guide.pdf`);
  };

  return (
    <Card className="glass border-none neon-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Book className="h-5 w-5" />
          {lang === 'bn' ? 'গাইড ও গ্রামার' : 'Guide & Grammar'}
        </CardTitle>
        <CardDescription>
          {lang === 'bn' 
            ? 'আপনার ক্লাসের সব বিষয়ের গাইড এবং গ্রামার নোটস এখানে পাবেন।' 
            : 'Get guide content and grammar notes for all subjects of your class.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Class</label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Subject</label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleGetGuide} disabled={loading} className="w-full gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {lang === 'bn' ? 'গাইড লোড করুন' : 'Get Guide'}
            </Button>
          </div>
        </div>

        {/* Quick Charts Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <ImageIcon className="h-4 w-4" /> {lang === 'bn' ? 'দ্রুত চার্ট ও শিট' : 'Quick Charts & Sheets'}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {QUICK_CHARTS.map((chart) => (
              <Button 
                key={chart.topic} 
                variant="outline" 
                size="sm" 
                onClick={() => showChart(chart.topic)}
                className="text-[10px] h-auto py-2 flex flex-col gap-1 border-border/50 hover:border-primary/50"
              >
                <span className="text-lg">{chart.icon}</span>
                {chart.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Output Area */}
        {(content || chartImage) && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-t border-border pt-4">
              <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                {content ? <FileText className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                {content ? (lang === 'bn' ? 'গাইড কন্টেন্ট' : 'Guide Content') : (lang === 'bn' ? 'ভিজ্যুয়াল চার্ট' : 'Visual Chart')}
              </h3>
              {content && (
                <Button variant="ghost" size="sm" onClick={downloadPDF} className="h-8 gap-2 text-xs">
                  <Download className="h-3 w-3" /> PDF
                </Button>
              )}
            </div>
            
            <ScrollArea className="h-[500px] w-full rounded-xl border border-border bg-secondary/30 p-6">
              {content && (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              )}
              {chartImage && (
                <div className="flex flex-col items-center gap-4">
                   <img 
                    src={chartImage} 
                    alt="Educational Chart" 
                    className="rounded-lg border border-border max-w-full h-auto shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
                  <p className="text-xs text-muted-foreground italic">
                    {lang === 'bn' ? '* এটি একটি রেফারেন্স ইমেজ।' : '* This is a reference image.'}
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
