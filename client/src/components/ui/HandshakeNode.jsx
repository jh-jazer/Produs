import React from 'react';
import { motion } from 'framer-motion';

/**
 * HandshakeNode - A cinematic header component for narrative nodes.
 * Displays a centered title with a "NODE_ID" hud element.
 */
const HandshakeNode = ({ 
    title, 
    subtitle, 
    nodeId = "0.0", 
    steps = [], 
    currentStep = 0,
    accentColor = "text-rose-500",
    lineColor = "bg-rose-500",
    onPrev,
    onNext,
    prevDisabled = false,
    nextDisabled = false
}) => {
    return (
        <div className="flex flex-col items-center gap-8 w-full">
            {/* Progress Map (The Linked Nodes) */}
            <div className="flex items-center justify-center gap-2">
                {steps.map((step, idx) => (
                    <React.Fragment key={idx}>
                        <div className="relative group">
                            <motion.div 
                                animate={currentStep === idx ? { 
                                    scale: [1, 1.2, 1],
                                    boxShadow: [
                                        "0 0 0px rgba(0,0,0,0)",
                                        "0 0 15px currentColor",
                                        "0 0 0px rgba(0,0,0,0)"
                                    ]
                                } : {}}
                                transition={{ duration: 2, repeat: Infinity }}
                                className={`size-3 rounded-full border-2 transition-all duration-500 ${
                                    currentStep === idx 
                                        ? `${accentColor} border-current bg-current` 
                                        : currentStep > idx 
                                            ? "border-emerald-500 bg-emerald-500/20" 
                                            : "border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/5"
                                }`}
                            />
                            {/* Hover Tooltip/Label */}
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                <span className="text-[7px] font-mono tracking-widest uppercase text-white/40">
                                    {step}
                                </span>
                            </div>
                        </div>
                        {idx < steps.length - 1 && (
                            <div className={`h-[1px] w-8 transition-all duration-500 ${
                                currentStep > idx ? "bg-emerald-500/40" : "bg-slate-300 dark:bg-white/10"
                            }`} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Centered Node Header with Navigation */}
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 w-full max-w-4xl">
                {/* Prev Button */}
                <div className="flex items-center gap-4 order-2 md:order-1 flex-1 justify-end md:justify-end">
                    {onPrev && (
                        <button
                            disabled={prevDisabled}
                            onClick={onPrev}
                            className="size-10 rounded-2xl border border-slate-300 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-all font-black text-2xl"
                        >
                            <span className="mb-1 leading-none">&lt;</span>
                        </button>
                    )}
                </div>

                <div className="text-center order-1 md:order-2 flex-[2]">
                    <motion.h1 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white font-exo mb-4 select-none leading-none"
                    >
                        {title}
                    </motion.h1>

                    <div className="flex items-center justify-center gap-6 text-slate-300 dark:text-white/20">
                        <div className={`h-px flex-1 max-w-[80px] ${lineColor} opacity-40`} />
                        <div className="flex flex-col items-center gap-1">
                            <span className={`text-[9px] font-mono tracking-[0.6em] uppercase ${accentColor} font-black`}>
                                NODE_{nodeId}
                            </span>
                            {subtitle && (
                                <span className="text-[8px] font-mono tracking-[0.4em] uppercase text-slate-500 dark:text-white/40 italic">
                                    {subtitle}
                                </span>
                            )}
                        </div>
                        <div className={`h-px flex-1 max-w-[80px] ${lineColor} opacity-40`} />
                    </div>
                </div>

                {/* Next Button */}
                <div className="flex items-center gap-4 order-3 md:order-3 flex-1 justify-start">
                    {onNext && (
                        <button
                            disabled={nextDisabled}
                            onClick={onNext}
                            className="size-10 rounded-2xl border border-slate-300 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-all font-black text-2xl"
                        >
                            <span className="mb-1 leading-none">&gt;</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HandshakeNode;
