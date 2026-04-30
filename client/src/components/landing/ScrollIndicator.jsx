import React, { useState, useRef, useEffect } from "react";
import { motion, useScroll, useSpring, useMotionValueEvent, useMotionValue } from "framer-motion";

const SECTIONS = [
  { id: 'hero', label: 'Intro', progress: 0 },
  { id: 'features', label: 'Explore', progress: 0.30 },
  { id: 'testimonials', label: 'Reviews', progress: 0.90 },
  { id: 'cta', label: 'Join', progress: 0.97 },
];

export default function ScrollIndicator({ 
  variant = 'landing',
  progress: externalProgress, 
  onNavigate,
  containerRef
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [internalProgress, setInternalProgress] = useState(0);
  const trackRef = useRef(null);

  // Use external progress if provided (landing), otherwise track internal scroll (dashboard)
  const isExternal = externalProgress !== undefined;
  const progress = isExternal ? externalProgress : internalProgress;
  const percentage = Math.round(progress * 100);

  // Framer Motion scroll tracking for dashboard mode
  const { scrollYProgress } = useScroll({
    container: containerRef
  });

  // Motion values for smooth orb position in dashboard mode
  const y = useMotionValue(0);
  const smoothY = useSpring(y, { stiffness: 400, damping: 40, restDelta: 0.001 });

  // Sync internal progress from scrollYProgress (Dashboard only)
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (isExternal || isDragging || !trackRef.current) return;
    const trackHeight = trackRef.current.offsetHeight;
    y.set(latest * trackHeight);
    setInternalProgress(latest);
  });

  // Sync external progress to motion values (Landing only)
  useEffect(() => {
    if (isExternal && !isDragging && trackRef.current) {
        const trackHeight = trackRef.current.offsetHeight;
        y.set(externalProgress * trackHeight);
    }
  }, [externalProgress, isExternal, isDragging]);

  const calculateProgress = (clientY) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    const newProgress = Math.min(1, Math.max(0, relativeY / rect.height));

    if (isExternal) {
      if (onNavigate) onNavigate(newProgress);
    } else if (containerRef?.current) {
      const scrollableHeight = containerRef.current.scrollHeight - containerRef.current.clientHeight;
      containerRef.current.scrollTop = newProgress * scrollableHeight;
      setInternalProgress(newProgress);
    }
    
    // Force immediate position update during drag
    const trackHeight = trackRef.current.offsetHeight;
    y.jump(newProgress * trackHeight);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    calculateProgress(e.clientY);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    calculateProgress(e.touches[0].clientY);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) calculateProgress(e.clientY);
    };
    const handleTouchMove = (e) => {
      if (isDragging) calculateProgress(e.touches[0].clientY);
    };
    const handleEnd = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleEnd);
      document.body.style.cursor = 'ns-resize';
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

  const isLanding = variant === 'landing';

  return (
    <div className="fixed right-2 bottom-24 z-[100] hidden md:flex flex-col items-center gap-6 pointer-events-none select-none transition-colors duration-1000 text-white">

      {/* Vertical Progress Track & Handle */}
      <div 
        ref={trackRef}
        className="relative flex flex-col items-center group/track pointer-events-none w-full"
      >
        <div className="relative flex flex-col items-center py-2 h-[calc(30vh+6px)] w-full">
          {/* Track Line */}
          <div className="relative w-[1px] h-full bg-white/10 overflow-hidden rounded-full">
            <motion.div 
              className="absolute top-0 left-0 w-full bg-white shadow-[0_0_15px_white]"
              style={{ height: `${progress * 100}%` }}
            />
          </div>

          {/* Draggable Glowing Circle Handle */}
          <motion.div 
            className="absolute left-1/2 -translate-x-1/2 z-50 pointer-events-auto flex items-center justify-center group"
            style={{ y: isDragging ? y : smoothY, translateY: "-50%" }}
            onMouseDown={(e) => { e.preventDefault(); handleMouseDown(e); }}
            onTouchStart={(e) => { e.preventDefault(); handleTouchStart(e); }}
          >
            {/* Extended invisible 40x40 hit area */}
            <div className={`w-10 h-10 flex items-center justify-center transition-colors ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}>
                <div className={`relative size-3 md:size-4 rounded-full ${isLanding ? 'bg-black' : 'bg-[#050505] dark:bg-black'} border border-white/20 shadow-lg transition-all duration-300 ${isDragging ? 'scale-125' : ''}`}>
                    {/* Glowing Core */}
                    <div className="absolute inset-1 rounded-full bg-white shadow-[0_0_10px_white] opacity-100 scale-110" />
                    
                    {/* Outer Ring */}
                    <div className="absolute inset-[-4px] rounded-full border border-white/20 transition-transform duration-500 scale-125" />
                </div>
            </div>

            {/* Percentage Label */}
            <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: (isDragging || percentage > 0) ? 1 : 0, x: (isDragging || percentage > 0) ? -10 : 0 }}
                className="absolute right-full mr-4 px-2 py-1 rounded bg-white text-black text-[9px] font-black font-mono tracking-widest whitespace-nowrap shadow-xl pointer-events-none"
            >
                [ {percentage.toString().padStart(3, '0')}% ]
            </motion.div>

            {/* Tactical metadata (Bottom label) */}
            <div className={`absolute top-full mt-4 -rotate-90 origin-right whitespace-nowrap transition-opacity duration-500 ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
                <span className="text-[7px] font-black uppercase tracking-[0.4em] text-white">MANUAL_OVERRIDE_ACTIVE_V4</span>
            </div>
          </motion.div>

          {/* Interactive Dots (Landing Only) */}
          {isLanding && (
            <div className="absolute inset-y-0 -left-8 flex flex-col justify-between items-end pointer-events-none z-30">
              {SECTIONS.map((section) => {
                const isActive = progress >= section.progress - 0.05 && progress <= section.progress + 0.05;
                return (
                  <button
                    key={section.id}
                    onClick={(e) => { e.stopPropagation(); onNavigate(section.progress); }}
                    className="group relative flex items-center justify-center size-8 outline-none pointer-events-auto"
                    title={section.label}
                  >
                    <div className={`size-1.5 rounded-full border transition-all duration-300 ${isActive ? 'bg-white border-white scale-125 shadow-[0_0_10px_white]' : 'bg-transparent border-white/20 group-hover:border-white/60 group-hover:scale-110'}`} />
                    <div className="absolute right-12 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      <span className="text-[10px] font-mono font-bold tracking-[0.3em] uppercase text-white/80">{section.label}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Abstract Design Elements (Landing Only) */}
      {isLanding && (
        <div className="flex flex-col gap-2 opacity-30 mt-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`w-1 h-3 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/20'}`} />
          ))}
        </div>
      )}

      {/* Rotating Compass / HUD Element */}
      <motion.div 
        animate={{ rotate: progress * 360 }}
        className="size-8 rounded-full border border-white/5 flex items-center justify-center relative mb-4"
      >
        <div className="w-px h-full bg-white/20 absolute top-0 left-1/2 -translate-x-1/2" />
        <div className="w-full h-px bg-white/20 absolute top-1/2 left-0 -translate-y-1/2" />
        <div className="size-1 bg-white shadow-[0_0_5px_white] rounded-full" />
      </motion.div>
    </div>
  );
}
