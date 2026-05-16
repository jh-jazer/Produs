import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardPanel from '../ui/DashboardPanel';
import DecisionModal from '../ui/DecisionModal';

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
  <div className="flex flex-col items-start justify-center pt-10 pb-10 opacity-40 text-left gap-6">
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
    const [innerView, setInnerView] = useState('ledger'); // 'categories' | 'ledger'
    const [editingTx, setEditingTx] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [selectedTxId, setSelectedTxId] = useState(null);

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
        <div className="flex flex-col gap-4 h-full relative z-10 pt-0 mt-0 md:-mt-8">
            <DecisionModal
                isOpen={!!confirmDelete}
                title="DELETE RECORD"
                message="Are you sure you want to delete this transaction from your history?"
                confirmLabel="DELETE"
                cancelLabel="CANCEL"
                onConfirm={() => handleDelete(confirmDelete)}
                onCancel={() => setConfirmDelete(null)}
            />

            <div className="flex justify-between items-start">
                <div className="hidden md:flex flex-col gap-1">
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.6em]">TRANSACTIONS</span>
                    <span className="text-[8px] font-mono uppercase tracking-widest text-white/40">LEDGER BREAKDOWN</span>
                </div>
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
                                        <div className="flex flex-col gap-1 px-1 text-left">
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
                            {/* Add New Transaction Action Card */}
                            <motion.div 
                                onClick={() => setShowAddTx && setShowAddTx(true)}
                                className="flex items-center gap-4 p-4 rounded-sm bg-black/20 dark:bg-white/[0.03] border border-dashed border-black/20 dark:border-white/10 group cursor-pointer hover:border-black/40 dark:hover:border-white/30 hover:bg-black/30 dark:hover:bg-white/[0.05] transition-all relative overflow-hidden active:scale-[0.98]"
                            >
                                <div className="size-10 rounded-sm bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shrink-0 shadow-lg shadow-black/20">
                                    <span className="material-symbols-outlined text-xl">add</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/60 dark:text-white/60 group-hover:text-black dark:group-hover:text-white transition-colors">
                                        ADD TRANSACTION
                                    </span>
                                </div>
                                
                                {/* Decorative Glitch Corner */}
                                <div className="absolute top-0 right-0 w-4 h-4 bg-black/5 dark:bg-white/5 rotate-45 translate-x-2 -translate-y-2" />
                            </motion.div>

                            {selectedTransactions.length > 0 ? (
                                selectedTransactions.slice(0, 50).map((tx) => (
                                    <div 
                                        key={tx._id} 
                                        onClick={() => setSelectedTxId(prev => prev === tx._id ? null : tx._id)}
                                        className={`flex items-center justify-between p-2.5 rounded-sm bg-white/[0.02] border transition-all group cursor-pointer ${selectedTxId === tx._id ? 'border-white/20 bg-white/[0.05]' : 'border-white/5 hover:border-white/10'}`}
                                    >
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
                                            <AnimatePresence>
                                                {selectedTxId === tx._id && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, scale: 0.9, x: 5 }}
                                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                                        exit={{ opacity: 0, scale: 0.9, x: 5 }}
                                                        className="flex items-center gap-1 shrink-0"
                                                    >
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); openEditModal(tx); }}
                                                            className="p-1.5 rounded-sm bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                                                            title="Edit Transaction"
                                                        >
                                                            <span className="material-symbols-outlined text-xs">edit</span>
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setConfirmDelete(tx._id); }}
                                                            className="p-1.5 rounded-sm bg-white/5 hover:bg-rose-500/20 text-rose-500/60 hover:text-rose-500 transition-all"
                                                            title="Delete Transaction"
                                                        >
                                                            <span className="material-symbols-outlined text-xs">delete</span>
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
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

            {/* Actions & View Toggle */}
            <div className="flex items-center justify-end mt-auto pt-1 md:pt-12 border-t border-white/5 -translate-y-12 md:translate-y-0">
                <div className="flex bg-white/5 p-1 rounded-sm border border-white/5">
                    {[
                        { id: 'ledger', label: 'LIST' },
                        { id: 'categories', label: 'CHART' }
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
            {/* Edit Transaction Modal */}
            {editingTx && createPortal(
                <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={() => setEditingTx(null)}
                    />

                    {/* Dialog Container - Operative Panel Design */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="relative z-10 w-full max-w-md bg-white dark:bg-[#080808] p-8 md:p-10 rounded-sm group overflow-hidden border border-black dark:border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]"
                    >
                        <ChippedBorder opacity={0.4} />

                        <div className="relative z-10">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-8">
                                <p className="text-[12px] md:text-[14px] font-bold leading-relaxed tracking-[0.2em] text-black/80 dark:text-white/80 uppercase">
                                    EDIT TRANSACTION
                                </p>
                                <button type="button" onClick={() => setEditingTx(null)} className="text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-lg">close</span>
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[9px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.4em]">TITLE</label>
                                    <input
                                        type="text" required placeholder="Enter title..."
                                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm px-4 py-3 text-xs focus:border-black dark:focus:border-white outline-none text-black dark:text-white font-black tracking-[0.2em] uppercase placeholder:text-black/20 dark:placeholder:text-white/20 transition-all"
                                        value={editingTx.title} onChange={e => handleEditChange('title', e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[9px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.4em]">AMOUNT</label>
                                        <input
                                            type="number" required step="0.01"
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm px-4 py-3 text-xs focus:border-black dark:focus:border-white outline-none text-black dark:text-white font-black tracking-[0.2em] uppercase transition-all"
                                            value={editingTx.amount} onChange={e => handleEditChange('amount', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[9px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.4em]">TYPE</label>
                                        <select
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm px-4 py-3 text-xs focus:border-black dark:focus:border-white outline-none text-black dark:text-white font-black tracking-[0.15em] uppercase appearance-none cursor-pointer transition-all"
                                            value={editingTx.type} onChange={e => handleEditChange('type', e.target.value)}
                                        >
                                            <option value="expense" className="bg-white dark:bg-[#080808] text-black dark:text-white">Expense (-)</option>
                                            <option value="income" className="bg-white dark:bg-[#080808] text-black dark:text-white">Income (+)</option>
                                            <option value="savings" className="bg-white dark:bg-[#080808] text-black dark:text-white">Savings (★)</option>
                                            <option value="debt" className="bg-white dark:bg-[#080808] text-black dark:text-white">Debt (⚠)</option>
                                            <option value="upcoming" className="bg-white dark:bg-[#080808] text-black dark:text-white">Receivable (⌚)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[9px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.4em]">CATEGORY</label>
                                        <select
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm px-4 py-3 text-xs focus:border-black dark:focus:border-white outline-none text-black dark:text-white font-black tracking-[0.15em] uppercase appearance-none cursor-pointer transition-all"
                                            value={editingTx.category} onChange={e => handleEditChange('category', e.target.value)}
                                        >
                                            {availableCategories.sort().map(cat => (
                                                <option key={cat} value={cat} className="bg-white dark:bg-[#080808] text-black dark:text-white">{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[9px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.4em]">DATE</label>
                                        <input
                                            type="date" required
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm px-4 py-3 text-xs focus:border-black dark:focus:border-white outline-none text-black dark:text-white font-black tracking-[0.1em] uppercase transition-all"
                                            value={editingTx.date} onChange={e => handleEditChange('date', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-row gap-6 w-full pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditingTx(null)}
                                        className="flex-1 py-4 bg-black/5 dark:bg-white/5 border border-black dark:border-white/10 text-black/40 dark:text-white/40 font-black uppercase tracking-[0.4em] text-[9px] hover:bg-black/10 hover:text-black dark:hover:bg-white/10 dark:hover:text-white transition-all active:scale-[0.98] rounded-sm"
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.4em] text-[9px] hover:bg-black/90 dark:hover:bg-white/90 transition-all active:scale-[0.98] rounded-sm relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-2 h-2 bg-white dark:bg-black rotate-45 translate-x-1 -translate-y-1" />
                                        UPDATE
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default FinancialBreakdown;
