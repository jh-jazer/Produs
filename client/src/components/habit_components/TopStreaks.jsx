import React from 'react';
import useSWR from 'swr';
import api from '../../services/api';

const fetcher = url => api.get(url).then(res => res.data);

const TopStreaks = () => {
    const { data: habits, isLoading } = useSWR('/habits', fetcher);

    const colorVariants = {
        blue: 'text-blue-500 bg-blue-500/10 border-blue-200/50 dark:border-blue-800/50',
        emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-200/50 dark:border-emerald-800/50',
        orange: 'text-orange-500 bg-orange-500/10 border-orange-200/50 dark:border-orange-800/50',
        violet: 'text-violet-500 bg-violet-500/10 border-violet-200/50 dark:border-violet-800/50',
        purple: 'text-purple-500 bg-purple-500/10 border-purple-200/50 dark:border-purple-800/50',
        rose: 'text-rose-500 bg-rose-500/10 border-rose-200/50 dark:border-rose-800/50',
        cyan: 'text-cyan-500 bg-cyan-500/10 border-cyan-200/50 dark:border-cyan-800/50',
        indigo: 'text-indigo-500 bg-indigo-500/10 border-indigo-200/50 dark:border-indigo-800/50',
        amber: 'text-amber-500 bg-amber-500/10 border-amber-200/50 dark:border-amber-800/50',
        pink: 'text-pink-500 bg-pink-500/10 border-pink-200/50 dark:border-pink-800/50',
        teal: 'text-teal-500 bg-teal-500/10 border-teal-200/50 dark:border-teal-800/50',
    };

    if (isLoading) {
        return (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] p-6 shadow-sm flex items-center justify-center h-[300px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Filter and sort habits with streaks
    const streaks = (habits || [])
        .filter(h => h.streak > 0)
        .sort((a, b) => b.streak - a.streak)
        .slice(0, 5);

    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] p-6 shadow-sm overflow-hidden relative group min-h-[300px]">
            {/* Background Accent */}
            <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-500"></div>

            <div className="relative z-10 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-none">Top Streaks</h3>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-widest">Consistency Leaders</p>
                    </div>
                    <span className="material-symbols-outlined text-amber-500 text-xl">workspace_premium</span>
                </div>

                <div className="space-y-4">
                    {streaks.length > 0 ? (
                        streaks.map((streak, index) => {
                            const target = streak.streak <= 7 ? 7 : streak.streak <= 14 ? 14 : streak.streak <= 30 ? 30 : streak.streak + 7;
                            const progress = (streak.streak / target) * 100;

                            return (
                                <div key={streak._id} className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className="relative shrink-0">
                                            <div className={`size-9 rounded-xl flex items-center justify-center border ${colorVariants[streak.color] || colorVariants.emerald}`}>
                                                <span className="material-symbols-outlined text-xl">{streak.icon}</span>
                                            </div>
                                            <div className="absolute -top-1.5 -right-1.5 bg-slate-900 dark:bg-white text-[8px] text-white dark:text-slate-900 px-1.5 py-0.5 rounded-md font-black shadow-sm ring-2 ring-white dark:ring-[#192233]">
                                                #{index + 1}
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-end mb-1">
                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{streak.name}</p>
                                                <div className="flex items-center gap-0.5 text-amber-500">
                                                    <span className="text-xs font-black">{streak.streak}</span>
                                                    <span className="material-symbols-outlined text-xs">local_fire_department</span>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${index === 0 ? 'bg-primary' : 'bg-slate-400'}`}
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <h4 className="text-[11px] font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">Ignite your first streak!</h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium max-w-[150px] leading-tight">
                                Consistency is key! 🔥
                            </p>
                        </div>
                    )}
                </div>

                <button className="w-full mt-4 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all">
                    View All
                </button>
            </div>
        </div>
    );
};

export default TopStreaks;
