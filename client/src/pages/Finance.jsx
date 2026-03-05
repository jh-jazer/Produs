import React from 'react';
import useSWR from 'swr';
import useAuthStore from '../store/useAuthStore';
import SpendingBreakdown from '../components/finance_components/SpendingBreakdown';
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

    return (
        <div className="w-full max-w-[1200px] flex flex-col gap-6 animate-in fade-in duration-700 pb-8">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">

                {/* Left Column (4 units): Header & Financial Metrics */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="flex flex-col gap-1 pb-4">
                        <h1 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">Finance</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Manage your wealth and spending</p>
                    </div>

                    <SpendingBreakdown
                        transactions={transactions}
                        currencySymbol={currencySymbol}
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

                {/* Right Column (8 units): Activity & History */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <RecentTransactions
                        transactions={transactions}
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

            </div>

            {/* Bottom Section: Savings */}
            <div className="mt-4">
                <SavingsPanel
                    savings={savings}
                    currencySymbol={currencySymbol}
                    onAction={handleAction}
                />
            </div>
        </div>
    );
};

export default Finance;
