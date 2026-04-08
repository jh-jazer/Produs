/* eslint-disable */
import React, { useState } from 'react';

const WaterTracker = ({ metrics, addHealthLog, deleteHealthLog }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [waterAmount, setWaterAmount] = useState('');

    const latest = metrics
        .filter(m => m.details?.metricType === 'water')
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!waterAmount) return;

        addHealthLog('metric', {
            title: 'Water Intake',
            date: new Date().toISOString().split('T')[0],
            details: {
                metricType: 'water',
                value: parseFloat(waterAmount),
                unit: 'L'
            }
        });

        setWaterAmount('');
        setIsAdding(false);
    };

    return (
        <div className="p-5 rounded-[24px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] flex flex-col gap-4 relative overflow-hidden group">
            <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <span className="material-symbols-outlined">water_drop</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Hydration</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daily Water Intake</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="size-8 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-blue-500 transition-colors flex items-center justify-center"
                >
                    <span className="material-symbols-outlined text-lg">{isAdding ? 'close' : 'add'}</span>
                </button>
            </div>

            {isAdding ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3 relative z-10 animate-in fade-in slide-in-from-top-2">
                    <div className="relative">
                        <input
                            type="number"
                            step="0.1"
                            value={waterAmount}
                            onChange={(e) => setWaterAmount(e.target.value)}
                            placeholder="Amount in Liters (e.g. 2.5)"
                            autoFocus
                            className="w-full bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500/50 transition-all font-bold placeholder:font-medium"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">Liters</span>
                    </div>
                    <button type="submit" className="w-full py-3 bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        Log Intake
                    </button>
                </form>
            ) : (
                <div className="flex items-baseline gap-2 relative z-10 mt-2">
                    <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                        {latest?.details?.value || '0.0'}
                    </span>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Liters Today</span>
                </div>
            )}

            {/* Subtle background decoration */}
            <div className="absolute -right-4 -bottom-4 size-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-400/10 transition-colors" />
        </div>
    );
};

export default WaterTracker;
