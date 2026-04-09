import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import DashboardPanel from "../ui/DashboardPanel";
import ConfirmDialog from "../ui/ConfirmDialog";

const FinancialOverview = ({
  transactions = [],
  budgets = [],
  currencySymbol = "$",
  totalSavings = 0,
  totalDebt = 0,
  totalUpcomingIncome = 0,
  addFinanceItem,
  deleteFinanceItem,
}) => {
  const [includeSavings, setIncludeSavings] = useState(false);
  const [includeUpcoming, setIncludeUpcoming] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState("current"); // 'current' | 'history'
  const [innerView, setInnerView] = useState("categories"); // 'categories' | 'ledger'
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0); 
  const [showAddTx, setShowAddTx] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [newTx, setNewTx] = useState({ 
      title: '', 
      amount: '', 
      type: 'expense', 
      category: 'General', 
      date: new Date().toISOString().split('T')[0] 
  });

  const now = new Date();

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

  // Current selected month transactions
  const selectedTransactions = useMemo(() => {
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + selectedMonthOffset);
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

  const ledgerBalance = transactions.reduce((sum, t) => {
    const amt = parseFloat(t.amount) || 0;
    return t.type === "income" ? sum + amt : sum - amt;
  }, 0);

  let displayedBalance = ledgerBalance;
  if (includeSavings) displayedBalance += totalSavings;
  if (includeUpcoming) {
    displayedBalance += totalUpcomingIncome - totalDebt;
  }

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

  const handleAdd = async (e) => {
    e.preventDefault();
    const txData = { ...newTx, amount: parseFloat(newTx.amount) || 0 };
    await addFinanceItem('transaction', txData);
    setShowAddTx(false);
    setNewTx({ title: '', amount: '', type: 'expense', category: 'General', date: new Date().toISOString().split('T')[0] });
  };

  const handleDelete = async (id) => {
    await deleteFinanceItem(id);
    setConfirmDelete(null);
  };

  return (
    <div className="flex flex-col gap-6 min-h-[500px] relative group">
      <ConfirmDialog
          isOpen={!!confirmDelete}
          title="Delete Transaction"
          message="Are you sure you want to delete this operational record?"
          confirmLabel="Delete"
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
      />

      {/* Header */}
      <div className="flex justify-end items-center">
        <div className="flex items-center gap-2">
           {/* Main View Toggle */}
           <div className="flex bg-slate-100 dark:bg-white/[0.03] p-1 rounded-xl mr-2">
            {[
              { id: 'current', icon: 'account_balance' },
              { id: 'history', icon: 'bar_chart' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setViewMode(tab.id);
                  if (tab.id === 'current') setSelectedMonthOffset(0);
                }}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === tab.id 
                    ? 'bg-white dark:bg-[#121212] text-primary shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="size-8 rounded-lg bg-slate-100 dark:bg-[#000000] text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-none"
            title="Overview Settings"
          >
            <span className="material-symbols-outlined text-lg">settings</span>
          </button>
        </div>
      </div>

      {/* Config Overlay */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 right-0 z-20 w-64 bg-white dark:bg-[#000000] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl p-4"
          >
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Balance Components</p>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Include Savings</span>
                <div className="relative">
                  <input type="checkbox" className="sr-only peer" checked={includeSavings} onChange={() => setIncludeSavings(!includeSavings)} />
                  <div className="w-8 h-4 bg-slate-200 dark:bg-[#121212] rounded-full peer peer-checked:bg-primary transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
                </div>
              </label>
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Include Upcoming Cashflow</span>
                <div className="relative">
                  <input type="checkbox" className="sr-only peer" checked={includeUpcoming} onChange={() => setIncludeUpcoming(!includeUpcoming)} />
                  <div className="w-8 h-4 bg-slate-200 dark:bg-[#121212] rounded-full peer peer-checked:bg-emerald-500 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
                </div>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Display Section */}
      <div className="relative min-h-[160px] flex flex-col justify-center">
        {viewMode === 'current' ? (
          <motion.div 
            key="balance"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-[#000000]/50 border border-slate-100 dark:border-white/5"
          >
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Net Balance</p>
            <p className={`text-4xl font-black ${displayedBalance >= 0 ? "text-emerald-500" : "text-rose-500 font-exo italic"}`}>
              {currencySymbol}{Math.abs(displayedBalance).toLocaleString()}
            </p>

            <div className="flex items-center justify-center gap-3 mt-4">
              {includeSavings && (
                <span className="px-2 py-1 rounded-md text-[8px] font-black bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest">
                  +Savings
                </span>
              )}
              {includeUpcoming && (
                <span className="px-2 py-1 rounded-md text-[8px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-widest">
                  +Upcoming
                </span>
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

      {/* Dynamic Breakdown Header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
          {viewMode === 'history' 
            ? `Analysis Buffer: ${historyData.find(h => h.offset === selectedMonthOffset)?.label || 'Current'}` 
            : 'Operational Realtime Analysis'}
        </p>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-5 rounded-2xl border transition-all duration-500 ${
          totalIncome > 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-50/50 dark:bg-white/5 border-transparent opacity-60'
        }`}>
          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Inflow
          </p>
          <p className="text-2xl font-black text-emerald-500 font-exo italic tracking-tight">{currencySymbol}{totalIncome.toLocaleString()}</p>
        </div>
        <div className={`p-5 rounded-2xl border transition-all duration-500 ${
          totalExpenses > 0 ? 'bg-rose-500/5 border-rose-500/20' : 'bg-slate-50/50 dark:bg-white/5 border-transparent opacity-60'
        }`}>
          <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
            Outflow
          </p>
          <p className="text-2xl font-black text-rose-500 font-exo italic tracking-tight">{currencySymbol}{totalExpenses.toLocaleString()}</p>
        </div>
      </div>

      {/* Expenditure Distribution Section */}
      <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             {/* Sub-toggle View */}
             <div className="flex bg-slate-50 dark:bg-white/[0.03] p-1 rounded-xl">
              {[
                { id: 'categories', label: 'Overview' },
                { id: 'ledger', label: 'Ledger' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setInnerView(tab.id)}
                  className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                    innerView === tab.id 
                      ? 'bg-white dark:bg-[#121212] text-primary shadow-sm' 
                      : 'text-slate-400'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">Expenditure Mapping</p>
          </div>
          
          <button
            onClick={() => setShowAddTx(true)}
            className="size-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-lg">add</span>
          </button>
        </div>

        <div className="min-h-[200px]">
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
                  categories.slice(0, 5).map((cat, i) => {
                    const bgColors = ["bg-primary", "bg-emerald-500", "bg-amber-500", "bg-purple-500", "bg-rose-500"];
                    const bgColor = bgColors[i % bgColors.length];
                    return (
                      <div key={cat.label} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{cat.label}</span>
                          <span className="text-[10px] font-black text-slate-900 dark:text-white">{currencySymbol}{cat.amount.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-[#000000] rounded-full h-1 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${cat.percent}%` }}
                            className={`h-full ${bgColor} transition-all duration-700`} 
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <EmptyState text="No dimensional expenditures logged" />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="ledger"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar"
              >
                {selectedTransactions.length > 0 ? (
                  selectedTransactions.slice().reverse().map((tx) => (
                    <div key={tx._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className={`size-8 rounded-lg flex items-center justify-center ${
                          tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : tx.type === 'savings' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          <span className="material-symbols-outlined text-sm">{tx.type === 'income' ? 'payments' : tx.type === 'savings' ? 'savings' : 'shopping_bag'}</span>
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-tight truncate max-w-[120px]">{tx.title}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase">{tx.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className={`text-xs font-black ${tx.type === 'income' ? 'text-emerald-500' : tx.type === 'savings' ? 'text-amber-500' : 'text-rose-500'}`}>
                          {tx.type === 'expense' ? '-' : '+'}{currencySymbol}{tx.amount.toLocaleString()}
                        </p>
                        <button 
                          onClick={() => setConfirmDelete(tx._id)}
                          className="size-6 rounded-lg hover:bg-rose-500/10 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState text="Zero transaction vectors in this buffer" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        <div className="flex items-center gap-4">
          <span className="opacity-40">System Snapshot_</span>
          <span className={displayedBalance >= 0 ? "text-emerald-500" : "text-rose-500 font-exo italic"}>
            {displayedBalance >= 0 ? "SURPLUS" : "DEFICIT_LIMIT"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-emerald-500 uppercase">Live_Secure_Link</span>
        </div>
      </div>

      {/* Add Transaction Portal */}
      {showAddTx && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
              <div className="absolute inset-0 bg-[#000000]/80 backdrop-blur-sm" onClick={() => setShowAddTx(false)}></div>
              <DashboardPanel
                  className="w-full max-w-md z-10 animate-in zoom-in-95 duration-200"
                  title="Entry Interface"
                  subtitle="Manual Vector Log"
                  headerExtra={
                      <button onClick={() => setShowAddTx(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                          <span className="material-symbols-outlined text-xl">close</span>
                      </button>
                  }
              >
                <form onSubmit={handleAdd} className="space-y-5 px-1 py-2">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Objective_Title</label>
                        <input
                            type="text" required placeholder="Log entry title..."
                            className="w-full bg-slate-50 dark:bg-[#000000] border dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
                            value={newTx.title} onChange={e => setNewTx({ ...newTx, title: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantum_Amount</label>
                            <input
                                type="number" required step="0.01"
                                className="w-full bg-slate-50 dark:bg-[#000000] border dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
                                value={newTx.amount} onChange={e => setNewTx({ ...newTx, amount: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vector_Type</label>
                            <select
                                className="w-full bg-slate-50 dark:bg-[#000000] border dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold appearance-none cursor-pointer"
                                value={newTx.type} onChange={e => setNewTx({ ...newTx, type: e.target.value })}
                            >
                                <option value="expense">Expense (-)</option>
                                <option value="income">Income (+)</option>
                                <option value="savings">Vault (★)</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classification</label>
                            <select
                                className="w-full bg-slate-50 dark:bg-[#000000] border dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold appearance-none cursor-pointer"
                                value={newTx.category} onChange={e => setNewTx({ ...newTx, category: e.target.value })}
                            >
                                {availableCategories.sort().map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time_Stamp</label>
                            <input
                                type="date" required
                                className="w-full bg-slate-50 dark:bg-[#000000] border dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
                                value={newTx.date} onChange={e => setNewTx({ ...newTx, date: e.target.value })}
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-4 bg-primary text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] transition-transform active:scale-[0.98] mt-4">
                        COMMIT_TO_LEDGER
                    </button>
                </form>
              </DashboardPanel>
          </div>,
          document.body
      )}
    </div>
  );
};

const EmptyState = ({ text }) => (
  <div className="py-12 text-center bg-slate-50 dark:bg-[#000000]/20 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center gap-2">
    <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 text-3xl">terminal</span>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">{text}</p>
  </div>
);

export default FinancialOverview;
