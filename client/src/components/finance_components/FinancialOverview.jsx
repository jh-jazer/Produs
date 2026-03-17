import React, { useState } from 'react';

const FinancialOverview = ({ transactions, currencySymbol, netBalance, totalSavings, totalDebt, totalUpcomingIncome }) => {
    const [includeSavings, setIncludeSavings] = useState(false);
    const [includeUpcoming, setIncludeUpcoming] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Current month filter
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalIncome = currentMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpenses = currentMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    // Entire history ledger balance
    const ledgerBalance = transactions.reduce((sum, t) => {
        const amt = parseFloat(t.amount) || 0;
        return t.type === 'income' ? sum + amt : sum - amt;
    }, 0);

    // Calculate displayed balance
    let displayedBalance = ledgerBalance;
    if (includeSavings) displayedBalance += totalSavings;
    if (includeUpcoming) {
        displayedBalance += (totalUpcomingIncome - totalDebt);
    }

    // Category breakdown for expenses
    const categoryTotals = currentMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
            return acc;
        }, {});

    const categories = Object.entries(categoryTotals)
        .map(([label, amount]) => ({
            label,
            amount,
            percent: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount);

    const getCategoryColor = (index) => {
        const colors = ['bg-primary', 'bg-purple-500', 'bg-orange-500', 'bg-emerald-500', 'bg-blue-500', 'bg-pink-500'];
        return colors[index % colors.length];
    };

    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] p-6 shadow-sm flex flex-col gap-6 relative">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Financial Overview</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Summary for {now.toLocaleString('default', { month: 'long' })}</p>
                </div>
                <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-xl">settings</span>
                </button>
            </div>

            {/* Config Overlay */}
            {showSettings && (
                <div className="absolute top-16 right-6 z-10 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Balance Components</p>
                    <div className="space-y-3">
                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Include Savings</span>
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={includeSavings} 
                                    onChange={() => setIncludeSavings(!includeSavings)}
                                />
                                <div className="w-8 h-4 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-primary transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
                            </div>
                        </label>
                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Include Upcoming Cashflow</span>
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={includeUpcoming} 
                                    onChange={() => setIncludeUpcoming(!includeUpcoming)}
                                />
                                <div className="w-8 h-4 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-emerald-500 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
                            </div>
                        </label>
                    </div>
                </div>
            )}

            {/* Net Balance Large Display */}
            <div className={`rounded-2xl p-6 text-center relative transition-all duration-300 ${
                displayedBalance >= 0 
                    ? 'bg-emerald-500/5 border border-emerald-500/10' 
                    : 'bg-rose-500/5 border border-rose-500/10'
            }`}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    {includeUpcoming ? 'Projected' : 'Current'} Balance
                </p>
                <p className={`text-4xl font-black tracking-tight ${
                    displayedBalance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-500'
                }`}>
                    {displayedBalance < 0 ? '-' : ''}{currencySymbol}{Math.abs(displayedBalance).toLocaleString()}
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                    {includeSavings && (
                        <span className="text-[8px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase">Savings Included</span>
                    )}
                    {includeUpcoming && (
                        <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded uppercase">Upcoming Included</span>
                    )}
                </div>
            </div>

            {/* Income & Expense Breakdown */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-emerald-500 text-sm">trending_up</span>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Income</p>
                    </div>
                    <p className="text-xl font-black text-slate-900 dark:text-white">
                        {currencySymbol}{totalIncome.toLocaleString()}
                    </p>
                </div>
                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-rose-500 text-sm">trending_down</span>
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Expenses</p>
                    </div>
                    <p className="text-xl font-black text-slate-900 dark:text-white">
                        {currencySymbol}{totalExpenses.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Category Progress Bars */}
            <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Spending by Category</p>
                {categories.length > 0 ? (
                    <div className="space-y-4">
                        {categories.slice(0, 5).map((cat, i) => (
                            <div key={cat.label}>
                                <div className="flex justify-between items-center mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${getCategoryColor(i)}`}></div>
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{cat.label}</span>
                                    </div>
                                    <span className="text-xs font-black text-slate-900 dark:text-white">
                                        {currencySymbol}{cat.amount.toLocaleString()}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${getCategoryColor(i)} transition-all duration-700`}
                                        style={{ width: `${cat.percent}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-4 text-center">
                        <p className="text-xs font-bold text-slate-400">No expense categories tracked yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinancialOverview;
