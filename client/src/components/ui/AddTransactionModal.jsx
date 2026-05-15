import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

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

const AddTransactionModal = ({ isOpen, onClose, addFinanceItem, availableCategories = [] }) => {
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringMonths, setRecurringMonths] = useState(1);
    const [newTx, setNewTx] = useState({ 
        title: '', 
        amount: '', 
        type: 'expense', 
        category: 'General', 
        date: new Date().toISOString().split('T')[0] 
    });

    const handleAdd = async (e) => {
        e.preventDefault();
        const amountNum = parseFloat(newTx.amount);
        if (!newTx.title || isNaN(amountNum) || amountNum <= 0) return;

        const txData = { ...newTx, amount: amountNum };
        
        try {
            if (newTx.type === 'debt') {
                await addFinanceItem('debt', { 
                    title: newTx.title, 
                    amount: amountNum, 
                    nature: 'debt',
                    date: newTx.date,
                    isMonthly: isRecurring,
                    monthsLeft: recurringMonths 
                });
            } else if (newTx.type === 'upcoming') {
                await addFinanceItem('debt', { 
                    title: newTx.title, 
                    amount: amountNum, 
                    nature: 'income',
                    date: newTx.date,
                    isMonthly: isRecurring,
                    monthsLeft: recurringMonths 
                });
            } else {
                await addFinanceItem('transaction', txData);
            }

            onClose();
            setIsRecurring(false);
            setRecurringMonths(1);
            setNewTx({ 
                title: '', 
                amount: '', 
                type: 'expense', 
                category: 'General', 
                date: new Date().toISOString().split('T')[0] 
            });
        } catch (err) {
            console.error("Add Transaction Error:", err);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={onClose}
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="relative z-10 w-full max-w-md bg-white dark:bg-[#080808] p-8 md:p-10 rounded-sm group overflow-hidden border border-black dark:border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto custom-scrollbar"
                        >
                            <ChippedBorder opacity={0.4} />

                            <div className="relative z-10">
                                <div className="flex justify-between items-center mb-8">
                                    <p className="text-[12px] md:text-[14px] font-bold leading-relaxed tracking-[0.2em] text-black/80 dark:text-white/80 uppercase">
                                        ADD TRANSACTION
                                    </p>
                                    <button type="button" onClick={onClose} className="text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>
                                </div>

                                <form onSubmit={handleAdd} className="space-y-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[9px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.4em]">TITLE</label>
                                        <input
                                            type="text" required placeholder="Enter title..."
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm px-4 py-3 text-xs focus:border-black dark:focus:border-white outline-none text-black dark:text-white font-black tracking-[0.2em] uppercase placeholder:text-black/20 dark:placeholder:text-white/20 transition-all"
                                            value={newTx.title} onChange={e => setNewTx({ ...newTx, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[9px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.4em]">AMOUNT</label>
                                            <input
                                                type="number" required step="0.01"
                                                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm px-4 py-3 text-xs focus:border-black dark:focus:border-white outline-none text-black dark:text-white font-black tracking-[0.2em] uppercase transition-all"
                                                value={newTx.amount} onChange={e => setNewTx({ ...newTx, amount: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[9px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.4em]">TYPE</label>
                                            <select
                                                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm px-4 py-3 text-xs focus:border-black dark:focus:border-white outline-none text-black dark:text-white font-black tracking-[0.15em] uppercase appearance-none cursor-pointer transition-all"
                                                value={newTx.type} onChange={e => setNewTx({ ...newTx, type: e.target.value })}
                                            >
                                                <option value="expense" className="bg-white dark:bg-[#080808] text-black dark:text-white">Expense (-)</option>
                                                <option value="income" className="bg-white dark:bg-[#080808] text-black dark:text-white">Income (+)</option>
                                                <option value="savings" className="bg-white dark:bg-[#080808] text-black dark:text-white">Savings (★)</option>
                                                <option value="debt" className="bg-white dark:bg-[#080808] text-black dark:text-white">Debt (⚠)</option>
                                                <option value="upcoming" className="bg-white dark:bg-[#080808] text-black dark:text-white">Receivable (⌚)</option>
                                            </select>
                                        </div>

                                        {(newTx.type === 'debt' || newTx.type === 'upcoming') && (
                                            <div className="flex flex-col gap-3 col-span-2 pt-2">
                                                <div className="flex items-center gap-3 p-3 rounded-sm bg-black/5 dark:bg-white/[0.02] border border-black/10 dark:border-white/5 cursor-pointer hover:bg-black/10 dark:hover:bg-white/[0.05] transition-all" onClick={() => setIsRecurring(!isRecurring)}>
                                                    <div className={`size-4 rounded-sm border transition-all flex items-center justify-center ${isRecurring ? 'bg-black border-black text-white dark:bg-white dark:border-white dark:text-black' : 'border-black/20 dark:border-white/20 text-transparent'}`}>
                                                        <span className="material-symbols-outlined text-[12px] font-black">check</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-black/80 dark:text-white/80">RECURRING</span>
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">MONTHLY SYNC</span>
                                                    </div>
                                                </div>

                                                {isRecurring && (
                                                    <div className="flex flex-col gap-1.5 p-3 rounded-sm bg-black/5 dark:bg-white/[0.02] border border-black/10 dark:border-white/5">
                                                        <label className="text-[9px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.4em]">DURATION (MONTHS)</label>
                                                        <input
                                                            type="number" min="1" max="60"
                                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm px-4 py-3 text-xs focus:border-black dark:focus:border-white outline-none text-black dark:text-white font-black tracking-[0.2em] uppercase transition-all"
                                                            value={recurringMonths} onChange={e => setRecurringMonths(parseInt(e.target.value))}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[9px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.4em]">CATEGORY</label>
                                            <select
                                                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm px-4 py-3 text-xs focus:border-black dark:focus:border-white outline-none text-black dark:text-white font-black tracking-[0.15em] uppercase appearance-none cursor-pointer transition-all"
                                                value={newTx.category} onChange={e => setNewTx({ ...newTx, category: e.target.value })}
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
                                                value={newTx.date} onChange={e => setNewTx({ ...newTx, date: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-row gap-6 w-full pt-4">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="flex-1 py-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black/40 dark:text-white/40 font-black uppercase tracking-[0.4em] text-[9px] hover:bg-black/10 hover:text-black dark:hover:bg-white/10 dark:hover:text-white transition-all active:scale-[0.98] rounded-sm"
                                        >
                                            CANCEL
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-4 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.4em] text-[9px] hover:bg-black/90 dark:hover:bg-white/90 transition-all active:scale-[0.98] rounded-sm relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-2 h-2 bg-white dark:bg-black rotate-45 translate-x-1 -translate-y-1" />
                                            SAVE
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>,
        document.body
    );
};

export default AddTransactionModal;
