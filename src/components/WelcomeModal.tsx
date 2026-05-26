import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, LogIn, Info, Loader2, Globe, GraduationCap, ArrowRight, UserCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { storage, UserProfile } from '../lib/storage';
import { translations, SupportedLanguage } from '../lib/translations';
import { AppDetails } from './AppDetails';
import { Logo } from './Logo';

interface WelcomeModalProps {
  isOpen: boolean;
  onComplete: (user: UserProfile) => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onComplete }) => {
  const [mode, setMode] = useState<'lang' | 'welcome' | 'login' | 'signup' | 'select' | 'details'>('lang');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<SupportedLanguage>('bn');
  const [level, setLevel] = useState('School');
  const [rememberMe, setRememberMe] = useState(true);
  
  // User data for signup
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  const translations_map: Record<string, string> = {
    bn: 'বাংলা',
    en: 'English'
  };

  const t = translations[lang] || translations.en;

  const [globalSettings, setGlobalSettings] = useState({
    publicRegistration: true,
  });

  useEffect(() => {
    // Attempt local lang detection
    const saved = localStorage.getItem('tsolver_lang') as SupportedLanguage;
    if (saved) {
      setLang(saved);
      // We still show the welcome screen if they aren't fully initialized
      setMode('welcome'); 
    }

    const savedSettings = localStorage.getItem('tsolver_global_settings');
    if (savedSettings) {
      try {
        setGlobalSettings(JSON.parse(savedSettings));
      } catch (e) {}
    }
  }, []);

  const handleCreateProfile = async (isGuest = false) => {
    setLoading(true);
    const userId = isGuest ? 'guest_' + Math.random().toString(36).substring(7) : Math.random().toString(36).substring(7);
    const newUser: UserProfile = {
      id: userId,
      name: isGuest ? 'T-Solver Guest' : (name || 'T-Solver student'),
      email: isGuest ? 'guest@local.host' : (email || ''),
      phone: isGuest ? '' : (phone || ''),
      password: password, // Supabase handles hashing
      level: level,
      joinDate: Date.now(),
      preferences: {
        lang: lang,
        darkMode: true
      }
    };
    
    try {
      await storage.signup(newUser, isGuest ? true : rememberMe);
      
      localStorage.setItem('tsolver_lang', lang);
      onComplete(newUser);
    } catch (err) {
      console.error(err);
      alert('Initialization failed. Check network link.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginAction = async () => {
    setLoading(true);
    try {
      const user = await storage.login(email, password, rememberMe);
      if (user) {
        onComplete(user);
      } else {
        alert('Credentials rejected by secure node.');
      }
    } catch (err) {
      console.error(err);
      alert('Neural link failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const user = await storage.loginWithGoogle();
      if (user) {
        localStorage.setItem('tsolver_lang', lang);
        onComplete(user);
      } else {
        alert('Google authentication failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md bg-black border border-white/10 p-0 rounded-[40px] shadow-2xl shadow-white/5 overflow-hidden no-scrollbar">
                <div className="flex flex-col h-full max-h-[90vh] relative overflow-y-auto no-scrollbar">
          
          <AnimatePresence mode="wait">
            {mode === 'lang' && (
              <motion.div 
                key="lang"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 md:p-12 flex flex-col items-center text-center space-y-8 md:space-y-10"
              >
                <button 
                  onClick={() => setMode('welcome')}
                  className="absolute top-8 right-8 text-white/40 hover:text-white transition-all"
                >
                  <X size={20} />
                </button>

                <Logo size="lg" className="mb-4" />

                <div className="space-y-6 w-full">
                  <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white">{t.welcome}</h2>
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 block text-center">Select Language / ভাষা নির্বাচন করুন</Label>
                    <div className="grid grid-cols-2 gap-2">
                       {(Object.keys(translations) as SupportedLanguage[]).map((l) => (
                         <button 
                          key={l}
                          onClick={() => setLang(l)}
                          className={`h-14 rounded-2xl border transition-all text-sm font-black italic uppercase ${lang === l ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                         >
                           {translations_map[l]}
                         </button>
                       ))}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setMode('welcome')}
                  className="w-full h-14 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-glow"
                >
                  Continue / এগিয়ে যান
                </button>
              </motion.div>
            )}

            {mode === 'welcome' && (
              <motion.div 
                key="welcome"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-8 md:p-12 flex flex-col items-center text-center space-y-10"
              >
                <button 
                  onClick={() => setMode('lang')}
                  className="absolute top-8 right-8 text-white/40 hover:text-white transition-all"
                >
                  <X size={20} />
                </button>

                <Logo size="lg" className="mb-4" />

                <div className="space-y-6 text-center">
                  <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white">{t.welcome}</h2>
                  <div className="max-w-md mx-auto space-y-4">
                    <p className="text-white/60 text-sm font-bold leading-relaxed px-2 italic">
                       {t.description}
                    </p>
                  </div>
                </div>

                <div className="w-full flex flex-col gap-3">
                  <button 
                    onClick={handleGoogleLogin}
                    className="h-14 flex items-center justify-center gap-3 rounded-2xl bg-white text-black font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-glow"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" className="mr-1">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>
                  <div className="flex gap-2">
                    {globalSettings.publicRegistration && (
                      <button 
                        onClick={() => setMode('signup')}
                        className="h-14 flex-1 flex items-center justify-center gap-3 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all"
                      >
                        <UserPlus size={16} className="text-white/40" /> {t.signup}
                      </button>
                    )}
                    <button 
                      onClick={() => setMode('login')}
                      className="h-14 flex-1 flex items-center justify-center gap-3 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all"
                    >
                      <LogIn size={16} className="text-white/40" /> {t.login}
                    </button>
                  </div>
                  <button 
                    onClick={() => handleCreateProfile(true)}
                    className="h-14 flex items-center justify-center gap-3 text-white/80 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all underline decoration-white/10 underline-offset-8"
                  >
                    <UserCircle2 size={18} className="text-white/40" /> {t.guest}
                  </button>
                </div>

                <button 
                  onClick={() => setMode('details')}
                  className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-all underline underline-offset-8 decoration-white/10"
                >
                  অ্যাপ ডিটেইলস দেখুন
                </button>
              </motion.div>
            )}

            {mode === 'signup' && (
              <motion.div 
                key="signup"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="p-8 md:p-16 space-y-8 h-full overflow-y-auto no-scrollbar"
              >
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                    <UserCircle2 size={24} className="text-white/40" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tight">{t.signup}</h3>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Initialize profile heritage</p>
                  </div>
                </div>

                <button 
                  onClick={handleGoogleLogin}
                  className="w-full h-14 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-glow flex items-center justify-center gap-3"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign Up with Google
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                  <div className="relative flex justify-center text-[7px] uppercase font-black tracking-[0.4em]"><span className="bg-black px-4 text-white/10 italic">Or Manual Entry</span></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-white/30">{t.name}</Label>
                     <Input 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="TACHIN"
                        className="h-14 bg-white/5 border-white/10 text-base font-black tracking-tight rounded-2xl placeholder:text-white/5"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-white/30">{t.phone}</Label>
                     <Input 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="h-14 bg-white/5 border-white/10 text-base font-black tracking-tight rounded-2xl placeholder:text-white/5"
                     />
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-white/30">{t.email}</Label>
                     <Input 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tachin@local.node"
                        type="email"
                        className="h-14 bg-white/5 border-white/10 text-base font-black tracking-tight rounded-2xl placeholder:text-white/5"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-white/30">{t.password}</Label>
                     <Input 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        type="password"
                        className="h-14 bg-white/5 border-white/10 text-base font-black tracking-tight rounded-2xl placeholder:text-white/5"
                     />
                   </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button onClick={() => setMode('welcome')} className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white">{t.cancel}</button>
                  <button 
                    onClick={() => setMode('select')}
                    disabled={!name || !email || !password}
                    className="h-14 px-8 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest disabled:opacity-20 active:scale-95 transition-all flex items-center gap-3"
                  >
                    Phase 2 <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {mode === 'select' && (
              <motion.div 
                key="select"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="p-8 md:p-16 space-y-12"
              >
                <div className="space-y-2">
                  <h3 className="text-3xl font-black uppercase italic tracking-tight text-center">Neural Configuration</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20 text-center">Finalizing user environment parameters</p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 block text-center italic">{t.selectLevel}</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { val: 'School', label: t.school },
                        { val: 'College', label: t.college },
                        { val: 'University', label: t.university }
                      ].map(l => (
                        <button
                          key={l.val}
                          onClick={() => setLevel(l.val)}
                          className={`h-20 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 group ${
                            level === l.val 
                            ? 'bg-white text-black border-white shadow-glow' 
                            : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20 hover:bg-white/10'
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase tracking-tighter">{l.label}</span>
                          <div className={`h-1 w-6 rounded-full transition-all ${level === l.val ? 'bg-black/20' : 'bg-white/10'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 block text-center italic">{t.selectLang}</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                       {Object.keys(translations).map(l => (
                         <button
                          key={l}
                          onClick={() => setLang(l as SupportedLanguage)}
                          className={`h-12 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
                            lang === l 
                            ? 'bg-white/20 text-white border-white/40' 
                            : 'bg-white/5 text-white/20 border-white/5 hover:bg-white/10'
                          }`}
                         >
                           {l}
                         </button>
                       ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 pt-4">
                  <div className="flex items-center justify-center gap-3 py-2 cursor-pointer group" onClick={() => setRememberMe(!rememberMe)}>
                    <div className={`h-5 w-5 rounded-md border-2 transition-all flex items-center justify-center ${rememberMe ? 'bg-white border-white shadow-glow' : 'border-white/20'}`}>
                      {rememberMe && <ArrowRight size={12} className="text-black" />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Remember my parameters</span>
                  </div>

                  <button 
                    onClick={() => handleCreateProfile(!name)}
                    className="h-16 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest shadow-glow hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <><Globe size={16} /> {t.create}</>}
                  </button>
                  <button 
                    onClick={() => setMode('welcome')}
                    className="h-12 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all"
                  >
                    {t.cancel}
                  </button>
                </div>
              </motion.div>
            )}

            {mode === 'details' && (
              <motion.div 
                key="details"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="p-8 md:p-12 overflow-y-auto no-scrollbar h-full"
              >
                <AppDetails lang={lang} onClose={() => setMode('welcome')} />
              </motion.div>
            )}
            
            {mode === 'login' && (
              <motion.div 
                key="login"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="p-8 md:p-16 flex flex-col items-center gap-8"
              >
                <Logo size="lg" className="mb-4" />
                <div className="text-center space-y-2">
                  <h3 className="text-4xl font-black uppercase tracking-tighter italic">Neural Retrieval</h3>
                  <p className="text-[10px] font-bold text-white/20 leading-relaxed uppercase tracking-[0.2em] max-w-[240px] mx-auto">Authorize node access</p>
                </div>
                <div className="w-full space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/30">{t.email}</Label>
                    <Input 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tachin@local.node"
                      type="email"
                      className="h-14 bg-white/5 border-white/10 text-base font-black tracking-tight rounded-2xl placeholder:text-white/5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/30">{t.password}</Label>
                    <Input 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      type="password"
                      className="h-14 bg-white/5 border-white/10 text-base font-black tracking-tight rounded-2xl placeholder:text-white/5"
                    />
                  </div>
                  
                  <div className="flex items-center justify-center gap-3 py-2 cursor-pointer group" onClick={() => setRememberMe(!rememberMe)}>
                    <div className={`h-5 w-5 rounded-md border-2 transition-all flex items-center justify-center ${rememberMe ? 'bg-white border-white shadow-glow' : 'border-white/20'}`}>
                      {rememberMe && <ArrowRight size={12} className="text-black" />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors font-black">Stay logged into node</span>
                  </div>

                  <button 
                    onClick={handleLoginAction}
                    className="w-full h-16 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest shadow-glow hover:scale-105 active:scale-95 transition-all"
                  >
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : t.login}
                  </button>
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                    <div className="relative flex justify-center text-[8px] uppercase font-black tracking-[0.4em]"><span className="bg-black px-4 text-white/20 italic">Or Sync Identity</span></div>
                  </div>
                  <button 
                    onClick={handleGoogleLogin}
                    className="w-full h-14 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </button>
                  <button onClick={() => setMode('welcome')} className="w-full text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white py-4">{t.cancel}</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

