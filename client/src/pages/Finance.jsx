import React from 'react';
import useAuthStore from '../store/useAuthStore';
import { useFinance } from '../hooks/useFinance';

import FinancialOverview from '../components/finance_components/FinancialOverview';
import DebtManager from '../components/finance_components/DebtManager';
import RecentTransactions from '../components/finance_components/RecentTransactions';
import MonthlyBudget from '../components/finance_components/MonthlyBudget';
import Wishlist from '../components/finance_components/Wishlist';
import BalanceHistory from '../components/finance_components/BalanceHistory';
import SavingsPanel from '../components/finance_components/SavingsPanel';
import MobileTabNav from '../components/ui/MobileTabNav';
import WorkspaceSkeleton from '../components/ui/WorkspaceSkeleton';

const Finance = () => {
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

    // Mobile Navigation State
    const [activeTab, setActiveTab] = React.useState('summary');

    const handleAction = () => {
        // useFinanceLocal uses useLiveQuery, so it auto-refreshes
    };

    // Calculate Summary Stats using data from hook
    const totalSavings = savings.reduce((sum, s) => sum + (s.amount || 0), 0);
    const actualDebts = debts.filter(d => d.nature === 'debt' || !d.nature);
    const upcomingIncome = debts.filter(d => d.nature === 'income');
    
    const totalDebt = actualDebts.reduce((sum, d) => sum + (d.amount || 0), 0);
    const totalUpcomingIncome = upcomingIncome.reduce((sum, d) => sum + (d.amount || 0), 0);

    const netBalance = totalSavings - totalDebt;

    const tabs = [
        { id: 'summary', label: 'Summary', icon: 'dashboard' },
        { id: 'budget', label: 'Budget', icon: 'account_balance_wallet' },
        { id: 'savings', label: 'Savings', icon: 'savings' },
        { id: 'wishlist', label: 'Wishlist', icon: 'shopping_bag' },
        { id: 'debts', label: 'Flow', icon: 'account_balance' },
    ];

    if (isLoading && transactions.length === 0) return <WorkspaceSkeleton />;

    return (
        <div className="w-full max-w-[1400px] lg:pt-8 flex flex-col gap-8 pb-28 md:pb-8 mx-auto px-0 md:px-0">
            
            {/* Mobile Navigation */}
            <MobileTabNav tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Tactical Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-0 md:px-0">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="size-2 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)] animate-pulse" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] font-mono">FINANCE_PROTOCOL_ACTIVE</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic font-exo">
                        Finance
                    </h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] max-w-md">
                        Status Overview
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Secondary Column (Left) */}
                <div className={`lg:col-span-4 flex flex-col gap-6 ${activeTab !== 'budget' && activeTab !== 'debts' ? 'hidden lg:flex' : ''}`}>
                    

                    {/* 2. Transactions */}
                    <div className={activeTab === 'budget' ? 'block' : 'hidden lg:block'}>
                        <RecentTransactions
                            transactions={transactions}
                            budgets={budgets}
                            currencySymbol={currencySymbol}
                            onAction={handleAction}
                            addFinanceItem={addFinanceItem}
                            deleteFinanceItem={deleteFinanceItem}
                        />
                    </div>

                    {/* 4. Budget */}
                    <div className={activeTab === 'budget' ? 'block' : 'hidden lg:block'}>
                        <MonthlyBudget
                            budgets={budgets}
                            transactions={transactions}
                            currencySymbol={currencySymbol}
                            onAction={handleAction}
                            addFinanceItem={addFinanceItem}
                            deleteFinanceItem={deleteFinanceItem}
                        />
                    </div>

                    {/* 6. Debt / Cash Flow */}
                    <div className={activeTab === 'debts' ? 'block' : 'hidden lg:block'}>
                        <DebtManager
                            debts={debts}
                            currencySymbol={currencySymbol}
                            onAction={handleAction}
                            addFinanceItem={addFinanceItem}
                            updateFinanceItem={updateFinanceItem}
                            deleteFinanceItem={deleteFinanceItem}
                        />
                    </div>
                </div>

                {/* Main Column (Right) */}
                <div className={`lg:col-span-8 flex flex-col gap-6 ${activeTab !== 'summary' && activeTab !== 'savings' && activeTab !== 'wishlist' ? 'hidden lg:flex' : ''}`}>
                    
                    {/* 1. Overview */}
                    <div className={activeTab === 'summary' ? 'block' : 'hidden lg:block'}>
                        <FinancialOverview
                            transactions={transactions}
                            currencySymbol={currencySymbol}
                            netBalance={netBalance}
                            totalSavings={totalSavings}
                            totalDebt={totalDebt}
                            totalUpcomingIncome={totalUpcomingIncome}
                        />
                    </div>

                    {/* 3. Savings */}
                    <div className={activeTab === 'savings' ? 'block' : 'hidden lg:block'}>
                        <SavingsPanel
                            savings={savings}
                            currencySymbol={currencySymbol}
                            onAction={handleAction}
                            addFinanceItem={addFinanceItem}
                            deleteFinanceItem={deleteFinanceItem}
                        />
                    </div>

                    {/* 5. Wishlist */}
                    <div className={activeTab === 'wishlist' ? 'block' : 'hidden lg:block'}>
                        <Wishlist
                            items={wishlist}
                            budgets={budgets}
                            currencySymbol={currencySymbol}
                            onAction={handleAction}
                            addFinanceItem={addFinanceItem}
                            deleteFinanceItem={deleteFinanceItem}
                        />
                    </div>

                    {/* 7. Balance History */}
                    <div className={activeTab === 'summary' ? 'block' : 'hidden lg:block'}>
                        <BalanceHistory />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Finance;
