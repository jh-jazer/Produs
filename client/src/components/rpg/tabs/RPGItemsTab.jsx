import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const RPGItemsTab = ({ user }) => {
    const [invPage, setInvPage] = useState(0);

    return (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none" key="items-inner">
            {/* 1. Equip Wings - Left (Slots 01-03) */}
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute left-4 lg:left-8 top-[28%] -translate-y-1/2 flex flex-col gap-3 md:gap-4 z-20 pointer-events-auto"
            >
                {[1, 2, 3].map((slot) => (
                    <div key={slot} className="group flex flex-col md:flex-row items-center gap-2">
                        <div className="size-16 md:size-20 glass-panel rounded-2xl border border-white/5 flex items-center justify-center hover:border-cyan-500/30 transition-all cursor-pointer">
                            <div className="size-8 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-600 group-hover:text-cyan-500 transition-colors">
                                <span className="text-[8px] font-black">?</span>
                            </div>
                        </div>
                        <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest hidden md:block">SLOT_0{slot}</span>
                    </div>
                ))}
            </motion.div>

            {/* 2. Equip Wings - Right (Slots 04-06) */}
            <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute right-4 lg:right-8 top-[28%] -translate-y-1/2 flex flex-col items-center md:items-end gap-3 md:gap-4 z-20 pointer-events-auto"
            >
                {[4, 5, 6].map((slot) => (
                    <div key={slot} className="group flex flex-col md:flex-row-reverse items-center gap-2">
                        <div className="size-16 md:size-20 glass-panel rounded-2xl border border-white/5 flex items-center justify-center hover:border-cyan-500/30 transition-all cursor-pointer">
                            <div className="size-8 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-600 group-hover:text-cyan-500 transition-colors">
                                <span className="text-[8px] font-black">?</span>
                            </div>
                        </div>
                        <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest hidden md:block">SLOT_0{slot}</span>
                    </div>
                ))}
            </motion.div>

            {/* 3. Character Centerpiece & Bottom Inventory - Fixed Layout */}
            <div className="h-full w-full flex flex-col items-center pointer-events-none">
                <div className="flex flex-col items-center gap-6 md:gap-10 pt-10 pb-20 pointer-events-auto w-full">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative z-10 w-[220px] md:w-[260px] h-[220px] md:h-[260px] flex items-center justify-center shrink-0"
                    >
                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="w-full h-full flex items-center justify-center drop-shadow-[0_0_30px_rgba(6,182,212,0.2)]"
                        >
                            <img src="/Wizard.png" alt="Protocol Wizard" className="w-full h-full object-contain grayscale-[0.5] opacity-80" />
                        </motion.div>
                        {/* Scanline Effect behind avatar */}
                        <div className="absolute inset-x-0 h-px bg-cyan-500/20 top-1/2 -translate-y-1/2 shadow-[0_0_15px_rgba(6,182,212,0.5)] animate-pulse" />
                    </motion.div>

                    {/* Bottom Inventory Grid - Paginated Carousel */}
                    <div className="flex flex-col items-center gap-6 pb-20">
                        <div className="flex items-center gap-8">
                            <button
                                onClick={() => setInvPage(p => Math.max(0, p - 1))}
                                disabled={invPage === 0}
                                className={`p-2 rounded-full border border-white/10 transition-all ${invPage === 0 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/5 hover:border-cyan-500/50 text-cyan-500'}`}
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <div className="flex flex-col items-center gap-3 w-48">
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.6em]">Sector_Grid_0{invPage + 1}</span>
                                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                            </div>

                            <button
                                onClick={() => setInvPage(p => Math.min(2, p + 1))}
                                disabled={invPage === 2}
                                className={`p-2 rounded-full border border-white/10 transition-all ${invPage === 2 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/5 hover:border-cyan-500/50 text-cyan-500'}`}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        <div className="relative w-full flex justify-center h-[160px] md:h-[200px]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={invPage}
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="grid grid-cols-5 gap-1.5"
                                >
                                    {Array.from({ length: 10 }).map((_, i) => (
                                        <div key={i} className="size-16 md:size-20 glass-panel rounded-2xl border border-white/5 flex items-center justify-center group cursor-pointer hover:border-cyan-500/30 transition-all bg-white/[0.01]">
                                            <div className="size-6 md:size-8 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-700 group-hover:text-cyan-500 transition-colors">
                                                <span className="text-[8px] font-black">{invPage * 10 + i + 1}</span>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RPGItemsTab;
