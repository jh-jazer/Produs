import React from 'react';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import api from '../../services/api';

const fetcher = url => api.get(url).then(res => res.data);


const COLOR_VARIANTS = {
    blue: {
        text: 'text-blue-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-200/50 dark:border-blue-800/50',
        bar: 'bg-blue-500'
    },
    purple: {
        text: 'text-purple-500',
        bg: 'bg-purple-500/10',
        border: 'border-purple-200/50 dark:border-purple-800/50',
        bar: 'bg-purple-500'
    },
    emerald: {
        text: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-200/50 dark:border-emerald-800/50',
        bar: 'bg-emerald-500'
    },
    rose: {
        text: 'text-rose-500',
        bg: 'bg-rose-500/10',
        border: 'border-rose-200/50 dark:border-rose-800/50',
        bar: 'bg-rose-500'
    },
    amber: {
        text: 'text-amber-500',
        bg: 'bg-amber-500/10',
        border: 'border-amber-200/50 dark:border-amber-800/50',
        bar: 'bg-amber-500'
    },
    slate: {
        text: 'text-slate-500',
        bg: 'bg-slate-500/10',
        border: 'border-slate-200/50 dark:border-slate-800/50',
        bar: 'bg-slate-500'
    },
    white: {
        text: 'text-slate-900 dark:text-white',
        bg: 'bg-white dark:bg-slate-800',
        border: 'border-slate-200 dark:border-slate-700',
        bar: 'bg-slate-900 dark:bg-white'
    },
};

const HabitChallenge = () => {
    const { data: fetchedChallenges, isLoading, error, mutate } = useSWR('/challenges', fetcher);

    const challenges = fetchedChallenges || [];

    const toggleJoin = async (id) => {
        try {
            await api.post(`/challenges/${id}/toggle`);
            mutate(); // Refresh the list
        } catch (error) {
            console.error('Failed to toggle challenge:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] p-6 shadow-sm min-h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] p-6 shadow-sm overflow-hidden relative group min-h-[400px] flex flex-col">
            <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-500"></div>

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-none">Habit Challenges</h3>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-widest">Level up your consistency</p>
                    </div>
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <span className="material-symbols-outlined text-lg">military_tech</span>
                    </div>
                </div>

                {/* CHALLENGES LIST WITH SCROLL */}
                <div className="flex-1 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar space-y-5">
                    {challenges.map((challenge) => {
                        const progressPercent = (challenge.progress / challenge.target) * 100;
                        const colorClass = COLOR_VARIANTS[challenge.color] || COLOR_VARIANTS.blue;
                        const isJoined = challenge.isJoined;
                        const isCompleted = challenge.progress >= challenge.target;
                        
                        return (
                            <div key={challenge.id} className="group/item relative">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`size-10 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover/item:scale-110 ${colorClass.text} ${colorClass.bg} ${colorClass.border}`}>
                                        <span className="material-symbols-outlined text-xl">{challenge.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 truncate tracking-tight">{challenge.name}</h4>
                                            {isCompleted ? (
                                                <span className="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-0.5">
                                                    <span className="material-symbols-outlined text-[10px]">workspace_premium</span>
                                                    Won
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter whitespace-nowrap ml-2">
                                                    {challenge.daysLeft}{typeof challenge.daysLeft === 'number' ? 'd left' : ''}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">{challenge.description}</p>
                                        <div className="mt-1 flex items-center gap-1">
                                            <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${challenge.category.includes('March') ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                                {challenge.category}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => toggleJoin(challenge.id)}
                                        className={`shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md transition-all ${isJoined 
                                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' 
                                            : 'bg-primary text-white shadow-sm shadow-primary/30 hover:scale-105 active:scale-95'}`}
                                    >
                                        {isJoined ? 'Joined' : 'Join'}
                                    </button>
                                </div>
                                <div className="space-y-1.5 pl-12">
                                    <div className="flex justify-between items-center px-1">
                                        <div className="flex items-center gap-1">
                                            <span className={`text-[10px] font-black ${colorClass.text}`}>{challenge.progress}</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">/ {challenge.target} {challenge.name.includes('Work') ? 'Hrs' : 'Days'}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-300">{Math.round(progressPercent)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800/50 rounded-full h-1.5 overflow-hidden border border-slate-200/20 dark:border-slate-700/30">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPercent}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className={`h-full rounded-full ${colorClass.bar}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {challenges.length === 0 && !isLoading && (
                        <div className="py-12 text-center opacity-40">
                            <span className="material-symbols-outlined text-4xl mb-2">military_tech</span>
                            <p className="text-xs font-bold italic">No active challenges found</p>
                        </div>
                    )}
                </div>

                <button className="mt-6 w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 group/btn">
                    Browse All Challenges
                    <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                </button>
            </div>
        </div>
    );
};

export default HabitChallenge;
