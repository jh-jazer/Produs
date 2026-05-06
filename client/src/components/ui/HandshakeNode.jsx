import React from 'react';
import { motion } from 'framer-motion';

/**
 * HandshakeNode - A cinematic header component for narrative nodes.
 * Displays a centered title with a "NODE_ID" hud element.
 * Redesigned for High-Fidelity Tactical HUD (Monochromatic).
 */
const HandshakeNode = ({ 
    title, 
    subtitle, 
    nodeId = "0.0", 
    steps = [], 
    currentStep = 0,
    accentColor = "text-white",
    lineColor = "bg-white",
    onPrev,
    onNext,
    prevDisabled = false,
    nextDisabled = false
}) => {
    return (
        <div className="flex flex-col items-center gap-10 w-full select-none">
            
            {/* 1. LINK ARRAY (Progress Map) */}
            <div className="flex items-center justify-center gap-3">
                {steps.map((step, idx) => {
                    const isActive = currentStep === idx;
                    const isCompleted = currentStep > idx;
                    
                    return (
                        <React.Fragment key={idx}>
                            <div className="relative group flex flex-col items-center">
                                <motion.div 
                                    animate={isActive ? { 
                                        scale: [1, 1.15, 1],
                                        boxShadow: [
                                            "0 0 0px rgba(255,255,255,0)",
                                            "0 0 10px rgba(255,255,255,0.3)",
                                            "0 0 0px rgba(255,255,255,0)"
                                        ]
                                    } : {}}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className={`size-2.5 rounded-full border transition-all duration-700 ${
                                        isActive 
                                            ? "bg-white border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]" 
                                            : isCompleted 
                                                ? "bg-white/40 border-white/40" 
                                                : "bg-white/[0.05] border-white/10"
                                    }`}
                                />
                                
                                {/* HUD Tag */}
                                <div className={`absolute top-6 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none ${isActive ? 'opacity-40 translate-y-0' : 'translate-y-1'}`}>
                                    <span className="text-[7px] font-black tracking-[0.4em] uppercase text-white whitespace-nowrap">
                                        {step}
                                    </span>
                                </div>
                            </div>
                            
                            {idx < steps.length - 1 && (
                                <div className="relative w-12 h-px">
                                    <div className="absolute inset-0 bg-white/5" />
                                    <motion.div 
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: isCompleted ? 1 : 0 }}
                                        className="absolute inset-0 bg-white/40 origin-left"
                                        transition={{ duration: 0.8 }}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* 2. CORE TERMINAL HEADER */}
            <div className="flex items-center justify-center gap-6 md:gap-12 w-full max-w-4xl px-6">
                
                {/* Navigation: Prev */}
                <div className="flex-1 flex justify-end">
                    {onPrev && (
                        <button
                            disabled={prevDisabled}
                            onClick={onPrev}
                            className="group size-10 rounded-xl border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:border-white/30 hover:bg-white/[0.03] disabled:opacity-5 transition-all"
                        >
                            <span className="text-xs font-black tracking-widest group-hover:-translate-x-1 transition-transform">←</span>
                        </button>
                    )}
                </div>

                <div className="flex-[2] text-center flex flex-col items-center">
                    {/* NODE METADATA */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-px w-8 bg-white/10" />
                        <div className="flex flex-col items-center">
                            <span className="text-[8px] font-black tracking-[0.5em] text-white/40 uppercase mb-1">
                                NODE_0.{nodeId}
                            </span>
                            {subtitle && (
                                <span className="text-[7px] font-mono tracking-[0.3em] text-white/20 uppercase italic">
                                    {subtitle}
                                </span>
                            )}
                        </div>
                        <div className="h-px w-8 bg-white/10" />
                    </div>

                    <motion.h1 
                        key={title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white font-display leading-none"
                    >
                        {title}
                    </motion.h1>
                </div>

                {/* Navigation: Next */}
                <div className="flex-1 flex justify-start">
                    {onNext && (
                        <button
                            disabled={nextDisabled}
                            onClick={onNext}
                            className="group size-10 rounded-xl border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:border-white/30 hover:bg-white/[0.03] disabled:opacity-5 transition-all"
                        >
                            <span className="text-xs font-black tracking-widest group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HandshakeNode;
