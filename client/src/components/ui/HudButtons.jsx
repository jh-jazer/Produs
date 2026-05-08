import React from 'react';
import { motion } from 'framer-motion';

export default function HudButtons({ onRpgClick, onPartnerClick, isRpgActive, isPartnerActive, variant = 'dashboard' }) {
  if (variant === 'landing') {
    return (
      <div className="fixed top-12 md:top-6 right-0 z-[100] flex flex-col items-center gap-4 pointer-events-none">
        <motion.button
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRpgClick}
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

  const baseStyles = "w-[6vw] md:w-[4.2vw] h-[8vh] flex items-center justify-center pointer-events-auto group overflow-hidden transition-all rounded-l-md border-y-2 border-l-2";
  const activeStyles = "bg-black dark:bg-white border-black dark:border-white text-white dark:text-black shadow-[0_0_30px_rgba(0,0,0,0.2)] dark:shadow-[0_0_30_rgba(255,255,255,0.2)]";
  const inactiveStyles = "bg-white dark:bg-[#080808] border-black dark:border-white/20 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white/40";

  return (
    <div className="fixed top-24 md:top-6 right-0 z-[100] flex flex-col items-center gap-4 pointer-events-none">
      {/* RPG Protocol Button */}
      <motion.button
        whileHover={{ x: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRpgClick}
        className={`${baseStyles} ${isRpgActive ? activeStyles : inactiveStyles}`}
      >
        <div className="flex flex-row items-center justify-center gap-1 pr-1">
          <span className={`material-symbols-outlined transition-opacity text-lg !hidden md:!inline-block ${isRpgActive ? 'text-black' : 'text-current'}`}>videogame_asset</span>
          <span className={`text-[10px] md:text-[7px] font-black tracking-tighter uppercase [writing-mode:vertical-rl] rotate-180 ${isRpgActive ? 'text-black' : 'text-current'}`}>RPG</span>
        </div>
      </motion.button>

      {/* Partner Protocol Button */}
      <motion.button
        whileHover={{ x: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={onPartnerClick}
        className={`${baseStyles} ${isPartnerActive ? activeStyles : inactiveStyles}`}
      >
        <div className="flex flex-row items-center justify-center gap-1 pr-1">
          <span className={`material-symbols-outlined transition-opacity text-lg !hidden md:!inline-block ${isPartnerActive ? 'text-black' : 'text-current'}`}>group</span>
          <span className={`text-[10px] md:text-[7px] font-black tracking-tighter uppercase [writing-mode:vertical-rl] rotate-180 ${isPartnerActive ? 'text-black' : 'text-current'}`}>LINK</span>
        </div>
      </motion.button>
    </div>
  );
}
