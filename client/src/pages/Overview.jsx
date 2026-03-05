import useSWR from 'swr';
import HabitTracker from '../components/habit_components/HabitTracker';
import TopStreaks from '../components/habit_components/TopStreaks';
import SmallCalendar from '../components/planner_components/SmallCalendar';
import Priority from '../components/planner_components/Priority';
import FinancialStats from '../components/finance_components/FinancialStats';
import JournalSnippet from '../components/journal_components/JournalSnippet';
import useAuthStore from '../store/useAuthStore';

function Overview() {
    const user = useAuthStore((state) => state.user);
    const firstName = user?.name ? user.name.split(' ')[0] : 'User';
    const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

    const { data: transactions = [] } = useSWR('/finance/transactions');

    return (
        <div className="w-full max-w-[1200px] flex flex-col gap-6">

            {/* Grid Layout - Fixed Height tied to screen */}
            <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)] min-h-[520px] pt-4">

                {/* Left Column */}
                <div className="w-full md:w-2/3 flex flex-col gap-6 h-full">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-black tracking-tight">Good morning, {firstName}</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Ready to crush your goals today?</p>
                        </div>
                    </div>
                    {/* Habit Tracker */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <HabitTracker isDashboard={true} />
                    </div>
                </div>

                {/* Right Column */}
                <div className="w-full md:w-1/3 flex flex-col gap-6 h-full">
                    {/* Calendar & Priority Panel */}
                    <div className="flex flex-col gap-4">
                        <Priority isCompact={true} />
                    </div>

                    {/* Financial Stats */}
                    <FinancialStats transactions={transactions} currencySymbol={currencySymbol} />

                    {/* Journal snippet */}
                    <JournalSnippet />
                </div>

            </div>
        </div>
    );
}

export default Overview;
