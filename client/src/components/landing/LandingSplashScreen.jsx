import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../brand/Logo';

const LandingSplashScreen = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setIsVisible(false);
                        if (onComplete) onComplete();
                    }, 800);
                    return 100;
                }
                // Faster at start, slower at end
                const step = prev < 30 ? 2 : prev < 70 ? 1 : 0.5;
                return Math.min(100, prev + step);
            });
        }, 25);

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }}
                    className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center overflow-hidden"
                >
                    <style>
                        {`
                            @keyframes scanline {
                                0% { transform: translateY(-100%); }
                                100% { transform: translateY(200%); }
                            }
                            .animate-scanline {
                                animation: scanline 8s linear infinite;
                            }
                        `}
                    </style>

                    {/* Background Glows */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-electric-blue/5 to-transparent pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] bg-electric-blue/10 blur-[150px] rounded-full pointer-events-none animate-pulse" />

                    <div className="relative flex flex-col items-center gap-12">
                        {/* Logo Container */}
                        <div className="relative">
                            <motion.div
                                animate={{ 
                                    opacity: [0.4, 0.7, 0.4],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 bg-electric-blue/20 blur-[25px] rounded-full"
                            />
                            
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                                className="size-28 flex items-center justify-center relative z-10"
                            >
                                <Logo className="w-full h-full" color="white" glow />

                            </motion.div>
                        </div>

                        {/* Text Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            className="flex flex-col items-center gap-6"
                        >
                            <div className="flex flex-col items-center gap-3">
                                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-[0.8em] text-white ml-[0.8em]">
                                    Produs
                                </h1>
                                <div className="w-48 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                            </div>

                            <div className="flex flex-col items-center gap-3">
                                <motion.span 
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60"
                                >
                                    {progress < 30 ? 'Initializing Logic' : progress < 60 ? 'Calibrating Matrix' : progress < 90 ? 'Optimizing Interface' : 'System Ready'}
                                </motion.span>
                                <div className="flex items-center gap-4">
                                     <span className="text-[10px] font-mono text-electric-blue/80 tracking-widest w-12 text-center">
                                        {Math.floor(progress)}%
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="absolute bottom-24 w-64 h-[1px] bg-white/5 overflow-hidden">
                        <motion.div
                            className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,1)]"
                            initial={{ width: "0%" }}
                            animate={{ width: `${progress}%` }}
                            transition={{ ease: "linear" }}
                        />
                    </div>

                    {/* HUD Decorations */}
                    <div className="absolute top-10 left-10 text-[8px] font-mono text-white/20 tracking-tighter hidden md:block">
                        SYS_INIT_SEQUENCE // P.001A<br />
                        MEMORY_ALLOC // OK<br />
                        GRAPH_ENGINE // ACTIVE
                    </div>
                    <div className="absolute bottom-10 right-10 text-[8px] font-mono text-white/20 tracking-tighter text-right hidden md:block">
                        COORDINATES: {Math.floor(progress * 7.2)}, {Math.floor(progress * 13.4)}<br />
                        LATENCY: 14MS<br />
                        STATUS: CALIBRATING
                    </div>

                    {/* Scanline Effect */}
                    <div className="absolute inset-x-0 h-[40vh] bg-gradient-to-b from-transparent via-white/[0.04] to-transparent pointer-events-none animate-scanline" />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LandingSplashScreen;
