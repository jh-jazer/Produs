import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardPanel from '../ui/DashboardPanel';
import ConfirmDialog from '../ui/ConfirmDialog';

const ChippedBorder = ({ opacity = 0.8 }) => (
  <div
    className="absolute inset-[-2px] rounded-sm pointer-events-none z-0"
    style={{
      border: '4px solid currentColor',
      opacity,
      clipPath: 'polygon(0% 0%, 15% 0%, 16% 2%, 18% 0%, 42% 0%, 43% 4%, 45% 0%, 78% 0%, 79% 2%, 81% 0%, 100% 0%, 100% 20%, 98% 22%, 100% 24%, 100% 55%, 97% 58%, 100% 61%, 100% 100%, 82% 100%, 81% 97%, 79% 100%, 38% 100%, 37% 96%, 35% 100%, 0% 100%, 0% 80%, 3% 78%, 0% 76%, 0% 35%, 2% 33%, 0% 31%)'
    }}
  />
);

const EmptyState = ({ text }) => (
  <div className="flex flex-col items-center justify-center pt-48 pb-10 opacity-40 text-center gap-6">
    <span className="material-symbols-outlined text-4xl opacity-20">terminal</span>
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-black uppercase tracking-[0.4em]">
        {text}
      </span>
      <span className="text-[8px] font-mono opacity-40 uppercase tracking-widest">
        SYSTEM_IDLE
      </span>
    </div>
  </div>
);

const FinancialBreakdown = ({ 
    selectedTransactions = [], 
    totalExpenses = 0, 
    localCurrency = '$', 
    setShowAddTx,
    updateFinanceItem,
    deleteFinanceItem,
    budgets = []
}) => {
    const [innerView, setInnerView] = useState('categories'); // 'categories' | 'ledger'
    const [editingTx, setEditingTx] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const categoryTotals = selectedTransactions
        .filter((t) => t.type === "expense")
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + (parseFloat(t.amount) || 0);
            return acc;
        }, {});

    const categories = Object.entries(categoryTotals)
        .map(([label, amount]) => ({
            label,
            amount,
            percent: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

    // Categories helper
    const budgetCategories = budgets.map(b => b.category);
    const availableCategories = budgetCategories.length > 0 ? budgetCategories : [
        'General', 'Food', 'Transport', 'Utilities', 'Entertainment',
        'Tech', 'Home', 'Fashion', 'Hobby', 'Fitness', 'Wellness',
        'Education', 'Travel', 'Vehicles', 'Gifts', 'Pets', 'Other'
    ];
    if (!availableCategories.includes('General')) availableCategories.push('General');

    const openEditModal = (tx) => {
        setEditingTx({
            ...tx,
            amount: tx.amount || '',
            date: tx.date ? new Date(tx.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });
    };

    const handleEditChange = (field, value) => {
        setEditingTx(prev => ({ ...prev, [field]: value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editingTx || !updateFinanceItem) return;
        const amountNum = parseFloat(editingTx.amount);
        if (isNaN(amountNum) || amountNum <= 0) return;

        await updateFinanceItem(editingTx._id, 'transaction', {
            title: editingTx.title,
            amount: amountNum,
            type: editingTx.type,
            category: editingTx.category,
            date: editingTx.date
        });
        setEditingTx(null);
    };

    const handleDelete = async (id) => {
        if (deleteFinanceItem) {
            await deleteFinanceItem(id);
        }
        setConfirmDelete(null);
    };

    return (
        <div className="flex flex-col gap-6 h-full relative z-10 pt-6 md:pt-8">
            <ConfirmDialog
                isOpen={!!confirmDelete}
                title="DELETE RECORD"
                message="Are you sure you want to delete this transaction from your history?"
                confirmLabel="DELETE"
                onConfirm={() => handleDelete(confirmDelete)}
                onCancel={() => setConfirmDelete(null)}
            />

            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.6em]">TRANSACTIONS</span>
            </div>

            <div className="flex-1 min-h-[350px]">
                <AnimatePresence mode="wait">
                    {innerView === 'categories' ? (
                        <motion.div
                            key="cats"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-4"
                        >
                            {categories.length > 0 ? (
                                categories.slice(0, 8).map((cat, i) => (
                                    <div key={cat.label} className="space-y-2">
                                        <div className="flex justify-between items-center px-1">
                                            <span className="font-black text-white/40 uppercase tracking-widest" style={{ fontSize: '1.25rem' }}>{cat.label}</span>
                                            <span className="font-black tracking-widest" style={{ fontSize: '1.25rem', color: '#f43f5e' }}>-{localCurrency}{cat.amount.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full bg-white/5 rounded-sm h-[2px] overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${cat.percent}%` }}
                                                className="h-full bg-white/30 transition-all duration-700" 
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <EmptyState text="NO DATA AVAILABLE" />
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="ledger"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar"
                        >
                            {selectedTransactions.length > 0 ? (
                                selectedTransactions.slice(0, 50).map((tx) => (
                                    <div key={tx._id} className="flex items-center justify-between p-2.5 rounded-sm bg-white/[0.02] border border-white/5 transition-all group hover:border-white/10">
                                        <div className="flex items-center gap-3">
                                            <div className="size-7 rounded-sm bg-white/5 flex items-center justify-center text-white/20 border border-white/10 shrink-0">
                                                <span className="material-symbols-outlined text-xs">{tx.type === 'income' ? 'payments' : tx.type === 'savings' ? 'savings' : 'shopping_bag'}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="font-black text-white uppercase tracking-wider leading-tight" style={{ fontSize: '1.2rem' }}>{tx.title}</p>
                                                <p className="font-black text-white/30 uppercase tracking-widest" style={{ fontSize: '0.85rem' }}>{tx.category}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <p 
                                                className="font-black tracking-wider"
                                                style={{ fontSize: '1.2rem', color: tx.type === 'income' || tx.type === 'upcoming' ? '#10b981' : '#f43f5e' }}
                                            >
                                                {tx.type === 'expense' || tx.type === 'debt' ? '-' : ''}{localCurrency}{parseFloat(tx.amount).toLocaleString()}
                                            </p>
                                            <div className="opacity-60 md:opacity-0 md:group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                                                <button 
                                                    onClick={() => openEditModal(tx)}
                                                    className="p-1 rounded-sm bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                                                    title="Edit Transaction"
                                                >
                                                    <span className="material-symbols-outlined text-xs">edit</span>
                                                </button>
                                                <button 
                                                    onClick={() => setConfirmDelete(tx._id)}
                                                    className="p-1 rounded-sm bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-500 transition-all"
                                                    title="Delete Transaction"
                                                >
                                                    <span className="material-symbols-outlined text-xs">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <EmptyState text="NO ENTRIES FOUND" />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* View Toggle */}
            <div className="flex items-center justify-end mt-auto pt-6 border-t border-white/5">
                <div className="flex bg-white/5 p-1 rounded-sm border border-white/5">
                    {[
                        { id: 'categories', label: 'CHART' },
                        { id: 'ledger', label: 'LIST' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setInnerView(tab.id)}
                            className={`px-4 py-2 rounded-sm text-[8px] font-black uppercase tracking-[0.2em] transition-all ${
                                innerView === tab.id 
                                    ? 'bg-white text-black shadow-lg shadow-white/10' 
                                    : 'text-white/20 hover:text-white/40'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Edit Transaction Modal */}
            {editingTx && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-[#000000]/80 backdrop-blur-sm" onClick={() => setEditingTx(null)}></div>
                    <DashboardPanel
                        className="w-full max-w-md z-10"
                        title="EDIT TRANSACTION"
                        subtitle="MODIFY ENTRY"
                        headerExtra={
                            <button onClick={() => setEditingTx(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        }
                    >
                        <form onSubmit={handleUpdate} className="space-y-5 px-1 py-2">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] ml-1 font-exo">TITLE</label>
                                <input
                                    type="text" required placeholder="Enter title..."
                                    className="w-full bg-[#000000] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none text-white font-black tracking-[0.2em] font-exo uppercase placeholder:text-white/20 transition-all"
                                    value={editingTx.title} onChange={e => handleEditChange('title', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] ml-1 font-exo">AMOUNT</label>
                                    <input
                                        type="number" required step="0.01"
                                        className="w-full bg-[#000000] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none text-white font-black tracking-[0.2em] font-exo uppercase transition-all"
                                        value={editingTx.amount} onChange={e => handleEditChange('amount', e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] ml-1 font-exo">TYPE</label>
                                    <select
                                        className="w-full bg-[#000000] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none text-white font-black tracking-[0.15em] font-exo uppercase appearance-none cursor-pointer transition-all"
                                        value={editingTx.type} onChange={e => handleEditChange('type', e.target.value)}
                                    >
                                        <option value="expense">Expense (-)</option>
                                        <option value="income">Income (+)</option>
                                        <option value="savings">Savings (★)</option>
                                        <option value="debt">Debt (⚠)</option>
                                        <option value="upcoming">Receivable (⌚)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] ml-1 font-exo">CATEGORY</label>
                                    <select
                                        className="w-full bg-[#000000] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none text-white font-black tracking-[0.15em] font-exo uppercase appearance-none cursor-pointer transition-all"
                                        value={editingTx.category} onChange={e => handleEditChange('category', e.target.value)}
                                    >
                                        {availableCategories.sort().map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] ml-1 font-exo">DATE</label>
                                    <input
                                        type="date" required
                                        className="w-full bg-[#000000] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none text-white font-black tracking-[0.1em] font-exo uppercase transition-all"
                                        value={editingTx.date} onChange={e => handleEditChange('date', e.target.value)}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-4 bg-primary text-white font-black text-[10px] tracking-[0.4em] rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all active:scale-[0.98] mt-4 font-exo uppercase">
                                UPDATE TRANSACTION
                            </button>
                        </form>
                    </DashboardPanel>
                </div>,
                document.body
            )}
        </div>
    );
};

export default FinancialBreakdown;
