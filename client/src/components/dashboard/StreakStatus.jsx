import React from 'react';
import { motion } from 'framer-motion';
import {
    Flame, Trophy, TrendingUp, AlertCircle, Zap,
    Shield, Brain, Crosshair, Heart, Network,
    Target, Eye, Sparkles, Dumbbell, Activity
} from 'lucide-react';
import { useHabits } from '../../hooks/useHabits';
import { ARCHETYPE_PROTOCOLS } from '../../constants/assessment';

const iconMap = {
    'Iron Fist': Dumbbell,
    'Blade Dancer': Zap,
    'Warlord': Crosshair,
    'Vanguard': TrendingUp,
    'Sentinel': Shield,
    'Forge Master': Sparkles,
    'Commander': Network,
    'Champion': Target,
    'Shadow Monk': Eye,
    'Ghost': Sparkles,
    'Diplomat': Network,
    'Bard': Sparkles,
    'Oracle': Brain,
    'Druid': Heart,
    'Alchemist': Sparkles,
    'Architect': TrendingUp,
    'None': Activity
};

const StreakStatus = ({ user }) => {
    const { habits } = useHabits();
    const today = new Date().toISOString().split('T')[0];

    // Calculate streaks
    const activeStreaks = habits.filter(h => h.streak > 0).sort((a, b) => b.streak - a.streak);
    
    // Find streaks that need completion today
    const criticalStreaks = habits.filter(h => {
        const isCompletedToday = h.checks?.some(c => c.date === today && c.completed);
        return h.streak > 0 && !isCompletedToday;
    });

    const archetype = user?.rpg?.archetype?.name || 'None';
    const protocol = ARCHETYPE_PROTOCOLS[archetype] || ARCHETYPE_PROTOCOLS['None'];
    const Icon = iconMap[archetype] || Activity;

    return (
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Archetype Protocol Card */}
            <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Icon size={120} className="text-white" strokeWidth={3} />
                </div>
                
                <div className="relative z-10 flex flex-col justify-between h-full">
                    <div className="space-y-2">
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] font-mono">ARCHETYPE_PROTOCOL</span>
                        <h3 className="text-5xl font-black text-white italic font-exo tracking-tighter uppercase">
                            {archetype}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-[400px]">
                            {protocol.flavor}
                        </p>

                        <div className="grid grid-cols-1 gap-1.5 mt-4">
                            {protocol.perk.split('|').map((p, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="size-1 rounded-full bg-emerald-500" />
                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">{p.trim()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-6 mt-8 pt-6 border-t border-white/10 overflow-x-auto no-scrollbar">
                        {Object.entries(protocol.multipliers).map(([stat, val]) => (
                            <div key={stat} className="flex flex-col min-w-fit">
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{stat}_MULT</span>
                                <span className={`text-xl font-black ${val >= 1 ? 'text-emerald-500' : 'text-orange-500'} font-exo italic`}>{val}x</span>
                            </div>
                        ))}
                        <div className="flex flex-col ml-auto">
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">CURRENT_STAGE</span>
                            <span className="text-xl font-black text-white font-exo italic uppercase">{user?.rpg?.archetype?.stage || 'NONE'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Critical Streaks Sidebar */}
            <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 space-y-4">
                <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">URGENT_STREAKS</span>
                    <Flame size={14} className="text-orange-500" />
                </div>

                <div className="space-y-3">
                    {criticalStreaks.length > 0 ? (
                        criticalStreaks.map(h => (
                            <div key={h._id} className="flex items-center justify-between p-3 rounded-2xl bg-orange-500/5 border border-orange-500/10">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight line-clamp-1">{h.name}</span>
                                    <span className="text-[8px] font-bold text-orange-500 uppercase tracking-widest">Day {h.streak} at risk</span>
                                </div>
                                <AlertCircle size={14} className="text-orange-500 animate-pulse" />
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                            <div className="size-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <CheckCircle2 size={16} />
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">STREAKS_STABILIZED</span>
                        </div>
                    )}
                </div>

                <div className="pt-4 mt-auto">
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">ACTIVE_CHAIN_VIEW</div>
                    <div className="flex flex-wrap gap-2">
                        {activeStreaks.slice(0, 4).map(h => (
                            <div key={h._id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                <Flame size={10} className="text-orange-500" />
                                <span className="text-[9px] font-black text-slate-900 dark:text-white font-mono">{h.streak}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Internal icon for checkmark since Lucide might have been missed in earlier imports
const CheckCircle2 = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

export default StreakStatus;
