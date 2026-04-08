/* eslint-disable */
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, Flame, Award, Plus, Sparkles } from 'lucide-react';
import useSWR from 'swr';
import api from '../../services/api';

const XpFeed = ({ user }) => {
    const fetcher = url => api.get(url).then(res => res.data);
    const { data: history, isLoading } = useSWR('/rpg/history', fetcher, {
        refreshInterval: 10000 // Refresh every 10s to show live gains
    });

    const statColors = {
        str: 'rose-500',
        dex: 'orange-400',
        end: 'emerald-500',
        int: 'accent',
        wis: 'purple-500',
        cha: 'pink-500',
        none: 'slate-400'
    };

    if (isLoading) return (
        <div className="w-full space-y-4 py-8 animate-pulse">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-16 w-full bg-slate-100 dark:bg-white/5 rounded-2xl" />
            ))}
        </div>
    );

    if (!history || history.length === 0) return (
        <div className="w-full py-12 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <Clock size={40} className="text-slate-300" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Recent Activity Logged</p>
        </div>
    );

    return (
        <div className="w-full space-y-4">
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex items-center justify-between px-1 mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">REALTIME_XP_STREAM</span>
                    <div className="flex items-center gap-2">
                        <div className="size-1 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="text-[8px] font-black font-mono text-cyan-500 uppercase leading-none">SYNC_ACTIVE</span>
                    </div>
                </div>
                {history.map((event, idx) => {
                    const color = statColors[event.stat] || 'slate-400';
                    const time = new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                        <motion.div
                            key={event._id || idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="glass-card flex items-center gap-4 p-4 rounded-3xl hover:border-white/40 transition-all group"
                        >
                            {/* Stat Badge */}
                            <div className={`size-10 rounded-2xl bg-${color}/10 border border-${color}/20 flex items-center justify-center text-${color} shrink-0`}>
                                <Plus size={16} />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight truncate pr-2 font-exo italic">
                                        {event.action}
                                    </h4>
                                    <span className="text-[9px] font-black text-slate-400 font-mono shrink-0">{time}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest bg-${color}/10 text-${color}`}>
                                        {event.stat.toUpperCase()}
                                    </span>
                                    {event.perkActivated && (
                                        <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-0.5">
                                            <Sparkles size={8} /> {event.perkActivated}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="px-3 py-2 bg-slate-900 dark:bg-white rounded-xl shadow-lg shrink-0">
                                <span className="text-xs font-black text-white dark:text-black font-exo italic">+{event.amount}</span>
                            </div>
                        </motion.div>
                    );
                })}
                {/* End of Transcript Indicator - Now inside scroll for organic feel */}
                <div className="pt-6 pb-2 flex justify-center opacity-40">
                    <div className="flex items-center gap-4 w-full px-4">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-slate-200 dark:to-white/10" />
                        <p className="text-[8px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.4em] whitespace-nowrap">END_OF_TRANSCRIPT</p>
                        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-slate-200 dark:to-white/10" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default XpFeed;
