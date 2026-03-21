import React from "react";
import { motion } from "framer-motion";

const SECTIONS = [
  { id: 'hero', label: 'Intro', progress: 0 },
  { id: 'features', label: 'Explore', progress: 0.30 },
  { id: 'testimonials', label: 'Reviews', progress: 0.90 },
  { id: 'cta', label: 'Join', progress: 0.97 },
];

export default function ScrollIndicator({ progress, onNavigate, isLightMode }) {
  const percentage = Math.round(progress * 100);

  return (
    <div className={`fixed right-6 md:right-12 top-1/2 -translate-y-1/2 z-[100] flex flex-col items-center gap-6 pointer-events-none select-none transition-colors duration-1000 ${isLightMode ? 'text-black' : 'text-white'}`}>
      {/* Percentage Text */}
      <div className="flex flex-col items-center gap-1">
        <span className={`text-[11px] font-mono font-black tracking-widest ${isLightMode ? 'text-black/80' : 'text-white/80'} uppercase`}>Sync</span>
        <div className="relative">
          <span className={`text-xl md:text-2xl font-mono font-bold ${isLightMode ? 'text-black' : 'text-white'} tracking-tighter w-12 text-center block`}>
            {percentage.toString().padStart(3, '0')}
          </span>
          <div className={`absolute -right-4 top-1/2 -translate-y-1/2 text-[12px] font-bold ${isLightMode ? 'text-black/50' : 'text-white/50'} uppercase tracking-tighter`}>
            %
          </div>
        </div>
      </div>

      {/* Vertical Progress Track & Section Dots */}
      <div className="relative flex flex-col items-center py-2 h-40 md:h-56">
        <div className={`relative w-[1px] h-full ${isLightMode ? 'bg-black/10' : 'bg-white/10'} overflow-hidden rounded-full`}>
          <motion.div 
            className={`absolute top-0 left-0 w-full ${isLightMode ? 'bg-black shadow-[0_0_15px_rgba(0,0,0,0.2)]' : 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]'}`}
            initial={{ height: "0%" }}
            animate={{ height: `${progress * 100}%` }}
            transition={{ duration: 0.1, ease: "linear" }}
          />
        </div>

        {/* Interactive Dots */}
        <div className="absolute inset-y-0 -left-6 flex flex-col justify-between items-end pointer-events-auto">
          {SECTIONS.map((section) => {
            const isActive = progress >= section.progress - 0.05 && progress <= section.progress + 0.05;
            return (
              <button
                key={section.id}
                onClick={() => onNavigate(section.progress)}
                className="group relative flex items-center justify-center size-8 outline-none"
                title={section.label}
              >
                {/* Active Indicator Line */}
                <motion.div 
                  className={`w-4 h-[1px] ${isLightMode ? 'bg-black' : 'bg-white'} transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}
                />
                
                {/* Visual Dot */}
                <div className={`size-1.5 rounded-full border transition-all duration-300 ${isActive ? (isLightMode ? 'bg-black border-black scale-125 shadow-[0_0_10px_rgba(0,0,0,0.2)]' : 'bg-white border-white scale-125 shadow-[0_0_10px_white]') : (isLightMode ? 'bg-transparent border-black/20 group-hover:border-black/60 group-hover:scale-110' : 'bg-transparent border-white/20 group-hover:border-white/60 group-hover:scale-110')}`} />
                
                {/* Label Overlay */}
                <div className="absolute right-12 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  <span className={`text-[10px] font-mono font-bold tracking-[0.3em] uppercase ${isLightMode ? 'text-black/80' : 'text-white/80'}`}>{section.label}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Abstract Design Elements */}
      <div className="flex flex-col gap-2 opacity-30 mt-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`w-1 h-3 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/20'}`} />
        ))}
      </div>

      {/* Rotating Compass / HUD Element */}
      <motion.div 
        animate={{ rotate: progress * 360 }}
        className={`size-8 rounded-full border ${isLightMode ? 'border-black/10' : 'border-white/5'} flex items-center justify-center relative`}
      >
        <div className={`w-px h-full ${isLightMode ? 'bg-black/10' : 'bg-white/20'} absolute top-0 left-1/2 -translate-x-1/2`} />
        <div className={`w-full h-px ${isLightMode ? 'bg-black/10' : 'bg-white/20'} absolute top-1/2 left-0 -translate-y-1/2`} />
        <div className={`size-1 ${isLightMode ? 'bg-black shadow-[0_0_5px_rgba(0,0,0,0.3)]' : 'bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]'} rounded-full`} />
      </motion.div>
    </div>
  );
}
