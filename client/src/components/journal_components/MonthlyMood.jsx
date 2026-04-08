/* eslint-disable */
import React from 'react';

const MonthlyMood = () => {
    return (
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 shadow-none flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Monthly Mood</h3>
                <span className="text-xs font-semibold text-slate-500">Oct 2023</span>
            </div>

            <div className="grid grid-cols-7 gap-1 mx-auto text-inter">
                {[
                    'bg-emerald-500/20', 'bg-emerald-500/40', 'bg-emerald-500/10', 'bg-emerald-500/60', 'bg-emerald-500/20', 'bg-emerald-500/80', 'bg-emerald-500/40',
                    'bg-emerald-500/10', 'bg-emerald-500/20', 'bg-primary/40', 'bg-emerald-500/60', 'bg-emerald-500/40', 'bg-emerald-500/90', 'bg-emerald-500/20',
                    'bg-emerald-500/30', 'bg-emerald-500/50', 'bg-emerald-500/10', 'bg-amber-500/40', 'bg-emerald-500/70', 'bg-emerald-500/20', 'bg-emerald-500/40',
                    'bg-emerald-500/80', 'bg-emerald-500/20', 'bg-primary/60', 'bg-emerald-500/10', 'bg-slate-200 dark:bg-[#000000]', 'bg-slate-200 dark:bg-[#000000]', 'bg-slate-200 dark:bg-[#000000]'
                ].map((colorClass, i) => (
                    <div key={i} className={`mood-heat-cell ${colorClass}`}></div>
                ))}
            </div>

            <div className="mt-6 flex justify-between items-center text-[10px] uppercase font-bold text-slate-500">
                <span>Negative</span>
                <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-sm bg-emerald-500/10"></div>
                    <div className="w-2 h-2 rounded-sm bg-emerald-500/30"></div>
                    <div className="w-2 h-2 rounded-sm bg-emerald-500/60"></div>
                    <div className="w-2 h-2 rounded-sm bg-emerald-500/90"></div>
                </div>
                <span>Positive</span>
            </div>
        </div>
    );
};

export default MonthlyMood;
