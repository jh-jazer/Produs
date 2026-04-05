import React from 'react';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import { Brain, Sparkles, Zap, ChevronDown, Clock, BookOpen } from 'lucide-react';

const NarrativeLog = () => {
    const { data: history = [], isLoading } = useSWR('/rpg/narrative-history');

    if (isLoading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
                <div className="size-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent animate-pulse">
                    <Brain size={24} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Accessing Neural Records...</p>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="py-20 text-center space-y-4">
                <div className="size-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-300">
                    <BookOpen size={28} />
                </div>
                <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Timeline_Empty</h3>
                    <p className="text-xs text-slate-500 font-medium">You haven't initiated the Neural Sync protocol yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 py-4">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)]">
                        <BookOpen size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase font-exo">Chronological_Memory</h2>
                        <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] font-mono">Neural Interface History</p>
                    </div>
                </div>
                <div className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    {history.length} SYNCED_BEATS
                </div>
            </div>

            <div className="relative space-y-12 before:absolute before:left-[19px] before:top-4 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-accent before:via-accent/20 before:to-transparent">
                {history.map((beat, idx) => (
                    <motion.div 
                        key={beat.questionId + idx}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative pl-12 group"
                    >
                        {/* Status Node */}
                        <div className="absolute left-0 top-1 size-10 rounded-xl bg-white dark:bg-[#121212] border-2 border-accent/20 flex items-center justify-center z-10 group-hover:border-accent group-hover:shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)] transition-all">
                             <div className="size-2 rounded-full bg-accent animate-pulse" />
                        </div>

                        <div className="space-y-4">
                            {/* Metadata */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-mono font-black text-accent bg-accent/10 px-2 py-0.5 rounded uppercase tracking-tighter">
                                        NODE_{beat.questionId}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Clock size={10} className="text-slate-300" />
                                        {new Date(beat.timestamp).toLocaleDateString()} at {new Date(beat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>

                            {/* Story Prose */}
                            <div className="bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 p-6 rounded-[2rem] relative overflow-hidden group-hover:bg-accent/[0.01] transition-all">
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic z-10 relative">
                                    "{beat.story}"
                                </p>
                            </div>

                            {/* The Choice */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 px-2">
                                    <div className="size-1 w-4 bg-accent/30 rounded-full" />
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{beat.question}</h4>
                                </div>

                                <div className="p-5 rounded-[1.5rem] bg-accent/5 border-2 border-accent/20 flex items-center justify-between shadow-[0_0_20px_rgba(var(--accent-rgb),0.05)]">
                                    <div className="flex items-center gap-4">
                                        <div className="size-8 rounded-xl bg-accent text-white flex items-center justify-center font-black font-mono shadow-[0_0_15px_rgba(var(--accent-rgb),0.4)]">
                                            ✓
                                        </div>
                                        <div className="space-y-0.5">
                                            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{beat.choiceText}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-accent uppercase tracking-tighter bg-accent/10 px-3 py-1 rounded-full outline outline-1 outline-accent/20">
                                        SYNCHRONIZED
                                    </div>
                                </div>

                                {beat.postText && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="mt-4 p-4 border-l-2 border-accent/20 bg-accent/[0.02] ml-8"
                                    >
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed italic">
                                            "{beat.postText}"
                                        </p>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
            
            <div className="py-20 text-center">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-slate-200 dark:border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <Sparkles size={12} className="animate-pulse" />
                    Timeline Stabilized
                </div>
            </div>
        </div>
    );
};

export default NarrativeLog;
