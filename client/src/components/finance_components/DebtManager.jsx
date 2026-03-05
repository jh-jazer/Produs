import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const DebtManager = ({ debts, currencySymbol, onAction }) => {
    const [showAdd, setShowAdd] = useState(false);
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

    const handlePayment = async (debtId, currentAmount) => {
        try {
            const payment = Math.min(currentAmount, 500);
            await api.patch(`/finance/debts/${debtId}`, { amount: currentAmount - payment });
            onAction();
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
                    onClick={() => setShowAdd(!showAdd)}
                    className={`p-1.5 rounded-lg transition-colors ${showAdd ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                    <span className="material-symbols-outlined text-xl">{showAdd ? 'close' : 'add_circle'}</span>
                </button>
            </div>

            {showAdd && (
                <form onSubmit={handleAdd} className="mb-6 space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2">
                    <input
                        required type="text" placeholder="Title (e.g. Bank Loan)"
                        className="w-full bg-white dark:bg-[#192233] border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-bold outline-none dark:text-white"
                        value={newDebt.title} onChange={e => setNewDebt({ ...newDebt, title: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            required type="number" placeholder="Remaining"
                            className="bg-white dark:bg-[#192233] border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-bold outline-none dark:text-white"
                            value={newDebt.amount} onChange={e => setNewDebt({ ...newDebt, amount: e.target.value })}
                        />
                        <input
                            required type="number" placeholder="Total"
                            className="bg-white dark:bg-[#192233] border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-bold outline-none dark:text-white"
                            value={newDebt.total} onChange={e => setNewDebt({ ...newDebt, total: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="w-full py-2 bg-primary text-white font-bold rounded-lg text-xs hover:opacity-90 transition-opacity">
                        Save Debt
                    </button>
                </form>
            )}

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
                                    onClick={() => handlePayment(debt._id, debt.amount)}
                                    className="w-full py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors dark:text-slate-300"
                                >
                                    Make Payment
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default DebtManager;
