import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useSpring, useTransform, useMotionValueEvent, useMotionValue } from 'framer-motion';

const ScrollOrb = ({ containerRef }) => {
    const trackRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [percentage, setPercentage] = useState(0);

    // Track scroll from the container
    const { scrollYProgress } = useScroll({
        container: { current: containerRef }
    });

    // The live position of the orb (0 to trackHeight)
    const y = useMotionValue(0);
    // Only smooth the position when NOT dragging to avoid 'laggy' manual control
    const smoothY = useSpring(y, { stiffness: 400, damping: 40, restDelta: 0.001 });

    // Synchronization: Scroll -> Orb
    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        if (isDragging || !trackRef.current) return;
        const trackHeight = trackRef.current.offsetHeight;
        y.set(latest * trackHeight);
        setPercentage(Math.round(latest * 100));
    });

    // Synchronization: Drag -> Scroll (Bulletproof Manual Calculation)
    const handleDrag = (_, info) => {
        if (!trackRef.current || !containerRef) return;
        
        const trackRect = trackRef.current.getBoundingClientRect();
        const trackTop = trackRect.top;
        const trackHeight = trackRect.height;
        
        // Use clientY (info.point.y) for the most stable and accurate mapping
        // This calculates the vertical progress relative to the track's screen position
        const relativeY = info.point.y - trackTop;
        const progress = Math.max(0, Math.min(1, relativeY / trackHeight));
        
        // Sync the percentage
        setPercentage(Math.round(progress * 100));
        
        // Immediate Scroll Sync
        const scrollableHeight = containerRef.scrollHeight - containerRef.clientHeight;
        containerRef.scrollTop = progress * scrollableHeight;
        
        // Force the motion value to follow immediately during drag
        if (isDragging) {
            y.jump(progress * trackHeight);
        }
    };

    return (
        <div className="fixed right-0 top-0 bottom-0 w-12 md:w-16 flex justify-center z-[200] pointer-events-none overflow-hidden select-none">
            {/* The actual vertical track area (Expanded hit-area for stable drag) */}
            <div 
                ref={trackRef} 
                className="absolute top-24 bottom-24 w-full bg-transparent right-0 pointer-events-auto cursor-ns-resize" 
            >
                {/* Visual Line - Centered */}
                <div className="absolute inset-y-0 w-px bg-black/[0.05] dark:bg-white/[0.05] left-1/2 -translate-x-1/2" />
            </div>

            <motion.div
                drag="y"
                dragConstraints={trackRef}
                dragElastic={0}
                dragMomentum={false}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
                onDrag={handleDrag}
                style={{ y: isDragging ? y : smoothY }}
                className="absolute left-1/2 -translate-x-1/2 top-24 z-10 flex items-center justify-center group pointer-events-auto cursor-ns-resize h-10 w-10"
            >
                {/* The Orb */}
                <div className={`relative size-3 md:size-4 rounded-full bg-white dark:bg-black border border-black/[0.1] dark:border-white/20 shadow-lg transition-all duration-300 ${isDragging ? 'scale-125' : ''}`}>
                    {/* Glowing Core */}
                    <div className={`absolute inset-1 rounded-full bg-electric-blue shadow-[0_0_10px_rgba(34,211,238,0.4)] ${isDragging ? 'opacity-100 scale-110' : 'animate-pulse'}`} />
                    
                    {/* Outer Ring */}
                    <div className={`absolute inset-[-4px] rounded-full border border-cyan-500/20 transition-transform duration-500 ${isDragging ? 'scale-150' : 'group-hover:scale-125'}`} />
                </div>

                {/* Percentage Label */}
                <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: (isDragging || percentage > 0) ? 1 : 0, x: (isDragging || percentage > 0) ? -10 : 0 }}
                    className="absolute right-full mr-4 px-2 py-1 rounded bg-black dark:bg-white text-white dark:text-black text-[9px] font-black font-mono tracking-widest whitespace-nowrap shadow-xl pointer-events-none"
                >
                    [ {percentage.toString().padStart(3, '0')}% ]
                </motion.div>

                {/* Tactical metadata (Bottom label) */}
                <div className={`absolute top-full mt-4 -rotate-90 origin-right whitespace-nowrap transition-opacity duration-500 ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
                    <span className="text-[7px] font-black uppercase tracking-[0.4em] text-cyan-500 dark:text-cyan-400">MANUAL_OVERRIDE_ACTIVE_V4</span>
                </div>
            </motion.div>
        </div>
    );
};

export default ScrollOrb;
