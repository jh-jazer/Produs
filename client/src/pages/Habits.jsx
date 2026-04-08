/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { 
    CheckCircle, 
    Calendar, 
    Trophy, 
    Flame, 
    Target
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { useHabits } from '../hooks/useHabits';

import HabitTracker from '../components/habit_components/HabitTracker';
import ConsistencyGrid from '../components/habit_components/ConsistencyGrid';
import TopStreaks from '../components/habit_components/TopStreaks';
import HabitChallenge from '../components/habit_components/HabitChallenge';
import MobileTabNav from '../components/ui/MobileTabNav';
import WorkspaceSkeleton from '../components/ui/WorkspaceSkeleton';
import DashboardPanel from '../components/ui/DashboardPanel';

const categories = ['All', 'Health', 'Mindset', 'Finance', 'Productivity', 'Creative'];

function Habits() {
    const { user, viewMode, setViewMode } = useAuthStore();
    const [activeDate, setActiveDate] = useState(new Date());
    const [currentFilter, setCurrentFilter] = useState('All');
    const [activeTab, setActiveTab] = useState('tracker');
    const { habits, isLoading, toggleCheck, addHabit, deleteHabit, updateHabit, reorderHabits } = useHabits();

    useEffect(() => {
        if (viewMode === 'partner') {
            // Background sync or other partner logic if needed
        }
    }, [viewMode]);

    const tabs = [
        { id: 'tracker', label: 'Tracker', icon: 'check_circle' },
        { id: 'consistency', label: 'Consistency', icon: 'calendar_month' },
        { id: 'challenges', label: 'Challenges', icon: 'emoji_events' },
    ];

    const myHabits = React.useMemo(() => habits.filter(h => h.userId === user?._id), [habits, user]);
    const partnerHabits = React.useMemo(() => habits.filter(h => h.userId !== user?._id), [habits, user]);

    const checks = React.useMemo(() => {
        const dict = {};
        habits.forEach(habit => {
            dict[habit._id] = { completed: {} };
            if (habit.checks && Array.isArray(habit.checks)) {
                habit.checks.forEach(check => {
                    dict[habit._id].completed[check.date] = check.completed;
                });
            }
        });
        return dict;
    }, [habits]);

    const changeWeek = (offset) => {
        const nextDate = new Date(activeDate);
        nextDate.setDate(activeDate.getDate() + (offset * 7));
        setActiveDate(nextDate);
    };

    if (isLoading && habits.length === 0) return <WorkspaceSkeleton />;

    return (
        <div className="w-full max-w-[1400px] lg:pt-8 flex flex-col gap-4 md:gap-8 pb-28 md:pb-8 mx-auto">
            <MobileTabNav tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />



            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 items-start">
                {/* Left Column (Challenges & Streaks) */}
                <div className={`lg:col-span-4 flex flex-col gap-4 md:gap-8 order-2 lg:order-1 ${activeTab !== 'challenges' && 'hidden lg:flex'}`}>
                    <DashboardPanel
                        title="Top Streaks"
                        subtitle="Consistency Analysis"
                        icon={Flame}
                        showZap={false}
                    >
                        <TopStreaks habits={habits} isSharedView={viewMode === 'partner'} />
                    </DashboardPanel>

                    <DashboardPanel
                        title="Active Challenges"
                        subtitle="Featured Goals"
                        icon={Trophy}
                        showZap={false}
                    >
                        <HabitChallenge />
                    </DashboardPanel>
                </div>

                {/* Right Column (Tracker & Grid) */}
                <div className="lg:col-span-8 flex flex-col gap-4 md:gap-8 order-1 lg:order-2">
                    <div className={activeTab === 'tracker' ? 'block' : 'hidden lg:block'}>
                        <DashboardPanel
                            title="Habit Tracker"
                            subtitle="Daily Overview"
                            icon={CheckCircle}
                            pulseColor="cyan"
                        >
                            <HabitTracker
                                activeDate={activeDate}
                                onDateChange={changeWeek}
                                currentFilter={currentFilter}
                                onFilterChange={setCurrentFilter}
                                habits={habits}
                                myHabits={myHabits}
                                partnerHabits={partnerHabits}
                                checks={checks}
                                isPartnerView={viewMode === 'partner'}
                                partnerName={user?.partner?.name}
                                isLoading={isLoading}
                                toggleCheck={toggleCheck}
                                addHabit={addHabit}
                                deleteHabit={deleteHabit}
                                updateHabit={updateHabit}
                                reorderHabits={reorderHabits}
                                myUserId={user?._id}
                            />
                        </DashboardPanel>
                    </div>

                    <div className={activeTab === 'consistency' ? 'block' : 'hidden lg:block'}>
                        <DashboardPanel
                            title="Consistency Matrix"
                            subtitle="Long-Term Trends"
                            icon={Calendar}
                            pulseColor="emerald"
                        >
                            <ConsistencyGrid
                                checks={checks}
                                isPartnerView={viewMode === 'partner'}
                                myUserId={user?._id}
                                partnerUserId={user?.partner?._id}
                            />
                        </DashboardPanel>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Habits;
