import React, { useState, useEffect } from 'react';
import { 
  Moon, 
  Sun, 
  User, 
  Download, 
  Globe,
  Brain,
  Gamepad2,
  BarChart,
  Bell,
  FileText,
  Lightbulb,
  Trophy,
  LayoutDashboard,
  GraduationCap,
  Sparkles,
  Search,
  BookOpen,
  MessageSquare,
  Users,
  Clock,
  Crown,
  ShieldCheck,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { storage, UserProfile } from './lib/storage';
import { localAI } from './lib/localAI';
import { usePWA } from './hooks/usePWA';
import { useTranslation } from './lib/useTranslation';
import { affiliateEngine } from './lib/affiliate';

import { ChatBox } from './components/ChatBox';
import { AdminDashboard } from './components/AdminDashboard';
import { AssignmentSolver } from './components/AssignmentSolver';
import { GraphPlotter } from './components/GraphPlotter';
import { BusinessMode } from './components/BusinessMode';
import { WelcomeModal } from './components/WelcomeModal';
import { Dashboard } from './components/Dashboard';
import { ImageScanner } from './components/ImageScanner';
import { OwnerModal } from './components/OwnerModal';
import { PWAInstallDialog } from './components/PWAInstallDialog';

// New Systems
import { QuizSystem } from './components/QuizSystem';
import { QuizAnalytics } from './components/QuizAnalytics';
import { SmartNotes } from './components/SmartNotes';
import { SubjectsBoard } from './components/SubjectsBoard';
import { GamificationSystem } from './components/GamificationSystem';
import { AssignmentRecommender } from './components/AssignmentRecommender';
import { EducationalGames } from './components/EducationalGames';
import { ProfileSettings } from './components/ProfileSettings';
import { StudyHelp } from './components/StudyHelp';
import { SubjectDashboard } from './components/SubjectDashboard';
import { CommunityDoubts } from './components/CommunityDoubts';
import { PublicDashboard } from './components/PublicDashboard';
import { StudyGroups } from './components/StudyGroups';
import { Leaderboard } from './components/Leaderboard';
import { PremiumPage } from './components/PremiumPage';
import { StudyTimer } from './components/StudyTimer';
import { Calculator } from './components/Calculator';
import { AlgebraSolver } from './components/AlgebraSolver';
import { FormulaFinder } from './components/FormulaFinder';
import { AboutPage } from './components/AboutPage';
import { HowToUse } from './components/HowToUse';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { ContactPage } from './components/ContactPage';
import { RealtimeVoiceAssistant } from './components/ai/RealtimeVoiceAssistant';
import { AffiliateWallet } from './components/affiliate/AffiliateWallet';
import { isConfiguredAdmin } from './lib/firebase';

import { SplashScreen } from './components/SplashScreen';
import { Logo } from './components/Logo';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('tsolver_theme') !== 'light');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [showPWAInstructions, setShowPWAInstructions] = useState(false);
  const [showWhatsapp, setShowWhatsapp] = useState(false);
  const { isInstallable, isIOS, installApp } = usePWA();
  const { lang, t } = useTranslation();
  
  const [globalSettings, setGlobalSettings] = useState({
    maintenanceMode: false,
    publicRegistration: true,
    announcementText: '',
    enableGames: true,
    enableCommunity: true,
    aiProvider: 'local'
  });

  const handleInstallClick = () => {
    if (isIOS) {
      setShowPWAInstructions(true);
    } else {
      installApp();
    }
  };

  useEffect(() => {
    const init = async () => {
      await localAI.init();
      const user = await storage.getCurrentUser();
      setCurrentUser(user);
      setInitializing(false);
      
      // Referral tracking from ?ref=CODE
      const referralCode = new URLSearchParams(window.location.search).get('ref');
      if (referralCode) {
        await affiliateEngine.trackReferralVisit(referralCode);
        localStorage.setItem('tsolver_pending_referral', referralCode.toUpperCase());
      }

      // WhatsApp Popup logic
      const lastShown = localStorage.getItem('whatsapp_popup_shown');
      if (!lastShown) {
        setTimeout(() => setShowWhatsapp(true), 3000);
      }
      
      // Global Settings logic
      const savedSettings = localStorage.getItem('tsolver_global_settings');
      if (savedSettings) {
        try {
          setGlobalSettings(JSON.parse(savedSettings));
        } catch (e) {}
      }
    }
    init();

    // Listen for global settings updates
    const handleSettingsUpdate = (e: any) => {
      setGlobalSettings(e.detail);
    };
    window.addEventListener('tsolver-settings-updated', handleSettingsUpdate);

    // Listen for profile updates from ProfileSettings or other parts
    const handleProfileUpdate = (e: any) => {
      setCurrentUser(e.detail);
    };
    window.addEventListener('user-profile-updated', handleProfileUpdate);
    
    const handleAISolve = (e: any) => {
      setActiveTab('study');
      // Pass the text to StudyHelp if needed via custom data or just let user paste
      // Improved: set a temporary localStorage to be picked up
      localStorage.setItem('tsolver_temp_solve', e.detail);
    };
    window.addEventListener('start-ai-solve', handleAISolve);

    return () => {
      window.removeEventListener('user-profile-updated', handleProfileUpdate);
      window.removeEventListener('start-ai-solve', handleAISolve);
      window.removeEventListener('tsolver-settings-updated', handleSettingsUpdate);
    };
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tsolver_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tsolver_theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    await storage.logout();
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const handleJoinWhatsapp = () => {
    localStorage.setItem('whatsapp_popup_shown', Date.now().toString());
    window.open('https://chat.whatsapp.com/HOdKk2iQ03BKTEYJekwGnW', '_blank');
    setShowWhatsapp(false);
  };

  if (initializing) {
    return <SplashScreen />;
  }

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'EXPLORE HUB', icon: <LayoutDashboard size={18} /> },
    { id: 'tools', label: 'CALCULATOR', icon: <BarChart size={18} /> },
    { id: 'notes', label: 'SMART NOTES', icon: <FileText size={18} /> },
    { id: 'formulas', label: 'FORMULAS', icon: <BookOpen size={18} /> },
    { id: 'graph', label: 'GRAPHER', icon: <TrendingUp size={18} /> },
    { id: 'ai-voice', label: 'AI VOICE', icon: <Brain size={18} /> },
    { id: 'affiliate', label: 'WALLET', icon: <Wallet size={18} /> },
    { id: 'premium', label: 'PREMIUM', icon: <Crown size={18} /> },
    { 
      id: 'profile', 
      label: 'PROFILE', 
      icon: currentUser?.thumbnail || currentUser?.avatar ? (
        <img src={currentUser.thumbnail || currentUser.avatar} className="h-5 w-5 rounded-full object-cover border border-black/10 dark:border-white/20" alt="Avatar" />
      ) : (
        <User size={18} />
      )
    },
    { 
      id: 'admin', 
      label: 'ADMIN', 
      icon: <ShieldCheck size={18} /> 
    },
  ].filter(item => {
    if (item.id === 'admin') {
      return isConfiguredAdmin(currentUser);
    }
    return true;
  });

  const isAdmin = isConfiguredAdmin(currentUser);
  const PUBLIC_TABS = ['about', 'how-to-use', 'privacy', 'terms', 'contact'];
  const isPublicTab = PUBLIC_TABS.includes(activeTab);

  if (globalSettings.maintenanceMode && !isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center space-y-6 selection:bg-white selection:text-black">
        <Logo size="lg" />
        <h1 className="text-4xl font-black uppercase tracking-tighter italic">System Maintenance</h1>
        <p className="text-white/40 font-bold max-w-md">Our neural nodes are currently undergoing scheduled upgrades. Access will be restored shortly. Please stand by.</p>
        <div className="h-1 w-24 bg-white/10 rounded-full overflow-hidden relative">
           <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-white rounded-full animate-ping" />
        </div>
      </div>
    );
  }

  const NAV_ITEMS_MOBILE = NAV_ITEMS.filter((item) => ['dashboard', 'tools', 'ai-voice', 'affiliate', 'profile'].includes(item.id));

  return (
    <div className={`min-h-screen text-black dark:text-white transition-colors duration-500 selection:bg-white selection:text-black ${isDarkMode ? 'bg-black dark' : 'bg-[#f5f5f7] light'}`}>
      <WelcomeModal isOpen={!currentUser && !isPublicTab} onComplete={handleLogin} />
      <OwnerModal 
        isOpen={isOwnerModalOpen} 
        onClose={() => setIsOwnerModalOpen(false)} 
        isInstallable={isInstallable}
        isIOS={isIOS}
        onInstall={handleInstallClick}
      />
      <PWAInstallDialog isOpen={showPWAInstructions} onClose={() => setShowPWAInstructions(false)} />
      
      {currentUser && <SystemNotifications userId={currentUser.id} />}
      
      {globalSettings.announcementText && (
        <div className="bg-black text-white dark:bg-white dark:text-black px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest z-[100] relative flex items-center justify-center gap-3">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          {globalSettings.announcementText}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/40 dark:bg-black/40 backdrop-blur-2xl border-b border-black/5 dark:border-white/5 transition-all duration-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-24 flex items-center justify-between">
            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setActiveTab('about')}>
              <div className="relative">
                <Logo size="sm" className="group-hover:rotate-12 transition-transform duration-500" />
                <div className="absolute inset-0 bg-white/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black uppercase italic tracking-tighter leading-none">T-Solver</h1>
                  <div className="px-1.5 py-0.5 rounded-md bg-black dark:bg-white text-[6px] font-black text-white dark:text-black uppercase tracking-widest">v4.0</div>
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30 text-black dark:text-white">Neural Logic Engine</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <nav className="hidden lg:flex items-center gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 backdrop-blur-xl">
                 {NAV_ITEMS.map(item => (
                   <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`h-11 px-5 rounded-xl flex items-center gap-2.5 transition-all whitespace-nowrap text-[10px] font-black uppercase tracking-widest relative group ${activeTab === item.id ? 'text-black dark:text-white' : 'text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white'}`}
                   >
                     {activeTab === item.id && (
                       <motion.div 
                        layoutId="header-nav-bg"
                        className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-lg shadow-sm"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                       />
                     )}
                     <span className="relative z-10 opacity-70 group-hover:opacity-100 transition-opacity">{item.icon}</span>
                     <span className="relative z-10">{item.label}</span>
                   </button>
                 ))}
              </nav>

              <div className="flex items-center gap-2 sm:gap-3">
                <a
                  href="https://bucket.appilix.com/app-apk-f43e5bbbfe8442959b50eff40021598e-1778907950.apk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-2 h-10 px-4 sm:h-12 sm:px-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-glow hover:scale-105 transition-all"
                >
                  <Download size={16} />
                  Download App
                </a>
                <a
                  href="https://bucket.appilix.com/app-apk-f43e5bbbfe8442959b50eff40021598e-1778907950.apk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm:hidden flex items-center justify-center h-10 w-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-glow hover:scale-105 transition-all"
                >
                  <Download size={16} />
                </a>
                {currentUser && <NotificationBell userId={currentUser.id} />}
                <div className="h-10 w-[1px] bg-black/5 dark:bg-white/5 mx-2 hidden lg:block" />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsDarkMode(!isDarkMode)} 
                  className="rounded-2xl h-10 w-10 sm:h-12 sm:w-12 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all group"
                >
                  {isDarkMode ? <Sun className="h-5 w-5 group-hover:rotate-45 transition-transform" /> : <Moon className="h-5 w-5 group-hover:-rotate-12 transition-transform" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="safe-padding pb-32 pt-8 md:pt-12 min-h-[80vh]">
        {(currentUser || isPublicTab) && (
          <AnimatePresence mode="wait">
            {currentUser && activeTab === 'dashboard' && <Dashboard key="dash" user={currentUser} setActiveTab={setActiveTab} onExploreHub={setActiveSubject} />}
            {activeTab === 'tools' && <Calculator key="tools" />}
            {activeTab === 'notes' && <AlgebraSolver key="notes" />}
            {activeTab === 'formulas' && <FormulaFinder key="formulas" />}
            {currentUser && activeTab === 'graph' && <GraphPlotter key="graph" user={currentUser} />}
            {currentUser && activeTab === 'ai-voice' && <RealtimeVoiceAssistant key="ai-voice" user={currentUser} />}
            {currentUser && activeTab === 'affiliate' && <AffiliateWallet key="affiliate" user={currentUser} />}
            {currentUser && activeTab === 'premium' && <PremiumPage key="premium" user={currentUser} />}
            {currentUser && activeTab === 'profile' && <ProfileSettings key="profile" user={currentUser} onLogout={handleLogout} setActiveTab={setActiveTab} />}
            {isAdmin && activeTab === 'admin' && <AdminDashboard key="admin" />}
            
            {/* Fallbacks for internal links from dashboard cards */}
            {currentUser && activeTab === 'feed' && <PublicDashboard key="feed" user={currentUser} />}
            {currentUser && activeTab === 'doubts' && <CommunityDoubts key="doubts" user={currentUser} />}
            {currentUser && activeTab === 'groups' && <StudyGroups key="groups" user={currentUser} />}
            {currentUser && activeTab === 'leaderboard' && <Leaderboard key="leader" user={currentUser} />}
            {currentUser && activeTab === 'games' && <EducationalGames key="games" user={currentUser} />}
            {currentUser && activeTab === 'study' && <StudyHelp key="study" user={currentUser} setActiveTab={setActiveTab} />}
            {currentUser && activeTab === 'quiz' && <QuizSystem key="quiz" user={currentUser} />}
            {currentUser && activeTab === 'subjects' && <SubjectsBoard key="subjects" user={currentUser} onExploreHub={setActiveSubject} />}
            {activeTab === 'about' && <AboutPage key="about" />}
            {activeTab === 'how-to-use' && <HowToUse key="how-to-use" />}
            {activeTab === 'privacy' && <PrivacyPolicy key="privacy" />}
            {activeTab === 'terms' && <TermsOfService key="terms" />}
            {activeTab === 'contact' && <ContactPage key="contact" />}
          </AnimatePresence>
        )}
      </main>

      {/* Whatsapp Popup */}
      <AnimatePresence>
        {showWhatsapp && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-[48px] p-10 text-center space-y-8 shadow-2xl overflow-hidden relative"
            >
               <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />
               <div className="h-20 w-20 bg-green-500/10 rounded-[32px] flex items-center justify-center mx-auto">
                  <div className="text-green-500">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  </div>
               </div>
               <div className="space-y-3">
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter">Join Command Channel</h3>
                  <p className="text-black/40 dark:text-white/30 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                     Connect with 2,400+ scholars on our official WhatsApp community for daily insights.
                  </p>
               </div>
               <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleJoinWhatsapp}
                    className="h-16 w-full bg-green-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-green-500 transition-all shadow-[0_0_30px_rgba(22,163,74,0.3)]"
                  >
                     Establish Link
                  </button>
                  <button 
                    onClick={() => {
                       localStorage.setItem('whatsapp_popup_shown', Date.now().toString());
                       setShowWhatsapp(false);
                    }}
                    className="h-14 w-full bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/30 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-black dark:hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                     Abort Signal
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Bottom Navigation (Mobile/Tablet Focused) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-0 sm:px-4 sm:bottom-6">
         <div className="max-w-xl mx-auto bg-white/80 dark:bg-black/95 backdrop-blur-3xl border-t sm:border border-black/10 dark:border-white/10 sm:rounded-[24px] p-2 flex items-center justify-around shadow-2xl overflow-hidden shadow-glow">
            {NAV_ITEMS_MOBILE.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-2 transition-all relative group ${activeTab === item.id ? 'text-black dark:text-white' : 'text-black/30 dark:text-white/20'}`}
              >
                 <div className={`transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'scale-90 group-hover:scale-100'}`}>
                    {item.icon}
                 </div>
                 <span className={`text-[7px] font-black uppercase tracking-widest transition-all ${activeTab === item.id ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>
                    {item.id === 'dashboard' ? 'EXPLORE' : item.id === 'tools' ? 'TOOLS' : item.label.split(' ')[0]}
                 </span>
                 {activeTab === item.id && (
                   <motion.div 
                    layoutId="active-nav-indicator"
                    className="absolute -bottom-1 h-0.5 w-4 bg-black dark:bg-white rounded-full"
                   />
                 )}
              </button>
            ))}
         </div>
      </div>

      {/* Copyright Footer */}
      <footer className="py-32 pb-48 relative overflow-hidden border-t border-black/5 dark:border-white/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-16">
          <div className="flex flex-col items-center gap-6">
            <Logo size="md" />
            <div className="flex flex-col items-center">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">T-Solver</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 mt-2">Next-Gen Scholastic Platform</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-[10px] font-black uppercase tracking-[0.3em]">
             <button onClick={() => setActiveTab('about')} className="hover:text-primary transition-colors relative group">
                About
                <div className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary group-hover:w-full transition-all" />
             </button>
             <button onClick={() => setActiveTab('how-to-use')} className="hover:text-primary transition-colors relative group">
                Guide
                <div className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary group-hover:w-full transition-all" />
             </button>
             <button onClick={() => setActiveTab('privacy')} className="hover:text-primary transition-colors relative group">
                Privacy
                <div className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary group-hover:w-full transition-all" />
             </button>
             <button onClick={() => setActiveTab('terms')} className="hover:text-primary transition-colors relative group">
                Terms
                <div className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary group-hover:w-full transition-all" />
             </button>
             <button onClick={() => setActiveTab('contact')} className="hover:text-primary transition-colors relative group">
                Contact
                <div className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary group-hover:w-full transition-all" />
             </button>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.5em] opacity-20 select-none pointer-events-none text-center">
               <span>© {new Date().getFullYear()} T-Solver Corporation</span>
               <div className="h-1.5 w-1.5 bg-black dark:bg-white rounded-full opacity-20" />
               <span>All Rights Reserved</span>
            </div>
            <div className="text-[8px] font-black uppercase tracking-[0.4em] opacity-40">
               Architected with precision by <span className="text-primary opacity-100">Tachin Ahmed Rion</span>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {activeSubject && currentUser && (
          <SubjectDashboard 
            subjectId={activeSubject} 
            user={currentUser} 
            onClose={() => setActiveSubject(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SystemNotifications({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const checkNotifications = () => {
      const all = JSON.parse(localStorage.getItem('tsolver_notifications') || '[]');
      const myUnread = all.filter((n: any) => n.targetUserId === userId && !n.read);
      if (JSON.stringify(myUnread) !== JSON.stringify(notifications)) {
        setNotifications(myUnread);
      }
    };
    
    checkNotifications();
    const interval = setInterval(checkNotifications, 2000);
    return () => clearInterval(interval);
  }, [userId, notifications]);

  const markAsRead = (id: string) => {
    const all = JSON.parse(localStorage.getItem('tsolver_notifications') || '[]');
    const updated = all.map((n: any) => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem('tsolver_notifications', JSON.stringify(updated));
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-28 right-4 md:right-8 z-[100] flex flex-col gap-3 w-full max-w-sm px-4 md:px-0">
      <AnimatePresence>
        {notifications.map(n => (
          <motion.div 
            key={n.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="p-5 flex gap-4 bg-white dark:bg-black border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.15)] rounded-2xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 relative z-10">
              <Bell className="text-blue-500 animate-pulse" size={20} />
            </div>
            <div className="flex-1 space-y-1 pt-1 relative z-10">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white">System Alert</h4>
              <p className="text-xs font-bold text-black/60 dark:text-white/60 leading-relaxed">{n.message}</p>
            </div>
            <button onClick={() => markAsRead(n.id)} className="self-start text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white relative z-10 h-6 w-6 flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-full">
              <span className="text-xs font-black">&times;</span>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkNotifications = () => {
      const all = JSON.parse(localStorage.getItem('tsolver_notifications') || '[]');
      const myNotifications = all.filter((n: any) => n.targetUserId === userId).sort((a:any, b:any) => b.timestamp - a.timestamp);
      if (JSON.stringify(myNotifications) !== JSON.stringify(notifications)) {
        setNotifications(myNotifications);
      }
    };
    
    checkNotifications();
    const interval = setInterval(checkNotifications, 2000);
    return () => clearInterval(interval);
  }, [userId, notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    const all = JSON.parse(localStorage.getItem('tsolver_notifications') || '[]');
    const updated = all.map((n: any) => n.targetUserId === userId ? { ...n, read: true } : n);
    localStorage.setItem('tsolver_notifications', JSON.stringify(updated));
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    const all = JSON.parse(localStorage.getItem('tsolver_notifications') || '[]');
    const updated = all.filter((n: any) => n.id !== id);
    localStorage.setItem('tsolver_notifications', JSON.stringify(updated));
    setNotifications(notifications.filter(n => n.id !== id));
  }
  
  const clearAll = () => {
    const all = JSON.parse(localStorage.getItem('tsolver_notifications') || '[]');
    const updated = all.filter((n: any) => n.targetUserId !== userId);
    localStorage.setItem('tsolver_notifications', JSON.stringify(updated));
    setNotifications([]);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => { setIsOpen(!isOpen); if (!isOpen && unreadCount > 0) markAllAsRead(); }}
        className="relative rounded-2xl h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
      >
        <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-[16px] sm:h-5 sm:min-w-[20px] px-1 sm:px-1.5 rounded-full bg-red-500 text-white text-[8px] sm:text-[9px] font-black flex items-center justify-center border-2 border-white dark:border-black shadow-glow">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-[120%] w-[300px] sm:w-[320px] max-h-[400px] overflow-y-auto bg-white/90 dark:bg-black/90 backdrop-blur-3xl border border-black/10 dark:border-white/10 rounded-2xl p-4 z-50 flex flex-col gap-2 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-2 px-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Notifications</span>
                {notifications.length > 0 && (
                   <button onClick={clearAll} className="text-[9px] font-bold text-red-500 uppercase tracking-widest hover:underline">Clear All</button>
                )}
              </div>
              
              {notifications.length === 0 ? (
                <div className="py-8 text-center flex flex-col items-center opacity-50">
                   <Bell size={24} className="mb-2 text-black/20 dark:text-white/20" />
                   <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">No new alerts</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={`p-4 rounded-xl border relative group transition-all ${n.read ? 'bg-black/5 dark:bg-white/5 border-transparent' : 'bg-blue-500/10 border-blue-500/20 shadow-glow'}`}>
                    <p className="text-[11px] font-bold leading-relaxed text-black dark:text-white">{n.message}</p>
                    <div className="mt-2 flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-black/30 dark:text-white/30">
                      <span>{new Date(n.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-black/40 hover:text-red-500 dark:text-white/40 dark:hover:text-red-500">
                      <span className="text-xs">&times;</span>
                    </button>
                  </div>
                ))
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
