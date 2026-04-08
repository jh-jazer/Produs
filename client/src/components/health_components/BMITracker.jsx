/* eslint-disable */
import React, { useState } from 'react';

const BMITracker = ({ metrics, addHealthLog, deleteHealthLog }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');

    const latest = metrics
        .filter(m => m.details?.metricType === 'bmi')
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!weight || !height) return;

        const heightInMeters = parseFloat(height) / 100;
        const bmiValue = parseFloat(weight) / (heightInMeters * heightInMeters);

        // 1. Log BMI Metric
        addHealthLog('metric', {
            title: 'BMI Calculation',
            date: new Date().toISOString().split('T')[0],
            details: {
                metricType: 'bmi',
                height: parseFloat(height),
                weight: parseFloat(weight),
                value: parseFloat(bmiValue.toFixed(1)),
                unit: 'BMI'
            }
        });

        // 2. Log Weight Metric Automatically
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
        setHeight('');
    };

    const getStatus = (bmi) => {
        if (!bmi) return { label: 'Unknown', color: 'text-slate-400' };
        if (bmi < 18.5) return { label: 'Underweight', color: 'text-amber-500' };
        if (bmi < 25) return { label: 'Healthy', color: 'text-emerald-500' };
        if (bmi < 30) return { label: 'Overweight', color: 'text-orange-500' };
        return { label: 'Obese', color: 'text-rose-500' };
    };

    const status = getStatus(latest?.details?.value);

    return (
        <div className="p-5 rounded-[24px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] flex flex-col gap-4 relative overflow-hidden group">
            <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <span className="material-symbols-outlined">monitor_heart</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Physique</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">BMI Analysis</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="size-8 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-emerald-500 transition-colors flex items-center justify-center"
                >
                    <span className="material-symbols-outlined text-lg">{isAdding ? 'close' : 'add'}</span>
                </button>
            </div>

            {isAdding ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Weight (kg)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder="70"
                                className="w-full bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500/50 transition-all font-bold"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Height (cm)</label>
                            <input
                                type="number"
                                step="1"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                placeholder="175"
                                className="w-full bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500/50 transition-all font-bold"
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        Calculate BMI
                    </button>
                </form>
            ) : (
                <div className="flex flex-col gap-1 relative z-10 mt-2">
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                            {latest?.details?.value || '0.0'}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-full ${status.color}`}>
                            {status.label}
                        </span>
                    </div>
                    {latest?.details?.weight && (
                        <div className="text-[10px] text-slate-400 font-black tracking-widest uppercase">
                            Based on {latest.details.weight}kg / {latest.details.height}cm
                        </div>
                    )}
                </div>
            )}

            {/* Subtle background decoration */}
            <div className="absolute -right-4 -bottom-4 size-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-400/10 transition-colors" />
        </div>
    );
};

export default BMITracker;
