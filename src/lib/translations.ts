export type SupportedLanguage = 'bn' | 'en';

export type TranslationSchema = {
  // Auth & General
  welcome: string;
  tagline: string;
  description: string;
  login: string;
  signup: string;
  guest: string;
  logout: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  loading: string;
  error: string;
  success: string;
  
  // Dashboard & Navigation
  dashboard: string;
  explore: string;
  profile: string;
  settings: string;
  subjects: string;
  leaderboard: string;
  analytics: string;
  community: string;
  doubts: string;
  
  // Stats
  xp: string;
  streak: string;
  level: string;
  levelSuffix: string;
  studyTime: string;
  rank: string;
  coins: string;
  
  // Features
  aiTeacher: string;
  smartNotes: string;
  games: string;
  assignments: string;
  quiz: string;
  ocr: string;
  voiceTutor: string;
  career: string;
  
  // Levels
  studentType: string;
  school: string;
  college: string;
  university: string;
  
  // Subjects
  math: string;
  physics: string;
  chemistry: string;
  biology: string;
  ict: string;
  english: string;
  bangla: string;
  accounting: string;
  economics: string;
  
  // Interaction
  askAI: string;
  startLearning: string;
  seeAllFeatures: string;
  comingSoon: string;
  create: string;
  cancel: string;
  save: string;
  edit: string;
  delete: string;
  
  // Labels
  greeting: string;
  desc: string;
  selectLevel: string;
  selectLang: string;
  placeholderSearch: string;
  placeholderAsk: string;
  noData: string;
  
  // Footer & Info
  about: string;
  howToUse: string;
  privacy: string;
  terms: string;
  contact: string;
  location: string;
  year: string;
  developer: string;
  
  // Premium
  premiumButton: string;
  premiumStatus: string;
  freeTrial: string;
  buyNow: string;
  transactionId: string;
  screenshot: string;
  language: string;
  calc: string;
  formula: string;
  graph: string;
  history: string;
  noHistory: string;
};

export const translations: Record<SupportedLanguage, TranslationSchema> = {
  en: {
    welcome: "Welcome to T-Solver",
    tagline: "Your Next-Generation AI Education Ecosystem",
    description: "Access subject solutions, calculators, AI study tools, assignments, quizzes, educational games, and smart learning systems in one place.",
    login: "Sign In",
    signup: "Sign Up",
    guest: "Continue as Guest",
    logout: "Logout",
    email: "Email Address",
    password: "Password",
    name: "Full Name",
    phone: "Phone Number",
    loading: "Initializing Systems...",
    error: "Signal Interrupted",
    success: "Sync Complete",
    dashboard: "Command Center",
    explore: "Explore Hub",
    profile: "User Profile",
    settings: "System Config",
    subjects: "Knowledge Units",
    leaderboard: "Legacy Board",
    analytics: "Neural Analytics",
    community: "Bio Network",
    doubts: "Community Doubts",
    xp: "Experience Points",
    streak: "Neural Pulse",
    level: "Tier",
    levelSuffix: "Scholar",
    studyTime: "Focus Time",
    rank: "Global Rank",
    coins: "T-Coins",
    aiTeacher: "AI Tutor",
    smartNotes: "Smart Notes",
    games: "Logic Games",
    assignments: "Tasks",
    quiz: "Reflex Test",
    ocr: "Visual scan",
    voiceTutor: "Audio Link",
    career: "Trajectory",
    studentType: "Academic Node",
    school: "Primary",
    college: "Secondary",
    university: "Higher Ed",
    math: "Mathematics",
    physics: "Physics",
    chemistry: "Chemistry",
    biology: "Biology",
    ict: "ICT",
    english: "English",
    bangla: "Bangla",
    accounting: "Accounting",
    economics: "Economics",
    askAI: "Consult AI",
    startLearning: "Initiate Session",
    seeAllFeatures: "Full Protocol",
    comingSoon: "Processing...",
    create: "Deploy Profile",
    cancel: "Abort",
    save: "Sync Changes",
    edit: "Modify",
    delete: "Purge",
    greeting: "User Identity Verified",
    desc: "Your localized AI educational node is active.",
    selectLevel: "Specify Academic Tier",
    selectLang: "Select Language Engine",
    placeholderSearch: "Search Knowledge Base...",
    placeholderAsk: "Query the AI Teacher...",
    noData: "Empty Void Found",
    about: "About Origin",
    howToUse: "Protocol Manual",
    privacy: "Data Privacy",
    terms: "Usage Terms",
    contact: "Support Link",
    location: "Base: Bangladesh",
    year: "Current Year: 2026",
    developer: "Architect: Tachin Ahmed",
    premiumButton: "Upgrade to Pro",
    premiumStatus: "Premium Status",
    freeTrial: "Trial Active",
    buyNow: "Select Plan",
    transactionId: "TXID",
    screenshot: "Upload Proof",
    language: "Language",
    calc: "Calculator",
    formula: "Formulas",
    graph: "Grapher",
    history: "Neural History",
    noHistory: "Memory banks empty"
  },
  bn: {
    welcome: "T-Solver এ স্বাগতম",
    tagline: "আপনার নেক্সট-জেনারেশন এআই শিক্ষা ইকোসিস্টেম",
    description: "সব রকম বিষয় সমাধান, এআই স্টাডি টুলস, অ্যাসাইনমেন্ট, কুইজ এবং স্মার্ট লার্নিং সিস্টেম এক জায়গায়।",
    login: "প্রবেশ করুন",
    signup: "নিবন্ধন করুন",
    guest: "গেস্ট হিসেবে প্রবেশ",
    logout: "লগআউট",
    email: "ইমেইল অ্যাড্রেস",
    password: "পাসওয়ার্ড",
    name: "পূর্ণ নাম",
    phone: "ফোন নম্বর",
    loading: "লোডিং হচ্ছে...",
    error: "ত্রুটি দেখা দিয়েছে",
    success: "সফলভাবে সম্পন্ন",
    dashboard: "ড্যাশবোর্ড",
    explore: "এক্সপ্লোর হাব",
    profile: "প্রোফাইল",
    settings: "সেটিংস",
    subjects: "বিষয়সমূহ",
    leaderboard: "লিডারবোর্ড",
    analytics: "অ্যানালিটিক্স",
    community: "কমিউনিটি",
    doubts: "কমিউনিটি ডাউটস",
    xp: "এক্সপি",
    streak: "স্ট্রিক",
    level: "লেভেল",
    levelSuffix: "স্কলার",
    studyTime: "অধ্যয়নের সময়",
    rank: "গ্লোবাল র‍্যাঙ্ক",
    coins: "টি-কয়েন",
    aiTeacher: "এআই শিক্ষক",
    smartNotes: "স্মার্ট নোটস",
    games: "শিক্ষামূলক গেমস",
    assignments: "অ্যাসাইনমেন্ট",
    quiz: "কুইজ হাব",
    ocr: "ওসিআর স্ক্যান",
    voiceTutor: "ভয়েস টিউটর",
    career: "ক্যারিয়ার গাইড",
    studentType: "শিক্ষার্থীর লেভেল",
    school: "স্কুল",
    college: "কলেজ",
    university: "ইউনিভার্সিটি",
    math: "গণিত",
    physics: "পদার্থবিজ্ঞান",
    chemistry: "রসায়ন",
    biology: "জীববিজ্ঞান",
    ict: "আইসিটি",
    english: "ইংরেজি",
    bangla: "বাংলা",
    accounting: "অ্যাকাউন্টিং",
    economics: "অর্থনীতি",
    askAI: "এআই কে জিজ্ঞাসা করুন",
    startLearning: "পড়া শুরু করুন",
    seeAllFeatures: "সব ফিচার দেখুন",
    comingSoon: "শীঘ্রই আসছে",
    create: "প্রোফাইল তৈরি করুন",
    cancel: "বাতিল",
    save: "সেভ করুন",
    edit: "সম্পাদনা",
    delete: "মুছে ফেলুন",
    greeting: "পরিচয় নিশ্চিত করা হয়েছে",
    desc: "আপনার এআই শিক্ষা নোড অনলাইন আছে।",
    selectLevel: "আপনার পড়ার লেভেল সিলেক্ট করুন",
    selectLang: "ভাষা নির্বাচন করুন",
    placeholderSearch: "জ্ঞান ভাণ্ডারে খুঁজুন...",
    placeholderAsk: "আপনার শিক্ষককে জিজ্ঞেস করুন...",
    noData: "কোনো তথ্য পাওয়া যায়নি",
    about: "আমাদের সম্পর্কে",
    howToUse: "ব্যবহার বিধি",
    privacy: "গোপনীয়তা নীতি",
    terms: "শর্তাবলী",
    contact: "যোগাযোগ",
    location: "অবস্থান: বাংলাদেশ",
    year: "বছর: ২০২৬",
    developer: "ডেভেলপার: তাহসিন আহমেদ",
    premiumButton: "প্রিমিয়াম নিন",
    premiumStatus: "প্রিমিয়াম স্ট্যাটাস",
    freeTrial: "ট্রায়াল চলছে",
    buyNow: "প্ল্যান দেখুন",
    transactionId: "ট্রানজেকশন আইডি",
    screenshot: "প্রমাণ আপলোড করুন",
    language: "ভাষা",
    calc: "ক্যালকুলেটর",
    formula: "সূত্রসমূহ",
    graph: "গ্রাফার",
    history: "পূর্ববর্তী তথ্য",
    noHistory: "ইতিহাস খালি আছে"
  }
};
