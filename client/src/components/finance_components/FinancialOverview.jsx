import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import DashboardPanel from "../ui/DashboardPanel";
import DecisionModal from "../ui/DecisionModal";
import AddTransactionModal from "../ui/AddTransactionModal";
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
  currencySymbol = "₱",
  totalSavings = 0,
  totalDebt = 0,
  totalUpcomingIncome = 0,
  addFinanceItem,
  deleteFinanceItem,
  updateFinanceItem,
  compact = false,
  showAddTx,
  setShowAddTx,
  selectedYear = 'all',
  setSelectedYear,
  selectedMonth = 'all',
  setSelectedMonth,
  selectedTransactions = [],
  allTransactions = []
}) => {
  const [foresee, setForesee] = useState(true);
  const [localCurrency, setLocalCurrency] = useState(currencySymbol);
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState("current"); 
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedTxId, setSelectedTxId] = useState(null);

  const isMonthPaid = (tx, monthLabel, legacyLabel) => {
    const cleanTitle = tx.title.replace(/^debt-/, '');
    const expectedTitle = tx.type === 'debt' 
        ? `Paid: ${cleanTitle} (${monthLabel})`
        : `Received: ${cleanTitle} (${monthLabel})`;
    const legacyExpectedTitle = legacyLabel ? (tx.type === 'debt' 
        ? `Paid: ${cleanTitle} (${legacyLabel})`
        : `Received: ${cleanTitle} (${legacyLabel})`) : null;
    const expectedType = tx.type === 'debt' ? 'expense' : 'income';
    return allTransactions.some(t => 
        t.type === expectedType && 
        (t.title === expectedTitle || (legacyExpectedTitle && t.title === legacyExpectedTitle))
    );
  };

  const handleToggleCheckbox = async (tx, monthLabel, checked, legacyLabel) => {
    try {
        const cleanTitle = tx.title.replace(/^debt-/, '');
        const expectedTitle = tx.type === 'debt' 
            ? `Paid: ${cleanTitle} (${monthLabel})`
            : `Received: ${cleanTitle} (${monthLabel})`;
        const legacyExpectedTitle = legacyLabel ? (tx.type === 'debt' 
            ? `Paid: ${cleanTitle} (${legacyLabel})`
            : `Received: ${cleanTitle} (${legacyLabel})`) : null;
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

  const dropdownOptions = useMemo(() => {
    const options = [{ value: 'all', label: 'ALL TIME' }];
    const currentYear = new Date().getFullYear();
    const endYear = currentYear + 4;
    
    for (let y = currentYear; y <= endYear; y++) {
      for (let m = 0; m < 12; m++) {
        const d = new Date(y, m, 1);
        options.push({
          value: `${y}-${m}`,
          label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()
        });
      }
    }
    return options;
  }, []);

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
  const filteredForTotals = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      if (selectedYear !== 'all' && d.getFullYear() !== parseInt(selectedYear)) return false;
      if (selectedMonth !== 'all' && selectedYear !== 'all' && d.getMonth() !== parseInt(selectedMonth)) return false;
      return true;
    });
  }, [transactions, selectedYear, selectedMonth]);

  const totalIncome = filteredForTotals
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const totalExpenses = filteredForTotals
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

  const handleDelete = async (id) => {
    await deleteFinanceItem(id);
    setConfirmDelete(null);
  };

  return (
    <div className={`flex flex-col ${compact ? 'gap-4' : 'gap-8 md:min-h-[400px]'} relative group`}>
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

                <div className="relative min-h-[80px] flex flex-col justify-center">
                    {viewMode === 'current' ? (
                        <motion.div 
                            key="balance"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-sm bg-transparent md:bg-black/5 dark:md:bg-white/[0.02] border-0 md:border md:border-black/10 dark:md:border-white/10 backdrop-blur-none md:backdrop-blur-sm relative overflow-hidden shadow-none md:shadow-md"
                        >
                            <div className="hidden md:block absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                            {/* Side-by-Side Layout Grid */}
                            <div className="grid grid-cols-3 min-h-[260px]">

                                {/* Col 1+2 merged: Big Total Balance */}
                                <div className="col-span-2 flex flex-col items-center justify-center text-center px-4 md:px-8 pt-10 pb-8 border-r border-black/10 dark:border-white/10 relative">
                                    {/* Controls row */}
                                    <div className="absolute top-4 left-4 flex items-center gap-2">
                                        <button 
                                            onClick={() => setShowSettings(true)}
                                            className="size-8 flex items-center justify-center rounded-sm text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">more_vert</span>
                                        </button>
                                        <div className="relative">
                                            <select
                                                value={selectedYear === 'all' ? 'all' : `${selectedYear}-${selectedMonth}`}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === 'all') {
                                                        setSelectedYear('all');
                                                        setSelectedMonth('all');
                                                    } else {
                                                        const [y, m] = val.split('-');
                                                        setSelectedYear(parseInt(y));
                                                        setSelectedMonth(parseInt(m));
                                                    }
                                                }}
                                                className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-sm px-4 py-2 outline-none appearance-none cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-all pr-10"
                                            >
                                                {dropdownOptions.map(opt => (
                                                    <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#0a0a0a] text-black dark:text-white">
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/20 pointer-events-none text-xs">
                                                expand_more
                                            </span>
                                        </div>
                                        {showSettings && createPortal(
                                            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                                                <div className="absolute inset-0 bg-[#000000]/80 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
                                                <DashboardPanel
                                                    className="w-full max-w-sm z-10 bg-white dark:bg-[#080808]"
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
                                                                    className="w-full bg-transparent border border-white/10 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-sm px-4 py-3 outline-none appearance-none cursor-pointer transition-all pr-10"
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

                                    {/* Big Balance with Responsive Font Scale via clamp() */}
                                    <p 
                                        className={`font-black font-exo tracking-tighter leading-none ${
                                            displayedBalance > 0 
                                                ? 'text-emerald-700 dark:text-emerald-400' 
                                                : displayedBalance < 0 
                                                    ? 'text-rose-700 dark:text-rose-400' 
                                                    : 'text-black dark:text-white'
                                        }`}
                                        style={{ fontSize: 'clamp(1.5rem, 6vw, 4.5rem)' }}
                                    >
                                        {displayedBalance < 0 ? '-' : ''}{localCurrency}{Math.abs(displayedBalance).toLocaleString()}
                                    </p>
                                    <p className="text-[10px] font-black text-black/90 dark:text-white/80 uppercase tracking-[0.6em] mt-2">
                                        TOTAL BALANCE {selectedYear === 'all' ? '(ALL TIME)' : `- ${(() => {
                                            const d = new Date(selectedYear, selectedMonth, 1);
                                            return `${d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()} ${selectedYear}`;
                                        })()}`}
                                    </p>
                                    {foresee && (
                                        <motion.span 
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-4 px-2 py-1 rounded-sm text-[8px] font-black bg-black/10 dark:bg-white/10 text-black dark:text-white border border-black/20 dark:border-white/20 uppercase tracking-widest flex items-center gap-2"
                                        >
                                            <span className="size-1 bg-black dark:bg-white animate-pulse rounded-full" />
                                            PROJECTION ACTIVE
                                        </motion.span>
                                    )}
                                </div>
 
                                {/* Col 3: 5 metric rows — click to filter */}
                                <div className="flex flex-col justify-center divide-y divide-black/10 dark:divide-white/10">
                                    {[
                                        { label: 'INCOME',     value: totalIncome,        color: '#10b981', colorClass: 'text-emerald-600 dark:text-emerald-400', sign: '',  type: 'income'   },
                                        { label: 'EXPENSES',   value: totalExpenses,       color: '#f43f5e', colorClass: 'text-rose-600 dark:text-rose-400', sign: '-', type: 'expense'  },
                                        { label: 'DEBT',       value: totalDebt,           color: '#f43f5e', colorClass: 'text-rose-600 dark:text-rose-400', sign: '-', type: 'debt'     },
                                        { label: 'RECEIVABLE', value: totalUpcomingIncome, color: '#10b981', colorClass: 'text-emerald-600 dark:text-emerald-400', sign: '',  type: 'upcoming' },
                                        { label: 'SAVINGS',    value: totalSavings,        color: '#10b981', colorClass: 'text-emerald-600 dark:text-emerald-400', sign: '',  type: 'savings'  },
                                    ].map(({ label, value, color, colorClass, sign, type }) => {
                                        const isActive = typeFilter === type;
                                        return (
                                            <button
                                                key={label}
                                                onClick={() => setTypeFilter(isActive ? 'all' : type)}
                                                className={`flex flex-col items-start px-5 py-3 gap-0.5 w-full text-left transition-all ${
                                                    isActive
                                                        ? 'bg-black/[0.04] dark:bg-white/[0.04] border-l-2'
                                                        : 'border-l-2 border-l-transparent hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                                                }`}
                                                style={isActive ? { borderLeftColor: color } : {}}
                                            >
                                                <p className={`text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 whitespace-nowrap transition-colors ${isActive ? 'text-black dark:text-white' : 'text-black/90 dark:text-white/80'}`}>
                                                    <span className="size-1.5 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: color }} />
                                                    {label}
                                                </p>
                                                <p className={`font-black font-exo tracking-tighter leading-none text-[1.15rem] md:text-[1.5rem] ${colorClass}`}>
                                                    {sign}{localCurrency}{value.toLocaleString()}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
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
                                    
                                    const colDate = new Date();
                                    colDate.setMonth(colDate.getMonth() + col.offset);
                                    const isActive = selectedYear === colDate.getFullYear() && selectedMonth === colDate.getMonth();

                                    return (
                                        <div 
                                            key={idx} 
                                            onClick={() => {
                                                setSelectedYear(colDate.getFullYear());
                                                setSelectedMonth(colDate.getMonth());
                                            }}
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

                {/* Compact Ledger Breakdown */}
                {(() => {
                    const filteredList = selectedTransactions.filter(tx => {
                        if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
                        if (selectedYear !== 'all') {
                            try {
                                const d = new Date(tx.date);
                                if (d.getFullYear() !== parseInt(selectedYear)) return false;
                                if (selectedMonth !== 'all' && d.getMonth() !== parseInt(selectedMonth)) return false;
                            } catch { return false; }
                        }
                        return true;
                    });
                    return (                        <div className="mt-4 border-t border-transparent md:border-black/10 dark:md:border-white/10 flex flex-col gap-3 pt-4">
                            {/* Scrollable list */}
                            <div className="flex flex-col gap-2 min-h-[260px] max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                                {/* Add button */}
                                <div
                                    onClick={() => setShowAddTx && setShowAddTx(true)}
                                    className="flex items-center gap-3 px-3 py-4 rounded-sm border border-transparent md:border-dashed md:border-black/10 dark:md:border-white/10 md:hover:border-black/30 dark:md:hover:border-white/30 bg-transparent md:hover:bg-black/[0.02] dark:md:hover:bg-white/[0.03] cursor-pointer transition-all group"
                                >
                                    <div className="size-10 rounded-sm bg-black/10 dark:bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-all">
                                        <span className="material-symbols-outlined text-xl">add</span>
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-black/45 dark:text-white/40 group-hover:text-black dark:group-hover:text-white transition-colors">ADD TRANSACTION</span>
                                </div>
                                  {filteredList.length > 0 ? filteredList.slice(0, 100).map(tx => (
                                    <div
                                        key={tx._id}
                                        className={`flex flex-col p-2.5 rounded-sm border transition-all ${
                                            selectedTxId === tx._id
                                                ? 'border-transparent md:border-black/20 dark:md:border-white/20 bg-transparent md:bg-black/[0.05] dark:md:bg-white/[0.05]'
                                                : 'border-transparent md:border-black/5 dark:md:border-white/5 md:hover:border-black/10 dark:md:hover:border-white/10 bg-transparent md:hover:bg-black/[0.02] dark:md:hover:bg-white/[0.02]'
                                        }`}
                                    >
                                        <div
                                            onClick={() => setSelectedTxId(prev => prev === tx._id ? null : tx._id)}
                                            className="flex items-center justify-between w-full cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="size-6 rounded-sm bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined text-xs text-black/30 dark:text-white/30">
                                                        {tx.type === 'income' ? 'payments' : tx.type === 'savings' ? 'savings' : tx.type === 'debt' ? 'warning' : tx.type === 'upcoming' ? 'schedule' : 'shopping_bag'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-black dark:text-white truncate leading-tight">
                                                        {tx.title}
                                                        {tx.isMonthly && (
                                                            <span className="ml-2 text-[7.5px] px-1.5 py-0.5 rounded-sm bg-black/10 dark:bg-white/10 text-black/60 dark:text-white/60 border border-black/5 dark:border-white/5 font-black uppercase tracking-widest inline-block align-middle">
                                                                {tx.monthsLeft}M
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className="text-[8px] font-black text-black/40 dark:text-white/30 uppercase tracking-widest">{tx.category}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-[11px] font-black tracking-wider" style={{ color: tx.type === 'income' || tx.type === 'upcoming' ? '#10b981' : '#f43f5e' }}>
                                                    {tx.type === 'expense' || tx.type === 'debt' ? '-' : ''}{localCurrency}{parseFloat(tx.amount).toLocaleString()}
                                                </span>
                                                <AnimatePresence>
                                                    {selectedTxId === tx._id && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.9 }}
                                                            className="flex items-center gap-1"
                                                        >
                                                            <button 
                                                                onClick={e => { e.stopPropagation(); setConfirmDelete(tx._id); }} 
                                                                className="p-1 rounded-sm bg-black/5 dark:bg-white/5 hover:bg-rose-500/20 text-rose-500/60 hover:text-rose-500 transition-all"
                                                                title="Delete"
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
                                                className="w-full mt-3 pt-3 border-t border-black/10 dark:border-white/5 space-y-2 text-left"
                                            >
                                                <p className="text-[7.5px] font-black uppercase tracking-widest text-black/40 dark:text-white/30 mb-2">RECURRING TIMELINE</p>
                                                <div className="space-y-1.5 pl-2 border-l border-black/10 dark:border-white/10">
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
                                                            
                                                            const d = new Date(startYear, startMonth + i, 1);
                                                            const lastDay = new Date(startYear, startMonth + i + 1, 0).getDate();
                                                            const dayToUse = Math.min(startDate.getDate() || 1, lastDay);
                                                            
                                                            const monthName = monthNames[mIdx].toUpperCase();
                                                            const label = `${monthName} ${dayToUse}, ${yVal}`;
                                                            const legacyLabel = `${monthName} ${yVal}`;
                                                            
                                                            const isPaid = isMonthPaid(tx, label, legacyLabel);
                                                            elements.push(
                                                                <div key={i} className="flex justify-between items-center text-[9px] text-black/60 dark:text-white/50 py-1.5 hover:bg-black/5 dark:hover:bg-white/[0.02] px-1.5 rounded-sm">
                                                                    <div className="flex items-center gap-3">
                                                                        <input 
                                                                            type="checkbox"
                                                                            checked={isPaid}
                                                                            onChange={(e) => {
                                                                                e.stopPropagation();
                                                                                handleToggleCheckbox(tx, label, e.target.checked, legacyLabel);
                                                                            }}
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            className="size-4 accent-emerald-500 rounded-sm cursor-pointer border border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5 shrink-0"
                                                                        />
                                                                        <span className={`font-mono ${isPaid ? 'line-through opacity-40 text-emerald-500/60' : ''}`}>{label}</span>
                                                                    </div>
                                                                    <span className={`font-black ${isPaid ? 'text-emerald-500' : 'text-black/80 dark:text-white/80'}`}>
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
                                                className="w-full mt-3 pt-3 border-t border-black/10 dark:border-white/5 space-y-2 text-left"
                                            >
                                                <p className="text-[7.5px] font-black uppercase tracking-widest text-black/40 dark:text-white/30 mb-2 font-mono">STATUS</p>
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
                                                        <div className="flex items-center gap-3 pl-2 py-1.5 hover:bg-black/5 dark:hover:bg-white/[0.02] px-1.5 rounded-sm">
                                                            <input 
                                                                type="checkbox"
                                                                checked={isPaid}
                                                                onChange={(e) => {
                                                                    e.stopPropagation();
                                                                    handleToggleCheckbox(tx, label, e.target.checked);
                                                                }}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="size-4 accent-emerald-500 rounded-sm cursor-pointer border border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5"
                                                            />
                                                            <span className={`text-[10px] font-black uppercase tracking-wider ${isPaid ? 'line-through text-emerald-500/60' : 'text-black dark:text-white'}`}>
                                                                MARK AS {tx.type === 'debt' ? 'PAID' : 'RECEIVED'} ({label})
                                                            </span>
                                                        </div>
                                                    );
                                                })()}
                                            </motion.div>
                                        )}
                                    </div>
                                )) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-black/35 dark:text-white/20 gap-2 min-h-[200px]">
                                        <span className="material-symbols-outlined text-2xl opacity-30">receipt_long</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest">NO TRANSACTIONS</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })()}
            </div>
        </div>

        {/* Add Transaction Modal */}
        <AddTransactionModal 
            isOpen={showAddTx}
            onClose={() => setShowAddTx(false)}
            addFinanceItem={addFinanceItem}
            availableCategories={availableCategories}
        />
    </div>
  );
};

export default FinancialOverview;
