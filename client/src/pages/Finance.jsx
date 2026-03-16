import React from 'react';
import useSWR from 'swr';
import useAuthStore from '../store/useAuthStore';
import FinancialOverview from '../components/finance_components/FinancialOverview';
import DebtManager from '../components/finance_components/DebtManager';
import RecentTransactions from '../components/finance_components/RecentTransactions';
import MonthlyBudget from '../components/finance_components/MonthlyBudget';
import Wishlist from '../components/finance_components/Wishlist';
import BalanceHistory from '../components/finance_components/BalanceHistory';
import SavingsPanel from '../components/finance_components/SavingsPanel';

const Finance = () => {
    const { user } = useAuthStore();
    const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

    // Data fetching
    const { data: transactions = [], mutate: mutateTx } = useSWR('/finance/transactions');
    const { data: budgets = [], mutate: mutateBudgets } = useSWR('/finance/budgets');
    const { data: debts = [], mutate: mutateDebts } = useSWR('/finance/debts');
    const { data: wishlist = [], mutate: mutateWishlist } = useSWR('/finance/wishlist');
    const { data: savings = [], mutate: mutateSavings } = useSWR('/finance/savings');

    const handleAction = () => {
        mutateTx();
        mutateBudgets();
        mutateDebts();
        mutateWishlist();
        mutateSavings();
    };

    // Calculate Summary Stats
    const totalSavings = savings.reduce((sum, s) => sum + s.amount, 0);
    const actualDebts = debts.filter(d => d.nature === 'debt' || !d.nature); // !d.nature for backward compatibility
    const upcomingIncome = debts.filter(d => d.nature === 'income');
    
    const totalDebt = actualDebts.reduce((sum, d) => sum + d.amount, 0);
    const totalUpcomingIncome = upcomingIncome.reduce((sum, d) => sum + d.amount, 0);

    const netBalance = totalSavings - totalDebt;

    return (
        <div className="w-full max-w-[1200px] flex flex-col gap-2 animate-in fade-in duration-700 pb-8">
            
            {/* Header - Always at top */}
            <div className="flex flex-col gap-1 px-1 pt-8 pb-6 mb-6 border-b border-slate-100 dark:border-slate-800/50">
                <h1 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">Finance</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Overview of your financial health</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* 1. Overview (Top on both) */}
                <div className="lg:col-span-8 order-1">
                    <FinancialOverview
                        transactions={transactions}
                        currencySymbol={currencySymbol}
                        netBalance={netBalance}
                        totalSavings={totalSavings}
                    />
                </div>

                {/* 2. Transactions (Below overview on mobile, Sidebar on desktop) */}
                <div className="lg:col-span-4 order-2">
                    <RecentTransactions
                        transactions={transactions}
                        currencySymbol={currencySymbol}
                        onAction={handleAction}
                    />
                </div>

                {/* 3. Savings (Below transactions on mobile, Main column on desktop) */}
                <div className="lg:col-span-8 order-5 lg:order-3">
                    <SavingsPanel
                        savings={savings}
                        currencySymbol={currencySymbol}
                        onAction={handleAction}
                    />
                </div>

                {/* 4. Budget (Below savings on mobile, Sidebar on desktop) */}
                <div className="lg:col-span-4 order-3 lg:order-4">
                    <MonthlyBudget
                        budgets={budgets}
                        transactions={transactions}
                        currencySymbol={currencySymbol}
                        onAction={handleAction}
                    />
                </div>

                {/* 5. Wishlist (Below budget on mobile, Main column on desktop) */}
                <div className="lg:col-span-8 order-6 lg:order-5">
                    <Wishlist
                        items={wishlist}
                        currencySymbol={currencySymbol}
                        onAction={handleAction}
                    />
                </div>

                {/* 6. Debt / Cash Flow (Below wishlist on mobile, Sidebar on desktop) */}
                <div className="lg:col-span-4 order-4 lg:order-6">
                    <DebtManager
                        debts={debts}
                        currencySymbol={currencySymbol}
                        onAction={handleAction}
                    />
                </div>

                {/* 7. Balance History (Absolute bottom on mobile, Main column on desktop) */}
                <div className="lg:col-span-8 order-7">
                    <BalanceHistory />
                </div>

            </div>
        </div>
    );
};

export default Finance;
