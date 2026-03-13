import React, { useState } from 'react';
import { createPortal } from 'react-dom';
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
                        const initial = {};
                        budgetList.forEach(b => initial[b.category] = b.limit);
                        setEditBudgets(initial);
                        setIsEditing(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-xl">settings</span>
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
                                <span className="text-xs font-black text-slate-900 dark:text-white">
                                    {currencySymbol}{spent.toLocaleString()} / {currencySymbol}{b.limit.toLocaleString()}
                                </span>
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

                <div className="mt-auto pt-6">
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-widest">Left to Spend</p>
                        <p className="text-2xl font-black text-primary">
                            {currencySymbol}{remainingBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
            </div>

            {isEditing && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsEditing(false)}></div>
                    <div className="relative w-full max-w-md bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="text-sm font-black dark:text-white uppercase tracking-wider">Budget Limits</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Define your monthly caps</p>
                            </div>
                            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                            {budgetList.map(b => (
                                <div key={b.category} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{b.category}</span>
                                    <div className="relative w-24">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">{currencySymbol}</span>
                                        <input
                                            type="number"
                                            className="w-full bg-white dark:bg-[#192233] border border-slate-200 dark:border-slate-700 rounded-lg pl-6 pr-2 py-1.5 text-xs font-black dark:text-white outline-none focus:ring-2 focus:ring-primary/50"
                                            value={editBudgets[b.category] || ''}
                                            onChange={(e) => setEditBudgets({ ...editBudgets, [b.category]: e.target.value })}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleSave}
                            className="w-full py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Save All Limits
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default MonthlyBudget;
