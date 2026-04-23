import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const RPGItemsTab = ({ user }) => {
    const [invPage, setInvPage] = useState(0);

    // Standardized box size for consistency
    const boxSize = "size-16";
    const gap = "gap-3";

    return (
        <div className="absolute inset-0 z-20 pointer-events-none" key="items-inner">
            
            {/* ====== MOBILE LAYOUT (Restored per previous preference) ====== */}
            <div className="lg:hidden absolute inset-0 flex flex-col items-center justify-center">
                <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="absolute left-4 top-[28%] -translate-y-1/2 flex flex-col gap-2 z-20 pointer-events-auto">
                    {[1, 2, 3].map(s => <div key={s} className="size-14 glass-panel rounded-xl border border-white/5 flex items-center justify-center bg-black/20"><span className="text-[8px] font-black text-slate-600">?</span></div>)}
                </motion.div>
                <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="absolute right-4 top-[28%] -translate-y-1/2 flex flex-col gap-2 z-20 pointer-events-auto">
                    {[4, 5, 6].map(s => <div key={s} className="size-14 glass-panel rounded-xl border border-white/5 flex items-center justify-center bg-black/20"><span className="text-[8px] font-black text-slate-600">?</span></div>)}
                </motion.div>
                <div className="h-full w-full flex flex-col items-center justify-between pt-10 pb-20">
                    <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity }} className="relative w-[180px] h-[180px]">
                        <img src="/Wizard.png" alt="Wiz" className="w-full h-full object-contain grayscale-[0.5] opacity-80" />
                        <div className="absolute inset-x-0 h-px bg-cyan-500/10 top-1/2 -translate-y-1/2" />
                    </motion.div>
                    <div className="flex flex-col items-center gap-4 pointer-events-auto">
                        <div className="flex items-center gap-6">
                            <button onClick={() => setInvPage(p => Math.max(0, p - 1))} className="text-white/20 hover:text-cyan-500"><ChevronLeft size={20}/></button>
                            <span className="text-[8px] font-black text-slate-600">Sector_0{invPage + 1}</span>
                            <button onClick={() => setInvPage(p => Math.min(2, p + 1))} className="text-white/20 hover:text-cyan-500"><ChevronRight size={20}/></button>
                        </div>
                        <div className="grid grid-cols-5 gap-1.5">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="size-14 glass-panel rounded-xl border border-white/5 flex items-center justify-center bg-white/[0.01]">
                                    <span className="text-[8px] font-black text-slate-700">{invPage * 10 + i + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>


            {/* ====== DESKTOP LAYOUT (XOXIUUU) ====== */}
            <div className="hidden lg:flex absolute inset-0 flex-row items-center justify-center px-12 py-8 pointer-events-none">
                
                {/* --- Left Half (O + X) - Exactly 50% --- */}
                <div className="flex-1 flex flex-col items-center justify-center gap-10 px-4 pointer-events-auto">
                    {/* O: Avatar (Top) */}
                    <div className="flex flex-col items-center justify-center">
                        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity }} className="relative w-[200px] h-[200px]">
                            <img src="/Wizard.png" alt="W" className="w-full h-full object-contain grayscale-[0.3] opacity-90" />
                            <div className="absolute inset-0 rounded-full border border-white/5 animate-pulse" />
                            <div className="absolute inset-4 rounded-full border border-cyan-500/5 animate-spin-slow" />
                        </motion.div>
                    </div>

                    {/* X: Equipment Slots (Bottom Grid) */}
                    <div className="flex flex-col items-center gap-3">
                        <span className="text-[9px] font-black text-cyan-500/40 uppercase tracking-[0.4em] mb-1">Active_Equipment</span>
                        <div className="grid grid-cols-3 gap-3">
                            {[1, 2, 3, 4, 5, 6].map(slot => (
                                <div key={slot} className="group flex flex-col items-center gap-1.5">
                                    <div className={`${boxSize} glass-panel rounded-xl border border-white/10 flex items-center justify-center hover:border-cyan-500/50 transition-all bg-black/40 relative`}>
                                        <span className="text-[8px] font-black text-slate-600">?</span>
                                    </div>
                                    <span className="text-[7px] font-black text-slate-500/40 uppercase tracking-widest">SLOT_{slot.toString().padStart(2, '0')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- I: Divider --- */}
                <div className="w-px h-[70%] bg-gradient-to-b from-transparent via-white/10 to-transparent mx-4" />

                {/* --- Right Half (U U U) --- */}
                <div className="flex-1 flex flex-col items-center justify-center px-8 pointer-events-auto">
                    <div className="w-full flex items-center justify-between mb-4">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Inventory_Matrix</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setInvPage(p => Math.max(0, p - 1))} className="p-1 hover:text-cyan-500"><ChevronLeft size={16}/></button>
                            <span className="text-[10px] font-mono text-cyan-500">{invPage + 1}</span>
                            <button onClick={() => setInvPage(p => Math.min(2, p + 1))} className="p-1 hover:text-cyan-500"><ChevronRight size={16}/></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {Array.from({ length: 15 }).map((_, i) => (
                            <div key={i} className={`aspect-square ${boxSize} glass-panel rounded-xl border border-white/10 flex items-center justify-center hover:border-cyan-500/50 transition-all bg-black/40 relative`}>
                                <span className="text-[8px] font-black text-slate-700">{invPage * 15 + i + 1}</span>
                                <div className="absolute top-1 right-1 size-1 bg-white/5 rounded-full" />
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex items-center gap-3 opacity-40">
                        <span className="text-[8px] font-mono tracking-widest uppercase">Capacity_Optimized</span>
                        <div className="size-1 bg-emerald-500 rounded-full" />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RPGItemsTab;
