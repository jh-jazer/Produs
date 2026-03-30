import React, { useState, useEffect } from 'react';
import { 
    CheckCircle, 
    Calendar, 
    Trophy, 
    Flame, 
    Target,
    Users,
    User
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
        <div className="w-full max-w-[1400px] lg:pt-8 flex flex-col gap-8 pb-28 md:pb-8 mx-auto">
            <MobileTabNav tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Tactical Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 md:px-0">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="size-2 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)] animate-pulse" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] font-mono">HABIT_PROTOCOL_ACTIVE</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic font-exo">
                        Neural Consistency
                    </h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] max-w-md">
                        Tracking daily operational efficiency and long-term behavioral patterns for archetype evolution.
                    </p>
                </div>

                {/* View Toggle - Desktop only */}
                {user?.partner && (
                    <div className="hidden lg:flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10 ml-auto">
                        <button
                            onClick={() => setViewMode('me')}
                            className={`flex items-center gap-2 px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${viewMode === 'me' ? 'bg-white dark:bg-slate-900 shadow-xl text-cyan-500' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <User size={12} /> Personal
                        </button>
                        <button
                            onClick={() => setViewMode('partner')}
                            className={`flex items-center gap-2 px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${viewMode === 'partner' ? 'bg-white dark:bg-slate-900 shadow-xl text-purple-500' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Users size={12} /> Sync_View
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column (Challenges & Streaks) */}
                <div className={`lg:col-span-4 flex flex-col gap-8 order-2 lg:order-1 ${activeTab !== 'challenges' && 'hidden lg:flex'}`}>
                    <DashboardPanel
                        title="TOP_CONSISTENCY_CHAINS"
                        subtitle="NEURAL_STREAK_ANALYSIS"
                        icon={Flame}
                        showZap={false}
                    >
                        <TopStreaks habits={habits} isSharedView={viewMode === 'partner'} />
                    </DashboardPanel>

                    <DashboardPanel
                        title="ACTIVE_CHALLENGES"
                        subtitle="BEHAVIORAL_SYNCHRONIZATION"
                        icon={Trophy}
                        showZap={false}
                    >
                        <HabitChallenge />
                    </DashboardPanel>
                </div>

                {/* Right Column (Tracker & Grid) */}
                <div className="lg:col-span-8 flex flex-col gap-8 order-1 lg:order-2">
                    <div className={activeTab === 'tracker' ? 'block' : 'hidden lg:block'}>
                        <DashboardPanel
                            title="HABIT_TRACKER_INTERFACE"
                            subtitle="DAILY_OPERATIONAL_CHECK"
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
                            title="LONG_TERM_CONSISTENCY_MATRIX"
                            subtitle="NEURAL_ACTIVITY_TRENDS"
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
