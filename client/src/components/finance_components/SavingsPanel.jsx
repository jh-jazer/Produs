import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const SavingsPanel = ({ savings, currencySymbol, onAction }) => {
    const [showAdd, setShowAdd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newSaving, setNewSaving] = useState({ title: '', amount: '', target: '', category: 'General' });

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/finance/savings', newSaving);
            onAction();
            setShowAdd(false);
            setNewSaving({ title: '', amount: '', target: '', category: 'General' });
        } catch (error) {
            console.error('Failed to add saving:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAmount = async (id, title, currentAmount, delta) => {
        try {
            await api.post('/finance/savings', { title, amount: Math.max(0, currentAmount + delta) });
            onAction();
        } catch (error) {
            console.error('Failed to update saving amount:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this savings goal?')) return;
        try {
            await api.delete(`/finance/savings/${id}`);
            onAction();
        } catch (error) {
            console.error('Failed to delete saving:', error);
        }
    };

    const totalSavings = savings.reduce((sum, s) => sum + s.amount, 0);
    const totalTarget = savings.reduce((sum, s) => sum + s.target, 0);
    const overallProgress = totalTarget > 0 ? (totalSavings / totalTarget) * 100 : 0;

    return (
        <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] p-8 shadow-sm overflow-hidden relative">
            <div className="absolute -right-24 -top-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">savings</span>
                            Savings Allotment
                        </h3>
                        <p className="text-sm text-slate-500 font-medium">Grow your wealth and reach your financial targets.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{currencySymbol}{totalSavings.toLocaleString()}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Saved</p>
                        </div>
                        <button
                            onClick={() => setShowAdd(!showAdd)}
                            className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                        >
                            <span className="material-symbols-outlined">{showAdd ? 'close' : 'add'}</span>
                        </button>
                    </div>
                </div>

                {showAdd && (
                    <motion.form
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onSubmit={handleAdd}
                        className="mb-8 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4"
                    >
                        <input
                            type="text" required placeholder="Goal Title (e.g. Emergency Fund)"
                            className="bg-white dark:bg-[#192233] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                            value={newSaving.title} onChange={e => setNewSaving({ ...newSaving, title: e.target.value })}
                        />
                        <input
                            type="number" required placeholder="Current Amount"
                            className="bg-white dark:bg-[#192233] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                            value={newSaving.amount} onChange={e => setNewSaving({ ...newSaving, amount: e.target.value })}
                        />
                        <input
                            type="number" required placeholder="Target Amount"
                            className="bg-white dark:bg-[#192233] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                            value={newSaving.target} onChange={e => setNewSaving({ ...newSaving, target: e.target.value })}
                        />
                        <button
                            type="submit" disabled={loading}
                            className="bg-primary text-white font-black rounded-xl text-sm py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add Goal'}
                        </button>
                    </motion.form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savings.length === 0 ? (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                            <span className="material-symbols-outlined text-4xl mb-2">account_balance_wallet</span>
                            <p className="text-sm font-bold uppercase tracking-widest text-slate-300">No savings goals yet</p>
                        </div>
                    ) : (
                        savings.map(s => {
                            const progress = (s.amount / s.target) * 100;
                            return (
                                <div key={s._id} className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 hover:border-primary/20 transition-colors group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{s.title}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{s.category}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(s._id)}
                                            className="text-slate-300 hover:text-rose-500 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>

                                    <div className="flex items-baseline justify-between mb-2">
                                        <p className="text-lg font-black text-slate-900 dark:text-white">
                                            {currencySymbol}{s.amount.toLocaleString()}
                                            <span className="text-slate-400 text-xs font-bold ml-1">/ {currencySymbol}{s.target.toLocaleString()}</span>
                                        </p>
                                        <span className="text-xs font-black text-primary">{Math.min(100, Math.round(progress))}%</span>
                                    </div>

                                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-6">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, progress)}%` }}
                                            className="h-full bg-primary rounded-full"
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUpdateAmount(s._id, s.title, s.amount, 100)}
                                            className="flex-1 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white hover:border-primary transition-all"
                                        >
                                            + {currencySymbol}100
                                        </button>
                                        <button
                                            onClick={() => handleUpdateAmount(s._id, s.title, s.amount, 500)}
                                            className="flex-1 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white hover:border-primary transition-all"
                                        >
                                            + {currencySymbol}500
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {savings.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Overall Progress</p>
                                <p className="text-sm font-black text-slate-900 dark:text-white">{Math.round(overallProgress)}% toward targets</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-wider">On Track</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavingsPanel;
