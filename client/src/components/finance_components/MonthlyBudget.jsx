import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import DashboardPanel from '../ui/DashboardPanel';

const PRESET_CATEGORIES = [
    'Food', 'Rent', 'Transport', 'Utilities', 'Health', 'Shopping',
    'Savings', 'Subsciptions', 'Personal', 'Insurance', 'Beauty',
    'General', 'Tech', 'Home', 'Fashion', 'Hobby', 'Fitness',
    'Wellness', 'Education', 'Travel', 'Entertainment', 'Vehicles',
    'Gifts', 'Pets', 'Other'
];

const MonthlyBudget = ({ budgets, transactions, currencySymbol, onAction, addFinanceItem, updateFinanceItem, deleteFinanceItem }) => {
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
        // 1. Delete marked budgets
        await Promise.all(
            deletedBudgetIds.map(id => deleteFinanceItem(id))
        );

        // 2. Update existing or create new budgets
        await Promise.all(
            editBudgets.map(b => {
                if (b._id) {
                    return updateFinanceItem(b._id, 'budget', { category: b.category, limit: parseFloat(b.limit) });
                } else {
                    return addFinanceItem('budget', { category: b.category, limit: parseFloat(b.limit) });
                }
            })
        );

        setIsEditing(false);
        setDeletedBudgetIds([]);
        if (onAction) onAction();
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
        <div className="min-h-[300px] flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">BUDGET OVERVIEW</span>
                <button
                    onClick={() => {
                        setEditBudgets(budgetList.map(b => ({ ...b })));
                        setIsEditing(true);
                    }}
                    className="size-8 rounded-sm border border-white/10 text-white/40 hover:bg-white hover:text-black transition-all flex items-center justify-center"
                >
                    <span className="material-symbols-outlined text-lg">settings</span>
                </button>
            </div>

            <div className="space-y-6 flex-1 flex flex-col">
                {budgetList.length > 0 ? (
                    <>
                        <div className="space-y-6">
                            {budgetList.map(b => {
                                const spent = spendingByCategory[b.category] || 0;
                                const percent = Math.min(100, (spent / b.limit) * 100);
                                const isCritical = percent > 90;

                                return (
                                    <div key={b.category} className="space-y-2">
                                        <div className="flex justify-between items-center px-1">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{b.category}</span>
                                                {b.isPending && (
                                                    <span className="animate-spin material-symbols-outlined text-[10px] text-white/20">sync</span>
                                                )}
                                            </div>
                                            <span className="text-[11px] font-black text-white italic">
                                                {currencySymbol}{spent.toLocaleString()} / {currencySymbol}{b.limit.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="w-full bg-white/5 rounded-sm h-[2px] overflow-hidden relative">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percent}%` }}
                                                className={`h-full transition-all duration-700 ${isCritical ? 'bg-rose-500' : 'bg-white/40'} ${b.isPending ? 'opacity-50 animate-pulse' : ''}`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-auto pt-8 border-t border-white/5">
                            <div className="p-8 rounded-sm border border-white/5 bg-white/[0.02]">
                                <p className="text-[10px] font-black text-white/20 mb-4 uppercase tracking-[0.4em]">MONTHLY REMAINING</p>
                                <p className="text-4xl font-black text-white italic tracking-tighter">
                                    {currencySymbol}{remainingBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-10 gap-4">
                        <span className="material-symbols-outlined text-4xl">account_balance_wallet</span>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em]">NO BUDGETS SET</p>
                    </div>
                )}
            </div>

            {isEditing && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-[#121212]/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsEditing(false)}></div>
                    <DashboardPanel
                        className="w-full max-w-md z-10 animate-in zoom-in-95 duration-200"
                        title="MANAGE BUDGET"
                        subtitle="Set spending limits per category"
                        headerExtra={
                            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        }
                    >
                        <div className="flex flex-col gap-6">

                        {/* Category List */}
                        <div className="grid grid-cols-1 gap-3 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                            {editBudgets.map((b, index) => (
                                <div key={index} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#000000]/50 border border-slate-100 dark:border-white/10 group">
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
                                                className="w-full bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-lg pl-6 pr-2 py-1.5 text-xs font-black dark:text-white outline-none focus:ring-2 focus:ring-primary/50"
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
                        <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#000000]/30 flex flex-col gap-4">
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
                                                : 'bg-white dark:bg-[#121212] border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-primary/50 hover:text-primary'
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
                                        className="flex-1 bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-primary/50"
                                        value={newCategory.category}
                                        onChange={(e) => setNewCategory({ ...newCategory, category: e.target.value })}
                                    />
                                    <div className="relative w-24">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">{currencySymbol}</span>
                                        <input
                                            type="number"
                                            placeholder="Limit"
                                            className="w-full bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-lg pl-6 pr-2 py-2 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-primary/50"
                                            value={newCategory.limit}
                                            onChange={(e) => setNewCategory({ ...newCategory, limit: e.target.value })}
                                        />
                                    </div>
                                    <button 
                                        onClick={addCategory}
                                        className="size-8 rounded-lg bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                                        title="Add Category"
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
                            SAVE BUDGET
                        </button>
                        </div>
                    </DashboardPanel>
                </div>,
                document.body
            )}
        </div>
    );
};

export default MonthlyBudget;
