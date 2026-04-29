import React from 'react';
import { motion } from 'framer-motion';

export default function HudButtons({ onRpgClick, onPartnerClick, variant = 'dashboard' }) {
  if (variant === 'landing') {
    return (
      <div className="fixed top-6 right-0 z-[100] flex flex-col items-center gap-4 pointer-events-none">
        <motion.button
          whileHover={{ x: -2, width: '4.8vw' }}
          whileTap={{ scale: 0.95 }}
          onClick={onRpgClick}
          className="w-[4.2vw] h-14 bg-white flex items-center justify-center pointer-events-auto group overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all rounded-l-md"
        >
          <div className="flex flex-row items-center justify-center gap-1 pr-1">
            <span className="material-symbols-outlined text-black transition-opacity text-lg !hidden md:!inline-block">play_arrow</span>
            <span className="text-[7px] font-black tracking-tighter text-black uppercase [writing-mode:vertical-rl] rotate-180">PLAY</span>
          </div>
          <div className="absolute top-0 left-0 w-1 h-full bg-black/5" />
        </motion.button>
      </div>
    );
  }

  return (
    <div className="fixed top-6 right-0 z-[100] flex flex-col items-center gap-4 pointer-events-none">
      {/* RPG Protocol Button */}
      <motion.button
        whileHover={{ x: -2, width: '4.8vw' }}
        whileTap={{ scale: 0.95 }}
        onClick={onRpgClick}
        className="w-[4.2vw] h-14 bg-white flex items-center justify-center pointer-events-auto group overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all rounded-l-md"
      >
        <div className="flex flex-row items-center justify-center gap-1 pr-1">
          <span className="material-symbols-outlined text-black transition-opacity text-lg !hidden md:!inline-block">videogame_asset</span>
          <span className="text-[7px] font-black tracking-tighter text-black uppercase [writing-mode:vertical-rl] rotate-180">RPG</span>
        </div>
        {/* Tapered highlight effect */}
        <div className="absolute top-0 left-0 w-1 h-full bg-black/5" />
      </motion.button>

      {/* Partner Protocol Button */}
      <motion.button
        whileHover={{ x: -2, width: '4.8vw' }}
        whileTap={{ scale: 0.95 }}
        onClick={onPartnerClick}
        className="w-[4.2vw] h-14 bg-white flex items-center justify-center pointer-events-auto group overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all rounded-l-md"
      >
        <div className="flex flex-row items-center justify-center gap-1 pr-1">
          <span className="material-symbols-outlined text-black transition-opacity text-lg !hidden md:!inline-block">group</span>
          <span className="text-[7px] font-black tracking-tighter text-black uppercase [writing-mode:vertical-rl] rotate-180">PARTNER</span>
        </div>
        {/* Tapered highlight effect */}
        <div className="absolute top-0 left-0 w-1 h-full bg-black/5" />
      </motion.button>
    </div>
  );
}
