import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FALLBACK_TIPS = [
  "\"The Rule of Three: Define 3 core tasks each morning. Focus only on them.\"",
  "\"Deep Work: 90 minutes of uninterrupted focus beats 4 hours of distracted work.\"",
  "\"Analog Mornings: Avoid screens for the first 30 minutes after waking up.\"",
  "\"The Shutdown Ritual: Clear your task list before 6 PM to reclaim your evening.\""
];

const CinematicLoader = ({ isVisible, onComplete }) => {
  const [tips, setTips] = useState(FALLBACK_TIPS);
  const [currentTip, setCurrentTip] = useState("");
  const [tipIndex, setTipIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetch('/tips.json')
      .then(res => res.json())
      .then(data => {
        const allTips = Object.values(data).flat();
        if (allTips.length > 0) setTips(allTips);
      })
      .catch(() => console.log('Using local fallback tips'));
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    setCurrentTip(tips[Math.floor(Math.random() * tips.length)]);
    
    const tipInterval = setInterval(() => {
      setTipIndex(prev => prev + 1);
    }, 4000);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 0.5;
      });
    }, 20);

    return () => {
      clearInterval(tipInterval);
      clearInterval(progressInterval);
    };
  }, [isVisible, tips]);

  useEffect(() => {
    if (isVisible) {
      const nextTip = tips[Math.floor(Math.random() * tips.length)];
      setCurrentTip(nextTip);
    }
  }, [tipIndex, tips, isVisible]);

  useEffect(() => {
    if (progress === 100) {
      setTimeout(() => {
        onComplete?.();
      }, 800);
    }
  }, [progress, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 z-[99999] bg-black flex items-center justify-center font-manrope overflow-hidden"
        >
          <div className="flex flex-col items-center justify-center gap-12 w-[90%] max-w-[600px] text-center">
            {/* Tip Display */}
            <div className="flex flex-col items-center gap-6 min-h-[80px]">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] font-black tracking-[0.8em] text-white/30 uppercase"
              >
                Produs
              </motion.div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTip}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.8 }}
                  className="text-[10px] font-bold leading-[1.8] tracking-[0.4em] text-white uppercase max-w-[500px]"
                >
                  {currentTip}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress Bar */}
            <div className="flex flex-col items-center w-[250px] gap-4">
              <div className="w-full h-[1px] bg-white/10 relative overflow-hidden">
                <motion.div 
                  className="absolute left-0 top-0 h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1, ease: "linear" }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CinematicLoader;
