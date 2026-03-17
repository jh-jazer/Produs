import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const BootSequence = ({ onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (stage < 3) {
        setStage(s => s + 1);
      } else {
        onComplete();
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [stage, onComplete]);

  const stages = [
    { text: "INITIALIZING PROTOCOL...", color: "text-white" },
    { text: "DECRYPTING CORE MODULES...", color: "text-electric-blue" },
    { text: "STABILIZING FLOW STATE...", color: "text-neon-emerald" },
    { text: "ACCESS GRANTED.", color: "text-white" }
  ];

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-deep-space flex flex-col items-center justify-center font-mono"
    >
        <div className="w-64 space-y-4">
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(stage + 1) * 25}%` }}
                    className="h-full bg-electric-blue shadow-[0_0_10px_rgba(0,102,255,1)]"
                />
            </div>
            <AnimatePresence mode="wait">
                <motion.div
                    key={stage}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`text-[10px] font-black tracking-[0.3em] text-center ${stages[stage].color}`}
                >
                    {stages[stage].text}
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Subtle Scanlines in loader */}
        <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />
    </motion.div>
  );
};
