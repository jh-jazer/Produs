import React, { useState } from 'react';
import api from '../../services/api';

const MonthlyBudget = ({ budgets, transactions, currencySymbol, onAction }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editBudgets, setEditBudgets] = useState({});

    // Calculate current spending per category for this month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const spendingByCategory = transactions
        .filter(t => t.type === 'expense')
        .filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
            return acc;
        }, {});

    const budgetList = budgets.length > 0 ? budgets : [
        { category: 'Food', limit: 500 },
        { category: 'Entertainment', limit: 300 },
        { category: 'Transport', limit: 200 },
        { category: 'Rent', limit: 1200 },
        { category: 'Utilities', limit: 200 },
        { category: 'Health', limit: 150 },
    ];

    const handleSave = async () => {
        try {
            await Promise.all(
                Object.entries(editBudgets).map(([category, limit]) =>
                    api.post('/finance/budgets', { category, limit: parseFloat(limit) })
                )
            );
            setIsEditing(false);
            onAction();
        } catch (error) {
            console.error('Failed to save budgets:', error);
        }
    };

    const totalBudget = budgetList.reduce((sum, b) => sum + b.limit, 0);
    const totalSpentThisMonth = Object.values(spendingByCategory).reduce((sum, val) => sum + val, 0);
    const remainingBudget = Math.max(0, totalBudget - totalSpentThisMonth);

    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] p-6 shadow-sm min-h-[300px] flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-6">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">pie_chart</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Monthly Budget</h3>
                </div>
                <button
                    onClick={() => {
                        if (!isEditing) {
                            const initial = {};
                            budgetList.forEach(b => initial[b.category] = b.limit);
                            setEditBudgets(initial);
                        }
                        setIsEditing(!isEditing);
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${isEditing ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                    <span className="material-symbols-outlined text-xl">{isEditing ? 'close' : 'edit'}</span>
                </button>
            </div>

            <div className="space-y-5 flex-1">
                {budgetList.map(b => {
                    const spent = spendingByCategory[b.category] || 0;
                    const percent = Math.min(100, (spent / b.limit) * 100);
                    const color = percent > 90 ? 'bg-red-500' : percent > 70 ? 'bg-orange-500' : 'bg-primary';

                    return (
                        <div key={b.category}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{b.category}</span>
                                {isEditing ? (
                                    <div className="flex items-center gap-1">
                                        <span className="text-[10px] text-slate-400 font-bold">{currencySymbol}</span>
                                        <input
                                            type="number"
                                            className="w-16 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 text-xs font-black dark:text-white outline-none"
                                            value={editBudgets[b.category] || ''}
                                            onChange={(e) => setEditBudgets({ ...editBudgets, [b.category]: e.target.value })}
                                        />
                                    </div>
                                ) : (
                                    <span className="text-xs font-black text-slate-900 dark:text-white">
                                        {currencySymbol}{spent.toLocaleString()} / {currencySymbol}{b.limit.toLocaleString()}
                                    </span>
                                )}
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className={`${color} h-full rounded-full transition-all duration-700`}
                                    style={{ width: `${percent}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}

                {isEditing && (
                    <button
                        onClick={handleSave}
                        className="w-full py-2 bg-primary text-white font-bold rounded-lg text-xs mt-2"
                    >
                        Save All Limits
                    </button>
                )}

                <div className="mt-auto pt-6">
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-widest">Left to Spend</p>
                        <p className="text-2xl font-black text-primary">
                            {currencySymbol}{remainingBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonthlyBudget;
