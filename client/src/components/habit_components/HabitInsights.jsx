import React from 'react';
import useSWR from 'swr';
import api from '../../services/api';

const fetcher = url => api.get(url).then(res => res.data);

const HabitInsights = () => {
    const { data: habits, isLoading } = useSWR('/habits', fetcher);

    if (isLoading) {
        return (
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 shadow-none flex items-center justify-center h-[300px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const habitsArray = habits || [];

    // 1. Calculate Habit Balance (Category Distribution)
    const categoryCounts = {
        Health: 0,
        Mindset: 0,
        Finance: 0,
        Productivity: 0,
        Creative: 0
    };

    habitsArray.forEach(h => {
        if (categoryCounts.hasOwnProperty(h.category)) {
            categoryCounts[h.category]++;
        }
    });

    const totalHabits = habitsArray.length || 1;
    const balance = Object.keys(categoryCounts).map(cat => ({
        label: cat,
        count: categoryCounts[cat],
        percent: Math.round((categoryCounts[cat] / totalHabits) * 100)
    }));

    // 2. Performance Trend (Last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        last7Days.push(dateStr);
    }

    const dailyCompletions = last7Days.map(dateStr => {
        let count = 0;
        habitsArray.forEach(h => {
            if (h.checks.some(c => c.date === dateStr && c.completed)) {
                count++;
            }
        });
        return { date: dateStr, count };
    });

    const maxCompletionsPerDay = Math.max(...dailyCompletions.map(d => d.count), 1);
    const bars = dailyCompletions.map(d => ({
        h: `${Math.round((d.count / totalHabits) * 100)}%`,
        active: d.count > 0
    }));

    // 3. Dynamic Insights
    const totalChecksLast7Days = dailyCompletions.reduce((acc, curr) => acc + curr.count, 0);
    const avgCompletionRate = Math.round((totalChecksLast7Days / (totalHabits * 7)) * 100);

    const bestCategory = balance.sort((a, b) => b.count - a.count)[0]?.label || 'General';

    return (
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 shadow-none relative group overflow-hidden min-h-[400px]">
            {/* Background Gradient */}
            <div className="absolute -left-12 -top-12 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-500"></div>

            <div className="relative z-10 flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white leading-none tracking-tight">Habit Insights</h3>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mt-1.5 tracking-widest">Performance analysis</p>
                </div>
                <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <span className="material-symbols-outlined text-lg">insights</span>
                </div>
            </div>

            <div className="space-y-4">
                <div className="p-3 bg-primary/[0.03] dark:bg-primary/[0.05] rounded-xl border border-primary/10 group-hover:bg-primary/[0.05] dark:group-hover:bg-primary/[0.08] transition-colors">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="material-symbols-outlined text-primary text-sm font-bold">bolt</span>
                        <p className="text-[10px] font-black text-primary uppercase tracking-wider">Weekly Velocity</p>
                    </div>
                    <p className="text-xs font-bold leading-relaxed dark:text-slate-200"> You successfully completed <span className="text-primary font-black underline decoration-primary/20 underline-offset-2">{totalChecksLast7Days}</span> check-ins this week.</p>
                </div>

                <div className="p-3 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05] rounded-xl border border-emerald-500/10 group-hover:bg-emerald-500/[0.05] dark:group-hover:bg-emerald-500/[0.08] transition-colors">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="material-symbols-outlined text-emerald-500 text-sm font-bold">auto_graph</span>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">Top Focus</p>
                    </div>
                    <p className="text-xs font-bold leading-relaxed dark:text-slate-200">You are currently most focused on <span className="text-emerald-500 font-black">{bestCategory}</span> habits.</p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-white/10">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4 flex items-center justify-between">
                        Weekly Performance
                        <span className="text-primary font-bold">{avgCompletionRate}% avg</span>
                    </p>
                    <div className="h-24 flex items-end justify-between gap-1.5 px-0.5">
                        {bars.map((bar, i) => (
                            <div
                                key={i}
                                className={`flex-1 rounded-t-md transition-all duration-300 relative group/bar ${bar.active
                                    ? 'bg-primary hover:bg-primary/90 shadow-none shadow-primary/20'
                                    : 'bg-slate-100 dark:bg-[#000000] hover:bg-slate-200 dark:hover:bg-[#121212]'
                                    }`}
                                style={{ height: bar.h }}
                            >
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#121212] text-white text-[8px] px-1 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap font-bold">
                                    {bar.h}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-3 px-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Mon</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase">Sun</span>
                    </div>
                </div>

                {/* Color Graphe - Habit Balance */}
                <div className="pt-6 border-t border-slate-100 dark:border-white/10">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">
                        Habit Balance by Category
                    </p>
                    <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-[#000000]">
                        {balance.map((item, i) => (
                            <div
                                key={i}
                                className={`h-full transition-all duration-700 ${item.label === 'Health' ? 'bg-rose-500' :
                                    item.label === 'Mindset' ? 'bg-blue-500' :
                                        item.label === 'Finance' ? 'bg-emerald-500' :
                                            item.label === 'Productivity' ? 'bg-amber-500' :
                                                'bg-indigo-500'
                                    }`}
                                style={{ width: `${item.percent}%` }}
                                title={`${item.label}: ${item.percent}%`}
                            ></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-3 gap-y-2 mt-4">
                        {[
                            { label: 'Health', color: 'bg-rose-500' },
                            { label: 'Mindset', color: 'bg-blue-500' },
                            { label: 'Finance', color: 'bg-emerald-500' },
                            { label: 'Prod.', color: 'bg-amber-500' },
                            { label: 'Creative', color: 'bg-indigo-500' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                                <div className={`size-1.5 rounded-full ${item.color}`}></div>
                                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HabitInsights;
