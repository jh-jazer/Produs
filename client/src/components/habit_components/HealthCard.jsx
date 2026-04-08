/* eslint-disable */
import React, { useMemo } from 'react';
import useSWR from 'swr';
import api from '../../services/api';

const fetcher = url => api.get(url).then(res => res.data);

const HealthCard = () => {
    const { data: habits, isLoading } = useSWR('/habits', fetcher);

    const stats = useMemo(() => {
        const habitsArray = habits || [];
        const healthHabits = habitsArray.filter(h => h.category === 'Health');
        const totalHealth = healthHabits.length;

        const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            last7Days.push(dateStr);
        }

        // 1. Consistency (Last 7 days)
        let totalPossible = totalHealth * 7;
        let totalCompleted = 0;
        last7Days.forEach(dateStr => {
            healthHabits.forEach(h => {
                if (h.checks.some(c => c.date === dateStr && c.completed)) {
                    totalCompleted++;
                }
            });
        });

        const consistencyPercent = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

        // 2. Daily Goal
        const completedToday = healthHabits.filter(h =>
            h.checks.some(c => c.date === today && c.completed)
        ).length;

        const progressPercent = totalHealth > 0 ? Math.round((completedToday / totalHealth) * 100) : 0;

        // 3. Bars
        const bars = last7Days.map(dateStr => {
            if (totalHealth === 0) return 0;
            const count = healthHabits.filter(h =>
                h.checks.some(c => c.date === dateStr && c.completed)
            ).length;
            return Math.round((count / totalHealth) * 100);
        });

        return {
            consistency: consistencyPercent,
            completedToday,
            totalHealth,
            progressPercent,
            bars
        };
    }, [habits]);

    if (isLoading) {
        return (
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 shadow-none flex items-center justify-center h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 shadow-none relative group overflow-hidden min-h-[320px]">
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all duration-500"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20">
                            <span className="material-symbols-outlined text-lg">favorite</span>
                        </div>
                        <h4 className="text-sm font-black dark:text-white tracking-tight">Health Overview</h4>
                    </div>
                    <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Top Category</span>
                </div>

                <div className="flex items-end justify-between">
                    <div>
                        <div className="flex items-baseline gap-1">
                            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.consistency}%</p>
                            <span className="text-xs font-bold text-emerald-500">+??%</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">Weekly Consistency</p>
                    </div>

                    {/* Activity bars */}
                    <div className="flex gap-1 items-end h-12">
                        {stats.bars.map((h, i) => (
                            <div
                                key={i}
                                className={`w-1.5 rounded-full transition-all duration-500 ${h >= 75 ? 'bg-rose-500' : 'bg-rose-500/20'}`}
                                style={{ height: `${Math.max(h, 5)}%` }}
                            ></div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daily Goal</span>
                        <span className="text-[10px] font-black dark:text-slate-300">{stats.completedToday} / {stats.totalHealth} Habits</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-[#000000] h-1.5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-rose-500 rounded-full transition-all duration-700"
                            style={{ width: `${stats.progressPercent}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthCard;
