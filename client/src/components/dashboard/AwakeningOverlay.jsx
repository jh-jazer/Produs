import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowLeft, Terminal, Lock } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const ChippedBorder = ({ opacity = 0.8, color = 'white' }) => (
    <div 
      className="absolute inset-[-1px] rounded-sm pointer-events-none z-0"
      style={{
        border: `2px solid ${color}`,
        opacity,
        clipPath: 'polygon(0% 0%, 15% 0%, 16% 2%, 18% 0%, 42% 0%, 43% 4%, 45% 0%, 78% 0%, 79% 2%, 81% 0%, 100% 0%, 100% 20%, 98% 22%, 100% 24%, 100% 55%, 97% 58%, 100% 61%, 100% 100%, 82% 100%, 81% 97%, 79% 100%, 38% 100%, 37% 96%, 35% 100%, 0% 100%, 0% 80%, 3% 78%, 0% 76%, 0% 35%, 2% 33%, 0% 31%)'
      }}
    />
);

const AwakeningOverlay = ({ onAwaken, onBackToReality, isLoading, hasStarted = false, userId }) => {
    const { user } = useAuthStore();
    const isAdmin = user?.isAdmin || user?.email === 'ernestodesabillejr@gmail.com';
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loadingStep, setLoadingStep] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (isLoading) {
            const interval = setInterval(() => {
                setLoadingStep(prev => (prev < 4 ? prev + 1 : prev));
            }, 800);
            return () => clearInterval(interval);
        } else {
            setLoadingStep(0);
        }
    }, [isLoading]);

    const formattedTime = currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const userShortId = userId ? userId.slice(-8).toLowerCase() : 'UNKNOWN';

    return (
        <div className="w-full h-full flex items-center justify-center pointer-events-auto">
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div 
                        key="loading"
                        initial={{ opacity: 0, filter: 'grayscale(1)' }}
                        animate={{ opacity: 1, filter: 'grayscale(1)' }}
                        exit={{ opacity: 0 }}
                        className="relative w-full max-w-md bg-black border border-white/20 rounded-sm p-10 shadow-2xl overflow-hidden flex flex-col gap-8"
                    >
                        <ChippedBorder opacity={0.3} color="white" />
                        
                        <div className="flex flex-col gap-1 border-b border-white/10 pb-4">
                            <span className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">SYSTEM_DIAGNOSTIC</span>
                            <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{formattedTime}</span>
                        </div>

                        <div className="flex flex-col gap-4 font-mono text-[10px] tracking-widest">
                            {loadingStep >= 1 && (
                                <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <span className="text-white/60">DIAGNOSTIC_RUNNING</span>
                                    <span className="text-white/20 text-[8px]">[{formattedTime}]</span>
                                </div>
                            )}
                            {loadingStep >= 2 && (
                                <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <span className="text-white/60">INITIALIZING_UPLINK...</span>
                                    <span className="text-white/20 text-[8px]">[{formattedTime}]</span>
                                </div>
                            )}
                            {loadingStep >= 3 && (
                                <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <span className="text-white/60">AUTHENTICATING_USER_ID: {userShortId}</span>
                                    <span className="text-white/20 text-[8px]">[{formattedTime}]</span>
                                </div>
                            )}
                            {loadingStep >= 4 && (
                                <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <span className="text-white/60">CALIBRATING_NEURAL_FREQ</span>
                                    <span className="text-white/20 text-[8px]">[{formattedTime}]</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4 mt-4">
                            <div className="flex-1 h-1 bg-white/5 overflow-hidden">
                                <motion.div 
                                    className="h-full bg-white"
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${(loadingStep / 4) * 100}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                            <span className="text-[9px] font-black text-white/40">{Math.round((loadingStep / 4) * 100)}%</span>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="ready"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-sm p-8 shadow-2xl overflow-hidden"
                    >
                        <ChippedBorder opacity={0.2} />
                        
                        <div className="relative z-10 flex flex-col gap-10">
                            {/* Header */}
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">GUARDIAN APPLICATION</span>
                                    <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{formattedTime}</span>
                                </div>
                                <div className="size-8 bg-white/5 border border-white/10 flex items-center justify-center text-white/20">
                                    <Sparkles size={14} />
                                </div>
                            </div>

                            <div className="flex flex-col gap-6">
                                {isAdmin ? (
                                    <>
                                        <div className="space-y-4">
                                            <p className="text-[11px] font-black text-white uppercase tracking-[0.2em] leading-relaxed italic border-l-2 border-white/20 pl-4">
                                                To find your hero, we will make you relive what happened and we will find you someone who chose the same decisions.
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-3 pt-4">
                                            <button
                                                onClick={!isLoading ? onAwaken : undefined}
                                                disabled={isLoading}
                                                className="w-full py-4 bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] rounded-sm hover:bg-white/90 disabled:opacity-20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                                            >
                                                <Sparkles size={14} />
                                                {hasStarted ? 'CONTINUE ASSESSMENT' : "LET'S START THIS"}
                                            </button>

                                            <button
                                                onClick={onBackToReality}
                                                className="w-full py-4 bg-white/[0.02] border border-white/10 text-white/40 font-black text-[10px] uppercase tracking-[0.4em] hover:text-white hover:bg-white/[0.05] transition-all flex items-center justify-center gap-3"
                                            >
                                                <ArrowLeft size={14} />
                                                I AM NOT READY
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="relative p-6 rounded-sm bg-white/[0.01] border border-white/5 overflow-hidden">
                                            <div className="space-y-4 filter blur-[2px] opacity-25 pointer-events-none select-none">
                                                <p className="text-[11px] font-black text-white uppercase tracking-[0.2em] leading-relaxed italic border-l-2 border-white/20 pl-4">
                                                    To find your hero, we will make you relive what happened and we will find you someone who chose the same decisions.
                                                </p>
                                            </div>

                                            {/* Lock Overlay inside the box */}
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40 backdrop-blur-sm z-20">
                                                <div className="size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white shadow-lg">
                                                    <Lock size={18} className="text-white" />
                                                </div>
                                                <div className="flex flex-col items-center gap-0.5">
                                                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white">COMING SOON</span>
                                                    <span className="text-[7px] font-mono uppercase tracking-widest text-white/30">GUARDIAN PROTOCOL LOCKED</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 pt-4">
                                            <button
                                                disabled={true}
                                                className="w-full py-4 bg-white/10 text-white/25 border border-white/5 font-black text-[10px] uppercase tracking-[0.4em] rounded-sm transition-all flex items-center justify-center gap-3 cursor-not-allowed"
                                            >
                                                <Lock size={12} />
                                                LOCKED
                                            </button>

                                            <button
                                                onClick={onBackToReality}
                                                className="w-full py-4 bg-white/[0.02] border border-white/10 text-white/40 font-black text-[10px] uppercase tracking-[0.4em] hover:text-white hover:bg-white/[0.05] transition-all flex items-center justify-center gap-3 pointer-events-auto"
                                            >
                                                <ArrowLeft size={14} />
                                                RETURN TO REALITY
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* System Footer Metadata */}
                            <div className="flex justify-between items-center opacity-10">
                                <span className="text-[6px] font-black tracking-[0.5em] uppercase">SECURE_SYNC_PROTOCOL</span>
                                <span className="text-[6px] font-mono">v1.4.2_AWAKEN</span>
                            </div>
                        </div>

                        {/* Background Decor */}
                        <div className="absolute bottom-[-20px] right-[-20px] opacity-[0.02] pointer-events-none select-none">
                            <span className="material-symbols-outlined text-[160px]">shield</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AwakeningOverlay;
