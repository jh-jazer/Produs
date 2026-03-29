import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Zap, Plus, Flame, Award, Brain } from 'lucide-react';
import { useHabits } from '../../hooks/useHabits';
import { XP_CAPS } from '../../utils/rpgHelpers';

const TodayActivity = ({ user }) => {
    const { habits, toggleCheck } = useHabits();
    const today = new Date().toISOString().split('T')[0];

    const dailyXP = user?.rpg?.dailyXP || { total: 0, byStat: {} };
    const statsUsed = ['str', 'dex', 'end', 'int', 'wis', 'cha'];

    const statColors = {
        str: 'rose-500',
        dex: 'orange-400',
        end: 'emerald-500',
        int: 'cyan-400',
        wis: 'purple-500',
        cha: 'pink-500'
    };

    const getStatIcon = (stat) => {
        switch(stat.toLowerCase()) {
            case 'str': return <Flame size={10} />;
            case 'int': return <Brain size={10} />;
            case 'dex': return <Zap size={10} />;
            default: return <Award size={10} />;
        }
    };

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] font-mono flex items-center gap-2">
                    <span className="size-2 rounded-full bg-cyan-500 animate-pulse" />
                    Today's Tactical Objectives
                </h2>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase font-mono">
                        {dailyXP.total} / {XP_CAPS.total} TOTAL XP
                    </span>
                    <div className="h-1.5 w-24 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(dailyXP.total / XP_CAPS.total) * 100}%` }}
                            className="h-full bg-slate-900 dark:bg-white"
                        />
                    </div>
                </div>
            </div>

            {/* Habit Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {habits.map((habit) => {
                    const isCompleted = habit.checks?.some(c => c.date === today && c.completed);
                    const statKey = habit.category?.toLowerCase() || 'int';
                    const colorClass = statColors[statKey] || 'slate-400';

                    return (
                        <motion.button
                            key={habit._id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleCheck(habit._id, today)}
                            className={`flex items-center gap-4 p-4 rounded-[2rem] border transition-all duration-300 ${isCompleted ? 'bg-white dark:bg-white/[0.05] border-transparent shadow-sm' : 'bg-transparent border-slate-200 dark:border-white/10 opacity-60 hover:opacity-100'}`}
                        >
                            <div className={`size-10 rounded-2xl flex items-center justify-center transition-colors ${isCompleted ? `bg-${colorClass}/20 text-${colorClass}` : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                                {isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                            </div>

                            <div className="flex-1 text-left">
                                <p className={`text-sm font-black uppercase tracking-tight italic font-exo ${isCompleted ? 'text-slate-900 dark:text-white line-through opacity-40' : 'text-slate-900 dark:text-white'}`}>
                                    {habit.name}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest bg-${colorClass}/10 text-${colorClass}`}>
                                        +{statKey}
                                    </span>
                                    {habit.streak > 0 && (
                                        <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-0.5">
                                            <Flame size={8} /> {habit.streak} DAY STREAK
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Daily Stat Caps Breakdown */}
            <div className="bg-slate-50 dark:bg-white/[0.02] rounded-[2.5rem] p-6 border border-slate-200 dark:border-white/5">
                <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth Distribution</span>
                    <div className="flex gap-1">
                        {[1, 2, 3].map(i => <div key={i} className="size-1 rounded-full bg-cyan-500/20" />)}
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-12">
                    {statsUsed.map(stat => {
                        const earned = dailyXP.byStat?.[stat] || 0;
                        const cap = XP_CAPS[stat];
                        const color = statColors[stat];
                        const progress = (earned / cap) * 100;

                        return (
                            <div key={stat} className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat}</span>
                                    <span className={`text-[9px] font-bold font-mono ${earned >= cap ? 'text-emerald-500' : 'text-slate-500'}`}>
                                        {earned}/{cap}
                                    </span>
                                </div>
                                <div className="h-1 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        className={`h-full bg-${color} shadow-[0_0_8px_rgba(var(--tw-color-${color}-rgb),0.5)]`}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TodayActivity;
