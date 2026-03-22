import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../../services/api';
import useConnectivityStore from '../../store/useConnectivityStore';

const PRESET_CATEGORIES = [
    'Food', 'Rent', 'Transport', 'Utilities', 'Health', 'Shopping',
    'Savings', 'Subsciptions', 'Personal', 'Insurance', 'Beauty',
    'General', 'Tech', 'Home', 'Fashion', 'Hobby', 'Fitness',
    'Wellness', 'Education', 'Travel', 'Entertainment', 'Vehicles',
    'Gifts', 'Pets', 'Other'
];

const MonthlyBudget = ({ budgets, transactions, currencySymbol, onAction }) => {
    const isOnline = useConnectivityStore(state => state.isOnline);
    const addToQueue = useConnectivityStore(state => state.addToQueue);
    const [isEditing, setIsEditing] = useState(false);
    const [editBudgets, setEditBudgets] = useState([]); // Array of { _id, category, limit }
    const [newCategory, setNewCategory] = useState({ category: '', limit: '' });
    const [deletedBudgetIds, setDeletedBudgetIds] = useState([]);

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

    const budgetList = budgets;

    const handleSave = async () => {
        if (!isOnline) {
            // 1. Queue deletions
            deletedBudgetIds.forEach(id => {
                addToQueue({
                    id,
                    type: 'finance-budget',
                    method: 'DELETE',
                    url: `/finance/budgets/${id}`
                });
            });

            // 2. Queue updates/creations
            editBudgets.forEach(b => {
                addToQueue({
                    id: b._id || `temp-budget-${Date.now()}-${b.category}`,
                    type: 'finance-budget',
                    method: 'PUT',
                    url: '/finance/budgets',
                    data: { category: b.category, limit: parseFloat(b.limit) }
                });
            });

            setIsEditing(false);
            setDeletedBudgetIds([]);
            if (onAction) onAction();
            return;
        }

        try {
            // 1. Delete marked budgets
            await Promise.all(
                deletedBudgetIds.map(id => api.delete(`/finance/budgets/${id}`))
            );

            // 2. Update existing or create new budgets
            await Promise.all(
                editBudgets.map(b =>
                    api.put('/finance/budgets', { category: b.category, limit: parseFloat(b.limit) })
                )
            );

            setIsEditing(false);
            setDeletedBudgetIds([]);
            onAction();
        } catch (error) {
            console.error('Failed to save budgets:', error);
        }
    };

    const addCategory = () => {
        if (!newCategory.category || !newCategory.limit) return;
        setEditBudgets([...editBudgets, { ...newCategory, limit: parseFloat(newCategory.limit) }]);
        setNewCategory({ category: '', limit: '' });
    };

    const removeCategory = (index, id) => {
        if (id) {
            setDeletedBudgetIds([...deletedBudgetIds, id]);
        }
        const updated = [...editBudgets];
        updated.splice(index, 1);
        setEditBudgets(updated);
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
                        setEditBudgets(budgetList.map(b => ({ ...b })));
                        setIsEditing(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-xl">settings</span>
                </button>
            </div>

            <div className="space-y-5 flex-1 flex flex-col">
                {budgetList.length > 0 ? (
                    <>
                        {budgetList.map(b => {
                            const spent = spendingByCategory[b.category] || 0;
                            const percent = Math.min(100, (spent / b.limit) * 100);
                            const color = percent > 90 ? 'bg-red-500' : percent > 70 ? 'bg-orange-500' : 'bg-primary';

                            return (
                                <div key={b.category}>
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">{b.category}</span>
                                            {b.isPending && (
                                                <span className="flex-shrink-0 animate-spin material-symbols-outlined text-[10px] text-amber-500">sync</span>
                                            )}
                                        </div>
                                        <span className="text-xs font-black text-slate-900 dark:text-white">
                                            {currencySymbol}{spent.toLocaleString()} / {currencySymbol}{b.limit.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className={`${color} h-full rounded-full transition-all duration-700 ${b.isPending ? 'opacity-50 animate-pulse' : ''}`}
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
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-3">account_balance_wallet</span>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">No Budgets Set</p>
                        <p className="text-[10px] text-slate-400 font-medium">Click the settings icon above to define your monthly spending caps.</p>
                    </div>
                )}
            </div>

            {isEditing && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsEditing(false)}></div>
                    <div className="relative w-full max-w-md bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="text-sm font-black dark:text-white uppercase tracking-wider">Budget Categories</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Manage your monthly caps</p>
                            </div>
                            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        {/* Category List */}
                        <div className="grid grid-cols-1 gap-3 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                            {editBudgets.map((b, index) => (
                                <div key={index} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 group">
                                    <div className="flex-1 flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</span>
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">{b.category}</span>
                                    </div>
                                    <div className="relative w-24">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Limit</span>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">{currencySymbol}</span>
                                            <input
                                                type="number"
                                                className="w-full bg-white dark:bg-[#192233] border border-slate-200 dark:border-slate-700 rounded-lg pl-6 pr-2 py-1.5 text-xs font-black dark:text-white outline-none focus:ring-2 focus:ring-primary/50"
                                                value={b.limit || ''}
                                                onChange={(e) => {
                                                    const updated = [...editBudgets];
                                                    updated[index].limit = e.target.value;
                                                    setEditBudgets(updated);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => removeCategory(index, b._id)}
                                        className="mt-4 p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add New Category */}
                        <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quick Picks</p>
                                <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto pr-1 selection-none">
                                    {PRESET_CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setNewCategory({ ...newCategory, category: cat })}
                                            className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-all ${
                                                newCategory.category === cat 
                                                ? 'bg-primary border-primary text-white' 
                                                : 'bg-white dark:bg-[#192233] border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-primary/50 hover:text-primary'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custom Entry</p>
                                <div className="flex gap-2">
                                    <input
                                        placeholder="Name (e.g. Subs)"
                                        className="flex-1 bg-white dark:bg-[#192233] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-primary/50"
                                        value={newCategory.category}
                                        onChange={(e) => setNewCategory({ ...newCategory, category: e.target.value })}
                                    />
                                    <div className="relative w-24">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">{currencySymbol}</span>
                                        <input
                                            type="number"
                                            placeholder="Limit"
                                            className="w-full bg-white dark:bg-[#192233] border border-slate-200 dark:border-slate-700 rounded-lg pl-6 pr-2 py-2 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-primary/50"
                                            value={newCategory.limit}
                                            onChange={(e) => setNewCategory({ ...newCategory, limit: e.target.value })}
                                        />
                                    </div>
                                    <button 
                                        onClick={addCategory}
                                        className="p-2 bg-primary text-white rounded-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-primary/20"
                                    >
                                        <span className="material-symbols-outlined text-lg">add</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            className="w-full py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-2"
                        >
                            Save All Changes
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default MonthlyBudget;
