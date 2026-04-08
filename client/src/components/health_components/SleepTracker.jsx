/* eslint-disable */
import React, { useState } from 'react';

const SleepTracker = ({ metrics, addHealthLog, deleteHealthLog }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [sleepStart, setSleepStart] = useState('');
    const [sleepEnd, setSleepEnd] = useState('');

    const latest = metrics
        .filter(m => m.details?.metricType === 'sleep')
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!sleepStart || !sleepEnd) return;

        const start = new Date(`1970-01-01T${sleepStart}`);
        let end = new Date(`1970-01-01T${sleepEnd}`);
        if (end < start) end.setDate(end.getDate() + 1);
        
        const logValue = (end - start) / (1000 * 60 * 60);

        addHealthLog('metric', {
            title: 'Sleep',
            date: new Date().toISOString().split('T')[0],
            details: {
                metricType: 'sleep',
                sleepStart,
                sleepEnd,
                value: parseFloat(logValue.toFixed(1)),
                unit: 'hrs'
            }
        });

        setIsAdding(false);
        setSleepStart('');
        setSleepEnd('');
    };

    return (
        <div className="p-5 rounded-[24px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] flex flex-col gap-4 relative overflow-hidden group">
            <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                        <span className="material-symbols-outlined">bedtime</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Rest</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sleep Quality</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="size-8 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-indigo-500 transition-colors flex items-center justify-center"
                >
                    <span className="material-symbols-outlined text-lg">{isAdding ? 'close' : 'add'}</span>
                </button>
            </div>

            {isAdding ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Slept At</label>
                            <input
                                type="time"
                                value={sleepStart}
                                onChange={(e) => setSleepStart(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500/50 transition-all font-bold"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Woke Up</label>
                            <input
                                type="time"
                                value={sleepEnd}
                                onChange={(e) => setSleepEnd(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500/50 transition-all font-bold"
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        Log Sleep
                    </button>
                </form>
            ) : (
                <div className="flex flex-col gap-1 relative z-10 mt-2">
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                            {latest?.details?.value || '0.0'}
                        </span>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Hours Total</span>
                    </div>
                    {latest?.details?.sleepStart && (
                        <div className="text-[10px] text-slate-400 font-black tracking-widest uppercase bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full w-fit">
                            From {latest.details.sleepStart} to {latest.details.sleepEnd}
                        </div>
                    )}
                </div>
            )}

            {/* Subtle background decoration */}
            <div className="absolute -right-4 -bottom-4 size-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-400/10 transition-colors" />
        </div>
    );
};

export default SleepTracker;
