import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, Target, Brain, Sparkles, ChevronRight, User, Mail, Calendar, CheckCircle2, Eye, EyeOff, Copy, Check, Lock } from 'lucide-react';
import { getLevelProgress } from '../../utils/rpgHelpers';
import { ARCHETYPE_PROTOCOLS } from '../../constants/assessment';
import Avatar from '../ui/Avatar';
import { DashboardContext } from '../../context/DashboardContext';

const IdentityHeader = ({ user, habits = [] }) => {
    const { protocolMode, setProtocolMode } = useContext(DashboardContext);
    const [isIdVisible, setIsIdVisible] = useState(false);
    const [hasCopiedId, setHasCopiedId] = useState(false);

    const handleCopyId = async () => {
        try {
            await navigator.clipboard.writeText(user._id);
            setHasCopiedId(true);
            setTimeout(() => setHasCopiedId(false), 2000);
        } catch (err) {
            console.error('Failed to copy ID', err);
        }
    };
    if (!user) return null;

    const today = new Date().toISOString().split('T')[0];
    const completedToday = habits.filter(h => h.completedDates?.some(d => d.startsWith(today))).length;
    const totalHabits = habits.length;
    const habitProgress = totalHabits > 0 ? (completedToday / totalHabits * 100) : 0;

    const rpg = user.rpg || { stats: {}, archetype: { name: 'None', tier: 1, stage: 'Unawakened' } };
    const { name: archeName, tier, stage } = rpg.archetype;
    const protocol = ARCHETYPE_PROTOCOLS[archeName] || ARCHETYPE_PROTOCOLS['None'];
    
    // Calculate level progress using total user EXP
    const progressData = getLevelProgress(user.exp || 0);

    return (
        <div className="glass-panel w-full rounded-[2.5rem] mb-12 relative overflow-hidden flex flex-col">
            {/* 1. Tactical Banner Segment */}
            <div className="w-full h-32 md:h-40 relative group overflow-hidden">
                {user.banner ? (
                    <img 
                        src={user.banner} 
                        alt="Profile Banner" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-900 dark:to-[#0a0a0a] transition-all duration-700">
                        {/* Abstract tactical grid over empty banner */}
                        <div className="absolute inset-0 bg-grid-light dark:bg-grid opacity-20" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                )}
                
                {/* 1.1 Tactical Toggles Area */}
                <div className="absolute top-4 right-6 flex flex-col md:flex-row items-end md:items-center gap-4">
                    {/* Protocol Selector Toggle */}
                    <div className="flex bg-black/40 dark:bg-black/60 backdrop-blur-md rounded-2xl p-1 border border-white/10 shadow-2xl">
                        <button
                            onClick={() => setProtocolMode('reality')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${protocolMode === 'reality' ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'text-white/40 hover:text-white/70'}`}
                        >
                            <User size={10} />
                            <span className="hidden md:block">REALITY</span>
                        </button>
                        <button
                            onClick={() => (user.rpg?.path || user.rpg?.pendingQuestions?.length > 0 || user.level === 0) && setProtocolMode('rpg')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                protocolMode === 'rpg' 
                                ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                                : (!user.rpg?.path && !user.rpg?.pendingQuestions?.length && user.level > 0) 
                                    ? 'text-white/20 cursor-not-allowed' 
                                    : 'text-white/40 hover:text-white/70'
                            }`}
                        >
                            {(user.rpg?.path || user.rpg?.pendingQuestions?.length > 0 || user.level === 0) ? (
                                <Zap size={10} className={protocolMode === 'rpg' ? 'animate-pulse' : ''} />
                            ) : (
                                <Lock size={10} className="text-white/20" />
                            )}
                            <span className="hidden md:block">RPG_LINK</span>
                        </button>
                    </div>

                    
                </div>
            </div>

            {/* 2. Profile Overlay & Header Section */}
            <div className="px-8 md:px-12 pb-10 -mt-10 md:-mt-12 relative z-10 space-y-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
                        {/* Avatar */}
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="size-24 md:size-32 rounded-3xl md:rounded-[2.5rem] bg-white dark:bg-[#121212] p-1 shadow-2xl border-4 border-white/80 dark:border-white/10 ring-8 ring-black/5 dark:ring-white/[0.02]"
                        >
                            <div className="w-full h-full rounded-2xl md:rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-white/5">
                                <Avatar config={user.avatar} className="size-full" />
                            </div>
                        </motion.div>

                        {/* User Identity Info */}
                        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-1 md:pb-5">
                            <AnimatePresence mode="wait">
                                {protocolMode === 'rpg' ? (
                                    <motion.div 
                                        key="rpg-info"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="flex items-center gap-3 mb-1"
                                    >
                                        <span className="text-sm md:text-base font-black text-cyan-500 uppercase tracking-tight font-exo italic">
                                            {user.level === 0 ? 'IDENTITY_OFFLINE' : archeName} <span className="text-slate-400 dark:text-slate-500 ml-1">T{tier}</span>
                                        </span>
                                        <div className="size-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_var(--accent-glow)]" />
                                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                                            {stage || 'UNMAPPED'}
                                        </span>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="reality-info"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="flex items-center gap-3 mb-1"
                                    >
                                        <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest font-mono italic">
                                            {isIdVisible ? user._id : '**************'}
                                        </span>
                                        <button 
                                            onClick={() => setIsIdVisible(!isIdVisible)}
                                            className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-cyan-500 transition-colors"
                                            title={isIdVisible ? "Hide ID" : "Show ID"}
                                        >
                                            {isIdVisible ? <EyeOff size={10} /> : <Eye size={10} />}
                                        </button>
                                        <button
                                            onClick={handleCopyId}
                                            className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-cyan-500 transition-colors"
                                            title="Copy ID"
                                        >
                                            {hasCopiedId ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                                        </button>
                                        <div className="size-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            
                            <motion.h1 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white font-exo leading-none"
                            >
                                @{user.username || user.name || 'USER_LINK_LOST'}
                            </motion.h1>
                        </div>
                    </div>

                    {/* Metric Card (Level or Reality) */}
                    <AnimatePresence mode="wait">
                        {protocolMode === 'rpg' ? (
                            <motion.div 
                                key="rpg-metric"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: 0.2 }}
                                className="glass-card flex items-center gap-5 p-4 md:p-5 rounded-3xl md:self-end"
                            >
                                {/* Level Icon Badge */}
                                <div className="size-12 md:size-14 rounded-2xl bg-slate-900 dark:bg-white flex flex-col items-center justify-center shrink-0 border border-black/5 dark:border-white/5 shadow-none">
                                    <span className="text-[7px] md:text-[8px] font-black text-white/40 dark:text-black/40 uppercase tracking-tighter italic leading-none mb-0.5">LVL</span>
                                    <span className="text-xl md:text-2xl font-black text-white dark:text-black italic font-exo leading-none">{user.level || 1}</span>
                                </div>

                                <div className="flex flex-col min-w-[200px] md:min-w-[240px]">
                                <div className="flex justify-between items-end mb-1.5 px-1">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white font-exo italic leading-none">
                                                {progressData.xpInLevel}
                                            </span>
                                            <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                                / {progressData.xpRequired} XP TO LVL UP
                                            </span>
                                        </div>
                                        <span className="text-[9px] md:text-[10px] font-black text-cyan-500 uppercase tracking-widest font-mono italic">{Math.round(progressData.progress)}%_SYNC</span>
                                    </div>
                                    
                                    <div className="h-2 w-full bg-black/[0.04] dark:bg-white/5 rounded-full overflow-hidden relative">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressData.progress}%` }}
                                            transition={{ duration: 1.2, ease: "circOut" }}
                                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-600 to-cyan-400"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="reality-metric"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: 0.2 }}
                                className="glass-card flex items-center gap-5 p-4 md:p-5 rounded-3xl md:self-end"
                            >
                                {/* Account Status Badge */}
                                <div className="size-12 md:size-14 rounded-2xl bg-cyan-500 flex flex-col items-center justify-center shrink-0 border border-cyan-500/10 shadow-none">
                                    <Shield size={20} className="text-white" />
                                </div>

                                <div className="flex flex-col min-w-[200px] md:min-w-[240px]">
                                    <div className="flex justify-between items-end mb-1.5 px-1">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white font-exo italic leading-none">
                                                {completedToday}
                                            </span>
                                            <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                                / {totalHabits - completedToday} HABITS_LEFT_TO_SYNC
                                            </span>
                                        </div>
                                        <span className="text-[9px] md:text-[10px] font-black text-cyan-500 uppercase tracking-widest font-mono italic">{Math.round(habitProgress)}%</span>
                                    </div>
                                    
                                    <div className="h-2 w-full bg-black/[0.04] dark:bg-white/5 rounded-full overflow-hidden relative">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${habitProgress}%` }}
                                            transition={{ duration: 1.2, ease: "circOut" }}
                                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-600 to-cyan-400"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 3. XP Progress Tracker (Space Reserved) */}
                <div className="space-y-4"></div>

                {/* 4. Lore / Bio Section */}
                <div className="flex items-center gap-8 pt-8 border-t border-black/[0.05] dark:border-white/5">
                    <div className="hidden md:flex size-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 items-center justify-center text-cyan-500 shrink-0">
                        <AnimatePresence mode="wait">
                            {protocolMode === 'rpg' ? (
                                <motion.div
                                    key="rpg-icon"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.5, opacity: 0 }}
                                >
                                    <Sparkles size={28} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="reality-icon"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.5, opacity: 0 }}
                                    className="text-cyan-500"
                                >
                                    <Target size={28} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="relative flex-1">
                        <span className="absolute -left-4 -top-6 text-6xl text-black/[0.05] dark:text-white/5 font-serif italic selection:bg-transparent pointer-events-none">"</span>
                        <AnimatePresence mode="wait">
                            {protocolMode === 'rpg' ? (
                                <motion.p 
                                    key="rpg-flavor"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20, filter: 'blur(5px)' }}
                                    className="text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 italic leading-relaxed tracking-[0.15em] uppercase px-4 max-w-4xl"
                                >
                                    {protocol.flavor}
                                </motion.p>
                            ) : (
                                <motion.p 
                                    key="reality-bio"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20, filter: 'blur(5px)' }}
                                    className="text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 italic leading-relaxed tracking-[0.05em] px-4 max-w-4xl normal-case"
                                >
                                    {user.bio || "Operator objective undefined. Establishing focus protocols..."}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IdentityHeader;
