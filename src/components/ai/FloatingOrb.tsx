import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Mic, Volume2, AlertTriangle } from 'lucide-react';

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error' | 'muted';

const stateCopy: Record<OrbState, string> = {
  idle: 'Ready',
  listening: 'Listening',
  thinking: 'Thinking',
  speaking: 'Speaking',
  error: 'Needs attention',
  muted: 'Muted'
};

const stateIcon: Record<OrbState, React.ReactNode> = {
  idle: <Brain size={38} />,
  listening: <Mic size={38} />,
  thinking: <Brain size={38} />,
  speaking: <Volume2 size={38} />,
  error: <AlertTriangle size={38} />,
  muted: <Mic size={38} />
};

export const FloatingOrb: React.FC<{ state: OrbState; compact?: boolean }> = ({ state, compact = false }) => {
  const isActive = state === 'listening' || state === 'speaking' || state === 'thinking';

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        className={`${compact ? 'h-24 w-24' : 'h-44 w-44'} relative rounded-full p-[2px] bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 shadow-[0_0_80px_rgba(34,211,238,0.18)]`}
        animate={{
          y: [0, -10, 0],
          scale: state === 'listening' ? [1, 1.05, 1] : state === 'thinking' ? [1, 0.96, 1] : 1,
          rotate: state === 'thinking' ? [0, 6, -6, 0] : 0
        }}
        transition={{ repeat: Infinity, duration: state === 'thinking' ? 1.2 : 3, ease: 'easeInOut' }}
      >
        <motion.div
          className="absolute inset-[-22px] rounded-full bg-cyan-400/10 blur-3xl"
          animate={{ opacity: isActive ? [0.2, 0.75, 0.2] : 0.16, scale: isActive ? [0.95, 1.2, 0.95] : 1 }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        />
        <div className="relative h-full w-full rounded-full bg-black/80 border border-white/10 backdrop-blur-2xl flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,.35),transparent_35%),radial-gradient(circle_at_70%_70%,rgba(168,85,247,.35),transparent_40%)]" />
          <motion.div
            className="relative z-10 text-white"
            animate={{ opacity: state === 'error' ? [1, 0.35, 1] : 1 }}
            transition={{ repeat: state === 'error' ? Infinity : 0, duration: 0.8 }}
          >
            {stateIcon[state]}
          </motion.div>
          <motion.div
            className="absolute inset-8 rounded-full border border-white/10"
            animate={{ scale: isActive ? [1, 1.18, 1] : 1, opacity: isActive ? [0.35, 0.05, 0.35] : 0.2 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        </div>
      </motion.div>
      <div className="text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.45em] text-white/30">AI Voice Core</p>
        <p className="mt-1 text-sm font-black uppercase tracking-widest text-white">{stateCopy[state]}</p>
      </div>
    </div>
  );
};
