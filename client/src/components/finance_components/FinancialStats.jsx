import React from 'react';

function FinancialStats({ transactions = [], currencySymbol = '$' }) {
    const safeTransactions = Array.isArray(transactions) ? transactions : [];

    const totalBalance = safeTransactions.reduce((acc, t) => {
        const amount = parseFloat(t.amount) || 0;
        return t.type === 'income' ? acc + amount : acc - amount;
    }, 0);

    // Trend calculation
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentMonthTotal = safeTransactions
        .filter(t => new Date(t.date).getMonth() === currentMonth)
        .reduce((acc, t) => {
            const amount = parseFloat(t.amount) || 0;
            return t.type === 'income' ? acc + amount : acc - amount;
        }, 0);

    const trend = currentMonthTotal >= 0 ? '+5.2%' : '-2.1%'; // Mock trend for now but dynamic based on sign

    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] p-6 shadow-sm flex flex-col flex-1 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-in-out font-inter">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-none">Net Balance</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 font-medium uppercase tracking-wider">Current Liquidity</p>
                </div>
                <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
                    <span className="material-symbols-outlined text-xl">more_horiz</span>
                </button>
            </div>

            <div className="flex items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                        {currencySymbol}{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>
                </div>
                <div className={`flex items-center gap-1 ${currentMonthTotal >= 0 ? 'text-emerald-500 bg-emerald-500/10 ring-emerald-500/20' : 'text-red-500 bg-red-500/10 ring-red-500/20'} px-2 py-1 rounded-lg text-xs font-bold ring-1`}>
                    <span className="material-symbols-outlined text-base leading-none">
                        {currentMonthTotal >= 0 ? 'trending_up' : 'trending_down'}
                    </span>
                    <span>{trend}</span>
                </div>
            </div>
        </div>
    );
}

export default FinancialStats;
