import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useMobile from '../../hooks/useMobile';
import useAuthStore from '../../store/useAuthStore';
import { soundManager } from '../../services/sound';

export default function HudButtons({ onRpgClick, onPartnerClick, isRpgActive, isPartnerActive, variant = 'dashboard', isShrunk = false }) {
  const isMobile = useMobile();
  const { user } = useAuthStore();
  const isLinked = !!user?.partner;

  const [showToast, setShowToast] = useState(false);
  const [shake, setShake] = useState(false);

  const handlePartnerClick = () => {
    soundManager.play('click');
    if (isLinked) {
      onPartnerClick();
    } else {
      setShake(true);
      setShowToast(true);
      setTimeout(() => setShake(false), 500);

      // Auto-hide toast after 3 seconds
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  };

  if (variant === 'landing') {
    return (
      <div className="fixed top-12 md:top-6 right-0 z-[100] flex flex-col items-center gap-4 pointer-events-none hud-buttons-container">
        <motion.button
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            soundManager.play('click');
            onRpgClick();
          }}
          className="w-[6vw] md:w-[4.2vw] h-[8vh] bg-white flex items-center justify-center pointer-events-auto group overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all rounded-l-md"
        >
          <div className="flex flex-row items-center justify-center gap-1 pr-1">
            <span className="material-symbols-outlined text-black transition-opacity text-lg !hidden md:!inline-block">play_arrow</span>
            <span className="text-[10px] md:text-[7px] font-black tracking-tighter text-black uppercase [writing-mode:vertical-rl] rotate-180">PLAY</span>
          </div>
          <div className="absolute top-0 left-0 w-1 h-full bg-black/5" />
        </motion.button>
      </div>
    );
  }

  const baseStyles = "h-[8vh] flex items-center justify-center pointer-events-auto group overflow-hidden transition-colors rounded-l-md border-y-2 border-l-2";
  const activeStyles = "bg-black/10 dark:bg-white/10 border-black dark:border-white text-black dark:text-white shadow-[0_0_30px_rgba(0,0,0,0.05)] dark:shadow-[0_0_30px_rgba(255,255,255,0.05)]";
  const inactiveStyles = "bg-transparent border-black/40 dark:border-white/20 text-black dark:text-white/40 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white/40 hover:bg-black/5 dark:hover:bg-white/5";

  return (
    <>
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%", scale: 0.9 }}
            animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
            exit={{ opacity: 0, y: -20, x: "-50%", scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed top-8 left-1/2 z-[9999] px-6 py-4 bg-black/95 dark:bg-white/95 text-white dark:text-black border border-white/10 dark:border-black/5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-3.5 backdrop-blur-md w-max max-w-[90vw]"
          >
            <span className="material-symbols-outlined text-lg text-rose-500 animate-pulse">lock</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">PROTOCOL LOCKED</span>
              <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest mt-2 leading-none">You need to link with a partner to unlock this feature</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{ x: isShrunk ? 8 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-24 md:top-6 right-0 z-[100] flex flex-col items-center gap-4 pointer-events-none hud-buttons-container"
      >
        {/* RPG Protocol Button */}
        <motion.button
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            soundManager.play('click');
            onRpgClick();
          }}
          animate={{ width: isMobile ? (isShrunk ? '10vw' : '12vw') : (isShrunk ? '3.5vw' : '4.2vw') }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`md:w-[4.2vw] ${baseStyles} ${isRpgActive ? activeStyles : inactiveStyles}`}
        >
          <div className="flex flex-row items-center justify-center gap-1 pr-1">
            <span className="material-symbols-outlined transition-opacity text-lg !hidden md:!inline-block text-current">videogame_asset</span>
            <span className="text-[10px] md:text-[7px] font-black tracking-tighter uppercase [writing-mode:vertical-rl] rotate-180 text-current">RPG</span>
          </div>
        </motion.button>

        {/* Partner Protocol Button */}
        <motion.button
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePartnerClick}
          animate={{
            x: shake ? [-6, 6, -6, 6, -3, 3, 0] : 0,
            width: isMobile ? (isShrunk ? '10vw' : '12vw') : (isShrunk ? '3.5vw' : '4.2vw')
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`md:w-[4.2vw] ${baseStyles} ${isPartnerActive ? activeStyles : inactiveStyles} ${!isLinked ? 'opacity-85' : ''}`}
        >
          <div className="flex flex-row items-center justify-center gap-1 pr-1">
            <span className="material-symbols-outlined transition-opacity text-lg !hidden md:!inline-block text-current">
              {isLinked ? 'group' : 'lock'}
            </span>
            <span className="text-[10px] md:text-[7px] font-black tracking-tighter uppercase [writing-mode:vertical-rl] rotate-180 text-current">LINK</span>
          </div>
        </motion.button>
      </motion.div>
    </>
  );
}
