import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Sword, Heart, Zap, Brain, Shield, Sparkles, Target, TrendingUp } from 'lucide-react';

const HandshakeResult = ({ finalPathData, onBegin }) => {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-5xl mx-auto space-y-6 pb-12"
        >
            {/* 1. Integrated Header HUD */}
            <div className="flex flex-col items-center gap-4 border-b border-white/5 pb-6">
                <div className="flex items-center gap-4 text-[9px] font-black font-mono uppercase tracking-[0.4em]">
                    <span className="text-emerald-500 animate-pulse">IDENTITY_STABILIZED</span>
                    <div className="size-1 rounded-full bg-white/10" />
                    <span className="text-white/40">GEN_1_AWAKENED</span>
                    <div className="size-1 rounded-full bg-white/10" />
                    <span className="text-white/40">CLEARANCE_LVL_1</span>
                </div>
                
                <div className="text-center space-y-1">
                    {finalPathData?.rpg?.archetype?.name !== finalPathData?.rpg?.path && finalPathData?.rpg?.archetype?.name !== "Initiate" && (
                        <div className="text-white/20 font-mono text-[9px] uppercase tracking-widest">{finalPathData?.rpg?.path} // SECTOR_LINK</div>
                    )}
                    <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter italic text-white font-exo leading-none">
                        {(finalPathData?.rpg?.archetype?.name === "Initiate" || !finalPathData?.rpg?.archetype?.name) 
                            ? finalPathData?.rpg?.path 
                            : finalPathData?.rpg?.archetype?.name}
                    </h1>
                </div>
            </div>

            {/* 2. Main Data Panel */}
            <div className="space-y-4">
                {/* Top Row: Summary + Attributes side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    {/* Summary */}
                    <div className="relative p-6 rounded-[1.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl overflow-hidden group h-full">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Activity size={40} />
                        </div>
                        <div className="relative space-y-3">
                            <div className="flex items-center gap-3 text-emerald-500/60 font-black text-[9px] uppercase tracking-widest">
                                <div className="h-[1px] w-6 bg-emerald-500/20" />
                                NEURAL_PROFILE_SUMMARY
                            </div>
                            <p className="text-slate-300 text-xs md:text-sm font-medium leading-relaxed italic text-left">
                                "{finalPathData?.rpg?.flavor || "The resonance of your choices has carved a unique path into the digital void."}"
                            </p>
                        </div>
                    </div>

                    {/* Attribute Vectors */}
                    <div className="p-6 rounded-[1.5rem] bg-white/[0.02] border border-white/5 space-y-4 h-full">
                        <div className="flex items-center gap-3 text-white/40 font-black text-[9px] uppercase tracking-[0.4em]">
                            <div className="h-[1px] w-6 bg-white/10" />
                            ATTRIBUTE_VECTORS
                        </div>
                            <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'STR', val: finalPathData?.rpg?.stats?.str, icon: Sword, color: 'text-rose-500', bg: 'bg-rose-500/5', border: 'border-rose-500/10' },
                                { label: 'VIT', val: finalPathData?.rpg?.stats?.vit, icon: Heart, color: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10' },
                                { label: 'AGI', val: finalPathData?.rpg?.stats?.agi, icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/5', border: 'border-yellow-500/10' },
                                { label: 'INT', val: finalPathData?.rpg?.stats?.int, icon: Brain, color: 'text-blue-500', bg: 'bg-blue-500/5', border: 'border-blue-500/10' },
                                { label: 'WIS', val: finalPathData?.rpg?.stats?.wis, icon: Shield, color: 'text-indigo-500', bg: 'bg-indigo-500/5', border: 'border-indigo-500/10' },
                                { label: 'LUK', val: finalPathData?.rpg?.stats?.luk, icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/10' },
                            ].map((stat) => (
                                <div 
                                    key={stat.label}
                                    className={`px-3 py-2.5 rounded-2xl ${stat.bg} border ${stat.border} flex items-center justify-between group/stat transition-all duration-300`}
                                >
                                    <div className="flex items-center gap-2">
                                        <stat.icon size={11} className={`${stat.color} opacity-50 group-hover/stat:opacity-100 transition-opacity`} />
                                        <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">{stat.label}</span>
                                    </div>
                                    <span className="text-sm font-black italic text-white font-exo">{stat.val || 10}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Perks full width */}
                <div className="relative p-6 rounded-[1.5rem] bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/10 flex items-center gap-5 group overflow-hidden">
                    <div className="size-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0 group-hover:scale-105 transition-transform">
                        <Target size={24} />
                    </div>
                    <div className="text-left space-y-0.5">
                        <div className="text-emerald-500/60 font-black text-[8px] uppercase tracking-[0.3em]">PRIMARY_UNLATCH</div>
                        <div className="text-xl font-black text-white italic uppercase tracking-tighter font-exo">
                            {finalPathData?.rpg?.perk || "Latent Potential"}
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
                        <TrendingUp size={32} />
                    </div>
                </div>
            </div>

            {/* 3. Footer Control */}
            <div className="pt-4">
                <motion.button
                    whileHover={{ scale: 1.01, boxShadow: '0 0 40px rgba(16,185,129,0.15)' }}
                    whileTap={{ scale: 0.99 }}
                    onClick={onBegin}
                    className="w-full py-6 rounded-[1.5rem] bg-emerald-500 text-white font-black text-xs uppercase tracking-[0.5em] shadow-xl transition-all relative overflow-hidden group"
                >
                    <span className="relative z-10">BEGIN_JOURNEY</span>
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </motion.button>
            </div>
        </motion.div>
    );
};

export default HandshakeResult;
