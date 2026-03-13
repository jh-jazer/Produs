import useSWR from 'swr';
import HabitTracker from '../components/habit_components/HabitTracker';
import Priority from '../components/planner_components/Priority';
import FinancialStats from '../components/finance_components/FinancialStats';
import JournalSnippet from '../components/journal_components/JournalSnippet';
import ActivityFeed from '../components/ActivityFeed';
import UserSearch from '../components/ui/UserSearch';
import useAuthStore from '../store/useAuthStore';

function Overview() {
    const user = useAuthStore((state) => state.user);
    const firstName = user?.name ? user.name.split(' ')[0] : 'User';
    const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

    const { data: transactions = [] } = useSWR('/finance/transactions');

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="w-full max-w-[1200px] flex flex-col gap-6">

            <div className="flex flex-col md:flex-row gap-6 pt-4">

                {/* Left — 2/3 scrolling social feed */}
                <div className="w-full md:flex-1 flex flex-col gap-5 pr-1 pb-6">
                    {/* Greeting */}
                    <div className="flex flex-col gap-0.5">
                        <h1 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-black tracking-tight">
                            {greeting}, {firstName} 👋
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                            Here's what your people are up to.
                        </p>
                    </div>

                    {/* User Search */}
                    <UserSearch />

                    {/* Activity Feed */}
                    <ActivityFeed />
                </div>

                {/* Right — narrow productive panels pushed to the right */}
                <div className="w-full md:w-64 shrink-0 min-w-0 flex flex-col gap-4 pb-6 ml-auto">
                    <HabitTracker isDashboard={true} />
                    <Priority isCompact={true} />
                    <FinancialStats transactions={transactions} currencySymbol={currencySymbol} />
                    <JournalSnippet />
                </div>

            </div>
        </div>
    );
}

export default Overview;
