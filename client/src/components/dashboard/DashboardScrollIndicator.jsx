import React, { useState, useEffect, useRef, useContext } from "react";
import { motion, useMotionValue, useMotionValueEvent, useSpring } from "framer-motion";
import { Cpu, Handshake, User } from "lucide-react";
import { DashboardContext } from "../../context/DashboardContext";

export default function DashboardScrollIndicator() {
  const [percentage, setPercentage] = useState(0);
  const trackRef = React.useRef(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const rawProgress = useMotionValue(0);
  const { protocolMode, setProtocolMode, viewMode, setViewMode } = useContext(DashboardContext);

  const getActiveContainer = () => {
    // Topmost modal scroll container
    const modalContainers = Array.from(document.querySelectorAll('.fixed .custom-scrollbar, .fixed [class*="overflow-y-auto"]'));
    const visibleModalContainers = modalContainers.filter(el => el.clientHeight > 0 && el.scrollHeight > el.clientHeight);
    if (visibleModalContainers.length > 0) {
      return visibleModalContainers[visibleModalContainers.length - 1]; 
    }
    // Main layout container fallback
    return Array.from(document.querySelectorAll('.custom-scrollbar')).find(el => !el.closest('.fixed'));
  };

  useEffect(() => {
    const updateProgress = (target) => {
       const maxScroll = target.scrollHeight - target.clientHeight;
       if (maxScroll <= 0) {
           rawProgress.set(0);
       } else {
           rawProgress.set(target.scrollTop / maxScroll);
       }
    };

    const handleScroll = (e) => {
       const active = getActiveContainer();
       if (active && (e.target === active || active.contains(e.target))) {
           updateProgress(active);
       }
    };
    
    document.addEventListener('scroll', handleScroll, true);
    
    const active = getActiveContainer();
    if (active) updateProgress(active);

    const observer = new MutationObserver(() => {
        const active = getActiveContainer();
        if (active) updateProgress(active);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
       document.removeEventListener('scroll', handleScroll, true);
       observer.disconnect();
    };
  }, [rawProgress]);

  // Visual Smoothing
  const springProgress = useSpring(rawProgress, {
    stiffness: 400,
    damping: 40,
    restDelta: 0.001
  });

  useMotionValueEvent(rawProgress, "change", (latest) => {
    setPercentage(Math.round(latest * 100));
  });

  const calculateProgress = (clientY) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    const newProgress = Math.min(1, Math.max(0, relativeY / rect.height));
    
    const active = getActiveContainer();
    if (active) {
        const maxScroll = active.scrollHeight - active.clientHeight;
        active.scrollTo({
            top: newProgress * maxScroll,
            behavior: isDragging ? 'auto' : 'smooth'
        });
        rawProgress.set(newProgress);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    calculateProgress(e.clientY);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    calculateProgress(e.touches[0].clientY);
  };

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        calculateProgress(e.clientY);
      }
    };
    const handleTouchMove = (e) => {
      if (isDragging) {
        calculateProgress(e.touches[0].clientY);
      }
    };
    const handleEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleEnd);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  return (
    <div className="fixed right-6 md:right-12 top-1/2 -translate-y-1/2 z-[100] hidden lg:flex flex-col items-center gap-8 pointer-events-none select-none text-slate-900 dark:text-white">
      {/* Tactical Mode Toggles (RPG & LINK) */}
      <div className="flex flex-col items-center gap-1.5 p-1 glass-panel rounded-2xl pointer-events-auto">
          <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setProtocolMode(protocolMode === 'rpg' ? 'reality' : 'rpg')}
              className={`flex items-center size-10 justify-center transition-all duration-300 rounded-xl relative group/toggle
                  ${protocolMode === 'rpg' 
                      ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                      : 'bg-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'}
              `}
          >
              <Cpu size={14} className={protocolMode === 'rpg' ? 'animate-pulse' : ''} />
              
              {/* Tooltip on left */}
              <div className="absolute right-full mr-4 px-3 py-1.5 bg-black/80 dark:bg-white/10 backdrop-blur-md border border-white/10 rounded-lg opacity-0 group-hover/toggle:opacity-100 transition-opacity pointer-events-none hidden md:block">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap">RPG_MODE</span>
              </div>
          </motion.button>

          <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode(viewMode === 'personal' ? 'partner' : 'personal')}
              className={`flex items-center size-10 justify-center transition-all duration-300 rounded-xl relative group/toggle
                  ${viewMode === 'partner' 
                      ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                      : 'bg-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'}
              `}
          >
              {viewMode === 'partner' ? <Handshake size={14} /> : <User size={14} />}
              
              {/* Tooltip on left */}
              <div className="absolute right-full mr-4 px-3 py-1.5 bg-black/80 dark:bg-white/10 backdrop-blur-md border border-white/10 rounded-lg opacity-0 group-hover/toggle:opacity-100 transition-opacity pointer-events-none hidden md:block">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap">SYNC_LINK</span>
              </div>
          </motion.button>
      </div>

      {/* Percentage Text */}
      <div className="flex flex-col items-center gap-1">
        <div className="relative">
          <span className="text-xl md:text-2xl font-mono font-bold text-slate-900 dark:text-white tracking-tighter w-12 text-center block">
            {percentage.toString().padStart(3, '0')}
          </span>
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-[12px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-tighter">
            %
          </div>
        </div>
      </div>

      {/* Vertical Progress Track */}
      <div className="relative flex flex-col items-center group/track pointer-events-auto">
        {/* Precise Hit Zone */}
        <div 
          ref={trackRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className={`absolute inset-y-0 -left-5 -right-5 z-20 transition-colors ${isDragging ? 'cursor-grabbing' : 'cursor-pointer'}`}
        />

        <div className="relative flex flex-col items-center py-2 h-40 md:h-56">
          <div className="relative w-[1px] h-full bg-slate-200 dark:bg-white/10 overflow-hidden rounded-full font-mono">
            <motion.div 
              className="absolute top-0 left-0 w-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.8)]"
              style={{ height: rawProgress.get() * 100 + "%" }}
              animate={{ height: `${percentage}%` }}
            />
          </div>

          {/* Minimal Draggable Circle (Landing Page Style) */}
          <motion.div 
            className="absolute left-1/2 -translate-x-1/2 z-30 pointer-events-none"
            style={{ 
              top: `calc(${percentage}% + 8px)`,
              y: "-50%" 
            }}
          >
            <motion.div 
              whileHover={{ scale: 1.5 }}
              className={`size-2 bg-slate-900 dark:bg-white border-2 border-white dark:border-cyan-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.8)] transition-all ${isDragging ? 'scale-150' : 'group-hover/track:scale-125'}`} 
            />
          </motion.div>
        </div>
      </div>

      {/* Abstract Design Elements */}
      <div className="flex flex-col gap-2 opacity-30 mt-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`size-1 rounded-full ${i === 0 ? 'bg-cyan-500 shadow-[0_0_10px_cyan]' : 'bg-slate-300 dark:bg-white/20'}`} />
        ))}
      </div>

      {/* Rotating HUD Element */}
      <motion.div 
        style={{ rotate: rawProgress.get() * 360 }}
        className="size-10 rounded-full border border-slate-200 dark:border-white/5 flex items-center justify-center relative opacity-40 group-hover/track:opacity-100 transition-opacity"
      >
        <div className="w-px h-full bg-slate-200 dark:bg-white/10 absolute top-0 left-1/2 -translate-x-1/2" />
        <div className="w-full h-px bg-slate-200 dark:bg-white/10 absolute top-1/2 left-0 -translate-y-1/2" />
        <div className="size-1.5 bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,1)] rounded-full" />
      </motion.div>
    </div>
  );
}
