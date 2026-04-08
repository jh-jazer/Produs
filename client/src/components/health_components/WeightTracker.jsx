/* eslint-disable */
import React, { useState } from 'react';

const WeightTracker = ({ metrics, addHealthLog, deleteHealthLog }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [weight, setWeight] = useState('');

    const latest = metrics
        .filter(m => m.details?.metricType === 'weight')
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    // Find previous weight for trend
    const previous = metrics
        .filter(m => m.details?.metricType === 'weight')
        .sort((a, b) => new Date(b.date) - new Date(a.date))[1];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!weight) return;

        addHealthLog('metric', {
            title: 'Body Weight',
            date: new Date().toISOString().split('T')[0],
            details: {
                metricType: 'weight',
                value: parseFloat(weight),
                unit: 'kg'
            }
        });

        setIsAdding(false);
        setWeight('');
    };

    const diff = latest && previous ? (latest.details.value - previous.details.value).toFixed(1) : null;
    const trendColor = diff > 0 ? 'text-rose-500' : diff < 0 ? 'text-emerald-500' : 'text-slate-400';
    const trendIcon = diff > 0 ? 'trending_up' : diff < 0 ? 'trending_down' : 'trending_flat';

    return (
        <div className="p-5 rounded-[24px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] flex flex-col gap-4 relative overflow-hidden group">
            <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                        <span className="material-symbols-outlined">monitor_weight</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Weight</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Body Composition</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="size-8 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-orange-500 transition-colors flex items-center justify-center"
                >
                    <span className="material-symbols-outlined text-lg">{isAdding ? 'close' : 'add'}</span>
                </button>
            </div>

            {isAdding ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10 animate-in fade-in slide-in-from-top-2">
                    <div className="relative">
                        <input
                            type="number"
                            step="0.1"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder="70.5"
                            autoFocus
                            className="w-full bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-orange-500/50 transition-all font-bold placeholder:font-medium"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">kg</span>
                    </div>
                    <button type="submit" className="w-full py-3 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        Update Weight
                    </button>
                </form>
            ) : (
                <div className="flex flex-col gap-1 relative z-10 mt-2">
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                            {latest?.details?.value || '0.0'}
                        </span>
                        {diff !== null && (
                            <div className={`flex items-center gap-0.5 text-[10px] font-black uppercase tracking-widest ${trendColor}`}>
                                <span className="material-symbols-outlined text-xs">{trendIcon}</span>
                                {diff > 0 ? `+${diff}` : diff} kg
                            </div>
                        )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-black tracking-widest uppercase">
                        Current Body Mass Index
                    </div>
                </div>
            )}

            {/* Subtle background decoration */}
            <div className="absolute -right-4 -bottom-4 size-24 bg-orange-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-orange-400/10 transition-colors" />
        </div>
    );
};

export default WeightTracker;
