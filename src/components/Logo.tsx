import React, { type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

const SIZES: Record<string, string> = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-20 w-20',
  xl: 'h-32 w-32'
};

type LogoProps = Omit<HTMLMotionProps<"div">, "children"> & {
  size?: keyof typeof SIZES | string;
  children?: ReactNode;
};

export const Logo = ({ 
  size = 'md', 
  className = '',
  children,
  ...rest 
}: LogoProps) => {
  const sizeClass = SIZES[size as keyof typeof SIZES] || '';

  return (
    <motion.div 
      {...rest}
      role="img"
      aria-label="T-Solver Logo"
      initial={{ scale: 0.8, rotate: -15, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={cn(
        'logo relative flex items-center justify-center',
        `logo-${size}`,
        sizeClass,
        className
      )}
    >
      {/* Outer Glow */}
      <div className="absolute inset-0 bg-black dark:bg-white rounded-[30%] blur-xl opacity-20 dark:opacity-10 animate-pulse" />
      
      {/* Layer 1: Base */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black dark:from-zinc-100 dark:to-white rounded-[32%] rotate-6 shadow-xl" />
      
      {/* Layer 2: Accent */}
      <motion.div 
        animate={{ rotate: [0, 90, 180, 270, 360] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[15%] border-2 border-black/10 dark:border-white/20 rounded-[30%] border-dashed opacity-50"
      />
      
      {/* Layer 3: Main Plate */}
      <div className="absolute inset-[8%] bg-black dark:bg-white rounded-[28%] flex items-center justify-center shadow-inner">
        <span className="relative text-white dark:text-black font-black text-3xl italic tracking-tighter select-none">T</span>
      </div>

      {/* Decorative Dots */}
      <div className="absolute top-1 right-1 h-2 w-2 bg-blue-500 rounded-full animate-ping" />
      
      {children}
    </motion.div>
  );
};

