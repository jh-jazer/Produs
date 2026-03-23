import React from 'react';
import useAuthStore from '../store/useAuthStore';
import useConnectivityStore from '../store/useConnectivityStore';
import { useFinanceLocal } from '../hooks/useFinanceLocal';

import FinancialOverview from '../components/finance_components/FinancialOverview';
import DebtManager from '../components/finance_components/DebtManager';
import RecentTransactions from '../components/finance_components/RecentTransactions';
import MonthlyBudget from '../components/finance_components/MonthlyBudget';
import Wishlist from '../components/finance_components/Wishlist';
import BalanceHistory from '../components/finance_components/BalanceHistory';
import SavingsPanel from '../components/finance_components/SavingsPanel';
import MobileTabNav from '../components/ui/MobileTabNav';

const Finance = () => {
    const { user } = useAuthStore();
    const isOnline = useConnectivityStore(state => state.isOnline);
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
    } = useFinanceLocal();

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

    return (
        <div className="w-full max-w-[1200px] lg:pt-12 flex flex-col gap-2 animate-in fade-in duration-700 pb-28 md:pb-8">
            
            {/* Mobile Navigation */}
            <MobileTabNav tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Secondary Column (Left) */}
                <div className={`lg:col-span-4 flex flex-col gap-6 ${activeTab !== 'budget' && activeTab !== 'debts' ? 'hidden lg:flex' : ''}`}>
                    
                    {/* Header - Hidden on Mobile */}
                    <div className="hidden lg:flex flex-col gap-1 px-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-semibold text-black dark:text-white tracking-[-0.02em]">Finance</h1>
                        </div>
                        <p className="text-black/40 dark:text-white/40 text-xs font-semibold uppercase tracking-[0.2em] mt-1">Status Overview</p>
                    </div>


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
