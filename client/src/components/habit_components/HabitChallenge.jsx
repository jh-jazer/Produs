/* eslint-disable */
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
        border: 'border-slate-200/50 dark:border-white/10/50',
        bar: 'bg-slate-500'
    },
    white: {
        text: 'text-slate-900 dark:text-white',
        bg: 'bg-white dark:bg-[#000000]',
        border: 'border-slate-200 dark:border-white/10',
        bar: 'bg-[#121212] dark:bg-white'
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
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 shadow-none min-h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="relative flex flex-col h-full">
            {/* CHALLENGES LIST WITH SCROLL */}
            <div className="flex-1 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar space-y-6 mt-2">
                {challenges.map((challenge) => {
                    const progressPercent = (challenge.progress / challenge.target) * 100;
                    const colorClass = COLOR_VARIANTS[challenge.color] || COLOR_VARIANTS.blue;
                    const isJoined = challenge.isJoined;
                    const isCompleted = challenge.progress >= challenge.target;
                    
                    return (
                        <div key={challenge.id} className="group/item relative">
                            <div className="flex items-center gap-4 mb-3">
                                <div className={`size-12 rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover/item:scale-110 ${colorClass.text} ${colorClass.bg} ${colorClass.border}`}>
                                    <span className="material-symbols-outlined text-xl">{challenge.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-sm font-black text-slate-300 truncate tracking-tight uppercase italic font-exo">{challenge.name}</h4>
                                        {isCompleted ? (
                                            <span className="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-0.5">
                                                <span className="material-symbols-outlined text-[10px]">workspace_premium</span>
                                                Won
                                            </span>
                                        ) : (
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap ml-2 font-mono">
                                                {challenge.daysLeft}{typeof challenge.daysLeft === 'number' ? 'D_LEFT' : ''}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[9px] text-slate-500 font-medium truncate uppercase tracking-widest italic mt-0.5">{challenge.description}</p>
                                    <div className="mt-1 flex items-center gap-1">
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${challenge.category.includes('March') ? 'bg-amber-500/10 text-amber-500' : 'bg-white/5 text-slate-500'}`}>
                                            {challenge.category}
                                        </span>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => toggleJoin(challenge.id)}
                                    className={`shrink-0 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl transition-all ${isJoined 
                                        ? 'bg-white/5 text-slate-500'
                                        : 'bg-cyan-500 text-slate-900 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95'}`}
                                >
                                    {isJoined ? 'Joined' : 'Join'}
                                </button>
                            </div>
                            <div className="space-y-1.5 pl-16">
                                <div className="flex justify-between items-center px-1">
                                    <div className="flex items-center gap-1">
                                        <span className={`text-[10px] font-black ${colorClass.text}`}>{challenge.progress}</span>
                                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">/ {challenge.target}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 font-mono">{Math.round(progressPercent)}%</span>
                                </div>
                                <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden border border-white/5">
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
                    <div className="py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-white/5 rounded-3xl opacity-40">
                        <span className="material-symbols-outlined text-4xl mb-2 text-slate-600">military_tech</span>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No active challenges found</p>
                    </div>
                )}
            </div>

            <button className="mt-8 w-full py-3 rounded-2xl border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-cyan-500 hover:border-cyan-500/30 transition-all flex items-center justify-center gap-2 group/btn">
                Browse All Challenges
                <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
            </button>
        </div>
    );
};

export default HabitChallenge;
