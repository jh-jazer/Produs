/* eslint-disable */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Zap, Shield, Sparkles } from 'lucide-react';
import SystemWindow from '../ui/SystemWindow';

const AwakeningOverlay = ({ onAwaken, onBackToReality, isLoading }) => {
    return (
        <div className="w-full h-full flex items-center justify-center pointer-events-auto">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-xl"
            >
                <SystemWindow 
                    variant="glass"
                    subtitle="Assessment Required"
                    module="Getting Started"
                    status="Locked"
                >
                    <div className="space-y-8 py-4">
                        <div className="flex flex-col items-center gap-6 text-center">
                            
                            
                            <div className="space-y-3">
                                <p className="text-sm font-black text-[var(--foreground)] uppercase tracking-widest italic font-exo">
                                    System Access Suspended
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase tracking-[0.2em] max-w-sm mx-auto">
                                    You haven't completed the onboarding assessment yet. Complete the assessment to discover your productivity style and unlock the dashboard features.
                                </p>
                            </div>
                        </div>

                        

                        <div className="flex flex-col gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(34,211,238,0.3)" }}
                                whileTap={{ scale: 0.98 }}
                                onClick={!isLoading ? onAwaken : undefined}
                                disabled={isLoading}
                                className={`w-full py-4 bg-cyan-500 text-black font-black text-[11px] uppercase tracking-[0.4em] rounded-2xl shadow-lg flex items-center justify-center gap-3 group transition-all ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                            >
                                <Sparkles size={10} className={`${isLoading ? 'animate-spin' : 'group-hover:rotate-12'} transition-transform`} />
                                {isLoading ? 'LOADING...' : 'START ASSESSMENT'}
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02, bg: "rgba(0,0,0,0.05)" }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onBackToReality}
                                className="w-full py-3 border border-black/10 dark:border-white/10 text-[var(--foreground)]/60 hover:text-[var(--foreground)] font-black text-[9px] uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 transition-all"
                            >
                                GO BACK
                            </motion.button>
                        </div>
                        
                        
                    </div>
                </SystemWindow>
            </motion.div>
        </div>
    );
};

export default AwakeningOverlay;
