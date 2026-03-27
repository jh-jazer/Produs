import React from "react";

function FinancialStats() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 shadow-none flex flex-col flex-1 min-h-[180px] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-in-out">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Financial Stats</h3>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-1">Monthly Overview</p>
        </div>
        <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#000000] text-slate-500 dark:text-slate-400 transition-colors">
          <span className="material-symbols-outlined text-xl">more_horiz</span>
        </button>
      </div>

      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Net Balance</p>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">$24,562.00</h2>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <span className="material-symbols-outlined text-emerald-500 text-sm">trending_up</span>
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">
            +12.5%
          </span>
        </div>
      </div>

      {/* Mini Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mt-auto">
        <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-[#000000]/50 border border-slate-100 dark:border-white/5">
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Income</p>
          <p className="text-sm font-black text-emerald-500">$5,240</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-[#000000]/50 border border-slate-100 dark:border-white/5">
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Expenses</p>
          <p className="text-sm font-black text-rose-500">$3,120</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-[#000000]/50 border border-slate-100 dark:border-white/5">
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Savings</p>
          <p className="text-sm font-black text-primary">$2,120</p>
        </div>
      </div>
    </div>
  );
}

export default FinancialStats;
