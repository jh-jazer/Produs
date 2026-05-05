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
        <div className="flex flex-col gap-8 min-h-[500px] relative group">
            <ConfirmDialog
                isOpen={!!confirmDelete}
                title="DELETE RECORD"
                message="Are you sure you want to delete this transaction from your history?"
                confirmLabel="DELETE"
                onConfirm={() => handleDelete(confirmDelete)}
                onCancel={() => setConfirmDelete(null)}
            />

            {/* Hero Display Section */}
            <div className="relative min-h-[160px] flex flex-col justify-center">
                {viewMode === 'current' ? (
                    <motion.div 
                        key="balance"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-12 text-center rounded-sm bg-white/[0.03] border border-white/5 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4">TOTAL BALANCE</p>
                        <p className={`text-3xl font-black tracking-tighter italic ${displayedBalance >= 0 ? "text-white" : "text-rose-500"}`}>
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
            ? `Monthly Analysis: ${historyData.find(h => h.offset === selectedMonthOffset)?.label || 'Current'}` 
            : 'Real-time Financial Overview'}
        </p>
      </div>

            {/* Breakdown Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className={`p-8 rounded-sm border transition-all duration-500 ${
                    totalIncome > 0 ? 'bg-white/[0.02] border-white/10' : 'bg-white/[0.01] border-transparent opacity-40'
                }`}>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                        <span className="size-1 bg-white animate-pulse" />
                        TOTAL INCOME
                    </p>
                    <p className="text-xl font-black text-white italic tracking-tighter">{currencySymbol}{totalIncome.toLocaleString()}</p>
                </div>
                <div className={`p-8 rounded-sm border transition-all duration-500 ${
                    totalExpenses > 0 ? 'bg-white/[0.02] border-white/10' : 'bg-white/[0.01] border-transparent opacity-40'
                }`}>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                        <span className="size-1 bg-white animate-pulse" />
                        TOTAL EXPENSES
                    </p>
                    <p className="text-xl font-black text-white italic tracking-tighter">{currencySymbol}{totalExpenses.toLocaleString()}</p>
                </div>
            </div>

            {/* Expenditure Distribution Section */}
            <div className="space-y-6 pt-8 border-t border-white/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex bg-white/5 p-1 rounded-sm border border-white/5">
                            {[
                                { id: 'categories', label: 'CHART' },
                                { id: 'ledger', label: 'LIST' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setInnerView(tab.id)}
                                    className={`px-4 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all ${
                                        innerView === tab.id 
                                            ? 'bg-white text-black' 
                                            : 'text-white/20 hover:text-white/40'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em] hidden sm:block">EXPENSE BREAKDOWN</span>
                    </div>
                    
                    <button
                        onClick={() => setShowAddTx(true)}
                        className="size-10 rounded-sm bg-white text-black flex items-center justify-center hover:bg-white/80 transition-all border border-white/10"
                    >
                        <span className="material-symbols-outlined text-xl">add</span>
                    </button>
                </div>

                <div className="min-h-[240px]">
                    <AnimatePresence mode="wait">
                        {innerView === 'categories' ? (
                            <motion.div
                                key="cats"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="space-y-6"
                            >
                                {categories.length > 0 ? (
                                    categories.slice(0, 6).map((cat, i) => {
                                        return (
                                            <div key={cat.label} className="space-y-3">
                                                <div className="flex justify-between items-center px-1">
                                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{cat.label}</span>
                                                    <span className="text-[10px] font-black text-white italic tracking-widest">{currencySymbol}{cat.amount.toLocaleString()}</span>
                                                </div>
                                                <div className="w-full bg-white/5 rounded-sm h-[2px] overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${cat.percent}%` }}
                                                        className="h-full bg-white/40 transition-all duration-700" 
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
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
                                className="space-y-3 max-h-[360px] overflow-y-auto pr-4 custom-scrollbar"
                            >
                                {selectedTransactions.length > 0 ? (
                                    selectedTransactions.slice().reverse().map((tx) => (
                                        <div key={tx._id} className="flex items-center justify-between p-4 rounded-sm bg-white/[0.02] border border-white/5 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="size-8 rounded-sm bg-white/5 flex items-center justify-center text-white/20 border border-white/10">
                                                    <span className="material-symbols-outlined text-sm">{tx.type === 'income' ? 'payments' : tx.type === 'savings' ? 'savings' : 'shopping_bag'}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <p className="text-[11px] font-black text-white uppercase tracking-wider">{tx.title}</p>
                                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">{tx.category}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <p className="text-sm font-black text-white italic">
                                                    {tx.type === 'expense' ? '-' : '+'}{currencySymbol}{tx.amount.toLocaleString()}
                                                </p>
                                                <button 
                                                    onClick={() => setConfirmDelete(tx._id)}
                                                    className="size-6 rounded-sm border border-white/5 text-white/10 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center"
                                                >
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
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
            </div>

            {/* Footer Metadata */}
            <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between opacity-20">
                <div className="flex items-center gap-4 text-[8px] font-black uppercase tracking-[0.4em]">
                    <span>SYSTEM SECURE</span>
                    <div className="size-1 bg-white rounded-full animate-pulse" />
                    <span>v2.0</span>
                </div>
                <span className="text-[8px] font-mono tracking-widest uppercase opacity-40">UTC_{new Date().toISOString().split('T')[0]}</span>
            </div>

      {/* Add Transaction Portal */}
      {showAddTx && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
              <div className="absolute inset-0 bg-[#000000]/80 backdrop-blur-sm" onClick={() => setShowAddTx(false)}></div>
              <DashboardPanel
                  className="w-full max-w-md z-10 animate-in zoom-in-95 duration-200"
                  title="ADD TRANSACTION"
                  subtitle="NEW ENTRY"
                  headerExtra={
                      <button onClick={() => setShowAddTx(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                          <span className="material-symbols-outlined text-xl">close</span>
                      </button>
                  }
              >
                <form onSubmit={handleAdd} className="space-y-5 px-1 py-2">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">TITLE</label>
                        <input
                            type="text" required placeholder="Enter title..."
                            className="w-full bg-slate-50 dark:bg-[#000000] border dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
                            value={newTx.title} onChange={e => setNewTx({ ...newTx, title: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">AMOUNT</label>
                            <input
                                type="number" required step="0.01"
                                className="w-full bg-slate-50 dark:bg-[#000000] border dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
                                value={newTx.amount} onChange={e => setNewTx({ ...newTx, amount: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">TYPE</label>
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
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CATEGORY</label>
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
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">DATE</label>
                            <input
                                type="date" required
                                className="w-full bg-slate-50 dark:bg-[#000000] border dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
                                value={newTx.date} onChange={e => setNewTx({ ...newTx, date: e.target.value })}
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-4 bg-primary text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] transition-transform active:scale-[0.98] mt-4">
                        SAVE TRANSACTION
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
