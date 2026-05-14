import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import DashboardPanel from "../ui/DashboardPanel";
import DecisionModal from "../ui/DecisionModal";
import currencyCodes from 'currency-codes';

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

const FinancialOverview = ({
  transactions = [],
  budgets = [],
  currencySymbol = "$",
  totalSavings = 0,
  totalDebt = 0,
  totalUpcomingIncome = 0,
  addFinanceItem,
  deleteFinanceItem,
  compact = false,
  showAddTx,
  setShowAddTx,
}) => {
  const [foresee, setForesee] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringMonths, setRecurringMonths] = useState(1);
  const [localCurrency, setLocalCurrency] = useState(currencySymbol);
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState("current"); 
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0); 
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [newTx, setNewTx] = useState({ 
      title: '', 
      amount: '', 
      type: 'expense', 
      category: 'General', 
      date: new Date().toISOString().split('T')[0] 
  });

  // Categories helper
  const budgetCategories = budgets.map(b => b.category);
  const availableCategories = budgetCategories.length > 0 ? budgetCategories : [
      'General', 'Food', 'Transport', 'Utilities', 'Entertainment',
      'Tech', 'Home', 'Fashion', 'Hobby', 'Fitness', 'Wellness',
      'Education', 'Travel', 'Vehicles', 'Gifts', 'Pets', 'Other'
  ];
  if (!availableCategories.includes('General')) availableCategories.push('General');

  // Aggregate Historical Data (Last 6 Months)
  const historyData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth();
      const y = d.getFullYear();
      
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      const monthTransactions = transactions.filter(t => {
        const td = new Date(t.date);
        return td.getMonth() === m && td.getFullYear() === y;
      });

      const inc = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
      const exp = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
      
      months.push({ label: monthLabel, inc, exp, offset: -i });
    }
    return months;
  }, [transactions]);

  // Current selected month totals
  const selectedTransactions = useMemo(() => {
    if (selectedMonthOffset === 'all') return transactions;
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + parseInt(selectedMonthOffset));
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === targetDate.getMonth() && d.getFullYear() === targetDate.getFullYear();
    });
  }, [transactions, selectedMonthOffset]);

  const totalIncome = selectedTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const totalExpenses = selectedTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const displayedBalance = useMemo(() => {
      let balance = transactions.reduce((sum, t) => {
        const amt = parseFloat(t.amount) || 0;
        return t.type === "income" ? sum + amt : sum - amt;
      }, 0);
      if (foresee) {
        balance += totalUpcomingIncome - totalDebt;
      }
      return balance;
  }, [transactions, foresee, totalUpcomingIncome, totalDebt]);

  const getCurrencySymbol = (code) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: code,
      }).formatToParts(0).find(p => p.type === 'currency').value;
    } catch (e) {
      return code;
    }
  };

  const allCurrencies = useMemo(() => {
    const codes = currencyCodes.data.map(c => c.code);
    const uniqueCodes = [...new Set(codes)].sort();
    return uniqueCodes;
  }, []);

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

      setShowAddTx(false);
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

  const handleDelete = async (id) => {
    await deleteFinanceItem(id);
    setConfirmDelete(null);
  };

  return (
    <div className={`flex flex-col ${compact ? 'gap-4' : 'gap-8 min-h-[400px]'} relative group`}>
        <DecisionModal
            isOpen={!!confirmDelete}
            title="DELETE RECORD"
            message="Are you sure you want to delete this transaction from your history?"
            confirmLabel="DELETE"
            cancelLabel="CANCEL"
            onConfirm={() => handleDelete(confirmDelete)}
            onCancel={() => setConfirmDelete(null)}
        />

        <div className="flex flex-col gap-8 pt-4 md:pt-0 mt-0 md:-mt-4 relative">
            <div className="flex flex-col gap-8">
                <div className="flex justify-between items-start mb-6">
                    <div className="hidden md:flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white">FINANCES</span>
                        <span className="text-[8px] font-mono uppercase tracking-widest text-white/40">REAL-TIME SYNC</span>
                    </div>
                    
                    <div className="relative">
                        <select
                            value={selectedMonthOffset}
                            onChange={(e) => setSelectedMonthOffset(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                            className="bg-white/5 border border-white/10 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-sm px-4 py-2 outline-none appearance-none cursor-pointer hover:bg-white/10 transition-all pr-10"
                        >
                            <option value="all" className="bg-black text-white">ALL TIME</option>
                            {[-5, -4, -3, -2, -1, 0].map((offset) => {
                                const date = new Date();
                                date.setMonth(date.getMonth() + offset);
                                const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
                                return (
                                    <option key={offset} value={offset} className="bg-black text-white">
                                        {label}
                                    </option>
                                );
                            })}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none text-xs">
                            expand_more
                        </span>
                    </div>
                </div>

                <div className="relative min-h-[80px] flex flex-col justify-center">
                    {viewMode === 'current' ? (
                        <motion.div 
                            key="balance"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-12 text-center rounded-sm bg-white/[0.03] border border-white/5 relative overflow-hidden"
                        >
                            <div className="absolute top-4 right-4 z-20">
                                <button 
                                    onClick={() => setShowSettings(true)}
                                    className="size-8 flex items-center justify-center rounded-sm text-white/40 hover:text-white bg-transparent transition-all"
                                >
                                    <span className="material-symbols-outlined text-lg">more_vert</span>
                                </button>

                                {showSettings && createPortal(
                                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                                        <div className="absolute inset-0 bg-[#000000]/80 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
                                        <DashboardPanel
                                            className="w-full max-w-sm z-10"
                                            title="FINANCIAL CONFIG"
                                            subtitle="SYSTEM SETTINGS"
                                            headerExtra={
                                                <button onClick={() => setShowSettings(false)} className="text-white/20 hover:text-white transition-colors">
                                                    <span className="material-symbols-outlined">close</span>
                                                </button>
                                            }
                                        >
                                            <div className="flex flex-col gap-2">
                                                <div className="p-2 bg-white/[0.02] border-b border-white/5">
                                                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 px-2">PROJECTION MODES</span>
                                                </div>
                                                <button 
                                                    onClick={() => setForesee(!foresee)}
                                                    className="w-full flex items-center justify-between px-4 py-4 hover:bg-white hover:text-black transition-all group"
                                                >
                                                    <span className="text-[10px] font-black uppercase tracking-widest">FORESEE PROJECTION</span>
                                                    <div className={`size-4 rounded-full border-2 transition-all ${foresee ? 'bg-current border-transparent' : 'border-current opacity-20'}`} />
                                                </button>

                                                <div className="p-4 flex flex-col gap-4">
                                                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">CURRENCY SYSTEM</span>
                                                    <div className="relative">
                                                        <select
                                                            value={localCurrency}
                                                            onChange={(e) => setLocalCurrency(e.target.value)}
                                                            className="w-full bg-white/5 border border-white/10 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-sm px-4 py-3 outline-none appearance-none cursor-pointer hover:bg-white/10 transition-all pr-10"
                                                        >
                                                            {allCurrencies.map(code => {
                                                                const symbol = getCurrencySymbol(code);
                                                                const currencyInfo = currencyCodes.code(code);
                                                                return (
                                                                    <option key={code} value={symbol} className="bg-black text-white">
                                                                        {code} - {currencyInfo ? currencyInfo.currency.toUpperCase() : ''} ({symbol})
                                                                    </option>
                                                                );
                                                            })}
                                                        </select>
                                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none">
                                                            expand_more
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </DashboardPanel>
                                    </div>,
                                    document.body
                                )}
                            </div>

                            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            <p 
                                className="font-black tracking-tighter leading-none"
                                style={{ 
                                    fontSize: '3.5rem',
                                    color: displayedBalance > 0 ? '#10b981' : displayedBalance < 0 ? '#f43f5e' : '#ffffff'
                                }}
                            >
                                {localCurrency}{displayedBalance < 0 ? '-' : ''}{Math.abs(displayedBalance).toLocaleString()}
                            </p>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.6em] mt-2">
                                TOTAL BALANCE {selectedMonthOffset === 'all' ? '(ALL TIME)' : `- ${(() => {
                                    const d = new Date();
                                    d.setMonth(d.getMonth() + parseInt(selectedMonthOffset));
                                    return d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                                })()}`}
                            </p>

                            <div className="flex items-center justify-center gap-3 mt-4">
                                {foresee && (
                                    <motion.span 
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="px-2 py-1 rounded-sm text-[8px] font-black bg-white/10 text-white border border-white/20 uppercase tracking-widest flex items-center gap-2"
                                    >
                                        <span className="size-1 bg-white animate-pulse rounded-full" />
                                        PROJECTION ACTIVE (INC + UPCOMING - DEBT)
                                    </motion.span>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="chart"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full"
                        >
                            <div className="h-44 flex items-end gap-2 relative pt-8 px-2">
                                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5 py-8">
                                    <div className="border-t border-slate-400 w-full"></div>
                                    <div className="border-t border-slate-400 w-full"></div>
                                    <div className="border-t border-slate-400 w-full"></div>
                                </div>

                                {historyData.map((col, idx) => {
                                    const maxVal = Math.max(...historyData.map(h => Math.max(h.inc, h.exp)), 1);
                                    const incHeight = (col.inc / maxVal) * 100;
                                    const expHeight = (col.exp / maxVal) * 100;
                                    const isActive = selectedMonthOffset === col.offset;

                                    return (
                                        <div 
                                            key={idx} 
                                            onClick={() => setSelectedMonthOffset(col.offset)}
                                            className={`flex-1 flex flex-col justify-end gap-2 group cursor-pointer rounded-t-xl transition-all duration-300 p-1
                                            ${isActive ? 'bg-primary/5 dark:bg-primary/10 ring-1 ring-primary/20' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
                                        >
                                            <div className="w-full relative h-28">
                                                <div className="flex gap-1 h-full items-end justify-center w-full px-1">
                                                    <div 
                                                        className={`rounded-t-sm relative transition-all w-full max-w-[12px] ${isActive ? 'bg-emerald-500' : 'bg-emerald-500/20 group-hover:bg-emerald-500/40'}`} 
                                                        style={{ height: `${incHeight}%` }} 
                                                    />
                                                    <div 
                                                        className={`rounded-t-sm relative transition-all w-full max-w-[12px] ${isActive ? 'bg-rose-500' : 'bg-rose-500/20 group-hover:bg-rose-500/40'}`} 
                                                        style={{ height: `${expHeight}%` }} 
                                                    />
                                                </div>
                                            </div>
                                            <span className={`text-[10px] text-center font-black uppercase tracking-widest ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                                                {col.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </div>

                <div className="grid grid-cols-2 border-t border-white/10 pt-3">
                    <div className="py-2 px-2 flex flex-col items-center justify-center text-center gap-1 border-r-2 border-b border-white/10">
                        <p className="font-black tracking-tighter leading-none mb-1" style={{ fontSize: '1.5rem', color: '#10b981' }}>{localCurrency}{totalIncome.toLocaleString()}</p>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] flex items-center justify-center gap-1.5 font-exo whitespace-nowrap">
                            <span className="size-1 animate-pulse shrink-0 rounded-full" style={{ backgroundColor: '#10b981' }} />
                            INCOME
                        </p>
                    </div>
                    <div className="py-2 px-2 flex flex-col items-center justify-center text-center gap-1 border-b border-white/10">
                        <p className="font-black tracking-tighter leading-none mb-1" style={{ fontSize: '1.5rem', color: '#f43f5e' }}>-{localCurrency}{totalExpenses.toLocaleString()}</p>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] flex items-center justify-center gap-1.5 font-exo whitespace-nowrap">
                            <span className="size-1 animate-pulse shrink-0 rounded-full" style={{ backgroundColor: '#f43f5e' }} />
                            EXPENSES
                        </p>
                    </div>
                    <div className="py-2 px-2 flex flex-col items-center justify-center text-center gap-1 border-r-2 border-white/10">
                        <p className="font-black tracking-tighter leading-none mb-1" style={{ fontSize: '1.5rem', color: '#f43f5e' }}>-{localCurrency}{totalDebt.toLocaleString()}</p>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] flex items-center justify-center gap-1.5 font-exo whitespace-nowrap">
                            <span className="size-1 animate-pulse shrink-0 rounded-full" style={{ backgroundColor: '#f43f5e' }} />
                            DEBT
                        </p>
                    </div>
                    <div className="py-2 px-2 flex flex-col items-center justify-center text-center gap-1">
                        <p className="font-black tracking-tighter leading-none mb-1" style={{ fontSize: '1.5rem', color: '#10b981' }}>{localCurrency}{totalUpcomingIncome.toLocaleString()}</p>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] flex items-center justify-center gap-1.5 font-exo whitespace-nowrap">
                            <span className="size-1 animate-pulse shrink-0 rounded-full" style={{ backgroundColor: '#10b981' }} />
                            RECEIVABLE
                        </p>
                    </div>
                </div>

                <div className="border-t border-white/10 w-full my-2" />
                <div className="flex flex-col items-center justify-center py-2 gap-1 w-full text-center">
                    <p className="font-black tracking-tighter leading-none mb-1" style={{ fontSize: '1.5rem', color: '#10b981' }}>{localCurrency}{totalSavings.toLocaleString()}</p>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] flex items-center justify-center gap-1.5 font-exo whitespace-nowrap">
                        <span className="size-1 animate-pulse shrink-0 rounded-full" style={{ backgroundColor: '#10b981' }} />
                        SAVINGS
                    </p>
                </div>
            </div>
        </div>

        {/* Add Transaction Modal */}
        {showAddTx && createPortal(
            <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    onClick={() => setShowAddTx(false)}
                />

                {/* Dialog Container - Operative Panel Design */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 w-full max-w-md bg-white dark:bg-[#080808] p-8 md:p-10 rounded-sm group overflow-hidden border border-black dark:border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto custom-scrollbar"
                >
                    <ChippedBorder opacity={0.4} />

                    <div className="relative z-10">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-8">
                            <p className="text-[12px] md:text-[14px] font-bold leading-relaxed tracking-[0.2em] text-black/80 dark:text-white/80 uppercase">
                                ADD TRANSACTION
                            </p>
                            <button type="button" onClick={() => setShowAddTx(false)} className="text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>

                        {/* Form */}
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

                            {/* Actions */}
                            <div className="flex flex-row gap-6 w-full pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddTx(false)}
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
            </div>,
            document.body
        )}
    </div>
  );
};

export default FinancialOverview;
