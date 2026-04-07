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
import DashboardPanel from '../components/ui/DashboardPanel';
import { Wallet, List, PieChart, TrendingUp, ShieldCheck, ShoppingCart, Activity } from 'lucide-react';

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
        <div className="w-full max-w-[1400px] lg:pt-8 flex flex-col gap-4 md:gap-8 pb-28 md:pb-8 mx-auto">
            
            {/* Mobile Navigation */}
            <MobileTabNav tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />



            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-start">
                
                {/* Secondary Column (Left) */}
                <div className={`lg:col-span-4 flex flex-col gap-4 md:gap-6 ${activeTab !== 'budget' && activeTab !== 'debts' ? 'hidden lg:flex' : ''}`}>
                    

                    {/* 2. Transactions */}
                    <div className={activeTab === 'budget' ? 'block' : 'hidden lg:block'}>
                        <DashboardPanel title="Ledger Log" subtitle="Recent Transactions" icon={List} showZap>
                            <RecentTransactions
                                transactions={transactions}
                                budgets={budgets}
                                currencySymbol={currencySymbol}
                                onAction={handleAction}
                                addFinanceItem={addFinanceItem}
                                deleteFinanceItem={deleteFinanceItem}
                            />
                        </DashboardPanel>
                    </div>

                    {/* 4. Budget */}
                    <div className={activeTab === 'budget' ? 'block' : 'hidden lg:block'}>
                        <DashboardPanel title="Budget Matrix" subtitle="Monthly Allocation" icon={PieChart}>
                            <MonthlyBudget
                                budgets={budgets}
                                transactions={transactions}
                                currencySymbol={currencySymbol}
                                onAction={handleAction}
                                addFinanceItem={addFinanceItem}
                                deleteFinanceItem={deleteFinanceItem}
                            />
                        </DashboardPanel>
                    </div>

                    {/* 6. Debt / Cash Flow */}
                    <div className={activeTab === 'debts' ? 'block' : 'hidden lg:block'}>
                        <DashboardPanel title="Cash Flow" subtitle="Debt & Income Streams" icon={TrendingUp}>
                            <DebtManager
                                debts={debts}
                                currencySymbol={currencySymbol}
                                onAction={handleAction}
                                addFinanceItem={addFinanceItem}
                                updateFinanceItem={updateFinanceItem}
                                deleteFinanceItem={deleteFinanceItem}
                            />
                        </DashboardPanel>
                    </div>
                </div>

                {/* Main Column (Right) */}
                <div className={`lg:col-span-8 flex flex-col gap-4 md:gap-6 ${activeTab !== 'summary' && activeTab !== 'savings' && activeTab !== 'wishlist' ? 'hidden lg:flex' : ''}`}>
                    
                    {/* 1. Overview */}
                    <div className={activeTab === 'summary' ? 'block' : 'hidden lg:block'}>
                        <DashboardPanel title="Asset Overview" subtitle="Net Valuation" icon={Wallet} showZap>
                            <FinancialOverview
                                transactions={transactions}
                                currencySymbol={currencySymbol}
                                netBalance={netBalance}
                                totalSavings={totalSavings}
                                totalDebt={totalDebt}
                                totalUpcomingIncome={totalUpcomingIncome}
                            />
                        </DashboardPanel>
                    </div>

                    {/* 3. Savings */}
                    <div className={activeTab === 'savings' ? 'block' : 'hidden lg:block'}>
                        <DashboardPanel title="Vault Reserves" subtitle="Liquid Assets" icon={ShieldCheck}>
                            <SavingsPanel
                                savings={savings}
                                currencySymbol={currencySymbol}
                                onAction={handleAction}
                                addFinanceItem={addFinanceItem}
                                deleteFinanceItem={deleteFinanceItem}
                            />
                        </DashboardPanel>
                    </div>

                    {/* 5. Wishlist */}
                    <div className={activeTab === 'wishlist' ? 'block' : 'hidden lg:block'}>
                        <DashboardPanel title="Acquisition Targets" subtitle="Desired Assets" icon={ShoppingCart}>
                            <Wishlist
                                items={wishlist}
                                budgets={budgets}
                                currencySymbol={currencySymbol}
                                onAction={handleAction}
                                addFinanceItem={addFinanceItem}
                                deleteFinanceItem={deleteFinanceItem}
                            />
                        </DashboardPanel>
                    </div>

                    {/* 7. Balance History */}
                    <div className={activeTab === 'summary' ? 'block' : 'hidden lg:block'}>
                        <DashboardPanel title="Balance History" subtitle="Fiscal Trajectory" icon={Activity}>
                            <BalanceHistory />
                        </DashboardPanel>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Finance;
