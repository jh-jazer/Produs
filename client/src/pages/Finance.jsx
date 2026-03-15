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
    const totalDebt = debts.reduce((sum, d) => sum + d.amount, 0);

    const netBalance = totalSavings - totalDebt;

    return (
        <div className="w-full max-w-[1200px] flex flex-col gap-2 animate-in fade-in duration-700 pb-8">
            
            {/* Header - Always at top */}
            <div className="flex flex-col gap-1 px-1 pt-8 pb-6 mb-6 border-b border-slate-100 dark:border-slate-800/50">
                <h1 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">Finance</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Overview of your financial health</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Main Column (8 units): Activity & History - First on Mobile */}
                <div className="lg:col-span-8 flex flex-col gap-6 order-1 lg:order-2">
                    <FinancialOverview
                        transactions={transactions}
                        currencySymbol={currencySymbol}
                        netBalance={netBalance}
                        totalSavings={totalSavings}
                    />
                    <SavingsPanel
                        savings={savings}
                        currencySymbol={currencySymbol}
                        onAction={handleAction}
                    />
                    
                    <Wishlist
                        items={wishlist}
                        currencySymbol={currencySymbol}
                        onAction={handleAction}
                    />
                    
                    <BalanceHistory />
                </div>

                {/* Sidebar Column (4 units): Transactions & Budgets - Second on Mobile */}
                <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
                    <RecentTransactions
                        transactions={transactions}
                        currencySymbol={currencySymbol}
                        onAction={handleAction}
                    />
                    <MonthlyBudget
                        budgets={budgets}
                        transactions={transactions}
                        currencySymbol={currencySymbol}
                        onAction={handleAction}
                    />
                    <DebtManager
                        debts={debts}
                        currencySymbol={currencySymbol}
                        onAction={handleAction}
                    />
                </div>

            </div>
        </div>
    );
};

export default Finance;
