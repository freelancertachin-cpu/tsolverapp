import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, 
  Trophy, 
  Zap, 
  Brain, 
  Target, 
  Dices,
  ChevronRight,
  Puzzle,
  Sword,
  X,
  History,
  FlaskConical,
  Ruler,
  Globe,
  Music,
  Code
} from 'lucide-react';
import { localEngine } from '../lib/localEngine';
import { UserProfile, storage } from '../lib/storage';
import { MathQuest } from './games/MathQuest';
import { SolarSystem } from './games/SolarSystem';
import { HistoryTimeTraveler } from './games/HistoryTimeTraveler';
import { MathRunner } from './games/MathRunner';
import { WordScramble } from './games/WordScramble';

interface Game {
  id: string;
  title: string;
  category: 'Math' | 'Memory' | 'Logic' | 'Language' | 'Science' | 'History' | 'Art' | 'IT';
  description: string;
  xpReward: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  color: string;
}

const GAMES_LIST: Game[] = [
  { id: 'math-runner', title: 'Math Runner', category: 'Math', description: 'Hyper-speed calculation sprint.', xpReward: 400, difficulty: 'Easy', color: '#00ff88' },
  { id: 'math-quest', title: 'Math Quest', category: 'Math', description: 'RPG Adventure where math solving powers your hero.', xpReward: 500, difficulty: 'Medium', color: '#00f2ff' },
  { id: 'solar-explorer', title: 'Solar Explorer', category: 'Science', description: 'Explore the 3D solar system and learn planetary data.', xpReward: 600, difficulty: 'Easy', color: '#ff7700' },
  { id: 'history-traveler', title: 'History Traveler', category: 'History', description: 'Jump through timelines and archive historical facts.', xpReward: 480, difficulty: 'Easy', color: '#c4a484' },
  { id: 'logic-grid', title: 'Logic Grid', category: 'Logic', description: 'Classical logic puzzles to boost your IQ.', xpReward: 750, difficulty: 'Hard', color: '#ffffff' },
  { id: 'word-master', title: 'Word Master', category: 'Language', description: 'Expand your vocabulary with hidden words.', xpReward: 400, difficulty: 'Easy', color: '#ff00ff' },
  { id: 'physics-puzzler', title: 'Physics Puzzler', category: 'Science', description: 'Use gravity and momentum to solve levels.', xpReward: 900, difficulty: 'Hard', color: '#00ff88' },
  { id: 'it-code', title: 'IT Code Breaker', category: 'IT', description: 'Debug simple code patterns locally.', xpReward: 600, difficulty: 'Medium', color: '#0088ff' },
  { id: 'chem-lab', title: 'Periodic Merge', category: 'Science', description: 'Combine elements to discover new chemical compounds.', xpReward: 550, difficulty: 'Medium', color: '#33ffaa' },
  { id: 'grammar-guard', title: 'Grammar Guard', category: 'Language', description: 'Defend the castle by correcting corrupted sentences.', xpReward: 420, difficulty: 'Medium', color: '#5544ff' },
  { id: 'biome-explorer', title: 'Biome Explorer', category: 'Science', description: 'Navigate diverse ecosystems and identify species.', xpReward: 500, difficulty: 'Easy', color: '#aaff33' },
  { id: 'data-detective', title: 'Data Detective', category: 'Math', description: 'Interpret graphs and statistics to solve mysteries.', xpReward: 680, difficulty: 'Hard', color: '#ff55cc' },
  { id: 'ancient-vocab', title: 'Ancient Vocab', category: 'History', description: 'Decode lost languages and expand your roots.', xpReward: 700, difficulty: 'Hard', color: '#cc9900' },
  { id: 'space-math', title: 'Space Geometry', category: 'Math', description: 'Calculate trajectories to safely land your probe.', xpReward: 800, difficulty: 'Hard', color: '#44aaff' },
  { id: 'coding-knight', title: 'Algorithm Knight', category: 'IT', description: 'Guide your knight using block-based logic sequences.', xpReward: 620, difficulty: 'Medium', color: '#888888' },
  { id: 'eco-tycoon', title: 'Eco Tycoon', category: 'Science', description: 'Manage a sustainable city and learn renewable energy.', xpReward: 580, difficulty: 'Medium', color: '#00aa55' },
  { id: 'art-history', title: 'Museo Match', category: 'Art', description: 'Match famous artwork to their movements and ears.', xpReward: 450, difficulty: 'Easy', color: '#ff8888' },
  { id: 'music-theory', title: 'Melody Logic', category: 'Art', description: 'Solve rhythm puzzles and learn scale structures.', xpReward: 520, difficulty: 'Medium', color: '#aaaaaa' },
  { id: 'civics-quiz', title: 'Global Citizen', category: 'History', description: 'Navigate world geography and international laws.', xpReward: 490, difficulty: 'Easy', color: '#0055ff' },
  { id: 'bio-cells', title: 'Cell Builder', category: 'Science', description: 'Construct complex cells from organelles.', xpReward: 600, difficulty: 'Medium', color: '#ffcc33' },
  { id: 'memory-math', title: 'Mnemonics', category: 'Memory', description: 'Improve math formula recall through visualization.', xpReward: 550, difficulty: 'Hard', color: '#ffffff' },
  { id: 'fractal-art', title: 'Fractal Weaver', category: 'Math', description: 'Create beautiful geometric art using mathematical recursive patterns.', xpReward: 600, difficulty: 'Medium', color: '#ff00aa' },
  { id: 'neuro-link', title: 'Neuro Link', category: 'Science', description: 'Connect neurons in the brain to facilitate memory pathways.', xpReward: 720, difficulty: 'Medium', color: '#44ffcc' },
  { id: 'binary-bot', title: 'Binary Bot', category: 'IT', description: 'Help the robot navigate by converting decimals to binary on the fly.', xpReward: 500, difficulty: 'Easy', color: '#00ff00' },
  { id: 'renaissance-run', title: 'Renaissance Run', category: 'History', description: 'Race through Florence collecting Da Vinci’s sketches.', xpReward: 550, difficulty: 'Medium', color: '#cc6600' },
  { id: 'quantum-quiz', title: 'Quantum Quiz', category: 'Science', description: 'Learn subatomic particle behavior in a wave-particle playground.', xpReward: 950, difficulty: 'Hard', color: '#aa00ff' },
  { id: 'syllable-slice', title: 'Syllable Slice', category: 'Language', description: 'A fast-paced slicing game to master word phonetics.', xpReward: 400, difficulty: 'Easy', color: '#ff4400' },
  { id: 'market-master', title: 'Market Master', category: 'Math', description: 'Run a virtual shop and master compound interest and margins.', xpReward: 650, difficulty: 'Medium', color: '#00cccc' },
  { id: 'dna-dash', title: 'DNA Dash', category: 'Science', description: 'Combine base pairs in a high-speed helix-building challenge.', xpReward: 800, difficulty: 'Hard', color: '#88ff00' },
  { id: 'syntax-survivor', title: 'Syntax Survivor', category: 'IT', description: 'Survive the code jungle by fixing broken brackets and semi-colons.', xpReward: 670, difficulty: 'Medium', color: '#5555ff' },
  { id: 'tempo-tower', title: 'Tempo Tower', category: 'Art', description: 'Stack blocks to the beat of classical masterpieces.', xpReward: 480, difficulty: 'Easy', color: '#ffaaee' },
  { id: 'orbital-oddity', title: 'Orbital Oddity', category: 'Science', description: 'Adjust gravity wells to slingshot satellites to their destination.', xpReward: 850, difficulty: 'Hard', color: '#3366ff' },
  { id: 'geo-hero', title: 'Geo Hero', category: 'History', description: 'Place lost landmarks on a giant rotating 3D globe.', xpReward: 520, difficulty: 'Medium', color: '#ffcc00' },
  { id: 'logic-levers', title: 'Logic Levers', category: 'Logic', description: 'Mechanical puzzles where thinking ahead is the only way out.', xpReward: 700, difficulty: 'Hard', color: '#cccccc' },
  { id: 'spectrum-sort', title: 'Spectrum Sort', category: 'Science', description: 'Filter white light into its component colors using prisms.', xpReward: 450, difficulty: 'Easy', color: '#ff0000' },
  { id: 'vulcan-voyage', title: 'Vulcan Voyage', category: 'Science', description: 'Descend into a volcano and learn about tectonic plates.', xpReward: 630, difficulty: 'Medium', color: '#ff3300' },
  { id: 'cryptic-code', title: 'Cryptic Code', category: 'IT', description: 'Crack historical ciphers from Caesar to Enigma.', xpReward: 880, difficulty: 'Hard', color: '#444444' },
  { id: 'idiom-island', title: 'Idiom Island', category: 'Language', description: 'A treasure hunt where clues are common metaphors and idioms.', xpReward: 500, difficulty: 'Medium', color: '#00cc88' },
  { id: 'stat-storm', title: 'Stat Storm', category: 'Math', description: 'Predict probability outcomes in a high-stakes weather sim.', xpReward: 780, difficulty: 'Hard', color: '#9999ff' },
  { id: 'ocean-os', title: 'Ocean OS', category: 'Science', description: 'Code the behavior of marine life in a virtual reef.', xpReward: 620, difficulty: 'Medium', color: '#0044cc' },
  { id: 'mythos-match', title: 'Mythos Match', category: 'History', description: 'Link deities and legends to their civilizations.', xpReward: 460, difficulty: 'Easy', color: '#ffdd00' },
  { id: 'color-theory', title: 'Color Theory', category: 'Art', description: 'Mix primary colors to match the target swatches in limited moves.', xpReward: 430, difficulty: 'Easy', color: '#ff00ff' },
  { id: 'ai-architect', title: 'AI Architect', category: 'IT', description: 'Train a simple neural network by feeding it correct data patterns.', xpReward: 820, difficulty: 'Hard', color: '#00ffcc' },
  { id: 'gravity-golf', title: 'Gravity Golf', category: 'Science', description: 'Putt through planetary systems using orbit paths.', xpReward: 560, difficulty: 'Medium', color: '#aaeeff' },
  { id: 'verb-vault', title: 'Verb Vault', category: 'Language', description: 'Capture falling verbs and categorize them by tense.', xpReward: 410, difficulty: 'Easy', color: '#55ccff' },
  { id: 'pioneer-path', title: 'Pioneer Path', category: 'History', description: 'Lead an expedition across the Silk Road and trade ideas.', xpReward: 600, difficulty: 'Medium', color: '#cc9966' },
  { id: 'matrix-madness', title: 'Matrix Madness', category: 'Math', description: 'Solve matrix transformations to unlock ancient doors.', xpReward: 920, difficulty: 'Hard', color: '#00ff88' },
  { id: 'sound-synth', title: 'Sound Synth', category: 'Art', description: 'Build your own digital instrument using mathematical waves.', xpReward: 540, difficulty: 'Medium', color: '#eeaa00' },
  { id: 'bot-builder', title: 'Bot Builder', category: 'IT', description: 'Assemble robots with unique logic circuits for specific tasks.', xpReward: 680, difficulty: 'Medium', color: '#8888ff' },
  { id: 'ancient-eco', title: 'Ancient Eco', category: 'Science', description: 'Restore prehistoric environments and learn about fossils.', xpReward: 510, difficulty: 'Easy', color: '#009944' },
  { id: 'finale-quest', title: 'Scholar’s Finale', category: 'Logic', description: 'The ultimate crossover challenge combining all your skills.', xpReward: 2000, difficulty: 'Hard', color: '#ffffff' },
];

export const EducationalGames: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [playing, setPlaying] = useState(false);
  const [difficultyPopup, setDifficultyPopup] = useState<Game | null>(null);

  const handleStartGame = (game: Game) => {
    setDifficultyPopup(game);
  };

  const confirmStart = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    if (difficultyPopup) {
      setSelectedGame({ ...difficultyPopup, difficulty });
      setDifficultyPopup(null);
      setPlaying(true);
    }
  };

  const handleFinish = async (score: number) => {
    if (selectedGame) {
      const xpEarned = Math.floor(selectedGame.xpReward * (selectedGame.difficulty === 'Hard' ? 1.5 : selectedGame.difficulty === 'Medium' ? 1 : 0.7));
      
      await storage.saveGameSession({
        id: crypto.randomUUID(),
        userId: user.id,
        gameId: selectedGame.id,
        score,
        xpEarned,
        duration: 0, 
        difficulty: selectedGame.difficulty,
        timestamp: Date.now()
      });

      await localEngine.awardXP(user.id, xpEarned, `Finished ${selectedGame.title}`);
      setPlaying(false);
      setSelectedGame(null);
    }
  };

  return (
    <div className="w-full space-y-12 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-4">
          <h2 className="text-5xl font-black uppercase tracking-tighter italic lg:text-7xl">Game Hub</h2>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest flex items-center gap-3">
             Play & Learn <span className="h-1 w-1 bg-white/20 rounded-full" /> Earn XP Rewards
          </p>
        </div>
        
        <div className="flex items-center gap-6 px-8 h-20 bg-white/5 border border-white/10 rounded-3xl">
           <Trophy className="text-white/40" size={24} />
           <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Quest Status</p>
              <p className="text-2xl font-black italic tracking-tighter leading-none">Active Hunter</p>
           </div>
        </div>
      </div>

      {!playing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {GAMES_LIST.map((game, idx) => (
             <motion.div 
              key={game.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="cyber-panel p-10 group hover:border-white/40 transition-all cursor-pointer flex flex-col justify-between h-[420px] relative overflow-hidden"
              onClick={() => handleStartGame(game)}
             >
                <div 
                  className="absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity"
                  style={{ backgroundColor: game.color }}
                />

                <div className="space-y-8 relative z-10">
                  <div className="flex items-center justify-between">
                     <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                        {game.category === 'Math' && <Brain size={28} />}
                        {game.category === 'Science' && <FlaskConical size={28} />}
                        {game.category === 'Logic' && <Puzzle size={28} />}
                        {game.category === 'Language' && <Dices size={28} />}
                        {game.category === 'IT' && <Code size={28} />}
                        {game.category === 'History' && <History size={28} />}
                     </div>
                     <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">{game.category}</div>
                  </div>

                  <div className="space-y-4">
                     <h3 className="text-3xl font-black uppercase italic tracking-tighter group-hover:tracking-normal transition-all">{game.title}</h3>
                     <p className="text-white/40 text-[11px] font-bold leading-relaxed uppercase pr-4">{game.description}</p>
                  </div>
                </div>

                <div className="space-y-8 relative z-10">
                   <div className="flex items-center justify-between px-1">
                      <div className="space-y-1">
                        <span className="block text-[9px] font-black uppercase tracking-widest text-white/30">Base XP</span>
                        <span className="text-xl font-black italic text-white">+{game.xpReward}</span>
                      </div>
                      <div className="space-y-1 text-right">
                        <span className="block text-[9px] font-black uppercase tracking-widest text-white/30">Difficulty</span>
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: game.color }}>{game.difficulty}</span>
                      </div>
                   </div>
                   
                   <button className="w-full h-14 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-glow flex items-center justify-center gap-3">
                      Initialize Mission <ChevronRight size={18} />
                   </button>
                </div>
             </motion.div>
           ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] bg-black"
        >
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-8 px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <div className="space-y-1">
                <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Active Session</p>
                <p className="text-sm font-black uppercase italic">{selectedGame?.title}</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <button 
                onClick={() => setPlaying(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
          </div>

          <div className="w-full h-full pt-20">
             {selectedGame?.id === 'math-runner' && (
               <MathRunner onFinish={handleFinish} difficulty={selectedGame.difficulty} />
             )}
             {selectedGame?.id === 'word-master' && (
               <WordScramble onFinish={handleFinish} />
             )}
             {selectedGame?.id === 'math-quest' && (
               <MathQuest onFinish={handleFinish} difficulty={selectedGame.difficulty} />
             )}
             {selectedGame?.id === 'solar-explorer' && (
               <SolarSystem onFinish={() => handleFinish(100)} />
             )}
             {selectedGame?.id === 'history-traveler' && (
               <HistoryTimeTraveler onFinish={handleFinish} />
             )}
             {/* Other game placeholders will render a "Coming Soon" for now */}
             {!['math-quest', 'solar-explorer', 'history-traveler', 'math-runner', 'word-master'].includes(selectedGame?.id || '') && (
               <div className="w-full h-full flex flex-col items-center justify-center space-y-8">
                  <Gamepad2 size={120} className="text-white/10 animate-pulse" />
                  <div className="text-center space-y-4">
                    <h2 className="text-4xl font-black uppercase italic">{selectedGame?.title}</h2>
                    <p className="text-white/40 text-xs font-black uppercase tracking-[0.5em]">Game Assets Loading Or Coming Soon...</p>
                    <button 
                      onClick={() => setPlaying(false)}
                      className="mt-8 px-12 h-14 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl"
                    >
                      Exit Game
                    </button>
                  </div>
               </div>
             )}
          </div>
        </motion.div>
      )}

      {/* Difficulty Selection Popup */}
      <AnimatePresence>
        {difficultyPopup && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg cyber-panel p-10 space-y-10"
            >
              <div className="space-y-2 text-center">
                <h3 className="text-3xl font-black uppercase italic italic tracking-tighter">Select Difficulty</h3>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Adjust challenge level for {difficultyPopup.title}</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {(['Easy', 'Medium', 'Hard'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => confirmStart(level)}
                    className="w-full h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between px-8 group hover:bg-white hover:text-black transition-all"
                  >
                    <div className="text-left">
                      <p className="font-black uppercase tracking-widest text-sm">{level}</p>
                      <p className="text-[10px] uppercase font-bold text-white/40 group-hover:text-black/60">
                        {level === 'Easy' && 'Experience the mechanics'}
                        {level === 'Medium' && 'Standard reward structure'}
                        {level === 'Hard' && '1.5x XP Multiplier'}
                      </p>
                    </div>
                    <ChevronRight size={20} />
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setDifficultyPopup(null)}
                className="w-full text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all pt-4"
              >
                Go Back
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Final 50+ Games section */}
      <div className="py-20 border-t border-white/5 mt-20">
         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 opacity-20 grayscale pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-square border border-white/10 rounded-2xl flex items-center justify-center">
                 <Dices size={24} />
              </div>
            ))}
         </div>
         <div className="mt-12 text-center">
            <h4 className="text-2xl font-black uppercase italic tracking-tighter text-white/40">Expanding to 50+ Educational Realms</h4>
            <p className="text-[8px] font-black uppercase tracking-[1em] text-white/10 mt-4">System Update Scheduled Weekly</p>
         </div>
      </div>
    </div>
  );
};
