import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
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
  currencySymbol = "$",
  totalSavings = 0,
  totalDebt = 0,
  totalUpcomingIncome = 0,
  addFinanceItem,
  deleteFinanceItem,
  compact = false,
  showAddTx,
  setShowAddTx,
  selectedYear = 'all',
  setSelectedYear,
  selectedMonth = 'all',
  setSelectedMonth
}) => {
  const [foresee, setForesee] = useState(false);
  const [localCurrency, setLocalCurrency] = useState(currencySymbol);
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState("current"); 
  const [confirmDelete, setConfirmDelete] = useState(null);

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
  const selectedTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      if (selectedYear !== 'all' && d.getFullYear() !== parseInt(selectedYear)) return false;
      if (selectedMonth !== 'all' && selectedYear !== 'all' && d.getMonth() !== parseInt(selectedMonth)) return false;
      return true;
    });
  }, [transactions, selectedYear, selectedMonth]);

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
                <div className="flex justify-between items-start mb-6">
                    <div className="hidden md:flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white">FINANCES</span>
                        <span className="text-[8px] font-mono uppercase tracking-widest text-white/40">REAL-TIME SYNC</span>
                    </div>
                </div>

                <div className="relative min-h-[80px] flex flex-col justify-center">
                    {viewMode === 'current' ? (
                        <motion.div 
                            key="balance"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-12 text-center rounded-sm bg-white/10 dark:bg-white/[0.02] border border-black/5 dark:border-white/10 backdrop-blur-sm relative overflow-hidden shadow-md"
                        >
                            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                                <button 
                                    onClick={() => setShowSettings(true)}
                                    className="size-8 flex items-center justify-center rounded-sm text-white/40 hover:text-white transition-colors"
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
                                        className="bg-white/5 border border-white/10 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-sm px-4 py-2 outline-none appearance-none cursor-pointer hover:bg-white/10 transition-all pr-10"
                                    >
                                        {dropdownOptions.map(opt => (
                                            <option key={opt.value} value={opt.value} className="bg-black text-white">
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none text-xs">
                                        expand_more
                                    </span>
                                </div>

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

                            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            <p 
                                className="font-black tracking-tighter leading-none pt-10"
                                style={{ 
                                    fontSize: '3.5rem',
                                    color: displayedBalance > 0 ? '#10b981' : displayedBalance < 0 ? '#f43f5e' : '#ffffff'
                                }}
                            >
                                {displayedBalance < 0 ? '-' : ''}{localCurrency}{Math.abs(displayedBalance).toLocaleString()}
                            </p>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.6em] mt-2">
                                TOTAL BALANCE {selectedYear === 'all' ? '(ALL TIME)' : `- ${(() => {
                                    const d = new Date(selectedYear, selectedMonth, 1);
                                    return `${d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()} ${selectedYear}`;
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
                                        PROJECTION ACTIVE (BAL + RECEIVABLES - DEBT)
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
