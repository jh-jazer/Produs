/* eslint-disable */
import React from 'react';

const HighPriority = () => {
    return (
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 shadow-none">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-orange-500">priority_high</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">High Priority</h3>
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Today</span>
            </div>
            <div className="space-y-3">
                <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        <span className="font-bold text-slate-900 dark:text-white">Q4 Product Strategy Review</span>
                    </div>
                    <span className="text-xs text-orange-600 dark:text-orange-400 font-semibold">10:00 AM</span>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="font-bold text-slate-900 dark:text-white">Client Onboarding Session</span>
                    </div>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">2:00 PM</span>
                </div>
            </div>
        </div>
    );
};

export default HighPriority;
