import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';

import HabitTracker from '../components/habit_components/HabitTracker';
import ConsistencyGrid from '../components/habit_components/ConsistencyGrid';

import TopStreaks from '../components/habit_components/TopStreaks';
import HabitChallenge from '../components/habit_components/HabitChallenge';
import HabitInsights from '../components/habit_components/HabitInsights';
import CategoryOverview from '../components/habit_components/CategoryOverview';
import MobileTabNav from '../components/ui/MobileTabNav';



const categories = ['All', 'Health', 'Mindset', 'Finance', 'Productivity', 'Creative'];

function Habits() {
    const { user, viewMode, setViewMode } = useAuthStore();
    const [activeDate, setActiveDate] = useState(new Date()); // Default to current date
    const [currentFilter, setCurrentFilter] = useState('All');
    const [activeTab, setActiveTab] = useState('tracker');

    const tabs = [
        { id: 'tracker', label: 'Tracker', icon: 'check_circle' },
        { id: 'consistency', label: 'Consistency', icon: 'calendar_month' },
        { id: 'challenges', label: 'Challenges', icon: 'emoji_events' },
    ];

    // Fetch habits using SWR
    const { data: fetchedHabits, error, isLoading, mutate } = useSWR(viewMode === 'partner' ? '/habits?view=partner' : '/habits');

    // Provide default fallback while loading or if undefined
    const habits = fetchedHabits || [];

    // Separate habits into mine and partner's
    const myHabits = React.useMemo(() => habits.filter(h => h.user === user?._id), [habits, user]);
    const partnerHabits = React.useMemo(() => habits.filter(h => h.user !== user?._id), [habits, user]);

    // Derive checks dictionary with user separation: { habitId: { date: completed } }
    const checks = React.useMemo(() => {
        const checksDict = {};
        habits.forEach(habit => {
            checksDict[habit._id] = {
                completed: {},
                user: habit.user
            };
            if (habit.checks && Array.isArray(habit.checks)) {
                habit.checks.forEach(check => {
                    checksDict[habit._id].completed[check.date] = check.completed;
                });
            }
        });
        return checksDict;
    }, [habits]);

    // Calculate header stats
    const totalActive = habits.length;
    const successRate = React.useMemo(() => {
        if (totalActive === 0) return 0;
        const last7Days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            last7Days.push(dateStr);
        }

        let totalCompleted = 0;
        last7Days.forEach(dateStr => {
            habits.forEach(h => {
                if (h.checks.some(c => c.date === dateStr && c.completed)) {
                    totalCompleted++;
                }
            });
        });

        return Math.round((totalCompleted / (totalActive * 7)) * 100);
    }, [habits, totalActive]);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const changeWeek = (offset) => {
        const nextDate = new Date(activeDate);
        nextDate.setDate(activeDate.getDate() + (offset * 7));
        setActiveDate(nextDate);
    };

    const getWeekOfMonth = (date) => {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - 3);
        const day = startOfWeek.getDate();
        const weekNum = Math.ceil(day / 7);
        const suffixes = ["1st", "2nd", "3rd", "4th", "5th"];
        return suffixes[weekNum - 1] || "5th";
    };

    return (
        <div className="w-full max-w-[1200px] lg:pt-12 flex flex-col gap-2 animate-in fade-in duration-700 pb-28 md:pb-8">
            

            {/* Mobile Navigation */}
            <MobileTabNav tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6  ">

                {/* Main Column (8 units): Habit Tracker & Consistency */}
                <div className="lg:col-span-8 flex flex-col gap-6 order-1 lg:order-2">
                    
                    {/* View Toggle removed from Mobile (now handled by global header partner icon) */}

                    {/* Habit Tracker Component */}
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
                            mutateHabits={mutate}
                            isPartnerView={viewMode === 'partner'}
                            partnerName={user?.partner?.name}
                            isLoading={isLoading}
                            error={error}
                        />
                    </div>

                    {/* Consistency Grid */}
                    <div className={activeTab === 'consistency' ? 'block' : 'hidden lg:block'}>
                        <ConsistencyGrid
                            checks={checks}
                            isPartnerView={viewMode === 'partner'}
                            myUserId={user?._id}
                            partnerUserId={user?.partner?._id}
                        />
                    </div>
                </div>

                {/* Secondary Column (4 units): Streaks & Challenges */}
                <div className={`lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1 ${activeTab !== 'challenges' && 'hidden lg:flex'}`}>
                    
                    {/* Header - Hidden on Mobile */}
                    <div className="hidden md:flex flex-col gap-1">
                        <h1 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-black tracking-tight">
                            Build Better Habits
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                            Track your daily goals.
                        </p>
                    </div>

                    {/* View Toggle - Desktop only */}
                    {user?.partner && (
                        <div className="hidden lg:flex bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode('me')}
                                className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${viewMode === 'me' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
                            >
                                My Habits
                            </button>
                            <button
                                onClick={() => setViewMode('partner')}
                                className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${viewMode === 'partner' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
                            >
                                Team Habit
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col gap-6">
                        <TopStreaks habits={habits} isTeamView={viewMode === 'partner'} />
                        <HabitChallenge />
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Habits;
