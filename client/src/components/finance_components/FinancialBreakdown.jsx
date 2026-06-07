import React, { useState, useMemo } from 'react';
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
    addFinanceItem,
    allTransactions = [],
    budgets = []
}) => {
    const [innerView, setInnerView] = useState('ledger'); // 'categories' | 'ledger'
    const [editingTx, setEditingTx] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [selectedTxId, setSelectedTxId] = useState(null);
    const [toggleConfirmData, setToggleConfirmData] = useState(null);

    const isMonthPaid = (tx, monthLabel, legacyLabel) => {
        const expectedTitle = tx.type === 'debt' 
            ? `Paid: ${tx.title} (${monthLabel})`
            : `Received: ${tx.title} (${monthLabel})`;
        const legacyExpectedTitle = legacyLabel ? (tx.type === 'debt' 
            ? `Paid: ${tx.title} (${legacyLabel})`
            : `Received: ${tx.title} (${legacyLabel})`) : null;
        const expectedType = tx.type === 'debt' ? 'expense' : 'income';
        return allTransactions.some(t => 
            t.type === expectedType && 
            (t.title === expectedTitle || (legacyExpectedTitle && t.title === legacyExpectedTitle))
        );
    };

    const handleToggleCheckbox = async (tx, monthLabel, checked, legacyLabel) => {
        try {
            const expectedTitle = tx.type === 'debt' 
                ? `Paid: ${tx.title} (${monthLabel})`
                : `Received: ${tx.title} (${monthLabel})`;
            const legacyExpectedTitle = legacyLabel ? (tx.type === 'debt' 
                ? `Paid: ${tx.title} (${legacyLabel})`
                : `Received: ${tx.title} (${legacyLabel})`) : null;
            const expectedType = tx.type === 'debt' ? 'expense' : 'income';

            if (checked) {
                const amountNum = parseFloat(tx.monthlyAmount || tx.amount);
                if (isNaN(amountNum) || amountNum <= 0) return;

                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                const dateString = `${yyyy}-${mm}-${dd}`;

                await addFinanceItem('transaction', {
                    title: expectedTitle,
                    amount: amountNum,
                    type: expectedType,
                    category: tx.type === 'debt' ? 'Debt' : 'Receivable',
                    date: dateString
                });
            } else {
                const match = allTransactions.find(t => 
                    t.type === expectedType && 
                    (t.title === expectedTitle || (legacyExpectedTitle && t.title === legacyExpectedTitle))
                );
                if (match) {
                    await deleteFinanceItem('transaction', match._id);
                }
            }
        } catch (err) {
            console.error("Error toggling payment:", err);
        }
    };

    const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'expense' | 'income' | 'savings' | 'debt' | 'upcoming'
    const [monthYearFilter, setMonthYearFilter] = useState('all'); // 'all' | 'YYYY-MM'

    const uniqueMonthYears = useMemo(() => {
        const months = new Set();
        selectedTransactions.forEach(tx => {
            if (tx.date) {
                try {
                    const d = new Date(tx.date);
                    if (!isNaN(d.getTime())) {
                        const yyyy = d.getFullYear();
                        const mm = String(d.getMonth() + 1).padStart(2, '0');
                        months.add(`${yyyy}-${mm}`);
                    }
                } catch (e) {}
            }
        });
        return Array.from(months).sort((a, b) => b.localeCompare(a));
    }, [selectedTransactions]);

    const formatMonthYearLabel = (ym) => {
        const [yyyy, mm] = ym.split('-');
        const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        const mName = monthNames[parseInt(mm) - 1];
        return `${mName.toUpperCase()} ${yyyy}`;
    };

    const filteredList = useMemo(() => {
        return selectedTransactions.filter(tx => {
            if (typeFilter !== 'all') {
                if (tx.type !== typeFilter) return false;
            }
            if (monthYearFilter !== 'all') {
                if (!tx.date) return false;
                try {
                    const d = new Date(tx.date);
                    const yyyy = d.getFullYear();
                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                    const ym = `${yyyy}-${mm}`;
                    if (ym !== monthYearFilter) return false;
                } catch (e) {
                    return false;
                }
            }
            return true;
        });
    }, [selectedTransactions, typeFilter, monthYearFilter]);

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

        const rawType = editingTx.rawType || 'transaction';
        let updates = {};

        if (rawType === 'debt') {
            updates = {
                title: editingTx.title,
                amount: amountNum,
                nature: editingTx.type === 'upcoming' ? 'income' : 'debt',
                dueDate: editingTx.date,
                isMonthly: !!editingTx.isMonthly,
                monthsLeft: editingTx.isMonthly ? (parseInt(editingTx.monthsLeft) || 1) : 1
            };
        } else if (rawType === 'saving') {
            updates = {
                title: editingTx.title,
                amount: amountNum,
                category: editingTx.category
            };
        } else {
            updates = {
                title: editingTx.title,
                amount: amountNum,
                type: editingTx.type,
                category: editingTx.category,
                date: editingTx.date
            };
        }

        await updateFinanceItem(editingTx._id, rawType, updates);
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

            <DecisionModal
                isOpen={!!toggleConfirmData}
                title={toggleConfirmData?.tx?.type === 'debt' ? "MARK AS PAID" : "MARK AS RECEIVED"}
                message={`Are you sure you want to mark "${toggleConfirmData?.tx?.title.replace(/^debt-/, '')}" as ${toggleConfirmData?.tx?.type === 'debt' ? 'paid' : 'received'} for ${toggleConfirmData?.monthLabel}?`}
                confirmLabel="CONFIRM"
                cancelLabel="CANCEL"
                onConfirm={async () => {
                    if (toggleConfirmData) {
                        const { tx, monthLabel, checked, legacyLabel } = toggleConfirmData;
                        setToggleConfirmData(null);
                        await handleToggleCheckbox(tx, monthLabel, checked, legacyLabel);
                    }
                }}
                onCancel={() => setToggleConfirmData(null)}
            />

            <div className="flex justify-between items-start">
                <div className="hidden md:flex flex-col gap-1">
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.6em]">TRANSACTIONS</span>
                    <span className="text-[8px] font-mono uppercase tracking-widest text-white/40">LEDGER BREAKDOWN</span>
                </div>
            </div>

            <div className="flex-1 min-h-[520px]">
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
                            className="flex flex-col h-full gap-3"
                        >
                            {/* Dynamic Filters Bar */}
                            <div className="grid grid-cols-2 gap-3 mb-1">
                                <div className="flex flex-col gap-1 text-left">
                                    <label className="text-[7.5px] font-black text-white/30 uppercase tracking-[0.25em]">FILTER TYPE</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-sm px-3 py-2.5 text-[9px] font-black text-white/60 hover:text-white outline-none tracking-widest uppercase cursor-pointer transition-all appearance-none"
                                            value={typeFilter}
                                            onChange={e => setTypeFilter(e.target.value)}
                                        >
                                            <option value="all" className="bg-[#080808] text-white">ALL TYPES</option>
                                            <option value="expense" className="bg-[#080808] text-white">EXPENSES</option>
                                            <option value="income" className="bg-[#080808] text-white">INCOMES</option>
                                            <option value="savings" className="bg-[#080808] text-white">SAVINGS</option>
                                            <option value="debt" className="bg-[#080808] text-white">DEBTS</option>
                                            <option value="upcoming" className="bg-[#080808] text-white">RECEIVABLES</option>
                                        </select>
                                        <span className="material-symbols-outlined text-[10px] text-white/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 text-left">
                                    <label className="text-[7.5px] font-black text-white/30 uppercase tracking-[0.25em]">FILTER DATE</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-sm px-3 py-2.5 text-[9px] font-black text-white/60 hover:text-white outline-none tracking-widest uppercase cursor-pointer transition-all appearance-none"
                                            value={monthYearFilter}
                                            onChange={e => setMonthYearFilter(e.target.value)}
                                        >
                                            <option value="all" className="bg-[#080808] text-white">ALL DATES</option>
                                            {uniqueMonthYears.map(ym => (
                                                <option key={ym} value={ym} className="bg-[#080808] text-white">
                                                    {formatMonthYearLabel(ym)}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined text-[10px] text-white/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
                                    </div>
                                </div>
                            </div>

                            {/* Scrolling list wrapper */}
                            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-2 custom-scrollbar flex-1">
                                {filteredList.length > 0 ? (
                                    <>
                                        {/* Add New Transaction Action Card */}
                                        <motion.div 
                                            onClick={() => setShowAddTx && setShowAddTx(true)}
                                            className="flex items-center gap-4 p-4 rounded-sm bg-white/10 dark:bg-white/[0.02] border border-dashed border-black/20 dark:border-white/10 group cursor-pointer hover:border-black/40 dark:hover:border-white/30 hover:bg-white/20 dark:hover:bg-white/[0.05] backdrop-blur-sm transition-all relative overflow-hidden active:scale-[0.98]"
                                        >
                                            <div className="size-10 rounded-sm bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shrink-0 shadow-lg shadow-black/20">
                                                <span className="material-symbols-outlined text-xl">add</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/60 dark:text-white/60 group-hover:text-black dark:group-hover:text-white transition-colors">
                                                    ADD TRANSACTION
                                                 </span>
                                            </div>
                                            <div className="absolute top-0 right-0 w-4 h-4 bg-black/5 dark:bg-white/5 rotate-45 translate-x-2 -translate-y-2" />
                                        </motion.div>

                                        {filteredList.slice(0, 100).map((tx) => (
                                            <div 
                                                key={tx._id} 
                                                onClick={() => setSelectedTxId(prev => prev === tx._id ? null : tx._id)}
                                                className={`flex flex-col p-2.5 rounded-sm bg-white/10 dark:bg-white/[0.01] border transition-all group cursor-pointer ${selectedTxId === tx._id ? 'border-black/20 dark:border-white/20 bg-white/20 dark:bg-white/[0.05]' : 'border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 hover:bg-white/15 dark:hover:bg-white/[0.03]'}`}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-7 rounded-sm bg-white/5 flex items-center justify-center text-white/20 border border-white/10 shrink-0">
                                                            <span className="material-symbols-outlined text-xs">
                                                                {tx.type === 'income' ? 'payments' : 
                                                                 tx.type === 'savings' ? 'savings' : 
                                                                 tx.type === 'debt' ? 'warning' : 
                                                                 tx.type === 'upcoming' ? 'schedule' : 'shopping_bag'}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col text-left">
                                                            <p className="font-black text-white uppercase tracking-wider leading-tight" style={{ fontSize: '1.2rem' }}>
                                                                {tx.title}
                                                                {tx.isMonthly && (
                                                                    <span className="ml-2 text-[7.5px] px-1.5 py-0.5 rounded-sm bg-white/10 text-white/60 border border-white/5 font-black uppercase tracking-widest inline-block align-middle">
                                                                        {tx.monthsLeft}M
                                                                    </span>
                                                                )}
                                                            </p>
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

                                                {selectedTxId === tx._id && tx.isMonthly && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="w-full mt-3 pt-3 border-t border-white/5 space-y-2 text-left"
                                                    >
                                                        <p className="text-[7.5px] font-black uppercase tracking-widest text-white/30 mb-2">RECURRING TIMELINE</p>
                                                        <div className="space-y-1.5 pl-2 border-l border-white/10">
                                                            {(() => {
                                                                const duration = tx.monthsLeft || 1;
                                                                const startDate = new Date(tx.startDate || tx.date);
                                                                const startYear = startDate.getFullYear();
                                                                const startMonth = startDate.getMonth();
                                                                const monthNames = [
                                                                    'January', 'February', 'March', 'April', 'May', 'June',
                                                                    'July', 'August', 'September', 'October', 'November', 'December'
                                                                ];
                                                                const elements = [];
                                                                for (let i = 0; i < duration; i++) {
                                                                    const mIdx = (startMonth + i) % 12;
                                                                    const yVal = startYear + Math.floor((startMonth + i) / 12);
                                                                    
                                                                    // Calculate correct day without month day-overflow (e.g. Feb 31st overflow)
                                                                    const d = new Date(startYear, startMonth + i, 1);
                                                                    const lastDay = new Date(startYear, startMonth + i + 1, 0).getDate();
                                                                    const dayToUse = Math.min(startDate.getDate() || 1, lastDay);
                                                                    
                                                                    const monthName = monthNames[mIdx].toUpperCase();
                                                                    const label = `${monthName} ${dayToUse}, ${yVal}`;
                                                                    const legacyLabel = `${monthName} ${yVal}`;
                                                                    
                                                                    const isPaid = isMonthPaid(tx, label, legacyLabel);
                                                                    elements.push(
                                                                        <div key={i} className="flex justify-between items-center text-[9px] text-white/50 py-1.5 hover:bg-white/[0.02] px-1.5 rounded-sm">
                                                                            <div className="flex items-center gap-3">
                                                                                <input 
                                                                                    type="checkbox"
                                                                                    checked={isPaid}
                                                                                    onChange={(e) => {
                                                                                        e.stopPropagation();
                                                                                        const isChecked = e.target.checked;
                                                                                        if (isChecked) {
                                                                                            setToggleConfirmData({ tx, monthLabel: label, checked: true, legacyLabel });
                                                                                        } else {
                                                                                            handleToggleCheckbox(tx, label, false, legacyLabel);
                                                                                        }
                                                                                    }}
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                    className="size-5 accent-emerald-500 rounded-sm cursor-pointer border border-white/20 bg-white/5 shrink-0"
                                                                                />
                                                                                <span className={`font-mono ${isPaid ? 'line-through opacity-40 text-emerald-500/60' : ''}`}>{label}</span>
                                                                            </div>
                                                                            <span className={`font-black ${isPaid ? 'text-emerald-500' : 'text-white/80'}`}>
                                                                                {localCurrency}{isPaid ? '0' : parseFloat(tx.monthlyAmount || tx.amount).toLocaleString()}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                }
                                                                return elements;
                                                            })()}
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {selectedTxId === tx._id && !tx.isMonthly && (tx.type === 'debt' || tx.type === 'upcoming') && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="w-full mt-3 pt-3 border-t border-white/5 space-y-2 text-left"
                                                    >
                                                        <p className="text-[7.5px] font-black uppercase tracking-widest text-white/30 mb-2 font-mono">STATUS</p>
                                                        {(() => {
                                                            const dateStr = tx.startDate || tx.date;
                                                            const startDate = new Date(dateStr);
                                                            const monthNames = [
                                                                'January', 'February', 'March', 'April', 'May', 'June',
                                                                'July', 'August', 'September', 'October', 'November', 'December'
                                                            ];
                                                            const label = `${monthNames[startDate.getMonth()].toUpperCase()} ${startDate.getFullYear()}`;
                                                            const isPaid = isMonthPaid(tx, label);
                                                            return (
                                                                <div className="flex items-center gap-3 pl-2 py-1.5 hover:bg-white/[0.02] px-1.5 rounded-sm">
                                                                    <input 
                                                                        type="checkbox"
                                                                        checked={isPaid}
                                                                        onChange={(e) => {
                                                                            e.stopPropagation();
                                                                            const isChecked = e.target.checked;
                                                                            if (isChecked) {
                                                                                setToggleConfirmData({ tx, monthLabel: label, checked: true });
                                                                            } else {
                                                                                handleToggleCheckbox(tx, label, false);
                                                                            }
                                                                        }}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="size-5 accent-emerald-500 rounded-sm cursor-pointer border border-white/20 bg-white/5"
                                                                    />
                                                                    <span className={`text-[10px] font-black uppercase tracking-wider ${isPaid ? 'line-through text-emerald-500/60' : 'text-white'}`}>
                                                                        MARK AS {tx.type === 'debt' ? 'PAID' : 'RECEIVED'} ({label})
                                                                    </span>
                                                                </div>
                                                            );
                                                        })()}
                                                    </motion.div>
                                                )}
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <motion.button
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => setShowAddTx && setShowAddTx(true)}
                                        className="w-full flex flex-col items-center justify-center py-16 gap-5 border border-dashed border-black/20 dark:border-white/10 hover:border-black/40 dark:hover:border-white/30 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all group/empty rounded-sm"
                                    >
                                        <div className="size-12 border-2 border-dashed border-black/20 dark:border-white/20 group-hover/empty:border-black/50 group-hover/empty:dark:border-white/50 flex items-center justify-center transition-all">
                                            <span className="material-symbols-outlined text-black/30 dark:text-white/30 group-hover/empty:text-black/80 group-hover/empty:dark:text-white/80 transition-colors">add</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-black/40 dark:text-white/40 group-hover/empty:text-black/80 group-hover/empty:dark:text-white/80 transition-colors">Make your first transaction</span>
                                            <span className="text-[8px] font-mono text-black/20 dark:text-white/20 uppercase tracking-widest">Start tracking your cashflow protocol</span>
                                        </div>
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Actions & View Toggle */}
            <div className="flex items-center justify-end mt-auto pt-1 md:pt-12 border-t border-white/5 -translate-y-12 md:translate-y-0">
                <div className="flex bg-white/10 dark:bg-white/5 p-1 rounded-sm border border-black/10 dark:border-white/5 backdrop-blur-sm">
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

                                {/* Recurrence settings for Debt/Receivable */}
                                {(editingTx.type === 'debt' || editingTx.type === 'upcoming') && (
                                    <div className="border-t border-black/5 dark:border-white/5 pt-4 space-y-4">
                                        <p className="text-[7.5px] font-black uppercase tracking-widest text-black/30 dark:text-white/30 mb-2">RECURRENCE PARAMETERS</p>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                id="edit-is-monthly"
                                                className="size-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 accent-black dark:accent-white rounded-sm cursor-pointer"
                                                checked={!!editingTx.isMonthly}
                                                onChange={e => handleEditChange('isMonthly', e.target.checked)}
                                            />
                                            <label htmlFor="edit-is-monthly" className="text-[9px] font-black text-black/60 dark:text-white/60 uppercase tracking-widest cursor-pointer select-none">
                                                RECURRING MONTHLY
                                            </label>
                                        </div>

                                        {editingTx.isMonthly && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="flex flex-col gap-1.5"
                                            >
                                                <label className="text-[9px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.4em]">DURATION (MONTHS)</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    required
                                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm px-4 py-3 text-xs focus:border-black dark:focus:border-white outline-none text-black dark:text-white font-black tracking-[0.2em] uppercase transition-all"
                                                    value={editingTx.monthsLeft || ''}
                                                    onChange={e => handleEditChange('monthsLeft', parseInt(e.target.value) || '')}
                                                />
                                            </motion.div>
                                        )}
                                    </div>
                                )}

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
