import React from 'react';
import { motion } from 'framer-motion';

export const VoiceWave: React.FC<{ active?: boolean; bars?: number }> = ({ active = false, bars = 24 }) => {
  return (
    <div className="flex h-12 items-center justify-center gap-1">
      {Array.from({ length: bars }).map((_, index) => (
        <motion.span
          key={index}
          className="w-1 rounded-full bg-gradient-to-t from-cyan-400 to-purple-500"
          animate={{
            height: active ? [8, 10 + ((index * 7) % 30), 8] : 8,
            opacity: active ? [0.35, 1, 0.35] : 0.25
          }}
          transition={{
            repeat: Infinity,
            duration: 0.8 + (index % 5) * 0.12,
            delay: index * 0.025
          }}
        />
      ))}
    </div>
  );
};
