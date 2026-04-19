import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CoreDisplay = ({ amount = 0, className = "", variant = "minimal" }) => {
    const [displayAmount, setDisplayAmount] = useState(amount);
    const [isPopping, setIsPopping] = useState(false);
    const prevAmount = useRef(amount);
    const requestRef = useRef();

    useEffect(() => {
        if (amount !== prevAmount.current) {
            setIsPopping(true);

            const start = prevAmount.current;
            const end = amount;
            const duration = 800;
            const startTime = performance.now();

            const updateCount = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(start + (end - start) * easeOut);

                setDisplayAmount(current);

                if (progress < 1) {
                    requestRef.current = requestAnimationFrame(updateCount);
                } else {
                    setDisplayAmount(end);
                    setTimeout(() => setIsPopping(false), 500);
                }
            };

            requestRef.current = requestAnimationFrame(updateCount);
            prevAmount.current = amount;
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [amount]);

    const isMinimal = variant === "minimal";

    return (
        <div className={`relative flex items-center gap-3 transition-all duration-300 ${
            !isMinimal
                ? 'px-3.5 py-2 bg-amber-500/10 border border-amber-500/20 rounded-2xl overflow-hidden'
                : 'px-0 py-0 bg-transparent border-none'
        } group ${className}`}>

            {/* Icon Section */}
            <div className={`relative z-10 size-7 flex items-center justify-center rounded-lg transition-all ${
                !isMinimal
                    ? 'bg-black border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'bg-transparent border-none'
            }`}>
                <motion.div
                    animate={isPopping ? {
                        scale: [1, 1.4, 1],
                        rotate: [0, 90, 180, 0],
                    } : {}}
                    transition={{ duration: 0.5, ease: "backOut" }}
                    className="relative flex items-center justify-center"
                >
                    {/* Hexagonal Core Icon */}
                    <span className="material-symbols-outlined text-amber-500 text-xl font-light">
                        hexagon
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="size-1 bg-white rounded-full animate-pulse" />
                    </div>
                </motion.div>

                {/* Pulse ring when popping */}
                <AnimatePresence>
                    {isPopping && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 1 }}
                            animate={{ scale: 2.2, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 rounded-lg border-2 border-amber-500 z-0"
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Amount Section */}
            <div className="flex flex-col relative z-10">
                {!isMinimal && (
                    <span className="text-[7px] font-black text-amber-500 uppercase tracking-[0.3em] leading-none mb-1">
                        Limited_Resource
                    </span>
                )}
                <div className="flex items-baseline gap-2">
                    <div className="min-w-[3.5rem] flex justify-start">
                        <motion.span
                            className={`font-black tracking-tight leading-none transition-colors duration-300 ${
                                isPopping ? 'text-amber-400' : 'text-slate-900 dark:text-white'
                            } ${!isMinimal ? 'text-[13px]' : 'text-sm'}`}
                        >
                            {displayAmount.toLocaleString()}
                        </motion.span>
                    </div>
                    <span className="text-[9px] font-black text-amber-500/60 uppercase shrink-0">CORE</span>
                </div>
            </div>
        </div>
    );
};

export default CoreDisplay;
