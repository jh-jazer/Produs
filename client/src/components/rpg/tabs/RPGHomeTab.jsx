import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Zap, Shield, Sword, Heart } from 'lucide-react';
import { getLevelProgress } from '../../../utils/rpgHelpers';
import { ARCHETYPE_PROTOCOLS } from '../../../constants/assessment';

const RPGHomeTab = ({ user }) => {
    const protocolData = ARCHETYPE_PROTOCOLS[user?.rpg?.path] || ARCHETYPE_PROTOCOLS['None'];
    const progressData = getLevelProgress(user?.exp || 0);

    const userStats = user?.rpg?.stats || { str: 50, vit: 50, agi: 50, int: 50, wis: 50, luk: 50 };

    const stats = [
        { label: 'STR_', value: userStats.str, icon: <Sword size={14} />, color: 'rose' },
        { label: 'VIT_', value: userStats.vit, icon: <Heart size={14} />, color: 'emerald' },
        { label: 'AGI_', value: userStats.agi, icon: <Zap size={14} />, color: 'amber' },
        { label: 'INT_', value: userStats.int, icon: <Brain size={14} />, color: 'blue' },
        { label: 'WIS_', value: userStats.wis, icon: <Shield size={14} />, color: 'indigo' },
        { label: 'LUK_', value: userStats.luk, icon: <Sparkles size={14} />, color: 'purple' },
    ];

    return (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden" key="home-inner">
            {/* 1. HUD - Left Wing (Physical Stats) */}
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute left-4 lg:left-8 top-[42%] -translate-y-1/2 flex flex-col gap-8 z-20"
            >
                <div className="flex flex-col gap-6 md:gap-3">
                    {stats.slice(0, 3).map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1 * i }}
                            className="group flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-12 border-b border-white/[0.01] md:border-white/[0.03] py-2 md:py-1.5 pr-2"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-1 rounded text-${stat.color}-500/60`}>
                                    {stat.icon}
                                </div>
                                <span className="text-[10px] font-black text-slate-500 group-hover:text-white/80 transition-colors tracking-widest">{stat.label}</span>
                            </div>
                            <span className="text-[13px] font-black text-white font-mono ml-8 md:ml-0">{stat.value}</span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* 2. HUD - Right Wing (Logic Stats) */}
            <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute right-4 lg:right-8 top-[42%] -translate-y-1/2 flex flex-col items-end gap-6 z-20 text-right"
            >
                <div className="flex flex-col gap-6 md:gap-3 w-full">
                    {stats.slice(3, 6).map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1 * i + 0.3 }}
                            className="group flex flex-col md:flex-row-reverse items-end md:items-center justify-between gap-2 md:gap-12 border-b border-white/[0.01] md:border-white/[0.03] py-2 md:py-1.5 pl-2"
                        >
                            <div className="flex flex-row-reverse items-center gap-3">
                                <div className={`p-1 rounded text-${stat.color}-500/60`}>
                                    {stat.icon}
                                </div>
                                <span className="text-[10px] font-black text-slate-500 group-hover:text-white/80 transition-colors tracking-widest">{stat.label}</span>
                            </div>
                            <span className="text-[13px] font-black text-white font-mono mr-8 md:mr-0">{stat.value}</span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* 3. Centerpiece - Avatar & Labels */}
            <div className="relative z-10 flex flex-col items-center translate-y-6">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
                    className="relative group"
                >
                    <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full scale-150 animate-pulse" />
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="relative z-10 w-[260px] h-[260px] flex items-center justify-center drop-shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                    >
                        <img src="/Wizard.png" alt="Protocol Wizard" className="w-full h-full object-contain" />
                    </motion.div>
                    <div className="absolute inset-0 -m-8 pointer-events-none">
                        <div className="absolute inset-0 border border-cyan-500/10 rounded-full animate-[spin_20s_linear_infinite]" />
                        <div className="absolute inset-8 border border-white/5 rounded-full animate-[spin_10s_linear_infinite_reverse]" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 flex flex-col items-center gap-2"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-px w-8 bg-gradient-to-r from-transparent to-cyan-500" />
                        <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.6em]">{user?.rpg?.path || 'Identity'}_Protocol</span>
                        <div className="h-px w-8 bg-gradient-to-l from-transparent to-cyan-500" />
                    </div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.4, 0.7] }}
                        transition={{ delay: 0.8, duration: 1.5 }}
                        className="max-w-[400px] text-center text-[9px] font-bold text-slate-400 italic leading-relaxed tracking-[0.2em] uppercase mt-2 px-4"
                    >
                        {protocolData.flavor}
                    </motion.p>
                </motion.div>
            </div>

            {/* 4. Center Top Diagnostics - Sync Progress */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="absolute top-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2"
            >
                <div className="flex items-center gap-12 w-64">
                    <div className="flex flex-col items-start">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Sync_Rank</span>
                        <span className="text-[12px] font-black text-white">LVL.{user?.level || 0}</span>
                    </div>
                    <div className="flex-1 space-y-1.5">
                        <div className="flex justify-between items-center">
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Neural_Sync</span>
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{Math.round(((user?.exp - progressData.totalRequired) / progressData.nextLevelExp) * 100)}%</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${((user?.exp - progressData.totalRequired) / progressData.nextLevelExp) * 100}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default RPGHomeTab;
