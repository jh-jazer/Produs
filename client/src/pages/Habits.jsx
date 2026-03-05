import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import api from '../services/api';

import HabitTracker from '../components/habit_components/HabitTracker';
import ConsistencyGrid from '../components/habit_components/ConsistencyGrid';

import TopStreaks from '../components/habit_components/TopStreaks';
import HabitInsights from '../components/habit_components/HabitInsights';
import CategoryOverview from '../components/habit_components/CategoryOverview';

// Data fetching function for SWR
const fetcher = url => api.get(url).then(res => res.data);

const categories = ['All', 'Health', 'Mindset', 'Finance', 'Productivity', 'Creative'];

function Habits() {
    const [activeDate, setActiveDate] = useState(new Date()); // Default to current date
    const [currentFilter, setCurrentFilter] = useState('All');

    // Fetch habits using SWR
    const { data: fetchedHabits, error, isLoading, mutate } = useSWR('/habits', fetcher);

    // Provide default fallback while loading or if undefined
    const habits = fetchedHabits || [];

    // Derive checks dictionary from the flat habit.checks array for easy O(1) lookups
    const checks = React.useMemo(() => {
        const checksDict = {};
        habits.forEach(habit => {
            checksDict[habit._id] = {};
            if (habit.checks && Array.isArray(habit.checks)) {
                habit.checks.forEach(check => {
                    checksDict[habit._id][check.date] = check.completed;
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
        <div className="w-full max-w-[1200px] flex flex-col gap-6">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">

                {/* Left Column: Header, Streaks & Overview */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="flex flex-col gap-1 pb-2">
                        <h1 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-black tracking-tight">Build Better Habits</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Tracking {totalActive} active habits • {successRate}% success rate this week</p>
                    </div>
                    <TopStreaks />
                    <CategoryOverview />
                </div>

                {/* Right Column: Habit Tracker & Consistency */}
                <div className="lg:col-span-8 flex flex-col gap-6">


                    {/* Habit Tracker Component */}
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 text-red-500">Failed to load habits.</div>
                    ) : (
                        <HabitTracker
                            activeDate={activeDate}
                            onDateChange={changeWeek}
                            currentFilter={currentFilter}
                            onFilterChange={setCurrentFilter}
                            habits={habits}
                            checks={checks}
                            mutateHabits={mutate}
                        />
                    )}

                    <ConsistencyGrid checks={checks} />
                    <HabitInsights />
                </div>
            </div>
        </div>
    );
}

export default Habits;
