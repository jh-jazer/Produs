import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import api from '../../../services/api';

const fetcher = url => api.get(url).then(res => res.data);

const CATEGORY_NAMES = ['Overall', 'Health', 'Mindset', 'Finance', 'Productivity', 'Creative'];

const CategoryOverview = () => {
    const { data: habits, isLoading } = useSWR('/habits', fetcher);
    const [activeIndex, setActiveIndex] = useState(0);

    const habitsArray = habits || [];

    const dynamicCategories = useMemo(() => {
        const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            last7Days.push(dateStr);
        }

        return CATEGORY_NAMES.map(name => {
            const filteredHabits = name === 'Overall'
                ? habitsArray
                : habitsArray.filter(h => h.category === name);

            const totalHabits = filteredHabits.length;

            // 1. Consistency (Last 30 days completions / total possible)
            // For now, let's just use the last 7 days for a more responsive feel if 30 days of data isn't there
            let totalPossible = totalHabits * 7;
            let totalCompleted = 0;
            last7Days.forEach(dateStr => {
                filteredHabits.forEach(h => {
                    if (h.checks.some(c => c.date === dateStr && c.completed)) {
                        totalCompleted++;
                    }
                });
            });

            const consistencyPercent = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

            // 2. Daily Progress
            const completedToday = filteredHabits.filter(h =>
                h.checks.some(c => c.date === today && c.completed)
            ).length;

            const progressPercent = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

            // 3. Activity Bars (Last 7 days completion rate)
            const bars = last7Days.map(dateStr => {
                if (totalHabits === 0) return 0;
                const dailyCount = filteredHabits.filter(h =>
                    h.checks.some(c => c.date === dateStr && c.completed)
                ).length;
                return Math.round((dailyCount / totalHabits) * 100);
            });

            // Color and Icon mapping
            const config = {
                Overall: { icon: 'dashboard', color: 'blue' },
                Health: { icon: 'favorite', color: 'rose' },
                Mindset: { icon: 'psychology', color: 'purple' },
                Finance: { icon: 'payments', color: 'emerald' },
                Productivity: { icon: 'bolt', color: 'amber' },
                Creative: { icon: 'brush', color: 'indigo' }
            };

            return {
                id: name.toLowerCase(),
                name,
                icon: config[name].icon,
                color: config[name].color,
                consistency: `${consistencyPercent}%`,
                trend: totalCompleted > 0 ? '+5%' : '0%', // Mock trend for now
                progress: progressPercent,
                stats: `${completedToday} / ${totalHabits} Habits`,
                bars
            };
        });
    }, [habitsArray]);

    if (isLoading) {
        return (
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 shadow-none flex items-center justify-center h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const cat = dynamicCategories[activeIndex];

    const nextCategory = () => {
        setActiveIndex((prev) => (prev + 1) % dynamicCategories.length);
    };

    const color = cat.color;

    return (
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 shadow-none relative group overflow-hidden h-full min-h-[350px]">
            <div className={`absolute -right-8 -top-8 w-24 h-24 bg-${color}-500/5 rounded-full blur-2xl group-hover:bg-${color}-500/10 transition-all duration-500`}></div>

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-500 border border-${color}-500/20`}>
                            <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                        </div>
                        <h4 className="text-sm font-black dark:text-white tracking-tight">{cat.name} Overview</h4>
                    </div>
                    <button
                        onClick={nextCategory}
                        className="flex items-center gap-1 text-[10px] font-black text-slate-400 hover:text-primary transition-colors uppercase tracking-wider group/btn"
                    >
                        Next
                        <span className="material-symbols-outlined text-xs group-hover/btn:translate-x-0.5 transition-transform">chevron_right</span>
                    </button>
                </div>

                <div className="flex items-end justify-between flex-grow">
                    <div>
                        <div className="flex items-baseline gap-1">
                            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{cat.consistency}</p>
                            <span className={`text-xs font-bold ${cat.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {cat.trend}
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">Consistency (7d)</p>
                    </div>

                    {/* Activity bars */}
                    <div className="flex gap-1 items-end h-12">
                        {cat.bars.map((h, i) => (
                            <div
                                key={i}
                                className={`w-1.5 rounded-full transition-all duration-500 ${h >= 75 ? `bg-${color}-500` : `bg-${color}-500/20`}`}
                                style={{ height: `${Math.max(h, 5)}%` }} // Show at least 5% bar for visibility
                            ></div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Progress</span>
                        <span className="text-[10px] font-black dark:text-slate-300">{cat.stats}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-[#000000] h-1.5 rounded-full overflow-hidden">
                        <div
                            className={`h-full bg-${color}-500 rounded-full transition-all duration-700`}
                            style={{ width: `${cat.progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryOverview;

