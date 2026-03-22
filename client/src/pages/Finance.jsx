import React from 'react';
import useSWR from 'swr';
import useAuthStore from '../store/useAuthStore';
import useConnectivityStore from '../store/useConnectivityStore';

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


    // Data fetching
    const { data: transactions = [], mutate: mutateTx } = useSWR('/finance/transactions');
    const { data: budgets = [], mutate: mutateBudgets } = useSWR('/finance/budgets');
    const { data: debts = [], mutate: mutateDebts } = useSWR('/finance/debts');
    const { data: wishlist = [], mutate: mutateWishlist } = useSWR('/finance/wishlist');
    const { data: savings = [], mutate: mutateSavings } = useSWR('/finance/savings');

    // Mobile Navigation State
    const [activeTab, setActiveTab] = React.useState('summary');

    const offlineQueue = useConnectivityStore(state => state.offlineQueue);

    // Helper to augment data with offline additions and filter out offline deletions
    const augmentData = (serverData, type) => {
        const pendingAdditions = offlineQueue
            .filter(item => item.type === type && (item.method === 'POST' || item.method === 'PUT'))
            .map(item => ({
                ...item.data,
                _id: item.id,
                isPending: true
            }));

        const pendingDeletions = new Set(
            offlineQueue
                .filter(item => item.type === type && item.method === 'DELETE')
                .map(item => item.id)
        );

        // For PATCH updates (like debt payments), we might need more complex logic, 
        // but for now, let's just handle additions and deletions as primary optimistic UI.
        // Debt payments are special: we'll handle them in the child component if needed, 
        // or here by applying the patch to the server data.
        let augmented = [...serverData, ...pendingAdditions].filter(item => !pendingDeletions.has(item._id));

        // Apply PATCH updates from queue
        offlineQueue
            .filter(item => item.type === type && item.method === 'PATCH')
            .forEach(patch => {
                const index = augmented.findIndex(i => i._id === patch.id);
                if (index !== -1) {
                    augmented[index] = { ...augmented[index], ...patch.data, isPending: true };
                }
            });

        return augmented;
    };

    const augmentedTransactions = augmentData(transactions, 'finance-transaction');
    const augmentedBudgets = augmentData(budgets, 'finance-budget');
    const augmentedDebts = augmentData(debts, 'finance-debt');
    const augmentedWishlist = augmentData(wishlist, 'finance-wishlist');
    const augmentedSavings = augmentData(savings, 'finance-saving');

    const handleAction = () => {
        mutateTx();
        mutateBudgets();
        mutateDebts();
        mutateWishlist();
        mutateSavings();
    };

    // Calculate Summary Stats using augmented data
    const totalSavings = augmentedSavings.reduce((sum, s) => sum + s.amount, 0);
    const actualDebts = augmentedDebts.filter(d => d.nature === 'debt' || !d.nature);
    const upcomingIncome = augmentedDebts.filter(d => d.nature === 'income');
    
    const totalDebt = actualDebts.reduce((sum, d) => sum + d.amount, 0);
    const totalUpcomingIncome = upcomingIncome.reduce((sum, d) => sum + d.amount, 0);

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
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Finance</h1>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Overview of your financial health</p>
                    </div>


                    {/* 2. Transactions */}
                    <div className={activeTab === 'budget' ? 'block' : 'hidden lg:block'}>
                        <RecentTransactions
                            transactions={augmentedTransactions}
                            budgets={augmentedBudgets}
                            currencySymbol={currencySymbol}
                            onAction={handleAction}
                        />
                    </div>

                    {/* 4. Budget */}
                    <div className={activeTab === 'budget' ? 'block' : 'hidden lg:block'}>
                        <MonthlyBudget
                            budgets={augmentedBudgets}
                            transactions={augmentedTransactions}
                            currencySymbol={currencySymbol}
                            onAction={handleAction}
                        />
                    </div>

                    {/* 6. Debt / Cash Flow */}
                    <div className={activeTab === 'debts' ? 'block' : 'hidden lg:block'}>
                        <DebtManager
                            debts={augmentedDebts}
                            currencySymbol={currencySymbol}
                            onAction={handleAction}
                        />
                    </div>
                </div>

                {/* Main Column (Right) */}
                <div className={`lg:col-span-8 flex flex-col gap-6 ${activeTab !== 'summary' && activeTab !== 'savings' && activeTab !== 'wishlist' ? 'hidden lg:flex' : ''}`}>
                    
                    {/* 1. Overview */}
                    <div className={activeTab === 'summary' ? 'block' : 'hidden lg:block'}>
                        <FinancialOverview
                            transactions={augmentedTransactions}
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
                            savings={augmentedSavings}
                            currencySymbol={currencySymbol}
                            onAction={handleAction}
                        />
                    </div>

                    {/* 5. Wishlist */}
                    <div className={activeTab === 'wishlist' ? 'block' : 'hidden lg:block'}>
                        <Wishlist
                            items={augmentedWishlist}
                            budgets={augmentedBudgets}
                            currencySymbol={currencySymbol}
                            onAction={handleAction}
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
