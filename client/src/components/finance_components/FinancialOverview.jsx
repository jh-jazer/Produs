import React, { useState } from 'react';

const FinancialOverview = ({ transactions, currencySymbol, netBalance, totalSavings }) => {
    const [includeSavings, setIncludeSavings] = useState(true);
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
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] p-6 shadow-sm flex flex-col gap-6">
            <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Financial Overview</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Summary for {now.toLocaleString('default', { month: 'long' })}</p>
            </div>

            {/* Net Balance Large Display */}
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 text-center relative group/balance">
                <button 
                    onClick={() => setIncludeSavings(!includeSavings)}
                    className="absolute right-4 top-4 size-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm opacity-0 group-hover/balance:opacity-100"
                    title={includeSavings ? "Exclude Savings" : "Include Savings"}
                >
                    <span className="material-symbols-outlined text-lg">
                        {includeSavings ? 'visibility' : 'visibility_off'}
                    </span>
                </button>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 flex items-center justify-center gap-2">
                    Total {includeSavings ? 'Net' : 'Available'} Balance
                    {!includeSavings && <span className="text-[8px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500 uppercase">Savings Hidden</span>}
                </p>
                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    {currencySymbol}{(includeSavings ? netBalance : (netBalance - totalSavings)).toLocaleString()}
                </p>
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
