import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Flame, Plus, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHabits } from '../../hooks/useHabits';
import DashboardPanel from '../ui/DashboardPanel';

const TodayActivity = ({ user }) => {
    const { habits } = useHabits();
    const navigate = useNavigate();
    const today = new Date().toISOString().split('T')[0];

    const statColors = {
        str: 'rose-500',
        agi: 'orange-400',
        vit: 'emerald-500',
        int: 'primary',
        wis: 'purple-500',
        luk: 'pink-500'
    };

    return (
        <DashboardPanel 
            title="Today's Objectives"
            subtitle="Active Habits"
            actionLabel="Manage Habits"
            actionPath="/dashboard/habits"
            showZap={true}
            className="md:col-span-2"
        >
            {/* Habit Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {habits.slice(0, 6).map((habit) => {
                    const isCompleted = habit.checks?.some(c => c.date === today && c.completed);
                    const colorClass = statColors.int;

                    return (
                        <motion.button
                            key={habit._id}
                            whileHover={{ scale: 1.01, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/dashboard/habits')}
                            className={`flex items-center gap-4 p-4 rounded-[2rem] border transition-all duration-300 group/item ${
                                isCompleted 
                                ? 'bg-white/5 border-white/5 border-transparent' 
                                : 'bg-transparent border-primary/40 dark:border-slate-800 hover:border-primary/60'
                            }`}
                        >
                            {/* Check Status (Read-Only on Dashboard) */}
                            <div className={`size-10 rounded-2xl flex items-center justify-center transition-all ${
                                isCompleted 
                                ? `bg-${colorClass}/20 text-${colorClass} shadow-[0_0_15px_color-mix(in srgb, var(--primary) 20%, transparent)]` 
                                : 'bg-slate-800/50 text-slate-600 group-hover/item:text-slate-400'
                            }`}>
                                {isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                            </div>

                            <div className="flex-1 text-left min-w-0">
                                <p className={`text-[11px] font-black uppercase tracking-tight italic font-exo truncate ${
                                    isCompleted ? 'text-slate-500 line-through' : 'text-slate-300 group-hover/item:text-white'
                                }`}>
                                    {habit.name}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    {habit.streak > 0 && (
                                        <span className="text-[8px] font-black text-orange-500/60 uppercase tracking-widest flex items-center gap-0.5">
                                            <Flame size={8} /> {habit.streak} Day Streak
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Navigation Indicator */}
                            <div className="opacity-0 group-hover/item:opacity-100 transition-opacity pr-2 text-primary">
                                <ChevronRight size={14} />
                            </div>
                        </motion.button>
                    );
                })}

                {habits.length === 0 && (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-center opacity-40">
                         <div className="size-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-600 mb-4">
                            <Plus size={24} />
                         </div>
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No Active Habits Today</p>
                    </div>
                )}
            </div>
        </DashboardPanel>
    );
};

export default TodayActivity;