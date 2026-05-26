import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Sword, Shield, Zap } from 'lucide-react';

interface MathQuestProps {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  onFinish: (score: number) => void;
}

export const MathQuest: React.FC<MathQuestProps> = ({ difficulty, onFinish }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [problem, setProblem] = useState({ q: '5 + 5', a: 10 });
  const [options, setOptions] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [health, setHealth] = useState(100);

  const gameRef = useRef<{ 
    active: boolean;
  }>({ 
    active: true
  });

  useEffect(() => {
    generateProblem();
  }, []);

  const generateProblem = () => {
    const a = Math.floor(Math.random() * 20);
    const b = Math.floor(Math.random() * 20);
    const correct = a + b;
    const opts = [
      correct,
      correct + (Math.floor(Math.random() * 5) + 1),
      correct - (Math.floor(Math.random() * 5) + 1)
    ].sort(() => Math.random() - 0.5);
    
    setProblem({ q: `${a} + ${b}`, a: correct });
    setOptions(opts);
  };

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const { Engine, Render, Runner, Bodies, Composite, Events } = Matter;
    const engine = Engine.create();
    const world = engine.world;

    const render = Render.create({
      element: containerRef.current,
      engine: engine,
      canvas: canvasRef.current,
      options: {
        width: 1000,
        height: 600,
        wireframes: false,
        background: 'transparent'
      }
    });

    // Create Floors with neon glow
    const ground = Bodies.rectangle(500, 580, 1200, 40, { 
      isStatic: true, 
      render: { fillStyle: '#002233', strokeStyle: '#00f2ff', lineWidth: 4 } 
    });
    
    // Create Player (Neon Square)
    const player = Bodies.rectangle(150, 500, 50, 50, { 
      render: { fillStyle: '#ffffff', strokeStyle: '#00f2ff', lineWidth: 4 },
      friction: 0.1,
      inertia: Infinity,
      restitution: 0.2
    });

    // Decorative Castle Pillar
    const pillar = Bodies.rectangle(850, 450, 80, 220, { 
      isStatic: true,
      render: { fillStyle: '#0a0a0a', strokeStyle: '#00f2ff', lineWidth: 2 }
    });

    Composite.add(world, [ground, player, pillar]);

    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
         Matter.Body.applyForce(player, player.position, { x: 0.005, y: -0.08 });
      }
    };
    window.addEventListener('keydown', handleKey);

    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);

    // Particle Effect loop
    const particleInterval = setInterval(() => {
       if (!gameRef.current.active) return;
       const p = Bodies.circle(player.position.x, player.position.y, 2, {
          render: { fillStyle: '#00f2ff', opacity: 0.5 },
          frictionAir: 0.05
       });
       Composite.add(world, p);
       setTimeout(() => Composite.remove(world, p), 1000);
    }, 100);

    return () => {
      Engine.clear(engine);
      Render.stop(render);
      Runner.stop(runner);
      window.removeEventListener('keydown', handleKey);
      clearInterval(particleInterval);
    };
  }, []);

  const handleAnswer = (ans: number) => {
    if (ans === problem.a) {
      setScore(prev => prev + 150);
      generateProblem();
      // Visual feedback: brief flash or sound would go here
    } else {
      setHealth(prev => Math.max(0, prev - 20));
      if (health <= 20) setGameOver(true);
      generateProblem();
    }
  };

  return (
    <div className="relative w-full h-[600px] bg-[#050505] rounded-[48px] overflow-hidden border border-white/10 shadow-2xl" ref={containerRef}>
      {/* Background Magic Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full" />
      </div>

      <canvas ref={canvasRef} className="opacity-80" />
      
      {/* Overlay UI */}
      <div className="absolute inset-0 p-12 flex flex-col justify-between pointer-events-none">
         <div className="flex justify-between items-start w-full">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="h-2 w-12 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] rounded-full" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Neon Quest Active</span>
               </div>
               <motion.h2 
                 key={score}
                 initial={{ scale: 1.2, color: '#00f2ff' }}
                 animate={{ scale: 1, color: '#ffffff' }}
                 className="text-6xl font-black italic uppercase tracking-tighter"
               >
                 {score.toLocaleString()}
               </motion.h2>
            </div>

            <div className="flex gap-4 pointer-events-auto">
               <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-1">
                     {Array(5).fill(0).map((_, i) => (
                        <div key={i} className={`h-1.5 w-6 rounded-full transition-all ${i < health / 20 ? 'bg-blue-500 shadow-glow' : 'bg-white/5'}`} />
                     ))}
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Shield Integrity</span>
               </div>
               <button 
                 onClick={() => onFinish(score)}
                 className="h-14 px-10 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:scale-105 transition-all shadow-glow pointer-events-auto"
               >
                 Extract XP
               </button>
            </div>
         </div>

         {/* Problem Area */}
         <div className="flex flex-col items-center gap-8 pointer-events-auto">
            <AnimatePresence mode="wait">
              <motion.div 
                key={problem.q}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-2"
              >
                 <span className="text-[9px] font-black uppercase tracking-[0.5em] text-blue-400">Incoming Equation</span>
                 <p className="text-7xl font-black italic tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                   {problem.q}
                 </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-4">
               {options.map((ans, idx) => (
                  <motion.button 
                    key={ans} 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => handleAnswer(ans)}
                    className="w-24 h-24 bg-white/5 border border-white/10 rounded-[32px] hover:bg-white hover:text-black hover:border-white transition-all font-black text-xl flex items-center justify-center group"
                  >
                     <span className="group-hover:scale-125 transition-transform">{ans}</span>
                  </motion.button>
               ))}
            </div>
         </div>
      </div>

      {/* Hero Icons floating around */}
      <div className="absolute top-1/2 left-12 -translate-y-1/2 flex flex-col gap-12 opacity-20">
         <Sword size={24} />
         <Shield size={24} />
         <Zap size={24} />
         <Sparkles size={24} />
      </div>

      {/* Game Over Screen */}
      <AnimatePresence>
        {gameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-12 text-center"
          >
            <h3 className="text-8xl font-black uppercase italic tracking-tighter mb-4">Mission Failed</h3>
            <p className="text-white/40 font-bold uppercase tracking-widest mb-12">Your shield has been depleted.</p>
            <button 
              onClick={() => onFinish(score)}
              className="px-12 h-16 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all"
            >
              Return with {score} XP
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
