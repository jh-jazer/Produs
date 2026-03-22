import useSWR from 'swr';
import HabitTracker from '../components/habit_components/HabitTracker';
import Priority from '../components/planner_components/Priority';
import FinancialStats from '../components/finance_components/FinancialStats';
import JournalSnippet from '../components/journal_components/JournalSnippet';
import useAuthStore from '../store/useAuthStore';
import MainFeed from '../components/MainFeed';

function Overview() {
    const user = useAuthStore((state) => state.user);
    const firstName = user?.name ? user.name.split(' ')[0] : 'User';
    const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    const { data: transactions = [] } = useSWR('/finance/transactions');

    return (
        <div className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left Column (4 units): Greeting & Productive Panels (Sticky - Hidden on Mobile) */}
            <div className="hidden lg:flex lg:col-span-4 flex-col gap-6 lg:border-r border-slate-100 dark:border-white/10/50 pr-6 sticky top-0 h-[calc(100vh-72px)] overflow-y-auto custom-scrollbar hover-scrollbar">
                {/* Greeting Header - Desktop only */}
                <div className="hidden md:flex flex-col gap-0.5 pt-8 pb-6 mb-2 border-b border-slate-100 dark:border-white/10/50">
                    <h1 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">
                        {greeting}, {firstName} 
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        What are you up to?
                    </p>
                </div>
                <HabitTracker isDashboard={true} />
                <Priority isCompact={true} />
                <FinancialStats transactions={transactions} currencySymbol={currencySymbol} />
                <JournalSnippet />
            </div>

            {/* Right Column (8 units / Full Width on Mobile): Unified Feed */}
            <div className="col-span-1 lg:col-span-8 flex flex-col gap-5 pb-24 lg:pt-8 lg:pl-6">
                <MainFeed />
            </div>

        </div>
    );
}

export default Overview;
