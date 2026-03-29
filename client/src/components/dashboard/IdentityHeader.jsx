import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Target, Brain, Sparkles, ChevronRight } from 'lucide-react';
import { getLevelProgress } from '../../utils/rpgHelpers';
import { ARCHETYPE_PROTOCOLS } from '../../constants/assessment';

const IdentityHeader = ({ user }) => {
    if (!user) return null;

    const rpg = user.rpg || { stats: {}, archetype: { name: 'None', tier: 1, stage: 'Unawakened' } };
    const { name: archeName, tier, stage } = rpg.archetype;
    const protocol = ARCHETYPE_PROTOCOLS[archeName] || ARCHETYPE_PROTOCOLS['None'];
    
    // Calculate level progress using total user EXP
    const progressData = getLevelProgress(user.exp || 0);

    return (
        <div className="w-full space-y-8 mb-12">
            {/* Identity Banner */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                    >
                        <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] font-mono bg-cyan-500/10 px-2 py-0.5 rounded">
                            {stage || 'UNMAPPED'}
                        </span>
                        <div className="h-px w-8 bg-slate-200 dark:bg-white/10" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono">
                            PHASE: {tier >= 5 ? 'ASCENDED' : tier >= 3 ? 'ESTABLISHED' : 'AWAKENING'}
                        </span>
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white font-exo"
                    >
                        {user.level === 0 ? 'IDENTITY_UNMAPPED' : archeName}{' '}
                        <span className="text-slate-200 dark:text-white/10">
                            {user.level === 0 ? 'CORE_OFFLINE' : `T${tier}`}
                        </span>
                    </motion.h1>
                </div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-4 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 p-4 rounded-3xl shadow-sm"
                >
                    <div className="size-12 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-black shadow-lg">
                        <span className="text-xl font-black font-exo italic">{progressData.level}</span>
                    </div>
                    <div className="flex flex-col pr-4">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">CURRENT_LEVEL</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter italic font-exo">
                            {progressData.title}
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* XP PROGRESS BAR */}
            <div className="space-y-3">
                <div className="flex justify-between items-end mb-1 px-1">
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-white font-exo italic">
                            {progressData.xpInLevel}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            / {progressData.xpRequired} XP TO LVL {progressData.level + 1}
                        </span>
                    </div>
                    <span className="text-[10px] font-black text-cyan-500 font-mono">
                        {Math.floor(progressData.progress)}%_SYNC
                    </span>
                </div>
                
                <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden relative">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressData.progress}%` }}
                        transition={{ duration: 1, ease: "circOut" }}
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                    />
                </div>
            </div>

            {/* Lore Quote & Icon Visual */}
            <div className="flex items-start gap-6 pt-4">
                <div className="hidden md:flex size-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 items-center justify-center text-cyan-500 shrink-0">
                    <Zap size={28} />
                </div>
                <div className="relative">
                    <span className="absolute -left-2 -top-2 text-4xl text-slate-100 dark:text-white/5 font-serif italic">"</span>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 italic leading-relaxed tracking-wide uppercase px-2">
                        {protocol.flavor}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default IdentityHeader;
