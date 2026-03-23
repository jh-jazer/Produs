import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import useConnectivityStore from '../store/useConnectivityStore';
import { useHabitsLocal } from '../hooks/useHabitsLocal';

import HabitTracker from '../components/habit_components/HabitTracker';
import ConsistencyGrid from '../components/habit_components/ConsistencyGrid';
import TopStreaks from '../components/habit_components/TopStreaks';
import HabitChallenge from '../components/habit_components/HabitChallenge';
import MobileTabNav from '../components/ui/MobileTabNav';

const categories = ['All', 'Health', 'Mindset', 'Finance', 'Productivity', 'Creative'];

function Habits() {
    const { user, viewMode, setViewMode } = useAuthStore();
    const [activeDate, setActiveDate] = useState(new Date());
    const [currentFilter, setCurrentFilter] = useState('All');
    const [activeTab, setActiveTab] = useState('tracker');
    const isOnline = useConnectivityStore(state => state.isOnline);

    const { habits, isLoading, toggleCheck, addHabit, deleteHabit, updateHabit, reorderHabits } = useHabitsLocal();

    useEffect(() => {
        if (!isOnline && viewMode === 'partner') {
            setViewMode('me');
        }
    }, [isOnline, viewMode, setViewMode]);

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

    return (
        <div className="w-full max-w-[1200px] lg:pt-12 flex flex-col gap-2 animate-in fade-in duration-700 pb-28 md:pb-8">
            <MobileTabNav tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 flex flex-col gap-6 order-1 lg:order-2">
                    <div className={activeTab === 'tracker' ? 'block' : 'hidden lg:block'}>
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
                    </div>

                    <div className={activeTab === 'consistency' ? 'block' : 'hidden lg:block'}>
                        <ConsistencyGrid
                            checks={checks}
                            isPartnerView={viewMode === 'partner'}
                            myUserId={user?._id}
                            partnerUserId={user?.partner?._id}
                        />
                    </div>
                </div>

                <div className={`lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1 ${activeTab !== 'challenges' && 'hidden lg:flex'}`}>
                    <div className="hidden md:flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <h1 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-black tracking-tight">
                                Build Better Habits
                            </h1>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                            Track your daily goals.
                        </p>
                    </div>

                    {/* View Toggle - Desktop only */}
                    {user?.partner && isOnline && (
                        <div className="hidden lg:flex bg-slate-50 dark:bg-[#000000]/50 p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode('me')}
                                className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${viewMode === 'me' ? 'bg-white dark:bg-[#121212] shadow-none text-slate-900 dark:text-white' : 'text-slate-500'}`}
                            >
                                My Habits
                            </button>
                            <button
                                onClick={() => setViewMode('partner')}
                                className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${viewMode === 'partner' ? 'bg-white dark:bg-[#121212] shadow-none text-slate-900 dark:text-white' : 'text-slate-500'}`}
                            >
                                Shared Habits
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col gap-6">
                        <TopStreaks habits={habits} isSharedView={viewMode === 'partner'} />
                        <HabitChallenge />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Habits;
