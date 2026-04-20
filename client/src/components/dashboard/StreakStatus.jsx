import React from 'react';
import { motion } from 'framer-motion';
import {
    Flame, AlertCircle,
    Activity
} from 'lucide-react';
import { useHabits } from '../../hooks/useHabits';
import { ARCHETYPE_PROTOCOLS } from '../../constants/assessment';
import DashboardPanel from '../ui/DashboardPanel';

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

    return (
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Archetype Protocol Card */}
            <DashboardPanel
                title="Current Identity"
                subtitle="Identity Parameters"
                className="md:col-span-2"
                showZap={false}
            >
                <div className="flex flex-col justify-between h-full relative z-10">
                    <div className="space-y-4">
                        <div className="flex items-baseline gap-4">
                            <h3 className="text-5xl font-black text-white italic font-exo tracking-tighter uppercase">
                                {archetype}
                            </h3>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest font-mono">[ ACTIVE ]</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest max-w-[450px] leading-relaxed">
                            {protocol.flavor}
                        </p>

                        <div className="grid grid-cols-1 gap-2 mt-4">
                            {protocol.perk.split('|').map((p, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="size-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">{p.trim()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-10 mt-8 pt-8 border-t border-cyan-500/20 dark:border-white/5 overflow-x-auto no-scrollbar">
                        {Object.entries(protocol.multipliers).map(([stat, val]) => (
                            <div key={stat} className="flex flex-col min-w-fit">
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{stat} Multiplier</span>
                                <span className={`text-xl font-black ${val >= 1 ? 'text-emerald-500' : 'text-orange-500'} font-exo italic tracking-tighter`}>{val}x</span>
                            </div>
                        ))}
                        <div className="flex flex-col ml-auto">
                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Current Stage</span>
                            <span className="text-xl font-black text-white font-exo italic uppercase tracking-tighter">{user?.rpg?.archetype?.stage || 'BASELINE'}</span>
                        </div>
                    </div>
                </div>
            </DashboardPanel>

            {/* Critical Streaks Sidebar */}
            <DashboardPanel
                title="Urgent Streaks"
                subtitle="At Risk Habits"
                className="flex flex-col"
            >
                <div className="space-y-3">
                    {criticalStreaks.length > 0 ? (
                        criticalStreaks.slice(0, 3).map(h => (
                            <div key={h._id} className="flex items-center justify-between p-4 rounded-[1.5rem] bg-orange-500/5 border border-orange-500/10 group/streak transition-all hover:bg-orange-500/10">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-tight line-clamp-1">{h.name}</span>
                                    <span className="text-[8px] font-bold text-orange-500 uppercase tracking-widest mt-0.5">Day {h.streak} at risk</span>
                                </div>
                                <AlertCircle size={14} className="text-orange-500 animate-pulse" />
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-3 glass-panel rounded-[1.5rem]">
                            <div className="size-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <CheckCircle2 size={20} />
                            </div>
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-tight">All Streaks Safe</span>
                        </div>
                    )}
                </div>

                <div className="pt-8 mt-auto">
                    <div className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Active Chains</div>
                    <div className="flex flex-wrap gap-2">
                        {activeStreaks.slice(0, 4).map(h => (
                            <div key={h._id} className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-card hover:border-orange-500/50 transition-colors">
                                <Flame size={10} className="text-orange-500" />
                                <span className="text-[10px] font-black text-white font-mono">{h.streak}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </DashboardPanel>
        </div>
    );
};

const CheckCircle2 = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

export default StreakStatus;
