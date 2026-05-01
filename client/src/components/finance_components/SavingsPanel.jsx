import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import ConfirmDialog from '../ui/ConfirmDialog';
import DashboardPanel from '../ui/DashboardPanel';

const SavingsPanel = ({ savings, currencySymbol, onAction, addFinanceItem, updateFinanceItem, deleteFinanceItem }) => {
    const [showAdd, setShowAdd] = useState(false);
    const [fundingGoal, setFundingGoal] = useState(null); // stores saving object
    const [fundAmount, setFundAmount] = useState('');
    const [newGoal, setNewGoal] = useState({ title: '', target: '', initialAmount: '' });
    const [loading, setLoading] = useState(false);

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const goalData = {
                ...newGoal,
                target: parseFloat(newGoal.target),
                initialAmount: parseFloat(newGoal.initialAmount) || 0,
                amount: parseFloat(newGoal.initialAmount) || 0,
                type: 'new'
            };

            await addFinanceItem('saving', goalData);
            if (onAction) onAction();
            setShowAdd(false);
            setNewGoal({ title: '', target: '', initialAmount: '' });
        } finally {
            setLoading(false);
        }
    };

    const handleFund = async (e) => {
        e.preventDefault();
        if (!fundingGoal) return;
        const amount = parseFloat(fundAmount);
        if (isNaN(amount) || amount <= 0) return;

        setLoading(true);
        try {
            const newAmount = (fundingGoal.amount || 0) + amount;
            await updateFinanceItem(fundingGoal._id, 'saving', { amount: newAmount });
            if (onAction) onAction();
            setFundingGoal(null);
            setFundAmount('');
        } finally {
            setLoading(false);
        }
    };

    const [confirmDelete, setConfirmDelete] = useState(null);

    const handleDelete = async (id) => {
        await deleteFinanceItem(id);
        if (onAction) onAction();
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
            <div className="w-full overflow-hidden relative flex flex-col gap-8">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">SAVINGS TRACKER</span>
                    <button
                        onClick={() => setShowAdd(true)}
                        className="size-8 rounded-sm border border-white/10 text-white/40 hover:bg-white hover:text-black transition-all flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                    </button>
                </div>

                <div className="p-8 rounded-sm border border-white/5 bg-white/[0.02]">
                    <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">TOTAL SAVINGS</p>
                        <p className="text-4xl font-black text-white italic tracking-tighter">{currencySymbol}{totalSavings.toLocaleString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savings.length === 0 ? (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center opacity-10 gap-4 border border-dashed border-white/5 rounded-sm">
                            <span className="material-symbols-outlined text-4xl">account_balance_wallet</span>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em]">NO SAVINGS GOALS</p>
                        </div>
                    ) : (
                        savings.map(s => {
                            const progress = (s.amount / s.target) * 100;
                            return (
                                <div key={s._id} className="p-6 rounded-sm border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 transition-all group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-[11px] font-black text-white uppercase tracking-wider">{s.title}</h4>
                                                {s.isPending && (
                                                    <span className="animate-spin material-symbols-outlined text-[10px] text-white/20">sync</span>
                                                )}
                                            </div>
                                            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">{s.category}</p>
                                        </div>
                                        <button
                                            onClick={() => setConfirmDelete(s._id)}
                                            className="text-white/10 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>

                                    <div className="flex items-baseline justify-between mb-2">
                                        <p className="text-lg font-black text-white italic">
                                            {currencySymbol}{s.amount.toLocaleString()}
                                            <span className="text-white/20 text-[10px] font-black ml-2 uppercase">/ {currencySymbol}{s.target.toLocaleString()}</span>
                                        </p>
                                        <span className="text-[10px] font-black text-white/40 italic">{Math.min(100, Math.round(progress))}%</span>
                                    </div>

                                    <div className="w-full bg-white/5 h-[2px] rounded-sm overflow-hidden mb-6">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, progress)}%` }}
                                            className={`h-full bg-white/40 rounded-sm transition-all duration-700 ${s.isPending ? 'opacity-50 animate-pulse' : ''}`}
                                        />
                                    </div>

                                    <button
                                        onClick={() => {
                                            setFundingGoal(s);
                                            setFundAmount('');
                                        }}
                                        className="w-full py-2 border border-white/5 bg-white/5 rounded-sm text-[9px] font-black uppercase tracking-[0.2em] text-white/40 hover:bg-white hover:text-black hover:border-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span>
                                        ADD SAVINGS
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

                {savings.length > 0 && (
                    <div className="pt-8 border-t border-white/5 flex items-center justify-between opacity-40">
                        <div className="flex flex-col gap-1">
                            <p className="text-[8px] font-black text-white uppercase tracking-widest">OVERALL PROGRESS</p>
                            <p className="text-[10px] font-black text-white italic">{Math.round(overallProgress)}% TOWARDS GOAL</p>
                        </div>
                        <span className="text-[8px] font-black text-white border border-white/20 px-3 py-1 rounded-sm uppercase tracking-widest">STABLE</span>
                    </div>
                )}
            </div>

            {/* Add Goal Modal */}
            {showAdd && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-[#121212]/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowAdd(false)}></div>
                    <DashboardPanel
                        className="w-full max-w-md z-10 animate-in zoom-in-95 duration-200"
                        title="New Savings Goal"
                        subtitle="Plan for your future"
                        headerExtra={
                            <button type="button" onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        }
                    >
                    <form 
                        onSubmit={handleAdd} 
                        className="flex flex-col gap-6"
                    >

                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                                <input
                                    required type="text" placeholder="e.g. Dream House"
                                    className="w-full bg-slate-50 dark:bg-[#000000] border dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
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
                                            className="w-full bg-slate-50 dark:bg-[#000000] border dark:border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
                                            value={newGoal.amount} onChange={e => setNewGoal({ ...newGoal, amount: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">{currencySymbol}</span>
                                        <input
                                            required type="number" placeholder="0.00"
                                            className="w-full bg-slate-50 dark:bg-[#000000] border dark:border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
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
                    </DashboardPanel>
                </div>,
                document.body
            )}

            {/* Fund Modal */}
            {fundingGoal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-[#121212]/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setFundingGoal(null)}></div>
                    <DashboardPanel
                        className="w-full max-w-sm z-10 animate-in zoom-in-95 duration-200"
                        title="Add Savings"
                        subtitle={`Focus: ${fundingGoal.title}`}
                        headerExtra={
                            <button type="button" onClick={() => setFundingGoal(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        }
                    >
                    <form 
                        onSubmit={handleFund} 
                        className="flex flex-col gap-6"
                    >

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deposit Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">{currencySymbol}</span>
                                <input
                                    autoFocus
                                    required type="number" step="0.01" placeholder="0.00"
                                    className="w-full bg-slate-50 dark:bg-[#000000] border dark:border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
                                    value={fundAmount} onChange={e => setFundAmount(e.target.value)}
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full py-3 bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                            {loading ? 'Processing...' : 'DEPOSIT FUNDS'}
                        </button>
                    </form>
                    </DashboardPanel>
                </div>,
                document.body
            )}
        </>
    );
};

export default SavingsPanel;
