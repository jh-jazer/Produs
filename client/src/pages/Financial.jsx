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
    <div className={`relative bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-all p-4 md:p-8 rounded-sm group overflow-hidden ${className}`}>
        <div className="hidden md:block">
            <ChippedBorder opacity={0.6} />
        </div>
        <div className="relative z-10">
            {title && (
                <div className="mb-8 flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-foreground/40">{title}</span>
                        {subtitle && <span className="text-[8px] font-mono uppercase tracking-widest opacity-20">{subtitle}</span>}
                    </div>
                    {headerExtra && <div className="flex gap-2">{headerExtra}</div>}
                </div>
            )}
            {children}
        </div>
    </div>
);

import WorkspaceSidebar from '../components/ui/WorkspaceSidebar';

import { useNavigate, useLocation } from 'react-router-dom';

const Financial = () => {
    const { user } = useAuthStore();
    const location = useLocation();
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

    // The active module is now driven by navigation state or external triggers
    const activeModule = location.state?.activeTab || 'summary';

    const handleAction = () => {
        // SWR handles refreshing
    };

    const totalSavings = savings.reduce((sum, s) => sum + (s.amount || 0), 0);
    const actualDebts = debts.filter(d => d.nature === 'debt' || !d.nature);
    const upcomingIncome = debts.filter(d => d.nature === 'income');

    const totalDebt = actualDebts.reduce((sum, d) => sum + (d.amount || 0), 0);
    const totalUpcomingIncome = upcomingIncome.reduce((sum, d) => sum + (d.amount || 0), 0);
    const netBalance = totalSavings - totalDebt;

    if (isLoading && transactions.length === 0) return <WorkspaceSkeleton />;

    return (
        <div className="w-full bg-transparent text-foreground p-8 pt-12 md:p-12 md:pt-16 font-sans overflow-x-hidden flex flex-col items-center">
            <div className="w-full max-w-7xl">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeModule}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col gap-8 md:gap-12"
                    >
                        {/* Tab Content Division */}
                        <div className="w-full">
                            {/* SUMMARY DIVISION */}
                            {activeModule === 'summary' && (
                                <HUDPanel>
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
                            )}

                            {/* BUDGET DIVISION */}
                            {activeModule === 'budget' && (
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
                            {activeModule === 'savings' && (
                                <HUDPanel title="SAVINGS ACCOUNTS" subtitle="EMERGENCY FUNDS">
                                    <SavingsPanel
                                        savings={savings}
                                        currencySymbol={currencySymbol}
                                        onAction={handleAction}
                                        addFinanceItem={addFinanceItem}
                                        deleteFinanceItem={deleteFinanceItem}
                                    />
                                </HUDPanel>
                            )}

                            {/* WISHLIST DIVISION */}
                            {activeModule === 'wishlist' && (
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
                            )}

                            {/* DEBTS DIVISION */}
                            {activeModule === 'debts' && (
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
                            )}
                        </div>

                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Financial;
