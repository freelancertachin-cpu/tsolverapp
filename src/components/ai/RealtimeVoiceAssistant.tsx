import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Mic, MicOff, Pause, Play, RefreshCcw, Send, Settings2, Volume2, X } from 'lucide-react';
import { UserProfile, storage } from '../../lib/storage';
import { vectorMemory } from '../../lib/vectorMemory';
import { realtimeBus } from '../../services/realtime';
import { securityEngine } from '../../services/security';
import { FloatingOrb, OrbState } from './FloatingOrb';
import { VoiceWave } from './VoiceWave';

interface VoiceTurn {
  id: string;
  role: 'student' | 'ai';
  text: string;
  timestamp: number;
}

const getSpeechRecognition = () => (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const RealtimeVoiceAssistant: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [autoListen, setAutoListen] = useState(false);
  const [language, setLanguage] = useState<'bn-BD' | 'en-US'>('bn-BD');
  const [voiceMode, setVoiceMode] = useState<'teacher' | 'friendly' | 'cinematic'>('teacher');
  const [transcript, setTranscript] = useState('');
  const [typedMessage, setTypedMessage] = useState('');
  const [turns, setTurns] = useState<VoiceTurn[]>([]);
  const recognitionRef = useRef<any>(null);
  const speakingRef = useRef(false);

  const recognitionSupported = useMemo(() => Boolean(getSpeechRecognition()), []);

  useEffect(() => {
    if (!recognitionSupported) return;
    const SpeechRecognition = getSpeechRecognition();
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      setOrbState('listening');
      realtimeBus.publish('voice:start', { language }, user.id);
    };

    recognition.onresult = (event: any) => {
      let finalText = '';
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += text;
        else interimText += text;
      }
      setTranscript(interimText || finalText);
      if (finalText.trim()) {
        handleStudentMessage(finalText.trim());
      }
    };

    recognition.onerror = () => {
      setOrbState('error');
      setAutoListen(false);
    };

    recognition.onend = () => {
      realtimeBus.publish('voice:end', { language }, user.id);
      if (autoListen && !speakingRef.current) {
        try {
          recognition.start();
        } catch {
          setOrbState('idle');
        }
      } else {
        setOrbState('idle');
      }
    };

    recognitionRef.current = recognition;
    return () => recognition.stop();
  }, [autoListen, language, recognitionSupported, user.id]);

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = voiceMode === 'cinematic' ? 0.84 : voiceMode === 'teacher' ? 0.92 : 1;
    utterance.pitch = voiceMode === 'friendly' ? 1.1 : 0.95;
    utterance.onstart = () => {
      speakingRef.current = true;
      setOrbState('speaking');
      realtimeBus.publish('ai:audio', { mode: voiceMode }, user.id);
    };
    utterance.onend = () => {
      speakingRef.current = false;
      setOrbState(autoListen ? 'listening' : 'idle');
      if (autoListen) startListening();
    };
    window.speechSynthesis.speak(utterance);
  };

  const createTutorReply = (message: string) => {
    const memory = vectorMemory.summarizeForPrompt(user.id, message);
    const lower = message.toLowerCase();
    let reply = 'আমি বুঝেছি। আগে মূল ধারণাটা পরিষ্কার করি, তারপর ছোট ধাপে সমাধান করব।';

    if (lower.includes('math') || lower.includes('solve') || lower.includes('সমাধান') || lower.includes('গণিত')) {
      reply = 'গণিতের ক্ষেত্রে আগে formula, তারপর given value, তারপর calculation—এই পুরোনো নিয়মটাই safest. প্রশ্নটা ভেঙে ধাপে ধাপে solve করি।';
    } else if (lower.includes('english') || lower.includes('speaking') || lower.includes('grammar')) {
      reply = 'English practice এর জন্য আগে simple sentence ঠিক করি, তারপর pronunciation ও fluency বাড়াই। তুমি sentence বলো, আমি natural করে দেব।';
    } else if (lower.includes('physics') || lower.includes('পদার্থ')) {
      reply = 'Physics বুঝতে diagram, formula, unit—এই তিনটা আগে ধরতে হয়। Conceptটা everyday example দিয়ে বুঝাই।';
    } else if (lower.includes('coding') || lower.includes('code') || lower.includes('programming')) {
      reply = 'Coding শেখার best way হলো small problem, clean logic, তারপর debug. Error বা topic বলো, আমি mentor mode এ বুঝাচ্ছি।';
    }

    if (memory) {
      reply += ` তোমার আগের learning memory অনুযায়ী আমি এই অংশটা আরেকটু সহজ করে বলব: ${memory.split('\n')[0]?.replace('- ', '')}`;
    }

    return reply;
  };

  const handleStudentMessage = async (text: string) => {
    const limit = securityEngine.rateLimit(`voice-${user.id}`, 25, 60_000);
    if (!limit.allowed) {
      setOrbState('error');
      return;
    }

    const cleanText = securityEngine.sanitizeText(text);
    setTranscript('');
    const studentTurn: VoiceTurn = { id: crypto.randomUUID(), role: 'student', text: cleanText, timestamp: Date.now() };
    setTurns((prev) => [studentTurn, ...prev].slice(0, 30));
    realtimeBus.publish('ai:thinking', { prompt: cleanText }, user.id);
    setOrbState('thinking');

    await storage.saveChat({
      id: studentTurn.id,
      userId: user.id,
      text: cleanText,
      sender: 'user',
      timestamp: studentTurn.timestamp,
      category: 'voice-ai'
    });
    vectorMemory.learnFromChat({
      id: studentTurn.id,
      userId: user.id,
      text: cleanText,
      sender: 'user',
      timestamp: studentTurn.timestamp,
      category: 'voice-ai'
    });

    window.setTimeout(async () => {
      const reply = createTutorReply(cleanText);
      const aiTurn: VoiceTurn = { id: crypto.randomUUID(), role: 'ai', text: reply, timestamp: Date.now() };
      setTurns((prev) => [aiTurn, ...prev].slice(0, 30));
      realtimeBus.publish('ai:text', { text: reply }, user.id);
      await storage.saveChat({
        id: aiTurn.id,
        userId: user.id,
        text: reply,
        sender: 'bot',
        timestamp: aiTurn.timestamp,
        category: 'voice-ai'
      });
      speak(reply);
    }, 700);
  };

  const startListening = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.lang = language;
      recognitionRef.current.start();
    } catch {
      // Browser can throw if already started. Ignore safely.
    }
  };

  const stopListening = () => {
    setAutoListen(false);
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
    speakingRef.current = false;
    realtimeBus.publish('user:interrupt', { reason: 'manual-stop' }, user.id);
    setOrbState('idle');
  };

  const toggleAutoListen = () => {
    if (!recognitionSupported) return;
    const next = !autoListen;
    setAutoListen(next);
    if (next) startListening();
    else stopListening();
  };

  const sendTypedMessage = () => {
    if (!typedMessage.trim()) return;
    handleStudentMessage(typedMessage);
    setTypedMessage('');
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-24 space-y-10">
      <div className="relative overflow-hidden rounded-[48px] border border-white/10 bg-black p-8 md:p-12 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,.16),transparent_40%)]" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-10 items-center">
          <div className="flex flex-col items-center justify-center gap-8">
            <FloatingOrb state={orbState} />
            <VoiceWave active={orbState === 'listening' || orbState === 'speaking'} />
            {!recognitionSupported && (
              <p className="text-center text-xs font-bold text-red-300/80">This browser does not support live speech recognition. Text mode still works.</p>
            )}
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-[9px] font-black uppercase tracking-[0.35em] text-cyan-200">
                <Bot size={14} /> Realtime AI Tutor
              </div>
              <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white">Live Voice Coach</h2>
              <p className="max-w-2xl text-sm font-bold leading-7 text-white/45">
                Continuous voice, AI interruption, Bengali + English mixed tutoring, memory-aware reply, study coaching and speaking practice in one premium panel.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'bn-BD' | 'en-US')}
                className="h-14 rounded-2xl border border-white/10 bg-white/5 px-4 text-xs font-black uppercase tracking-widest text-white outline-none"
              >
                <option value="bn-BD" className="bg-black">Bangla + English</option>
                <option value="en-US" className="bg-black">English</option>
              </select>
              <select
                value={voiceMode}
                onChange={(e) => setVoiceMode(e.target.value as 'teacher' | 'friendly' | 'cinematic')}
                className="h-14 rounded-2xl border border-white/10 bg-white/5 px-4 text-xs font-black uppercase tracking-widest text-white outline-none"
              >
                <option value="teacher" className="bg-black">Teacher Voice</option>
                <option value="friendly" className="bg-black">Friendly Voice</option>
                <option value="cinematic" className="bg-black">Cinematic Voice</option>
              </select>
              <button
                onClick={() => setTurns([])}
                className="h-14 rounded-2xl border border-white/10 bg-white/5 px-4 text-xs font-black uppercase tracking-widest text-white/50 hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
              >
                <RefreshCcw size={14} /> Reset
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={toggleAutoListen}
                disabled={!recognitionSupported}
                className={`h-16 flex-1 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${autoListen ? 'bg-red-500 text-white' : 'bg-white text-black'} disabled:opacity-30`}
              >
                {autoListen ? <MicOff size={18} /> : <Mic size={18} />} {autoListen ? 'Stop Live Mode' : 'Start Live Mode'}
              </button>
              <button
                onClick={stopListening}
                className="h-16 px-8 rounded-2xl border border-white/10 bg-white/5 text-xs font-black uppercase tracking-widest text-white/50 hover:text-white transition-all flex items-center justify-center gap-3"
              >
                <X size={18} /> Interrupt
              </button>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 min-h-[80px]">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mb-2">Live Transcript</p>
              <p className="text-sm font-bold text-white/70">{transcript || 'Voice transcript will appear here while you speak.'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <div className="cyber-panel p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <Volume2 size={18} className="text-cyan-300" />
            <h3 className="text-xs font-black uppercase tracking-[0.35em] text-white/40">Conversation Stream</h3>
          </div>

          <div className="flex gap-3">
            <input
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendTypedMessage()}
              placeholder="Type here if mic is unavailable..."
              className="h-14 flex-1 rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-bold text-white outline-none placeholder:text-white/15"
            />
            <button onClick={sendTypedMessage} className="h-14 w-14 rounded-2xl bg-white text-black flex items-center justify-center">
              <Send size={18} />
            </button>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2">
            <AnimatePresence mode="popLayout">
              {turns.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-white/10 p-10 text-center text-xs font-bold text-white/25">
                  Start live mode or type a question. Your AI tutor will reply with voice and save learning memory.
                </div>
              ) : (
                turns.map((turn) => (
                  <motion.div
                    key={turn.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className={`rounded-[28px] p-5 border ${turn.role === 'ai' ? 'bg-cyan-400/10 border-cyan-400/20' : 'bg-white/[0.04] border-white/10'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-black uppercase tracking-[0.35em] text-white/35">{turn.role === 'ai' ? 'AI Tutor' : user.name}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/15">{new Date(turn.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm font-bold leading-7 text-white/75">{turn.text}</p>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="cyber-panel p-7 space-y-6">
          <div className="flex items-center gap-3">
            <Settings2 size={18} className="text-purple-300" />
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40">Engine Map</h3>
          </div>
          {[
            ['Voice', 'Browser STT live fallback'],
            ['AI', 'Memory-aware tutor reply'],
            ['Memory', 'Local vector-style recall'],
            ['Realtime', 'Broadcast + Firebase-ready events'],
            ['Security', 'Rate limit + sanitized text']
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.35em] text-white/20">{label}</p>
              <p className="mt-1 text-xs font-bold text-white/60">{value}</p>
            </div>
          ))}
          <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-xs font-bold leading-6 text-yellow-100/70">
            Premium TTS engines like Coqui / ElevenLabs can be connected from the server layer later. This build keeps a safe browser fallback so the current Vite app runs without backend breakage.
          </div>
        </div>
      </div>
    </div>
  );
};
