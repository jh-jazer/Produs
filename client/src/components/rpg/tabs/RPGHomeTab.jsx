import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Zap, Shield, Sword, Heart, Info, User, Shirt, Layers, Gem, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { getLevelProgress } from '../../../utils/rpgHelpers';
import { ARCHETYPE_PROTOCOLS } from '../../../constants/assessment';
import RPGModal from '../../ui/RPGModal';

const RPGHomeTab = ({ user }) => {
    const [showInfoModal, setShowInfoModal] = React.useState(false);
    const [vaultPage, setVaultPage] = React.useState(0);
    const [activeSubTab, setActiveSubTab] = React.useState('stats');
    const protocolData = ARCHETYPE_PROTOCOLS[user?.rpg?.path] || ARCHETYPE_PROTOCOLS['None'];
    const progressData = getLevelProgress(user?.guardianExp || 0);

    const userStats = user?.rpg?.stats || { str: 50, vit: 50, agi: 50, int: 50, wis: 50, luk: 50 };

    const stats = [
        { label: 'STR_', value: userStats.str, icon: <Sword size={14} />, color: 'rose' },
        { label: 'VIT_', value: userStats.vit, icon: <Heart size={14} />, color: 'emerald' },
        { label: 'AGI_', value: userStats.agi, icon: <Zap size={14} />, color: 'amber' },
        { label: 'INT_', value: userStats.int, icon: <Brain size={14} />, color: 'blue' },
        { label: 'WIS_', value: userStats.wis, icon: <Shield size={14} />, color: 'indigo' },
        { label: 'LUK_', value: userStats.luk, icon: <Sparkles size={14} />, color: 'purple' },
    ];

    const subTabs = [
        { id: 'stats', label: 'STATS' },
        { id: 'items', label: 'ITEMS' },
        { id: 'skills', label: 'SKILLS' },
    ];

    const health = 500 + (userStats.vit * 10) + (userStats.str * 5);
    const defense = Math.round((userStats.vit * 2) + (userStats.agi * 0.5));
    const power = Math.round((userStats.str * 3) + (userStats.agi * 1));

    const tacticalStats = {
        defTact: Math.round((userStats.wis * 2) + (userStats.int * 0.5)),
        pwrTact: Math.round((userStats.int * 3) + (userStats.wis * 1.5)),
        critRate: ((userStats.luk * 0.4) + (userStats.int * 0.1)).toFixed(1),
        critDmg: (150 + (userStats.luk * 0.2)).toFixed(1),
        cdr: Math.min(50, (userStats.agi / 2.5)).toFixed(1),
        atkSpeed: (1 + (userStats.agi / 100)).toFixed(2),
        dodge: ((userStats.agi * 0.3) + (userStats.luk * 0.2)).toFixed(1),
        lootQual: ((userStats.luk * 0.1) + (userStats.wis * 0.05)).toFixed(1),
    };

    const combatLogistics = [
        { label: 'HP_', value: health, icon: <Heart size={10} />, color: 'rose' },
        { label: 'P_DEF_', value: defense, icon: <Shield size={10} />, color: 'cyan' },
        { label: 'T_DEF_', value: tacticalStats.defTact, icon: <Shield size={10} />, color: 'blue' },
        { label: 'P_PWR_', value: power, icon: <Sword size={10} />, color: 'emerald' },
        { label: 'T_PWR_', value: tacticalStats.pwrTact, icon: <Sword size={10} />, color: 'indigo' },
        { label: 'CRIT_%', value: tacticalStats.critRate + '%', icon: <Sparkles size={10} />, color: 'amber' },
        { label: 'CDMG_%', value: tacticalStats.critDmg + '%', icon: <Zap size={10} />, color: 'amber' },
        { label: 'CDR_%', value: tacticalStats.cdr + '%', icon: <Zap size={10} />, color: 'blue' },
        { label: 'ASPD_', value: tacticalStats.atkSpeed + 'x', icon: <Zap size={10} />, color: 'blue' },
        { label: 'DODGE_', value: tacticalStats.dodge + '%', icon: <Zap size={10} />, color: 'emerald' },
        { label: 'LOOT_', value: tacticalStats.lootQual + '%', icon: <Sparkles size={10} />, color: 'purple' },
    ];

    return (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none" key="home-inner">
            
            {/* Tactical Briefing Modal */}
            <RPGModal
                isOpen={showInfoModal}
                onClose={() => setShowInfoModal(false)}
                title="TACTICAL_BRIEFING_"
                subtitle={user?.rpg?.path || 'Identity'}
                maxWidth="max-w-xl"
            >
                <div className="flex flex-col gap-8">
                    <div className="space-y-4">
                        <p className="text-sm font-bold text-rpg-stone leading-relaxed tracking-wider uppercase italic">
                            {protocolData.flavor}
                        </p>
                        
                        <div className="h-px w-full bg-gradient-to-r from-rpg-accent/20 via-transparent to-transparent" />
                        
                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-rpg-stone/40 uppercase tracking-[0.2em] font-mono">Active_Protocol_Perks</span>
                            <div className="bg-rpg-surface/20 border border-rpg-border p-6 rounded-3xl">
                                <div className="space-y-3">
                                    {protocolData.perk.split(' | ').map((p, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="size-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                            <span className="text-xs font-black text-emerald-500 tracking-widest uppercase leading-tight">
                                                {p}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-rpg-stone/40 uppercase tracking-[0.2em] font-mono">Advanced_Combat_Logistics</span>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'MAX_HEALTH', value: health, icon: <Heart size={10} />, color: 'rose' },
                                    { label: 'CRIT_RATE', value: tacticalStats.critRate + '%', icon: <Sparkles size={10} />, color: 'amber' },
                                    { label: 'PHYSICAL_DEF', value: defense, icon: <Shield size={10} />, color: 'cyan' },
                                    { label: 'TACTICAL_DEF', value: tacticalStats.defTact, icon: <Shield size={10} />, color: 'blue' },
                                    { label: 'PHYSICAL_PWR', value: power, icon: <Sword size={10} />, color: 'emerald' },
                                    { label: 'TACTICAL_PWR', value: tacticalStats.pwrTact, icon: <Sword size={10} />, color: 'indigo' },
                                    { label: 'CRIT_DMG', value: tacticalStats.critDmg + '%', icon: <Zap size={10} />, color: 'amber' },
                                    { label: 'COOLDOWN_R', value: tacticalStats.cdr + '%', icon: <Zap size={10} />, color: 'blue' },
                                    { label: 'ATTACK_SPD', value: tacticalStats.atkSpeed + 'x', icon: <Zap size={10} />, color: 'blue' },
                                    { label: 'DODGE_CHNC', value: tacticalStats.dodge + '%', icon: <Zap size={10} />, color: 'emerald' },
                                    { label: 'LOOT_QUALITY', value: tacticalStats.lootQual + '%', icon: <Sparkles size={10} />, color: 'purple' },
                                ].map((stat, i) => (
                                    <div key={i} className="flex items-center justify-between border border-rpg-border p-3 rounded-xl bg-rpg-surface/20">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-${stat.color}-500`}>{stat.icon}</span>
                                            <span className="text-[9px] font-black text-rpg-stone uppercase tracking-widest">{stat.label}</span>
                                        </div>
                                        <span className="text-[11px] font-black text-rpg-cream font-mono">{stat.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-rpg-stone/40 uppercase tracking-[0.2em] font-mono">Neural_Synchronization_Multipliers</span>
                            <div className="grid grid-cols-3 gap-3">
                                {Object.entries(protocolData.multipliers).map(([stat, mult]) => (
                                    <div key={stat} className="flex flex-col gap-2 border border-rpg-border p-4 rounded-2xl bg-rpg-surface/40 group hover:border-rpg-accent/30 transition-all">
                                        <span className="text-[9px] font-black text-rpg-stone/85 uppercase tracking-widest leading-none">{stat}_MOD</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className={`text-lg font-black font-mono leading-none ${mult >= 1.2 ? 'text-rpg-accent' : mult < 1 ? 'text-rose-500' : 'text-rpg-cream'}`}>
                                                {mult.toFixed(1)}
                                            </span>
                                            <span className="text-[8px] font-bold text-rpg-stone">x</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </RPGModal>

            {/* Top Tactical Navigation: Tabs Only */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="absolute top-1 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-auto"
            >
                {/* Sub-Tab Navigation: Unified Command Pill */}
                <div className="bg-rpg-bg/40 backdrop-blur-md border border-rpg-border px-8 py-1 rounded-full flex items-center gap-8 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    {subTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id)}
                            className={`relative group/tab py-1 transition-all ${activeSubTab === tab.id ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                        >
                            <span className={`text-[11px] font-black tracking-[0.4em] font-mono transition-colors ${activeSubTab === tab.id ? 'text-rpg-accent' : 'text-rpg-cream'}`}>
                                {tab.label}
                            </span>
                        </button>
                    ))}
                </div>
            </motion.div>

            {activeSubTab === 'stats' && (
                <>
                    {/* Bottom Tactical Diagnostics: 3-Column Command Grid */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="absolute bottom-1 md:bottom-6 left-1/2 md:left-[42%] -translate-x-1/2 z-30 flex items-center justify-center pointer-events-auto w-full max-w-[95%] md:w-auto"
                    >
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-x-8 md:gap-x-42 gap-y-4 px-6 p-5 rounded-[2rem]">
                            {combatLogistics.map((stat, i) => (
                                <div key={stat.label} className="flex items-center justify-start gap-2 min-w-[120px]">
                                    <div className="flex items-center gap-1.5 min-w-[60px]">
                                        <span className={`text-${stat.color}-500 opacity-80`}>{stat.icon}</span>
                                        <span className="text-[9px] font-black text-rpg-stone uppercase tracking-widest font-mono">{stat.label}</span>
                                    </div>
                                    <span className="text-[11px] font-black text-rpg-cream font-mono">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* 1. HUD - Left Wing (Physical Stats) */}
                    <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="absolute left-4 lg:left-[28%] top-[35%] -translate-y-1/2 flex flex-col gap-8 z-20 pointer-events-auto"
                    >
                        <div className="flex flex-col gap-6 md:gap-3">
                            {stats.slice(0, 3).map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 * i }}
                                    className="group flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-12 border-b border-rpg-border/40 py-2 md:py-1.5 pr-2"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1 rounded text-${stat.color}-500/60`}>
                                            {stat.icon}
                                        </div>
                                        <span className="text-[10px] font-black text-rpg-stone group-hover:text-rpg-cream/80 transition-colors tracking-widest">{stat.label}</span>
                                    </div>
                                    <span className="text-[13px] font-black text-rpg-cream font-mono ml-8 md:ml-0">{stat.value}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* 2. HUD - Right Wing (Logic Stats) */}
                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="absolute right-4 lg:right-[28%] top-[35%] -translate-y-1/2 flex flex-col items-end gap-6 z-20 text-right pointer-events-auto"
                    >
                        <div className="flex flex-col gap-6 md:gap-3 w-full">
                            {stats.slice(3, 6).map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 * i + 0.3 }}
                                    className="group flex flex-col md:flex-row-reverse items-end md:items-center justify-between gap-2 md:gap-12 border-b border-rpg-border/40 py-2 md:py-1.5 pl-2"
                                >
                                    <div className="flex flex-row-reverse items-center gap-3">
                                        <div className={`p-1 rounded text-${stat.color}-500/60`}>
                                            {stat.icon}
                                        </div>
                                        <span className="text-[10px] font-black text-rpg-stone group-hover:text-rpg-cream/80 transition-colors tracking-widest">{stat.label}</span>
                                    </div>
                                    <span className="text-[13px] font-black text-rpg-cream font-mono mr-8 md:mr-0">{stat.value}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}

            {activeSubTab === 'items' && (
                <>
                    {/* Tactical Vault: Storage Boxes with Pagination */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="absolute bottom-4 md:bottom-8 left-1/2 md:left-[47%] -translate-x-1/2 z-30 flex flex-col items-center gap-3 pointer-events-auto w-full max-w-[95%] md:w-auto"
                    >
                        <div className="flex items-center justify-between w-full px-6">
                            <div className="flex items-center gap-4">
                                <span className="text-[9px] font-black text-rpg-stone uppercase tracking-widest font-mono">TACTICAL_VAULT_</span>
                                <span className="text-[9px] font-black text-rpg-cream uppercase tracking-widest font-mono">PAGE {vaultPage + 1}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setVaultPage(p => Math.max(0, p - 1))}
                                    className={`p-1 rounded-md border border-rpg-border hover:bg-rpg-surface/30 transition-all ${vaultPage === 0 ? 'opacity-20 cursor-not-allowed' : 'opacity-100'}`}
                                >
                                    <ChevronLeft size={12} className="text-rpg-cream" />
                                </button>
                                <button 
                                    onClick={() => setVaultPage(p => p + 1)}
                                    className="p-1 rounded-md border border-rpg-border hover:bg-rpg-surface/30 transition-all"
                                >
                                    <ChevronRight size={12} className="text-rpg-cream" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-5 md:grid-cols-8 gap-2 md:gap-x-[72px] md:gap-y-4 px-6 py-4 rounded-3xl">
                            {Array.from({ length: 16 }).map((_, i) => (
                                <motion.div 
                                    key={`${vaultPage}-${i}`}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.03 }}
                                    className={`size-14 border border-rpg-border bg-rpg-surface/10 rounded-xl hover:border-rpg-accent/50 transition-all cursor-pointer relative group ${i >= 10 ? 'hidden md:block' : ''}`}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                        <Package size={20} className="text-rpg-cream" />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-br from-rpg-cream/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                                    <span className="absolute bottom-1 right-1.5 text-[7px] font-black text-rpg-stone uppercase">{vaultPage * 10 + i + 1}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Equipment Slots - Left Wing */}
                    <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="absolute left-2 lg:left-[32%] top-[35%] -translate-y-1/2 flex flex-col gap-4 z-20 pointer-events-auto"
                    >
                        {[
                            { id: 'head', icon: <User size={24} /> },
                            { id: 'body', icon: <Shirt size={24} /> },
                            { id: 'legs', icon: <Layers size={24} /> },
                        ].map((slot, i) => (
                            <motion.div
                                key={slot.id}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.1 * i }}
                                className="group flex items-center"
                            >
                                <div className="size-14 border border-rpg-border bg-rpg-surface/10 rounded-2xl flex items-center justify-center group-hover:border-rpg-accent/50 transition-all cursor-pointer relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-rpg-cream/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="text-rpg-cream opacity-20 group-hover:opacity-40 transition-opacity">
                                        {slot.icon}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Equipment Slots - Right Wing */}
                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="absolute right-2 lg:right-[32%] top-[35%] -translate-y-1/2 flex flex-col items-end gap-4 z-20 text-right pointer-events-auto"
                    >
                        {[
                            { id: 'main_hand', icon: <Sword size={24} /> },
                            { id: 'off_hand', icon: <Shield size={24} /> },
                            { id: 'accessory', icon: <Gem size={24} /> },
                        ].map((slot, i) => (
                            <motion.div
                                key={slot.id}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.1 * i + 0.3 }}
                                className="group flex flex-row-reverse items-center"
                            >
                                <div className="size-14 border border-rpg-border bg-rpg-surface/10 rounded-2xl flex items-center justify-center group-hover:border-rpg-accent/50 transition-all cursor-pointer relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-rpg-cream/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="text-rpg-cream opacity-20 group-hover:opacity-40 transition-opacity">
                                        {slot.icon}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                </>
            )}

            {activeSubTab === 'skills' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute inset-x-8 top-[42%] -translate-y-1/2 flex flex-col items-center gap-8 z-20 pointer-events-auto"
                >
                    <div className="w-full max-w-md border border-rpg-border bg-rpg-surface/10 p-6 rounded-3xl backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-[10px] font-black text-rpg-stone uppercase tracking-widest">Skill_Matrix_</span>
                            <span className="text-[10px] font-black text-rpg-cream uppercase tracking-widest">Protocol_Ready</span>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="aspect-square border border-rpg-border/40 bg-rpg-surface/40 rounded-xl flex items-center justify-center group hover:border-rpg-accent/30 transition-all cursor-pointer">
                                    <div className="size-6 rounded-full bg-rpg-surface/30 group-hover:bg-rpg-accent/20 transition-all" />
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* 3. Centerpiece - Avatar & Labels */}
            <div className={`relative z-20 flex flex-col items-center ${activeSubTab === 'items' ? '-translate-y-14 md:-translate-y-18' : '-translate-y-10 md:-translate-y-14'} pointer-events-auto`}>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
                    className="relative group"
                >
                    <div className="absolute inset-0 bg-rpg-accent/20 blur-[100px] rounded-full scale-150 animate-pulse" />
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="relative z-10 w-[260px] h-[260px] flex items-center justify-center drop-shadow-[0_0_30px_rgba(107,29,43,0.4)]"
                    >
                        <img src="/Wizard.png" alt="Protocol Wizard" className="w-full h-full object-contain" />
                    </motion.div>
                    <div className="absolute inset-0 -m-8 pointer-events-none">
                        <div className="absolute inset-0 border border-rpg-accent/10 rounded-full animate-[spin_20s_linear_infinite]" />
                        <div className="absolute inset-8 border border-rpg-border/20 rounded-full animate-[spin_10s_linear_infinite_reverse]" />
                    </div>
                </motion.div>

                {/* Archetype Title: Sitting at the feet */}
                {activeSubTab === 'stats' && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-2 md:mt-6 flex flex-col items-center gap-2"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-px w-10 bg-gradient-to-r from-transparent via-rpg-accent/50 to-rpg-accent" />
                            <button 
                                onClick={() => setShowInfoModal(true)}
                                className="flex items-center gap-3 group cursor-pointer hover:scale-105 transition-transform relative z-50 pointer-events-auto"
                            >
                                <span className="text-[11px] font-black text-rpg-accent uppercase tracking-[0.8em] group-hover:text-rpg-cream transition-colors">{user?.rpg?.path || 'Identity'}</span>
                                <div className="p-1 rounded-full bg-rpg-accent/10 border border-rpg-accent/20 group-hover:bg-rpg-accent/20 group-hover:border-rpg-accent/40 transition-all">
                                    <Info size={10} className="text-rpg-accent" />
                                </div>
                            </button>
                            <div className="h-px w-10 bg-gradient-to-l from-transparent via-rpg-accent/50 to-rpg-accent" />
                        </div>
                    </motion.div>
                )}
            </div>

        </div>
    );
};

export default RPGHomeTab;
