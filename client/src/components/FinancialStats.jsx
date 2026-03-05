import React from 'react';

function FinancialStats() {
    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] p-6 shadow-sm flex flex-col flex-1 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-in-out min-h-[180px]">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Financial Stats</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-1">Monthly Overview</p>
                </div>
                <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
                    <span className="material-symbols-outlined text-xl">more_horiz</span>
                </button>
            </div>

            <div className="flex items-center gap-4 mb-2">
                <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">$24,562.00</h2>
                </div>
                <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded text-xs font-bold">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    <span>+12.5%</span>
                </div>
            </div>


        </div>
    );
}

export default FinancialStats;
