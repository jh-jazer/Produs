import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';

const DebtManager = ({ debts, currencySymbol, onAction }) => {
    const [showAdd, setShowAdd] = useState(false);
    const [showPayModal, setShowPayModal] = useState(null); // stores debt object
    const [payAmount, setPayAmount] = useState('');
    const [newDebt, setNewDebt] = useState({ title: '', amount: '', total: '', type: 'loan' });

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/finance/debts', {
                ...newDebt,
                amount: parseFloat(newDebt.amount),
                total: parseFloat(newDebt.total)
            });
            onAction();
            setShowAdd(false);
            setNewDebt({ title: '', amount: '', total: '', type: 'loan' });
        } catch (error) {
            console.error('Failed to add debt:', error);
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        if (!showPayModal) return;
        try {
            const payment = parseFloat(payAmount);
            if (isNaN(payment) || payment <= 0) return;
            
            await api.patch(`/finance/debts/${showPayModal._id}`, { 
                amount: Math.max(0, showPayModal.amount - payment) 
            });
            onAction();
            setShowPayModal(null);
            setPayAmount('');
        } catch (error) {
            console.error('Failed to update debt:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this debt record?')) return;
        try {
            await api.delete(`/finance/debts/${id}`);
            onAction();
        } catch (error) {
            console.error('Failed to delete debt:', error);
        }
    };

    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] p-6 shadow-sm min-h-[300px] flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-6">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500">account_balance_wallet</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Debts to Pay</h3>
                </div>
                <button
                    onClick={() => setShowAdd(true)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-xl">add_circle</span>
                </button>
            </div>

            <div className="space-y-6 flex-1">
                {debts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-400 h-full">
                        <span className="material-symbols-outlined text-3xl mb-1">check_circle</span>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-300">No Active Debts</p>
                    </div>
                ) : (
                    debts.map(debt => {
                        const progress = (debt.amount / debt.total) * 100;
                        return (
                            <div key={debt._id} className="group">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{debt.title}</span>
                                        <button
                                            onClick={() => handleDelete(debt._id)}
                                            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all p-0.5"
                                        >
                                            <span className="material-symbols-outlined text-base">delete</span>
                                        </button>
                                    </div>
                                    <span className="text-sm font-black text-slate-900 dark:text-white">
                                        {currencySymbol}{debt.amount.toLocaleString()} <span className="text-[10px] text-slate-400 font-bold">/ {currencySymbol}{debt.total.toLocaleString()}</span>
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-3 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, progress)}%` }}
                                        className={`h-full rounded-full transition-all duration-500 ${progress > 75 ? 'bg-red-500' : 'bg-primary'}`}
                                    ></motion.div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowPayModal(debt);
                                        setPayAmount('');
                                    }}
                                    className="w-full py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors dark:text-slate-300"
                                >
                                    Make Payment
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add Debt Modal */}
            {showAdd && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowAdd(false)}></div>
                    <form 
                        onSubmit={handleAdd} 
                        className="relative w-full max-w-md bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 flex flex-col gap-6"
                    >
                        <div className="flex justify-between items-center mb-1">
                            <div>
                                <h4 className="text-sm font-black dark:text-white uppercase tracking-wider">Add Debt Record</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Track what you owe</p>
                            </div>
                            <button type="button" onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                                <input
                                    required type="text" placeholder="e.g. Bank Loan"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
                                    value={newDebt.title} onChange={e => setNewDebt({ ...newDebt, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Remaining</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">{currencySymbol}</span>
                                        <input
                                            required type="number" placeholder="0.00"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
                                            value={newDebt.amount} onChange={e => setNewDebt({ ...newDebt, amount: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Debt</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">{currencySymbol}</span>
                                        <input
                                            required type="number" placeholder="0.00"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
                                            value={newDebt.total} onChange={e => setNewDebt({ ...newDebt, total: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="w-full py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-2">
                            Save Debt
                        </button>
                    </form>
                </div>,
                document.body
            )}

            {/* Payment Modal */}
            {showPayModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowPayModal(null)}></div>
                    <form 
                        onSubmit={handlePayment} 
                        className="relative w-full max-w-sm bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 flex flex-col gap-6"
                    >
                        <div className="flex justify-between items-center mb-1">
                            <div>
                                <h4 className="text-sm font-black dark:text-white uppercase tracking-wider">Make Payment</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Reducing {showPayModal.title}</p>
                            </div>
                            <button type="button" onClick={() => setShowPayModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount to Pay</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">{currencySymbol}</span>
                                <input
                                    autoFocus
                                    required type="number" step="0.01" placeholder="0.00"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
                                    value={payAmount} onChange={e => setPayAmount(e.target.value)}
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full py-3 bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                            Confirm Payment
                        </button>
                    </form>
                </div>,
                document.body
            )}
        </div>
    );
};

export default DebtManager;
