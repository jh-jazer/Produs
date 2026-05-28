import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmDialog from '../ui/ConfirmDialog';
import DashboardPanel from '../ui/DashboardPanel';

const DebtManager = ({ debts, currencySymbol, onAction, addFinanceItem, updateFinanceItem, deleteFinanceItem }) => {
    const [showAdd, setShowAdd] = useState(false);
    const [summaryView, setSummaryView] = useState('overall'); // 'overall' or specific month string
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
        const debtData = {
            ...newDebt,
            amount: parseFloat(newDebt.amount),
            total: parseFloat(newDebt.amount) 
        };

        await addFinanceItem('debt', debtData);
        if (onAction) onAction();
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
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        if (!showPayModal) return;
        const payment = parseFloat(payAmount);
        if (isNaN(payment) || payment <= 0) return;
        
        const updatedAmount = Math.max(0, showPayModal.amount - payment);

        await updateFinanceItem(showPayModal._id, 'debt', { amount: updatedAmount });
        if (onAction) onAction();
        setShowPayModal(null);
        setPayAmount('');
    };

    const [confirmDelete, setConfirmDelete] = useState(null);

    const handleDelete = async (id) => {
        await deleteFinanceItem(id);
        if (onAction) onAction();
    };

    const sortedDebts = [...debts].sort((a, b) => {
        if (a.nature !== b.nature) return a.nature === 'debt' ? -1 : 1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });

    return (
        <>
            <ConfirmDialog
                isOpen={!!confirmDelete}
                title="Remove Record"
                message="Are you sure you want to remove this cash flow record?"
                confirmLabel="Remove"
                onConfirm={() => { handleDelete(confirmDelete); setConfirmDelete(null); }}
                onCancel={() => setConfirmDelete(null)}
            />
            <div className="min-h-[300px] flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/35 dark:text-white/20">CASH FLOW TRACKER</span>
                    <button
                        onClick={() => setShowAdd(true)}
                        className="size-8 rounded-sm border border-black/10 dark:border-white/10 text-black/40 dark:text-white/40 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                    </button>
                </div>
            {/* Summary Totals */}
            {debts.length > 0 && (() => {
                // Calculate Monthly Statistics including Recurring items
                const monthlyStats = debts.reduce((acc, debt) => {
                    if (!debt.dueDate) return acc;
                    const startDate = new Date(debt.dueDate);
                    const iterations = debt.isMonthly ? (parseInt(debt.monthsLeft) || 1) : 1;

                    for (let i = 0; i < iterations; i++) {
                        const date = new Date(startDate);
                        date.setMonth(startDate.getMonth() + i);
                        const m = date.toLocaleString('default', { month: 'short', year: 'numeric' });
                        
                        if (!acc[m]) acc[m] = { income: 0, debt: 0 };
                        if (debt.nature === 'income') {
                            acc[m].income += debt.amount;
                        } else {
                            acc[m].debt += debt.amount;
                        }
                    }
                    return acc;
                }, {});

                const availableMonths = Object.keys(monthlyStats).sort((a, b) => {
                    const dateA = new Date(a);
                    const dateB = new Date(b);
                    return dateA - dateB;
                });

                let displayIncome = 0;
                let displayDebt = 0;

                if (summaryView === 'overall') {
                    // Overall total now includes all recurring installments
                    debts.forEach(d => {
                        const iterations = d.isMonthly ? (parseInt(d.monthsLeft) || 1) : 1;
                        const totalAmount = d.amount * iterations;
                        if (d.nature === 'income') {
                            displayIncome += totalAmount;
                        } else {
                            displayDebt += totalAmount;
                        }
                    });
                } else {
                    const stats = monthlyStats[summaryView] || { income: 0, debt: 0 };
                    displayIncome = stats.income;
                    displayDebt = stats.debt;
                }
                const displayNet = displayIncome - displayDebt;

                    return (
                        <div className="p-8 rounded-sm border border-black/10 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] flex flex-col gap-4">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black text-black/35 dark:text-white/20 uppercase tracking-[0.4em]">TIME FRAME</span>
                                <select 
                                    value={summaryView}
                                    onChange={(e) => setSummaryView(e.target.value)}
                                    className="text-[10px] font-black uppercase bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm px-3 py-1 outline-none text-black dark:text-white cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-all"
                                >
                                    <option value="overall" className="bg-white dark:bg-[#0a0a0a] text-black dark:text-white">TOTAL OVERVIEW</option>
                                    {availableMonths.map(m => (
                                        <option key={m} value={m} className="bg-white dark:bg-[#0a0a0a] text-black dark:text-white">{m.toUpperCase()} REPORT</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[8px] font-black text-black/40 dark:text-white/20 uppercase tracking-widest">INCOMING</span>
                                    <span className="text-xl font-black text-black dark:text-white italic">+{currencySymbol}{displayIncome.toLocaleString()}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[8px] font-black text-black/40 dark:text-white/20 uppercase tracking-widest">OUTBOUND</span>
                                    <span className="text-xl font-black text-black/50 dark:text-white/40 italic">-{currencySymbol}{displayDebt.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-6 border-t border-black/10 dark:border-white/5 flex justify-between items-center">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-black/25 dark:text-white/10 uppercase tracking-[0.4em]">NET CASH FLOW</span>
                                </div>
                                <span className={`text-3xl font-black tracking-tighter italic ${displayNet >= 0 ? 'text-black dark:text-white' : 'text-rose-500'}`}>
                                    {displayNet >= 0 ? '+' : '-'}{currencySymbol}{Math.abs(displayNet).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    );
            })()}

                <div className="space-y-3 flex-1 mt-4">
                    {sortedDebts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 opacity-10 gap-4">
                            <span className="material-symbols-outlined text-4xl">contract</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">NO CASH FLOW ENTRIES</span>
                        </div>
                    ) : (
                        sortedDebts.map(debt => {
                            const isIncome = debt.nature === 'income';
                            return (
                                <div key={debt._id} className="group p-5 rounded-sm border border-black/10 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-3">
                                                <span className={`material-symbols-outlined text-sm ${isIncome ? 'text-black dark:text-white' : 'text-black/30 dark:text-white/20'}`}>
                                                    {isIncome ? 'trending_up' : 'trending_down'}
                                                </span>
                                                <span className="text-[11px] font-black text-black dark:text-white uppercase tracking-wider">{debt.title}</span>
                                                <button
                                                    onClick={() => setConfirmDelete(debt._id)}
                                                    className="opacity-0 group-hover:opacity-100 text-black/20 dark:text-white/10 hover:text-rose-500 transition-all p-1"
                                                >
                                                    <span className="material-symbols-outlined text-base">delete</span>
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-4 text-[9px] font-black text-black/35 dark:text-white/20 uppercase tracking-widest">
                                                {debt.dueDate && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[10px]">calendar_today</span>
                                                        {isIncome ? 'ETA' : 'DUE'}: {new Date(debt.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                )}
                                                {debt.isMonthly && <span>RECURRING {debt.monthsLeft} REMAINING</span>}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`text-xl font-black italic ${isIncome ? 'text-black dark:text-white' : 'text-black/45 dark:text-white/20'}`}>
                                                {isIncome ? '+' : '-'}{currencySymbol}{debt.amount.toLocaleString()}
                                            </span>
                                            {!isIncome && (
                                                <button
                                                    onClick={() => { setShowPayModal(debt); setPayAmount(''); }}
                                                    className="px-3 py-1 bg-black/5 dark:bg-white/5 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black border border-black/10 dark:border-white/10 rounded-sm text-[8px] font-black uppercase tracking-widest transition-all mt-2 text-black dark:text-white"
                                                >
                                                    PAY
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>


            {/* Add Record Modal */}
            {showAdd && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-[#121212]/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowAdd(false)}></div>
                    <DashboardPanel
                        className="w-full max-w-sm z-10 animate-in zoom-in-95 duration-200"
                        title="New Cash Flow Record"
                        subtitle="Plan your upcoming finances"
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

                        {/* Nature Toggle */}
                        <div className="flex bg-slate-100 dark:bg-[#000000] p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setNewDebt({ ...newDebt, nature: 'debt', type: 'personal' })}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase transition-all rounded-lg ${
                                    newDebt.nature === 'debt' 
                                        ? 'bg-white dark:bg-[#121212] text-rose-500 shadow-none'
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
                                        ? 'bg-white dark:bg-[#121212] text-emerald-500 shadow-none'
                                        : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                <span className="material-symbols-outlined text-sm">trending_up</span>
                                Receivable
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                                <input
                                    required type="text" placeholder={newDebt.nature === 'income' ? "e.g. Freelance Payout" : "e.g. Bill Payment"}
                                    className="w-full bg-slate-50 dark:bg-[#000000] border dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
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
                                            className="w-full bg-slate-50 dark:bg-[#000000] border dark:border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
                                            value={newDebt.amount} onChange={e => setNewDebt({ ...newDebt, amount: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-slate-50 dark:bg-[#000000] border dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
                                        value={newDebt.dueDate} onChange={e => setNewDebt({ ...newDebt, dueDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                <select
                                    className="w-full bg-slate-50 dark:bg-[#000000] border dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
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

                            <div className="bg-slate-50 dark:bg-[#000000]/50 p-4 rounded-xl border border-slate-100 dark:border-white/10/50 flex flex-col gap-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={newDebt.isMonthly}
                                            onChange={e => setNewDebt({ ...newDebt, isMonthly: e.target.checked })}
                                        />
                                        <div className="w-10 h-6 bg-slate-200 dark:bg-[#121212] rounded-full peer peer-checked:bg-primary transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4"></div>
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
                                            className="w-full bg-white dark:bg-[#000000] border dark:border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
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
                            Save {newDebt.nature === 'income' ? 'Receivable' : 'Debt'}
                        </button>
                    </form>
                    </DashboardPanel>
                </div>,
                document.body
            )}

            {/* Payment Modal (Only for Debts) */}
            {showPayModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-[#121212]/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowPayModal(null)}></div>
                    <DashboardPanel
                        className="w-full max-w-sm z-10 animate-in zoom-in-95 duration-200"
                        title="Make Payment"
                        subtitle={`Reducing ${showPayModal.title}`}
                        headerExtra={
                            <button type="button" onClick={() => setShowPayModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        }
                    >
                    <form 
                        onSubmit={handlePayment} 
                        className="flex flex-col gap-6"
                    >

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount to Pay</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">{currencySymbol}</span>
                                <input
                                    autoFocus
                                    required type="number" step="0.01" placeholder="0.00"
                                    className="w-full bg-slate-50 dark:bg-[#000000] border dark:border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
                                    value={payAmount} onChange={e => setPayAmount(e.target.value)}
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full py-3 bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                            CONFIRM PAYMENT
                        </button>
                    </form>
                    </DashboardPanel>
                </div>,
                document.body
            )}
            </div>
        </>
    );
};

export default DebtManager;
