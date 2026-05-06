import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CoreDisplay = ({ amount = 0, className = "", variant = "vault" }) => {
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

    const isVault = variant === "vault";

    return (
        <div className={`relative flex items-center gap-3 transition-all duration-300 ${
            isVault
                ? 'px-3.5 py-2 overflow-hidden'
                : 'px-0 py-0 bg-transparent border-none'
        } group ${className}`}>

            {isVault && (
                <>
                    {/* Vault Glow Layer */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-black/5 dark:from-white/5 dark:to-white/5 opacity-50" />

                    {/* Vault Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-black/10 dark:via-white/20 to-transparent" />

                    {/* Corner Brackets */}
                    <div className="absolute top-1 left-1 size-1.5 border-t border-l border-black/20 dark:border-white/20" />
                    <div className="absolute top-1 right-1 size-1.5 border-t border-r border-black/20 dark:border-white/20" />
                    <div className="absolute bottom-1 left-1 size-1.5 border-b border-l border-black/20 dark:border-white/20" />
                    <div className="absolute bottom-1 right-1 size-1.5 border-b border-r border-black/20 dark:border-white/20" />

                    {/* Scanline Effect */}
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] z-20 bg-[length:100%_4px] opacity-10" />
                </>
            )}

            {/* Icon Section */}
            <div className={`relative z-10 size-7 flex items-center justify-center rounded-lg transition-all ${
                isVault
                    ? 'bg-black border border-white/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]'
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
                    <span className="material-symbols-outlined text-black dark:text-white text-base font-light">
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
                            className="absolute inset-0 rounded-lg border-2 border-black dark:border-white z-0"
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Amount Section */}
            <div className="flex flex-col relative z-10">

                <div className="flex items-baseline gap-2 flex-nowrap">
                    <div className="min-w-fit flex justify-start">
                        <motion.span
                            className={`font-sans font-black uppercase tracking-[0.4em] leading-none transition-colors duration-300 ${
                                isPopping ? 'text-slate-400 dark:text-slate-500' : 'text-black dark:text-white'
                            } text-[10px]`}
                        >
                            {displayAmount.toLocaleString()}
                        </motion.span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoreDisplay;
