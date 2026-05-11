import React, { useState } from 'react';
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
    selectedTransactions, 
    totalExpenses, 
    localCurrency, 
    setShowAddTx 
}) => {
    const [innerView, setInnerView] = useState('categories'); // 'categories' | 'ledger'

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

    return (
        <div className="flex flex-col gap-6 h-full relative z-10">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.6em]">BREAKDOWN</span>
                
                {/* Add Entry Button - Icon Only */}
                <button 
                    onClick={() => setShowAddTx(true)}
                    className="size-8 rounded-sm bg-white/5 text-white/60 flex items-center justify-center hover:bg-white hover:text-black transition-all border border-white/10 group shadow-lg shadow-black/20"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                </button>
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
                                            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{cat.label}</span>
                                            <span className="text-[9px] font-black text-white italic tracking-widest">{localCurrency}{cat.amount.toLocaleString()}</span>
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
                                selectedTransactions.slice().reverse().map((tx) => (
                                    <div key={tx._id} className="flex items-center justify-between p-3 rounded-sm bg-white/[0.02] border border-white/5 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="size-6 rounded-sm bg-white/5 flex items-center justify-center text-white/20 border border-white/10">
                                                <span className="material-symbols-outlined text-[10px]">{tx.type === 'income' ? 'payments' : tx.type === 'savings' ? 'savings' : 'shopping_bag'}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-[10px] font-black text-white uppercase tracking-wider truncate max-w-[80px]">{tx.title}</p>
                                                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">{tx.category}</p>
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-black text-white italic">
                                            {tx.type === 'expense' ? '-' : '+'}{localCurrency}{tx.amount.toLocaleString()}
                                        </p>
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
            <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                <span className="text-[8px] font-black text-white/10 uppercase tracking-[0.3em]">NAV_PROTOCOL</span>
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
        </div>
    );
};

export default FinancialBreakdown;
