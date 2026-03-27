import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * DataBit - A single decorative element with randomized "holographic" animations.
 */
const DataBit = ({ className, delay = 0, duration = 2, yRange = 4 }) => (
    <motion.div 
        animate={{ 
            opacity: [0.2, 0.8, 0.4, 1, 0.3],
            y: [0, -yRange, yRange / 2, 0],
            scale: [1, 1.05, 0.95, 1]
        }}
        transition={{ 
            duration, 
            repeat: Infinity, 
            delay,
            ease: "easeInOut"
        }}
        className={className}
    />
);

/**
 * DataBits - A set of animated decorative white squares/lines
 * representing "system fragments" dissolving around the window.
 */
const DataBits = () => (
    <>
        {/* TOP-LEFT CLUSTER (The Anchor) */}
        <DataBit className="absolute -top-12 -left-4 w-4 h-4 bg-white opacity-80" delay={0.2} duration={3} />
        <DataBit className="absolute -top-6 -left-10 w-2 h-6 bg-white/40" delay={0.5} duration={4} yRange={8} />
        <DataBit className="absolute top-4 -left-6 w-3 h-3 border border-white/30" delay={0.8} duration={2.5} />
        
        {/* TOP-RIGHT (Minimalist) */}
        <DataBit className="absolute -top-8 right-12 w-3 h-3 bg-white/60" delay={1.2} duration={3.5} />
        <DataBit className="absolute top-2 -right-4 w-1 h-5 bg-white/20" delay={0.4} duration={5} yRange={10} />

        {/* BOTTOM-RIGHT CLUSTER (The Dissolve) */}
        <DataBit className="absolute -bottom-10 right-8 w-5 h-5 bg-white shadow-[0_0_10px_white]" delay={0.1} duration={4.5} />
        <DataBit className="absolute -bottom-4 right-20 w-3 h-3 bg-white/70" delay={0.9} duration={3} />
        <DataBit className="absolute bottom-10 -right-6 w-2 h-8 bg-white/30" delay={1.5} duration={6} yRange={12} />
        <DataBit className="absolute -bottom-16 right-4 w-4 h-4 border border-white/40" delay={0.3} duration={2} />

        {/* BOTTOM-LEFT (The Tail) */}
        <DataBit className="absolute -bottom-8 left-10 w-2 h-5 bg-white/50" delay={0.7} duration={4} yRange={6} />
    </>
);

/**
 * SystemWindow - A high-fidelity, game-style window component.
 * Features an asymmetrical "glitch" polygon silhouette, neon outer glow,
 * inner offset frame, and a vertical teal-to-cyan "solid core" gradient.
 * 
 * Props:
 * - title: Primary header text (Exo 2 Black Italic)
 * - subtitle: Secondary metadata text (JetBrains Mono)
 * - status: Small status indicator in the top right
 * - module: Small module ID in the top left
 * - className: Additional classes for the outer container
 * - children: Window content
 */
const SystemWindow = ({ children, title, subtitle, status = "STABLE", module = "SYSTEM_01", className = "", variant = "primary" }) => {
    const sessionId = useMemo(() => `0x${Math.random().toString(16).slice(2, 6).toUpperCase()}`, []);
    const [time, setTime] = useState(new Date());

    const isDanger = variant === "danger";
    const accentColor = isDanger ? "text-red-500" : "text-cyan-400";
    const borderColor = isDanger ? "border-red-500/40" : "border-cyan-400/40";
    const glowColor = isDanger ? "shadow-[0_0_50px_rgba(239,68,68,0.3)]" : "shadow-[0_0_50px_rgba(6,182,212,0.3)]";
    const underlineColor = isDanger ? "decoration-red-500/40" : "decoration-cyan-400/40";

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    
    const timeString = time.toLocaleTimeString([], { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });

    // Uneven, Asymmetrical Polygon silhouette
    const polygon = 'polygon(4% 0%, 96% 2%, 100% 12%, 98% 88%, 92% 100%, 6% 97%, 0% 82%, 2% 16%)';
    
    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.9, y: 30 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 1.1, y: -30 }}
            className={`relative ${className} font-outfit`}
        >
            {/* High-Fidelity Data Bits - The "Dissolve" Effect (Animated) */}
            <DataBits />

            {/* Outer Glow: High-Intensity Neon Line */}
            <div 
                className={`relative p-[1.5px] ${isDanger ? 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]' : 'bg-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.5)]'} transition-all duration-700`}
                style={{ clipPath: polygon }}
            >
                {/* Inner Offset: Frame within a Frame */}
                <div 
                    className="w-full h-full bg-neutral-900 p-[2px]"
                    style={{ clipPath: polygon }}
                >
                    <div 
                        className={`w-full h-full border ${isDanger ? 'border-red-500/30' : 'border-cyan-400/30'}`}
                        style={{ clipPath: polygon }}
                    >
                        {/* Solid Core: Vertical Teal/Cyan Gradient */}
                        <div 
                            className={`relative bg-black border-2 ${borderColor} backdrop-blur-3xl ${glowColor} p-px transition-all duration-700`}
                            style={{ clipPath: polygon }}
                        >
                            {/* Header Metadata */}
                            <div className={`flex justify-between items-center px-10 pt-6 pb-2 opacity-40 font-mono text-[8px] tracking-[0.5em] ${accentColor} uppercase`}>
                                <span className={`flex items-center gap-2 underline ${underlineColor} underline-offset-4`}>{module} // {sessionId}</span>
                                <span>{timeString}</span>
                            </div>

                            {/* Content Area */}
                            <div className="px-8 pb-8 pt-2 text-center">
                                {title && (
                                    <div className="mb-4 text-left">
                                        <h2 className="text-xl md:text-2xl font-black italic tracking-tighter text-white uppercase drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] leading-none mb-2 font-exo">
                                            {title}
                                        </h2>
                                        {subtitle && (
                                            <div className="flex items-center gap-4 mb-8">
                                                <div className={`h-1 w-12 ${isDanger ? 'bg-red-500' : 'bg-cyan-500'} shadow-[0_0_10px_${isDanger ? 'rgba(239,68,68,0.8)' : 'rgba(6,182,212,0.8)'}]`} />
                                                <div className={`text-[10px] font-mono tracking-[0.4em] ${accentColor} opacity-50 uppercase`}>
                                                    {subtitle}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="text-neutral-200">
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tactical Corners */}
            <div className="absolute top-0 left-0 size-4 border-l-2 border-t-2 border-white/20 -translate-x-1 -translate-y-1" />
            <div className="absolute bottom-0 right-0 size-4 border-r-2 border-b-2 border-white/20 translate-x-1 translate-y-1" />
        </motion.div>
    );
};

export default SystemWindow;
