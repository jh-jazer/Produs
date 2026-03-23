import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../../services/api';
import ConfirmDialog from '../ui/ConfirmDialog';
import useConnectivityStore from '../../store/useConnectivityStore';

const RecentTransactions = ({ transactions, budgets = [], currencySymbol, onAction, addFinanceItem, deleteFinanceItem }) => {
    const [showAdd, setShowAdd] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [newTx, setNewTx] = useState({ title: '', amount: '', type: 'expense', category: 'General', date: new Date().toISOString().split('T')[0] });

    // Deduplicate and prepare categories from budgets
    const budgetCategories = budgets.map(b => b.category);
    const availableCategories = budgetCategories.length > 0 ? budgetCategories : [
        'General', 'Food', 'Transport', 'Utilities', 'Entertainment', 
        'Tech', 'Home', 'Fashion', 'Hobby', 'Fitness', 'Wellness', 
        'Education', 'Travel', 'Vehicles', 'Gifts', 'Pets', 'Other'
    ];
    
    // Ensure "General" or current category is included if not in budgets
    if (!availableCategories.includes('General')) availableCategories.push('General');

    const handleAdd = async (e) => {
        e.preventDefault();
        const txData = {
            ...newTx,
            amount: parseFloat(newTx.amount)
        };

        await addFinanceItem('transaction', txData);
        if (onAction) onAction();
        setShowAdd(false);
        setNewTx({ title: '', amount: '', type: 'expense', category: 'General', date: new Date().toISOString().split('T')[0] });
    };

    const handleDelete = async (id) => {
        await deleteFinanceItem(id);
        if (onAction) onAction();
    };

    return (
        <>
            <ConfirmDialog
                isOpen={!!confirmDelete}
                title="Delete Transaction"
                message="Are you sure you want to delete this transaction?"
                confirmLabel="Delete"
                onConfirm={() => { handleDelete(confirmDelete); setConfirmDelete(null); }}
                onCancel={() => setConfirmDelete(null)}
            />
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 shadow-none min-h-[350px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowAdd(true)}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#121212]/50 text-slate-500 hover:text-primary transition-colors"
                        title="Add Transaction"
                    >
                        <span className="material-symbols-outlined text-xl">add_circle</span>
                    </button>
                    <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#121212]/50 text-slate-500 hover:text-primary transition-colors" title="View All">
                        <span className="material-symbols-outlined text-xl">visibility</span>
                    </button>
                </div>
            </div>

            {showAdd && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-[#121212]/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowAdd(false)}></div>
                    <form 
                        onSubmit={handleAdd} 
                        className="relative w-full max-w-md bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-200 flex flex-col gap-5"
                    >
                        <div className="flex justify-between items-center mb-1">
                            <div>
                                <h4 className="text-sm font-black dark:text-white uppercase tracking-wider">Add Transaction</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Track your flow</p>
                            </div>
                            <button type="button" onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                                <input
                                    type="text" required placeholder="What was this for?"
                                    className="w-full bg-slate-50 dark:bg-[#000000] border dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
                                    value={newTx.title} onChange={e => setNewTx({ ...newTx, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">{currencySymbol}</span>
                                        <input
                                            type="number" required step="0.01" placeholder="0.00"
                                            className="w-full bg-slate-50 dark:bg-[#000000] border dark:border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
                                            value={newTx.amount} onChange={e => setNewTx({ ...newTx, amount: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                                    <select
                                        className="w-full bg-slate-50 dark:bg-[#000000] border dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold appearance-none"
                                        value={newTx.type} onChange={e => setNewTx({ ...newTx, type: e.target.value })}
                                    >
                                        <option value="expense">Expense</option>
                                        <option value="income">Income</option>
                                        <option value="savings">Savings</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                    <select
                                        className="w-full bg-slate-50 dark:bg-[#000000] border dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold appearance-none"
                                        value={newTx.category} onChange={e => setNewTx({ ...newTx, category: e.target.value })}
                                    >
                                        {availableCategories.sort().map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                                    <input
                                        type="date" required
                                        className="w-full bg-slate-50 dark:bg-[#000000] border dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
                                        value={newTx.date} onChange={e => setNewTx({ ...newTx, date: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-2 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Save Transaction'}
                        </button>
                    </form>
                </div>,
                document.body
            )}

            <div className="space-y-4">
                {transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <span className="material-symbols-outlined text-4xl mb-2">analytics</span>
                        <p className="text-sm font-medium">No transactions yet</p>
                    </div>
                ) : (
                    transactions.slice(0, 5).map(tx => (
                        <div key={tx._id} className="group flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-[#000000]/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-white/10">
                            <div className="flex items-center gap-4">
                                <div className={`size-10 rounded-full flex items-center justify-center ${
                                    tx.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 
                                    tx.type === 'savings' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' :
                                    'bg-slate-100 dark:bg-[#000000] text-slate-600 dark:text-slate-400'
                                }`}>
                                    <span className="material-symbols-outlined">{
                                        tx.type === 'income' ? 'payments' : 
                                        tx.type === 'savings' ? 'savings' : 
                                        'shopping_bag'
                                    }</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{tx.title}</p>
                                        {tx.isPending && (
                                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-tighter border border-amber-500/20">
                                                <span className="material-symbols-outlined text-[8px] animate-spin">sync</span>
                                                Pending
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {tx.category}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <p className={`text-sm font-black ${
                                    tx.type === 'income' ? 'text-emerald-500' : 
                                    tx.type === 'savings' ? 'text-purple-500' :
                                    'text-red-500'
                                }`}>
                                    {tx.type === 'income' ? '+' : tx.type === 'savings' ? '★' : '-'}{currencySymbol}{parseFloat(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                                <button
                                    onClick={() => setConfirmDelete(tx._id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-300 hover:text-rose-500 transition-all"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            </div>
        </>
    );
};

export default RecentTransactions;
