import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const DebtManager = ({ debts, currencySymbol, onAction }) => {
    const [showAdd, setShowAdd] = useState(false);
    const [showPayModal, setShowPayModal] = useState(null); // stores debt object
    const [payAmount, setPayAmount] = useState('');
    const [newDebt, setNewDebt] = useState({ 
        title: '', 
        amount: '', 
        type: 'personal', 
        nature: 'debt', 
        dueDate: '', 
        isMonthly: false, 
        monthsLeft: '' 
    });

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/finance/debts', {
                ...newDebt,
                amount: parseFloat(newDebt.amount),
                total: parseFloat(newDebt.amount) 
            });
            onAction();
            setShowAdd(false);
            setNewDebt({ 
                title: '', 
                amount: '', 
                type: 'personal', 
                nature: 'debt', 
                dueDate: '', 
                isMonthly: false, 
                monthsLeft: '' 
            });
        } catch (error) {
            console.error('Failed to add record:', error);
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
            console.error('Failed to update record:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this record?')) return;
        try {
            await api.delete(`/finance/debts/${id}`);
            onAction();
        } catch (error) {
            console.error('Failed to delete record:', error);
        }
    };

    const sortedDebts = [...debts].sort((a, b) => {
        if (a.nature !== b.nature) return a.nature === 'debt' ? -1 : 1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });

    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192233] p-6 shadow-sm min-h-[300px] flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-6">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">account_balance</span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upcoming Cash Flow</h3>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Debts & Expected Income</p>
                </div>
                <button
                    onClick={() => setShowAdd(true)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-xl">add_circle</span>
                </button>
            </div>

            <div className="space-y-4 flex-1">
                {sortedDebts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-400 h-full">
                        <span className="material-symbols-outlined text-4xl mb-2 opacity-20">contract</span>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-300">Clean Slate</p>
                    </div>
                ) : (
                    sortedDebts.map(debt => {
                        const isIncome = debt.nature === 'income';
                        return (
                            <div key={debt._id} className={`group p-4 rounded-xl border transition-all ${
                                isIncome 
                                    ? 'bg-emerald-50/30 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-800/30 hover:border-emerald-500/30' 
                                    : 'bg-slate-50/50 dark:bg-slate-900/20 border-slate-100 dark:border-slate-800 hover:border-primary/20'
                            }`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className={`material-symbols-outlined text-sm ${isIncome ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                {isIncome ? 'trending_up' : 'trending_down'}
                                            </span>
                                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{debt.title}</span>
                                            <button
                                                onClick={() => handleDelete(debt._id)}
                                                className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all p-0.5"
                                            >
                                                <span className="material-symbols-outlined text-base">delete</span>
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            {debt.dueDate && (
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[10px]">calendar_today</span>
                                                    {isIncome ? 'Expected' : 'Due'}: {new Date(debt.dueDate).toLocaleDateString('default', { month: 'short', day: 'numeric' })}
                                                </span>
                                            )}
                                            {debt.isMonthly && (
                                                <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
                                                    isIncome ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'
                                                }`}>
                                                    <span className="material-symbols-outlined text-[10px]">sync</span>
                                                    Monthly {debt.monthsLeft ? `• ${debt.monthsLeft} left` : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                            {isIncome ? 'Incoming' : 'Outbound'}
                                        </p>
                                        <span className={`text-base font-black ${isIncome ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                                            {isIncome ? '+' : ''}{currencySymbol}{debt.amount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                
                                {!isIncome && (
                                    <button
                                        onClick={() => {
                                            setShowPayModal(debt);
                                            setPayAmount('');
                                        }}
                                        className="w-full mt-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors dark:text-slate-300 shadow-sm"
                                    >
                                        Make Payment
                                    </button>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add Record Modal */}
            {showAdd && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowAdd(false)}></div>
                    <form 
                        onSubmit={handleAdd} 
                        className="relative w-full max-w-sm bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 flex flex-col gap-6"
                    >
                        <div className="flex justify-between items-center mb-1">
                            <div>
                                <h4 className="text-sm font-black dark:text-white uppercase tracking-wider">New Cash Flow Record</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Plan your upcoming finances</p>
                            </div>
                            <button type="button" onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        {/* Nature Toggle */}
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setNewDebt({ ...newDebt, nature: 'debt', type: 'personal' })}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase transition-all rounded-lg ${
                                    newDebt.nature === 'debt' 
                                        ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' 
                                        : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                <span className="material-symbols-outlined text-sm">trending_down</span>
                                Expense / Debt
                            </button>
                            <button
                                type="button"
                                onClick={() => setNewDebt({ ...newDebt, nature: 'income', type: 'salary' })}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase transition-all rounded-lg ${
                                    newDebt.nature === 'income' 
                                        ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm' 
                                        : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                <span className="material-symbols-outlined text-sm">trending_up</span>
                                Upcoming Income
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                                <input
                                    required type="text" placeholder={newDebt.nature === 'income' ? "e.g. Freelance Payout" : "e.g. Bill Payment"}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
                                    value={newDebt.title} onChange={e => setNewDebt({ ...newDebt, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expected Amount</label>
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
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
                                        value={newDebt.dueDate} onChange={e => setNewDebt({ ...newDebt, dueDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                <select
                                    className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
                                    value={newDebt.type} onChange={e => setNewDebt({ ...newDebt, type: e.target.value })}
                                >
                                    {newDebt.nature === 'debt' ? (
                                        <>
                                            <option value="personal">Personal</option>
                                            <option value="credit">Credit Card</option>
                                            <option value="loan">Loan</option>
                                            <option value="other">Other</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="salary">Salary</option>
                                            <option value="freelance">Freelance</option>
                                            <option value="investment">Investment</option>
                                            <option value="other">Other</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 flex flex-col gap-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={newDebt.isMonthly}
                                            onChange={e => setNewDebt({ ...newDebt, isMonthly: e.target.checked })}
                                        />
                                        <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-primary transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4"></div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Is this recurring?</p>
                                        <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Repeats monthly for the given duration</p>
                                    </div>
                                </label>

                                {newDebt.isMonthly && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className="flex flex-col gap-1.5"
                                    >
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration (Months)</label>
                                        <input
                                            type="number" placeholder="e.g. 12"
                                            className="w-full bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
                                            value={newDebt.monthsLeft} onChange={e => setNewDebt({ ...newDebt, monthsLeft: e.target.value })}
                                        />
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className={`w-full py-3 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all mt-2 ${
                                newDebt.nature === 'income' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-primary shadow-primary/20'
                            }`}
                        >
                            Save {newDebt.nature === 'income' ? 'Income' : 'Debt'}
                        </button>
                    </form>
                </div>,
                document.body
            )}

            {/* Payment Modal (Only for Debts) */}
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
