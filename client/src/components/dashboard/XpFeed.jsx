import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, Flame, Award, Plus, Sparkles } from 'lucide-react';
import useSWR, { useSWRConfig } from 'swr';
import api from '../../services/api';

const getUnitLabel = (event) => {
    const unit = event.metadata?.unit;
    if (unit) {
        if (unit.toLowerCase().includes('point') || unit.toLowerCase().includes('coin')) return 'PRODPOINTS';
        if (unit.toLowerCase().includes('exp')) return 'GUARDIAN EXP';
        return unit.toUpperCase();
    }
    const actionLower = event.action.toLowerCase();
    if (actionLower.includes('claimed') || actionLower.includes('streak') || actionLower.includes('bounty') || actionLower.includes('points') || actionLower.includes('coins')) {
        return 'PRODPOINTS';
    }
    return 'GUARDIAN EXP';
};

const XpFeed = ({ user, markAllRead = false }) => {
    const fetcher = url => api.get(url).then(res => res.data);
    const { data: history, isLoading, mutate } = useSWR('/rpg/history', fetcher, {
        refreshInterval: 10000 // Refresh every 10s to show live gains
    });
    const { mutate: globalMutate } = useSWRConfig();

    useEffect(() => {
        if (markAllRead && history && history.some(e => !e.read)) {
            api.post('/rpg/mark-read')
                .then(() => {
                    mutate();
                    globalMutate('/rpg/history-unread');
                })
                .catch(err => console.error("Failed to mark activities as read:", err));
        }
    }, [markAllRead, history]);

    const statColors = {
        str: 'rose-500',
        agi: 'orange-400',
        vit: 'emerald-500',
        int: 'accent',
        wis: 'purple-500',
        luk: 'pink-500',
        none: 'slate-400'
    };

    const getCapsuleColors = (event, resolvedUnit) => {
        if (resolvedUnit === 'PRODPOINTS') {
            return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        }
        const color = statColors[event.stat];
        if (color && event.stat !== 'none') {
            return `text-${color} bg-${color}/10 border-${color}/20`;
        }
        return 'text-primary bg-primary/10 border-primary/20';
    };

    if (isLoading) return (
        <div className="w-full space-y-3 py-8 animate-pulse">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-16 w-full bg-foreground/5 rounded-sm" />
            ))}
        </div>
    );

    if (!history || history.length === 0) return (
        <div className="w-full flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <Clock size={40} className="text-foreground/20" />
            <p className="text-[10px] font-mono uppercase tracking-widest">No Recent Activity Logged</p>
        </div>
    );

    return (
        <div className="w-full space-y-3">
            <div className="flex items-center justify-between mb-4">
                <div className="text-[8px] font-mono uppercase tracking-widest text-foreground/40 px-1">REALTIME_GUARDIAN_EXP_STREAM</div>
                <div className="flex items-center gap-2">
                    <div className="size-1 rounded-full bg-primary animate-pulse" />
                    <span className="text-[8px] font-mono text-primary uppercase tracking-widest">SYNC_ACTIVE</span>
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
                        className={`group relative p-3 rounded-sm border transition-all flex items-center gap-3.5 ${
                            !event.read 
                                ? 'bg-primary/5 border-primary/30 shadow-[0_0_12px_rgba(255,255,255,0.02)]' 
                                : 'border-foreground/5 bg-transparent hover:bg-foreground/5'
                        }`}
                    >
                        {/* Stat Badge */}
                        <div className={`size-8 rounded-sm bg-${color}/10 border ${!event.read ? 'border-primary/40' : `border-${color}/20`} flex items-center justify-center text-${color} shrink-0`}>
                            <Plus size={14} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <h4 className="text-[9px] font-black uppercase tracking-wider leading-snug text-foreground break-words whitespace-normal pr-2">
                                    {event.action}
                                </h4>
                                <span className="text-[8px] font-mono text-foreground/40 shrink-0 mt-0.5">{time}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-sm border uppercase tracking-widest ${getCapsuleColors(event, getUnitLabel(event))}`}>
                                    +{event.amount} {getUnitLabel(event)}
                                </span>
                                {event.perkActivated && (
                                    <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-0.5">
                                        <Sparkles size={8} /> {event.perkActivated}
                                    </span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                );
            })}
            {/* End of Transcript Indicator */}
            <div className="pt-6 pb-2 flex justify-center opacity-40">
                <div className="flex items-center gap-4 w-full px-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-foreground/20" />
                    <p className="text-[8px] font-mono text-foreground/40 uppercase tracking-widest whitespace-nowrap">END_OF_TRANSCRIPT</p>
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-foreground/20" />
                </div>
            </div>
        </div>
    );
};

export default XpFeed;
