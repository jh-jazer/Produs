/* eslint-disable */
import React from 'react';

const SpendingBreakdown = ({ transactions, currencySymbol }) => {
    // Calculate category totals for expenses
    const categoryTotals = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
            return acc;
        }, {});

    const totalSpent = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

    const categories = [
        { label: 'Rent & Utilities', color: 'bg-primary' },
        { label: 'Shopping', color: 'bg-purple-500' },
        { label: 'Food & Dining', color: 'bg-orange-500' },
        { label: 'Transport', color: 'bg-emerald-500' },
        { label: 'General', color: 'bg-slate-400' },
    ].map(cat => ({
        ...cat,
        amount: categoryTotals[cat.label] || 0
    })).filter(cat => cat.amount > 0 || cat.label === 'General');

    // Add any other categories found in transactions
    Object.keys(categoryTotals).forEach(cat => {
        if (!categories.find(c => c.label === cat)) {
            categories.push({ label: cat, color: 'bg-slate-300', amount: categoryTotals[cat] });
        }
    });

    return (
        <div className="min-h-[300px]">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Spending Breakdown</h3>

            <div className="relative flex items-center justify-center mb-6">
                <div className="size-40 rounded-full border-[12px] border-slate-100 dark:border-white/10 relative flex items-center justify-center">
                    {/* Visual indicator (simplified for now without complex SVG paths) */}
                    <div className="absolute inset-0 border-[12px] border-primary/20 rounded-full"></div>

                    <div className="text-center z-10 bg-white/80 dark:bg-[#121212]/80 rounded-full size-24 flex flex-col justify-center backdrop-blur-sm">
                        <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                            {currencySymbol}{totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-[10px] uppercase font-bold text-slate-500">Total Spent</p>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {categories.length === 0 ? (
                    <p className="text-center text-xs text-slate-500 py-4">No spending data</p>
                ) : (
                    categories.slice(0, 4).sort((a, b) => b.amount - a.amount).map(item => (
                        <div key={item.label} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                                <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white">{currencySymbol}{item.amount.toLocaleString()}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SpendingBreakdown;
