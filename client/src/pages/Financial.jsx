import React, { useEffect, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';
import { useFinance } from '../hooks/useFinance';

import FinancialOverview from '../components/finance_components/FinancialOverview';
import DebtManager from '../components/finance_components/DebtManager';
import MonthlyBudget from '../components/finance_components/MonthlyBudget';
import Wishlist from '../components/finance_components/Wishlist';
import SavingsPanel from '../components/finance_components/SavingsPanel';
import WorkspaceSkeleton from '../components/ui/WorkspaceSkeleton';
import { DashboardContext } from '../context/DashboardContext';

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

const HUDPanel = ({ title, subtitle, children, headerExtra, className = "" }) => (
  <div className={`relative bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-all p-8 rounded-sm group overflow-hidden ${className}`}>
    <ChippedBorder opacity={0.6} />
    <div className="relative z-10">
      <div className="mb-8 flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-foreground/40">{title}</span>
          {subtitle && <span className="text-[8px] font-mono uppercase tracking-widest opacity-20">{subtitle}</span>}
        </div>
        {headerExtra && <div className="flex gap-2">{headerExtra}</div>}
      </div>
      {children}
    </div>
  </div>
);

import WorkspaceSidebar from '../components/ui/WorkspaceSidebar';

const Financial = () => {
    const { user } = useAuthStore();
    const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

    const { 
        transactions, 
        budgets, 
        debts, 
        wishlist, 
        savings, 
        addFinanceItem, 
        updateFinanceItem, 
        deleteFinanceItem,
        isLoading 
    } = useFinance();

    const { setMobileTabs } = useContext(DashboardContext);
    const [activeTab, setActiveTab] = useState('summary');

    useEffect(() => {
        setMobileTabs({ tabs, activeTab, setActiveTab });
        return () => setMobileTabs(null);
    }, [activeTab, setMobileTabs]);

    const handleAction = () => {
        // SWR handles refreshing
    };

    const totalSavings = savings.reduce((sum, s) => sum + (s.amount || 0), 0);
    const actualDebts = debts.filter(d => d.nature === 'debt' || !d.nature);
    const upcomingIncome = debts.filter(d => d.nature === 'income');
    
    const totalDebt = actualDebts.reduce((sum, d) => sum + (d.amount || 0), 0);
    const totalUpcomingIncome = upcomingIncome.reduce((sum, d) => sum + (d.amount || 0), 0);
    const netBalance = totalSavings - totalDebt;

    const tabs = [
        { id: 'summary', label: 'Overview', icon: 'account_balance' },
        { id: 'budget', label: 'Budget', icon: 'pie_chart' },
        { id: 'savings', label: 'Vault', icon: 'shield' },
        { id: 'wishlist', label: 'Targets', icon: 'shopping_cart' },
        { id: 'debts', label: 'Flow', icon: 'trending_up' },
    ];

    if (isLoading && transactions.length === 0) return <WorkspaceSkeleton />;

    return (
        <div className="w-full bg-transparent text-foreground p-8 pt-0 md:p-12 font-sans overflow-x-hidden flex flex-col md:flex-row items-start gap-8 md:gap-12">
            {/* Tactical Navigation Bar - Vertical on Desktop */}
            <WorkspaceSidebar 
                tabs={tabs} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                namespace="Financial" 
            />

            <div className="flex-1">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col gap-8 md:gap-12"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            
                            {/* Tab Content Division */}
                            <div className="lg:col-span-12">
                                {/* SUMMARY DIVISION */}
                                {activeTab === 'summary' && (
                                    <div className="max-w-6xl mx-auto w-full">
                                        <HUDPanel title="FINANCIAL OVERVIEW" subtitle="NET WORTH & ASSETS">
                                            <FinancialOverview
                                                transactions={transactions}
                                                budgets={budgets}
                                                currencySymbol={currencySymbol}
                                                netBalance={netBalance}
                                                totalSavings={totalSavings}
                                                totalDebt={totalDebt}
                                                totalUpcomingIncome={totalUpcomingIncome}
                                                addFinanceItem={addFinanceItem}
                                                deleteFinanceItem={deleteFinanceItem}
                                            />
                                        </HUDPanel>
                                    </div>
                                )}

                                {/* BUDGET DIVISION */}
                                {activeTab === 'budget' && (
                                    <HUDPanel title="MONTHLY BUDGET" subtitle="ACTIVE SPENDING">
                                        <MonthlyBudget
                                            budgets={budgets}
                                            transactions={transactions}
                                            currencySymbol={currencySymbol}
                                            onAction={handleAction}
                                            addFinanceItem={addFinanceItem}
                                            deleteFinanceItem={deleteFinanceItem}
                                        />
                                    </HUDPanel>
                                )}

                                {/* SAVINGS DIVISION */}
                                {activeTab === 'savings' && (
                                    <div className="max-w-4xl mx-auto w-full">
                                        <HUDPanel title="SAVINGS & VAULT" subtitle="EMERGENCY FUNDS">
                                            <SavingsPanel
                                                savings={savings}
                                                currencySymbol={currencySymbol}
                                                onAction={handleAction}
                                                addFinanceItem={addFinanceItem}
                                                deleteFinanceItem={deleteFinanceItem}
                                            />
                                        </HUDPanel>
                                    </div>
                                )}

                                {/* WISHLIST DIVISION */}
                                {activeTab === 'wishlist' && (
                                    <div className="max-w-4xl mx-auto w-full">
                                        <HUDPanel title="WISHLIST" subtitle="PLANNED PURCHASES">
                                            <Wishlist
                                                items={wishlist}
                                                budgets={budgets}
                                                currencySymbol={currencySymbol}
                                                onAction={handleAction}
                                                addFinanceItem={addFinanceItem}
                                                deleteFinanceItem={deleteFinanceItem}
                                            />
                                        </HUDPanel>
                                    </div>
                                )}

                                {/* DEBTS DIVISION */}
                                {activeTab === 'debts' && (
                                    <div className="max-w-4xl mx-auto w-full">
                                        <HUDPanel title="DEBTS & INCOME" subtitle="CASH FLOW TRACKER">
                                            <DebtManager
                                                debts={debts}
                                                currencySymbol={currencySymbol}
                                                onAction={handleAction}
                                                addFinanceItem={addFinanceItem}
                                                updateFinanceItem={updateFinanceItem}
                                                deleteFinanceItem={deleteFinanceItem}
                                            />
                                        </HUDPanel>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* System Metadata Footer */}
                        <div className="mt-16 pt-8 border-t border-foreground/5 flex justify-between items-center opacity-20">
                          <span className="text-[8px] font-black uppercase tracking-[0.5em]">PRODUS_FINANCIAL_WORKSPACE_v0.2</span>
                          <div className="flex gap-2">
                            {[1,2,3,4,5,6].map(i => <div key={i} className="size-1 bg-foreground rounded-full" />)}
                          </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Financial;
