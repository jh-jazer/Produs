import React, { useEffect, useContext, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';
import { useFinance } from '../hooks/useFinance';
import SyncErrorToast from '../components/ui/SyncErrorToast';

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
    <div className="w-full flex flex-col">
        {title && (
            <div className="mb-6 hidden md:flex justify-between items-start px-4 md:px-0">
                <div className="flex flex-col gap-1">
                    <span className="text-2xl md:text-3xl font-black uppercase tracking-[0.3em] text-foreground/95">{title}</span>
                    {subtitle && <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/45">{subtitle}</span>}
                </div>
                {headerExtra && <div className="flex gap-2">{headerExtra}</div>}
            </div>
        )}
        <div className={`relative bg-transparent dark:bg-foreground/[0.02] dark:hover:bg-foreground/[0.04] transition-all px-0 md:px-12 py-4 md:py-8 rounded-sm group overflow-hidden ${className}`}>
            <div className="relative z-10">
                {children}
            </div>
        </div>
    </div>
);

import WorkspaceSidebar from '../components/ui/WorkspaceSidebar';

import { useNavigate, useLocation } from 'react-router-dom';

const Financial = () => {
    const { user } = useAuthStore();
    const location = useLocation();
    const currencySymbol = (user?.currency || 'PHP') === 'PHP' ? '₱' : '$';

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

    const [showErrorToast, setShowErrorToast] = useState(false);

    const handleAddFinance = async (type, data) => {
        const result = await addFinanceItem(type, data);
        if (result?.error) setShowErrorToast(true);
        return result;
    };

    const handleUpdateFinance = async (id, type, updates) => {
        const result = await updateFinanceItem(id, type, updates);
        if (result?.error) setShowErrorToast(true);
        return result;
    };

    const handleDeleteFinance = async (id) => {
        const result = await deleteFinanceItem(id);
        if (result?.error) setShowErrorToast(true);
        return result;
    };

    const navigate = useNavigate();
    const { setMobileTabs } = useContext(DashboardContext);
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'summary');

    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location.state?.activeTab]);

    useEffect(() => {
        setMobileTabs({
            tabs: [
                { id: 'summary', label: 'Summary', icon: 'account_balance' },
                { id: 'budget', label: 'Budget', icon: 'pie_chart' },
                { id: 'savings', label: 'Savings', icon: 'shield' },
                { id: 'wishlist', label: 'Wishlist', icon: 'shopping_cart' },
                { id: 'debts', label: 'Debts', icon: 'trending_up' },
            ],
            activeTab,
            setActiveTab: (tabId) => {
                setActiveTab(tabId);
                navigate(location.pathname, { replace: true, state: { ...location.state, activeTab: tabId } });
            }
        });
        return () => setMobileTabs(null);
    }, [activeTab, setMobileTabs, location.pathname, navigate, location.state]);

    // The active module is now driven by navigation state or external triggers
    const activeModule = activeTab;

    const handleAction = () => {
        // SWR handles refreshing
    };

    const [selectedYear, setSelectedYear] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [showAddTx, setShowAddTx] = useState(false);

    const formatDate = (dateInput) => {
        if (!dateInput) return new Date().toISOString().split('T')[0];
        try {
            const d = new Date(dateInput);
            if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
            return d.toISOString().split('T')[0];
        } catch (e) {
            return new Date().toISOString().split('T')[0];
        }
    };

    const getFilteredAmount = (d) => {
        const amt = parseFloat(d.amount) || 0;
        const dateStr = d.dueDate || formatDate(d.createdAt);
        const startDate = new Date(dateStr);
        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth();
        const duration = d.monthsLeft || 1;

        const targetYear = selectedYear === 'all' ? null : parseInt(selectedYear);
        const targetMonth = selectedMonth === 'all' ? null : parseInt(selectedMonth);

        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const isMonthInstancePaid = (offset) => {
            const mIdx = (startMonth + offset) % 12;
            const yVal = startYear + Math.floor((startMonth + offset) / 12);
            const label = `${monthNames[mIdx].toUpperCase()} ${yVal}`;
            const expectedTitle = d.nature === 'income' 
                ? `Received: ${d.title} (${label})`
                : `Paid: ${d.title} (${label})`;
            const expectedType = d.nature === 'income' ? 'income' : 'expense';
            return transactions.some(t => t.title === expectedTitle && t.type === expectedType);
        };

        if (!d.isMonthly) {
            const label = `${monthNames[startMonth].toUpperCase()} ${startYear}`;
            const expectedTitle = d.nature === 'income' 
                ? `Received: ${d.title} (${label})`
                : `Paid: ${d.title} (${label})`;
            const expectedType = d.nature === 'income' ? 'income' : 'expense';
            const isPaid = transactions.some(t => t.title === expectedTitle && t.type === expectedType);
            return isPaid ? 0 : amt;
        }

        // If viewing all time
        if (targetYear === null && targetMonth === null) {
            let sum = 0;
            for (let i = 0; i < duration; i++) {
                if (!isMonthInstancePaid(i)) {
                    sum += amt;
                }
            }
            return sum;
        }

        // If viewing a specific calendar month
        if (targetYear !== null && targetMonth !== null) {
            const startAbs = startYear * 12 + startMonth;
            const targetAbs = targetYear * 12 + targetMonth;
            if (targetAbs >= startAbs && targetAbs < startAbs + duration) {
                const offset = targetAbs - startAbs;
                return isMonthInstancePaid(offset) ? 0 : amt;
            }
            return 0;
        }

        // If viewing a specific year (all months)
        if (targetYear !== null && targetMonth === null) {
            let sum = 0;
            const startAbs = startYear * 12 + startMonth;
            const endAbs = startAbs + duration - 1;
            const yearStartAbs = targetYear * 12;
            const yearEndAbs = targetYear * 12 + 11;

            const overlapStart = Math.max(startAbs, yearStartAbs);
            const overlapEnd = Math.min(endAbs, yearEndAbs);

            if (overlapStart <= overlapEnd) {
                for (let abs = overlapStart; abs <= overlapEnd; abs++) {
                    const offset = abs - startAbs;
                    if (!isMonthInstancePaid(offset)) {
                        sum += amt;
                    }
                }
            }
            return sum;
        }

        // If viewing a specific month across all years
        if (targetYear === null && targetMonth !== null) {
            let sum = 0;
            for (let i = 0; i < duration; i++) {
                if ((startMonth + i) % 12 === targetMonth) {
                    if (!isMonthInstancePaid(i)) {
                        sum += amt;
                    }
                }
            }
            return sum;
        }

        return amt;
    };

    const filteredDebts = useMemo(() => {
        return debts.filter(d => {
            const dateStr = d.dueDate || formatDate(d.createdAt);
            const startDate = new Date(dateStr);
            const startYear = startDate.getFullYear();
            const startMonth = startDate.getMonth();

            const targetYear = selectedYear === 'all' ? null : parseInt(selectedYear);
            const targetMonth = selectedMonth === 'all' ? null : parseInt(selectedMonth);

            // If standard non-recurring debt
            if (!d.isMonthly) {
                const matchYear = targetYear === null || startYear === targetYear;
                const matchMonth = targetMonth === null || startMonth === targetMonth;
                return matchYear && matchMonth;
            }

            // If recurring debt
            const duration = d.monthsLeft || 1;
            const startAbs = startYear * 12 + startMonth;
            const endAbs = startAbs + duration - 1;

            if (targetYear !== null && targetMonth !== null) {
                const targetAbs = targetYear * 12 + targetMonth;
                return targetAbs >= startAbs && targetAbs <= endAbs;
            }

            if (targetYear !== null && targetMonth === null) {
                const yearStartAbs = targetYear * 12;
                const yearEndAbs = targetYear * 12 + 11;
                return startAbs <= yearEndAbs && endAbs >= yearStartAbs;
            }

            if (targetYear === null && targetMonth !== null) {
                for (let i = 0; i < duration; i++) {
                    if ((startMonth + i) % 12 === targetMonth) return true;
                }
                return false;
            }

            return true;
        });
    }, [debts, selectedYear, selectedMonth]);

    const filteredSavings = useMemo(() => {
        return savings.filter(s => {
            const dateStr = formatDate(s.createdAt);
            const sDate = new Date(dateStr);
            if (selectedYear !== 'all' && sDate.getFullYear() !== parseInt(selectedYear)) return false;
            if (selectedMonth !== 'all' && sDate.getMonth() !== parseInt(selectedMonth)) return false;
            return true;
        });
    }, [savings, selectedYear, selectedMonth]);

    const totalSavingsForMonth = useMemo(() => {
        return filteredSavings.reduce((sum, s) => sum + (s.amount || 0), 0);
    }, [filteredSavings]);

    const actualDebtsForMonth = useMemo(() => {
        return filteredDebts.filter(d => d.nature === 'debt' || !d.nature);
    }, [filteredDebts]);

    const totalDebtForMonth = useMemo(() => {
        return actualDebtsForMonth.reduce((sum, d) => sum + getFilteredAmount(d), 0);
    }, [actualDebtsForMonth, selectedYear, selectedMonth]);

    const upcomingIncomeForMonth = useMemo(() => {
        return filteredDebts.filter(d => d.nature === 'income');
    }, [filteredDebts]);

    const totalUpcomingIncomeForMonth = useMemo(() => {
        return upcomingIncomeForMonth.reduce((sum, d) => sum + getFilteredAmount(d), 0);
    }, [upcomingIncomeForMonth, selectedYear, selectedMonth]);

    const netBalance = totalSavingsForMonth - totalDebtForMonth;

    const combinedTransactions = useMemo(() => {
        const debtTxs = debts.map(d => ({
            _id: `debt-${d._id}`,
            title: d.title,
            amount: d.amount,
            type: d.nature === 'income' ? 'upcoming' : 'debt',
            category: d.nature === 'income' ? 'Receivable' : 'Debt',
            date: d.dueDate || d.createdAt,
            isMonthly: d.isMonthly,
            monthsLeft: d.monthsLeft,
            startDate: d.dueDate || d.createdAt,
            monthlyAmount: d.amount
        }));
        const savingsTxs = savings.map(s => ({
            _id: `savings-${s._id}`,
            title: s.title,
            amount: s.amount,
            type: 'savings',
            category: 'Savings',
            date: s.createdAt
        }));
        return [...transactions, ...debtTxs, ...savingsTxs];
    }, [transactions, debts, savings]);

    if (isLoading && transactions.length === 0) return <WorkspaceSkeleton />;

    return (
        <div className="w-full bg-transparent text-foreground px-0 pt-24 pb-12 md:pt-20 md:pb-16 font-sans overflow-x-hidden flex flex-col items-center">
            <div className="w-full mt-4 md:mt-6">
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
                                <HUDPanel title="FINANCE HUB" subtitle="FINANCIAL SUMMARY">
                                    <FinancialOverview
                                        transactions={transactions}
                                        budgets={budgets}
                                        currencySymbol={currencySymbol}
                                        totalSavings={totalSavingsForMonth}
                                        totalDebt={totalDebtForMonth}
                                        totalUpcomingIncome={totalUpcomingIncomeForMonth}
                                        addFinanceItem={handleAddFinance}
                                        deleteFinanceItem={handleDeleteFinance}
                                        updateFinanceItem={handleUpdateFinance}
                                        showAddTx={showAddTx}
                                        setShowAddTx={setShowAddTx}
                                        selectedYear={selectedYear}
                                        setSelectedYear={setSelectedYear}
                                        selectedMonth={selectedMonth}
                                        setSelectedMonth={setSelectedMonth}
                                        selectedTransactions={combinedTransactions}
                                        allTransactions={transactions}
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
                                        addFinanceItem={handleAddFinance}
                                        deleteFinanceItem={handleDeleteFinance}
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
                                        addFinanceItem={handleAddFinance}
                                        deleteFinanceItem={handleDeleteFinance}
                                        updateFinanceItem={handleUpdateFinance}
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
                                        addFinanceItem={handleAddFinance}
                                        deleteFinanceItem={handleDeleteFinance}
                                        updateFinanceItem={handleUpdateFinance}
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
                                        addFinanceItem={handleAddFinance}
                                        updateFinanceItem={handleUpdateFinance}
                                        deleteFinanceItem={handleDeleteFinance}
                                    />
                                </HUDPanel>
                            )}
                        </div>

                    </motion.div>
                </AnimatePresence>
                <SyncErrorToast show={showErrorToast} onDismiss={() => setShowErrorToast(false)} />
            </div>
        </div>
    );
};

export default Financial;
