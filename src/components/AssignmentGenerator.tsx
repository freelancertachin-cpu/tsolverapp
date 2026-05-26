import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Sparkles, Loader2, Download, Copy, Check } from 'lucide-react';
import { localAI } from '@/lib/localAI';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '@/components/ui/scroll-area';
import { jsPDF } from 'jspdf';

export const AssignmentGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const lang = localStorage.getItem('tsolver-lang') || 'bn';

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult(null);

    const prompt = `
      Create a full academic assignment on the topic: "${topic}".
      The assignment must include:
      1. A catchy Title
      2. A detailed Introduction
      3. 5 deep Questions with comprehensive Answers
      4. A detailed Explanation of the core concepts
      5. A solid Conclusion
      
      Make it student-friendly and professional. 
      Language: ${lang === 'bn' ? 'Bengali' : 'English'}.
    `;

    try {
      const res = await localAI.process(`Write a full assignment about: ${topic}. Include title, intro, questions/answers, and conclusion.`);
      setResult(res);
    } catch (err: any) {
      console.error(err);
      setResult(lang === 'bn' ? "অ্যাসাইনমেন্ট তৈরি করতে ব্যর্থ হয়েছে।" : "Failed to generate assignment.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(result, 180);
    doc.text(splitText, 10, 10);
    doc.save(`${topic.replace(/\s+/g, '_')}_Assignment.pdf`);
  };

  return (
    <Card className="glass border-none neon-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <FileText className="h-5 w-5" />
          {lang === 'bn' ? 'অটো অ্যাসাইনমেন্ট জেনারেটর' : 'Auto Assignment Generator'}
        </CardTitle>
        <CardDescription>
          {lang === 'bn' 
            ? 'যেকোনো টপিক দিন, AI আপনার জন্য পুরো অ্যাসাইনমেন্ট লিখে দিবে।' 
            : 'Enter any topic, AI will write a full assignment for you.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Input 
            placeholder={lang === 'bn' ? 'টপিক লিখুন (যেমন: জলবায়ু পরিবর্তন)...' : 'Enter topic (e.g. Climate Change)...'}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            className="bg-secondary border-border"
          />
          <Button onClick={handleGenerate} disabled={loading || !topic.trim()} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {lang === 'bn' ? 'তৈরি করুন' : 'Generate'}
          </Button>
        </div>

        {result && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-primary uppercase tracking-widest">Generated Assignment</h3>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 gap-2 text-xs">
                  {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
                <Button variant="ghost" size="sm" onClick={downloadPDF} className="h-8 gap-2 text-xs">
                  <Download className="h-3 w-3" /> PDF
                </Button>
              </div>
            </div>
            <ScrollArea className="h-[500px] w-full rounded-xl border border-border bg-secondary/30 p-6">
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
