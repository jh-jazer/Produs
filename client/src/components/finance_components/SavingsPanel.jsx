import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import ConfirmDialog from '../ui/ConfirmDialog';
import useConnectivityStore from '../../store/useConnectivityStore';

const SavingsPanel = ({ savings, currencySymbol, onAction }) => {
    const isOnline = useConnectivityStore(state => state.isOnline);
    const addToQueue = useConnectivityStore(state => state.addToQueue);
    const [showAdd, setShowAdd] = useState(false);
    const [fundingGoal, setFundingGoal] = useState(null); // stores saving object
    const [fundAmount, setFundAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [newGoal, setNewGoal] = useState({ title: '', target: '', initialAmount: '' });

    const handleAdd = async (e) => {
        e.preventDefault();
        const goalData = {
            ...newGoal,
            target: parseFloat(newGoal.target),
            initialAmount: parseFloat(newGoal.initialAmount) || 0,
            amount: parseFloat(newGoal.initialAmount) || 0,
            type: 'new'
        };

        if (!isOnline) {
            addToQueue({
                id: `temp-saving-${Date.now()}`,
                type: 'finance-saving',
                method: 'POST',
                url: '/finance/savings',
                data: goalData
            });
            setShowAdd(false);
            setNewGoal({ title: '', target: '', initialAmount: '' });
            if (onAction) onAction();
            return;
        }

        setLoading(true);
        try {
            await api.post('/finance/savings', goalData);
            onAction();
            setShowAdd(false);
            setNewGoal({ title: '', target: '', initialAmount: '' });
        } catch (error) {
            console.error('Failed to add goal:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFund = async (e) => {
        e.preventDefault();
        if (!fundingGoal) return;
        const amount = parseFloat(fundAmount);
        if (isNaN(amount) || amount <= 0) return;

        if (!isOnline) {
            addToQueue({
                id: `temp-fund-${Date.now()}`,
                type: 'finance-saving',
                method: 'POST',
                url: '/finance/savings',
                data: {
                    goalId: fundingGoal._id,
                    amount: amount,
                    type: 'fund'
                }
            });
            setFundingGoal(null);
            setFundAmount('');
            if (onAction) onAction();
            return;
        }

        setLoading(true);
        try {
            await api.post('/finance/savings', {
                goalId: fundingGoal._id,
                amount: amount,
                type: 'fund'
            });
            onAction();
            setFundingGoal(null);
            setFundAmount('');
        } catch (error) {
            console.error('Failed to fund goal:', error);
        } finally {
            setLoading(false);
        }
    };

    const [confirmDelete, setConfirmDelete] = useState(null);

    const handleDelete = async (id) => {
        if (!isOnline) {
            addToQueue({
                id,
                type: 'finance-saving',
                method: 'DELETE',
                url: `/finance/savings/${id}`
            });
            if (onAction) onAction();
            return;
        }

        try {
            await api.delete(`/finance/savings/${id}`);
            onAction();
        } catch (error) {
            console.error('Failed to delete goal:', error);
        }
    };

    const totalSavings = savings.reduce((sum, s) => sum + s.amount, 0);
    const totalTarget = savings.reduce((sum, s) => sum + s.target, 0);
    const overallProgress = totalTarget > 0 ? (totalSavings / totalTarget) * 100 : 0;

    return (
        <>
            <ConfirmDialog
                isOpen={!!confirmDelete}
                title="Remove Savings Goal"
                message="Are you sure you want to remove this savings goal? This cannot be undone."
                confirmLabel="Remove"
                onConfirm={() => { handleDelete(confirmDelete); setConfirmDelete(null); }}
                onCancel={() => setConfirmDelete(null)}
            />
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
                            onClick={() => setShowAdd(true)}
                            className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                        >
                            <span className="material-symbols-outlined">add</span>
                        </button>
                    </div>
                </div>

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
                                <div key={s._id} className={`p-6 rounded-2xl border transition-colors group ${
                                    s.isPending 
                                        ? 'bg-amber-50/10 dark:bg-amber-500/5 border-amber-200/50 dark:border-amber-800/30' 
                                        : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 hover:border-primary/20'
                                }`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <h4 className="font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{s.title}</h4>
                                                {s.isPending && (
                                                    <span className="flex-shrink-0 animate-spin material-symbols-outlined text-[12px] text-amber-500">sync</span>
                                                )}
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{s.category}</p>
                                        </div>
                                        <button
                                            onClick={() => setConfirmDelete(s._id)}
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
                                            className={`h-full bg-primary rounded-full transition-all duration-700 ${s.isPending ? 'opacity-50 animate-pulse' : ''}`}
                                        />
                                    </div>

                                    <button
                                        onClick={() => {
                                            setFundingGoal(s);
                                            setFundAmount('');
                                        }}
                                        className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span>
                                        Add Funds
                                    </button>
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

            {/* Add Goal Modal */}
            {showAdd && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowAdd(false)}></div>
                    <form 
                        onSubmit={handleAdd} 
                        className="relative w-full max-w-md bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 flex flex-col gap-6"
                    >
                        <div className="flex justify-between items-center mb-1">
                            <div>
                                <h4 className="text-sm font-black dark:text-white uppercase tracking-wider">New Savings Goal</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Plan for your future</p>
                            </div>
                            <button type="button" onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                                <input
                                    required type="text" placeholder="e.g. Dream House"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
                                    value={newGoal.title} onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Starting Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">{currencySymbol}</span>
                                        <input
                                            required type="number" placeholder="0.00"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
                                            value={newGoal.initialAmount} onChange={e => setNewGoal({ ...newGoal, initialAmount: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">{currencySymbol}</span>
                                        <input
                                            required type="number" placeholder="0.00"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
                                            value={newGoal.target} onChange={e => setNewGoal({ ...newGoal, target: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-2 disabled:opacity-50">
                            {loading ? 'Creating...' : 'Create Goal'}
                        </button>
                    </form>
                </div>,
                document.body
            )}

            {/* Fund Modal */}
            {fundingGoal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setFundingGoal(null)}></div>
                    <form 
                        onSubmit={handleFund} 
                        className="relative w-full max-w-sm bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 flex flex-col gap-6"
                    >
                        <div className="flex justify-between items-center mb-1">
                            <div>
                                <h4 className="text-sm font-black dark:text-white uppercase tracking-wider">Add Savings</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Focus: {fundingGoal.title}</p>
                            </div>
                            <button type="button" onClick={() => setFundingGoal(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deposit Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">{currencySymbol}</span>
                                <input
                                    autoFocus
                                    required type="number" step="0.01" placeholder="0.00"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
                                    value={fundAmount} onChange={e => setFundAmount(e.target.value)}
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full py-3 bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                            {loading ? 'Processing...' : 'Confirm Deposit'}
                        </button>
                    </form>
                </div>,
                document.body
            )}
            </div>
        </>
    );
};

export default SavingsPanel;
