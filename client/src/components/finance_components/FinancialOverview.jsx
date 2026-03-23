import React, { useState, useEffect } from "react";

const FinancialOverview = ({
  transactions,

  currencySymbol,

  totalSavings,
  totalDebt,
  totalUpcomingIncome,
}) => {
  const [includeSavings, setIncludeSavings] = useState(false);
  const [includeUpcoming, setIncludeUpcoming] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Current month filter
  const now = new Date();

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalIncome = currentMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpenses = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // Entire history ledger balance
  const ledgerBalance = transactions.reduce((sum, t) => {
    const amt = parseFloat(t.amount) || 0;
    return t.type === "income" ? sum + amt : sum - amt;
  }, 0);

  // Calculate displayed balance
  let displayedBalance = ledgerBalance;
  if (includeSavings) displayedBalance += totalSavings;
  if (includeUpcoming) {
    displayedBalance += totalUpcomingIncome - totalDebt;
  }

  // Category breakdown for expenses
  const categoryTotals = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
      return acc;
    }, {});

  const categories = Object.entries(categoryTotals)

    .map(([label, amount]) => ({
      label,

      amount,

      percent: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    }))

    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 shadow-none flex flex-col gap-6 min-h-[400px] relative overflow-hidden group">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Financial Insights</h3>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-1">
            {now.toLocaleString("default", { month: "long", year: "numeric" }).toUpperCase()} Analysis
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#000000] text-slate-500 dark:text-slate-400 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">settings</span>
          </button>
        </div>
      </div>

      {/* Config Overlay */}
      {showSettings && (
        <div className="absolute top-16 right-6 z-10 w-64 bg-white dark:bg-[#000000] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Balance Components</p>
           <div className="space-y-3">
             <label className="flex items-center justify-between cursor-pointer group">
               <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Include Savings</span>
               <div className="relative">
                 <input type="checkbox" className="sr-only peer" checked={includeSavings} onChange={() => setIncludeSavings(!includeSavings)} />
                 <div className="w-8 h-4 bg-slate-200 dark:bg-[#121212] rounded-full peer peer-checked:bg-primary transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
               </div>
             </label>
             <label className="flex items-center justify-between cursor-pointer group">
               <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Include Upcoming Cashflow</span>
               <div className="relative">
                 <input type="checkbox" className="sr-only peer" checked={includeUpcoming} onChange={() => setIncludeUpcoming(!includeUpcoming)} />
                 <div className="w-8 h-4 bg-slate-200 dark:bg-[#121212] rounded-full peer peer-checked:bg-emerald-500 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
               </div>
             </label>
           </div>
        </div>
      )}

      {/* Net Balance Display */}
      <div className="relative p-8 text-center rounded-2xl bg-slate-50 dark:bg-[#000000]/50 border border-slate-100 dark:border-white/5">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Net Balance</p>
        <p className={`text-4xl font-black ${displayedBalance >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
          {currencySymbol}{Math.abs(displayedBalance).toLocaleString()}
        </p>

        <div className="flex items-center justify-center gap-3 mt-4">
          {includeSavings && (
            <span className="px-2 py-1 rounded-md text-[8px] font-black bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest">
              +Savings
            </span>
          )}
          {includeUpcoming && (
            <span className="px-2 py-1 rounded-md text-[8px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-widest">
              +Upcoming
            </span>
          )}
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 transition-colors hover:border-emerald-500/30">
          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Inflow</p>
          <p className="text-2xl font-black text-emerald-500">{currencySymbol}{totalIncome.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 transition-colors hover:border-rose-500/30">
          <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-1">Outflow</p>
          <p className="text-2xl font-black text-rose-500">{currencySymbol}{totalExpenses.toLocaleString()}</p>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expenditure Distribution</p>
        {categories.length > 0 ? (
          <div className="space-y-4">
            {categories.slice(0, 5).map((cat, i) => {
              const bgColors = ["bg-primary", "bg-emerald-500", "bg-amber-500", "bg-purple-500", "bg-rose-500"];
              const bgColor = bgColors[i % bgColors.length];
              return (
                <div key={cat.label} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{cat.label}</span>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-slate-900 dark:text-white">{currencySymbol}{cat.amount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-[#000000] rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full ${bgColor} transition-all duration-500`} style={{ width: `${cat.percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center bg-slate-50 dark:bg-[#000000]/20 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
            <span className="material-symbols-outlined text-slate-300 text-3xl mb-1">insights</span>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">No data logged</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <div className="flex items-center gap-4">
          <span>Snapshot</span>
          <span className={displayedBalance >= 0 ? "text-emerald-500" : "text-rose-500"}>
            {displayedBalance >= 0 ? "SURPLUS" : "DEFICIT"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-500">Active</span>
        </div>
      </div>
    </div>
  );
};

export default FinancialOverview;
