import React, { useState } from 'react';
import api from '../../services/api';

const RecentTransactions = ({ transactions, currencySymbol, onAction }) => {
    const [showAdd, setShowAdd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newTx, setNewTx] = useState({ title: '', amount: '', type: 'expense', category: 'General', date: new Date().toISOString().split('T')[0] });

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/finance/transactions', newTx);
            onAction();
            setShowAdd(false);
            setNewTx({ title: '', amount: '', type: 'expense', category: 'General', date: new Date().toISOString().split('T')[0] });
        } catch (error) {
            console.error('Failed to add transaction:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this transaction?')) return;
        try {
            await api.delete(`/finance/transactions/${id}`);
            onAction();
        } catch (error) {
            console.error('Failed to delete transaction:', error);
        }
    };

    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] p-6 shadow-sm min-h-[350px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowAdd(!showAdd)}
                        className={`p-2 rounded-lg transition-colors ${showAdd ? 'bg-primary text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-500 hover:text-primary'}`}
                        title="Add Transaction"
                    >
                        <span className="material-symbols-outlined text-xl">{showAdd ? 'close' : 'add_circle'}</span>
                    </button>
                    <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-500 hover:text-primary transition-colors" title="View All">
                        <span className="material-symbols-outlined text-xl">visibility</span>
                    </button>
                </div>
            </div>

            {showAdd && (
                <form onSubmit={handleAdd} className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <input
                            type="text" required placeholder="Title"
                            className="bg-white dark:bg-[#192233] border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white"
                            value={newTx.title} onChange={e => setNewTx({ ...newTx, title: e.target.value })}
                        />
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">{currencySymbol}</span>
                            <input
                                type="number" required step="0.01" placeholder="0.00"
                                className="w-full bg-white dark:bg-[#192233] border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white"
                                value={newTx.amount} onChange={e => setNewTx({ ...newTx, amount: e.target.value })}
                            />
                        </div>
                        <select
                            className="bg-white dark:bg-[#192233] border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white"
                            value={newTx.type} onChange={e => setNewTx({ ...newTx, type: e.target.value })}
                        >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </select>
                        <input
                            type="date" required
                            className="bg-white dark:bg-[#192233] border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white"
                            value={newTx.date} onChange={e => setNewTx({ ...newTx, date: e.target.value })}
                        />
                    </div>
                    <button
                        type="submit" disabled={loading}
                        className="w-full py-2 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? 'Adding...' : 'Save Transaction'}
                    </button>
                </form>
            )}

            <div className="space-y-4">
                {transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <span className="material-symbols-outlined text-4xl mb-2">analytics</span>
                        <p className="text-sm font-medium">No transactions yet</p>
                    </div>
                ) : (
                    transactions.slice(0, 5).map(tx => (
                        <div key={tx._id} className="group flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                            <div className="flex items-center gap-4">
                                <div className={`size-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                    <span className="material-symbols-outlined">{tx.type === 'income' ? 'payments' : 'shopping_bag'}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{tx.title}</p>
                                    <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {tx.category}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <p className={`text-sm font-black ${tx.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {tx.type === 'income' ? '+' : '-'}{currencySymbol}{parseFloat(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                                <button
                                    onClick={() => handleDelete(tx._id)}
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
    );
};

export default RecentTransactions;
