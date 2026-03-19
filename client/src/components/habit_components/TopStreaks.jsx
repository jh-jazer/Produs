import React from 'react';
import useSWR from 'swr';
import api from '../../services/api';

const fetcher = url => api.get(url).then(res => res.data);

const TopStreaks = ({ habits, isSharedView = false }) => {
    const { data: fetchedHabits, isLoading } = useSWR(habits ? null : '/habits', fetcher);

    const activeHabits = habits || fetchedHabits || [];

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

    if (isLoading && !habits) {
        return (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] p-6 shadow-sm flex items-center justify-center h-[300px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Identify my streaks (not shared)
    const myId = activeHabits.length > 0 ? activeHabits.find(h => !h.isShared && h.user)?.user : null;

    const myStreaks = activeHabits
        .filter(h => h.streak > 0 && h.user === myId && !h.isShared)
        .sort((a, b) => b.streak - a.streak)
        .slice(0, 3);

    const partnerStreaks = activeHabits
        .filter(h => h.streak > 0 && h.user !== myId && !h.isShared)
        .sort((a, b) => b.streak - a.streak)
        .slice(0, 3);

    // Identify shared streaks (previously team)
    const sharedStreaks = activeHabits
        .filter(h => h.isShared && h.streak > 0)
        .sort((a, b) => b.streak - a.streak);
        
    // Unique shared habits for user streaks
    const uniqueSharedStreaks = [];
    const seenGids = new Set();
    sharedStreaks.forEach(s => {
        if (s.sharedGroupId && !seenGids.has(s.sharedGroupId)) {
            uniqueSharedStreaks.push(s);
            seenGids.add(s.sharedGroupId);
        } else if (!s.sharedGroupId) {
            uniqueSharedStreaks.push(s);
        }
    });

    const StreakItem = ({ streak, index, isPartner = false, isShared = false }) => {
        const target = streak.streak <= 7 ? 7 : streak.streak <= 14 ? 14 : streak.streak <= 30 ? 30 : streak.streak + 7;
        const progress = Math.min((streak.streak / target) * 100, 100);

        return (
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                        <div className={`size-8 rounded-xl flex items-center justify-center border ${colorVariants[streak.color] || colorVariants.emerald}`}>
                            <span className="material-symbols-outlined text-base">{streak.icon}</span>
                        </div>
                        <div className={`absolute -top-1 -right-1 ${isShared ? 'bg-emerald-500' : isPartner ? 'bg-purple-500' : 'bg-slate-900 dark:bg-white'} text-[7px] text-white dark:text-slate-900 px-1 py-0.5 rounded-md font-black shadow-sm ring-1 ring-white dark:ring-[#192233]`}>
                            {isShared ? 'SHARED' : `#${index + 1}`}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-end mb-1">
                            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100 truncate">{streak.name}</p>
                            <div className="flex items-center gap-0.5 text-amber-500">
                                <span className="text-[10px] font-black">{streak.streak}</span>
                                <span className="material-symbols-outlined text-[10px]">local_fire_department</span>
                            </div>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
                            <div
                                className={`h-full rounded-full ${isShared ? 'bg-emerald-500' : isPartner ? 'bg-purple-500' : 'bg-primary'}`}
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] p-6 shadow-sm overflow-hidden relative group min-h-[300px]">
            <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-500"></div>

            <div className="relative z-10 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-none">
                            {isSharedView ? 'Shared Top Streaks' : 'Top Streaks'}
                        </h3>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-widest">
                            {isSharedView ? 'Shared Habits Only' : 'Consistency Leaders'}
                        </p>
                    </div>
                    <span className="material-symbols-outlined text-amber-500 text-xl">workspace_premium</span>
                </div>

                <div className="space-y-6">
                    {isSharedView ? (
                        <div className="space-y-3">
                            {uniqueSharedStreaks.length > 0 ? (
                                uniqueSharedStreaks.slice(0, 5).map((s, i) => <StreakItem key={s._id} streak={s} index={i} isShared={true} />)
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 text-center">
                                    <h4 className="text-[11px] font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">No shared streaks yet!</h4>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium max-w-[150px] leading-tight">Start a shared habit together! 🔥</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeHabits
                                .filter(h => h.streak > 0)
                                .sort((a, b) => b.streak - a.streak)
                                .slice(0, 5)
                                .map((s, i) => (
                                    <StreakItem key={s._id} streak={s} index={i} isShared={s.isShared} />
                                ))}
                            {activeHabits.filter(h => h.streak > 0).length === 0 && (
                                <div className="flex flex-col items-center justify-center py-6 text-center">
                                    <h4 className="text-[11px] font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">Ignite your first streak!</h4>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium max-w-[150px] leading-tight">Consistency is key! 🔥</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopStreaks;
