import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle, 
    Calendar, 
    Flame, 
    Target,
    CalendarDays,
    Clock,
    Star,
    Brain,
    Zap
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { useHabits } from '../hooks/useHabits';
import { usePlanner } from '../hooks/usePlanner';

// UI Components
import MobileTabNav from '../components/ui/MobileTabNav';
import WorkspaceSkeleton from '../components/ui/WorkspaceSkeleton';
import DashboardPanel from '../components/ui/DashboardPanel';

// Intellectual - Consistency (Habit) Components
import HabitTracker from '../components/intellectual/habits/HabitTracker';
import { DashboardContext } from '../context/DashboardContext';

// Intellectual - Structure (Planner) Components
import Priority from '../components/intellectual/planner/Priority';
import DailySchedule from '../components/intellectual/planner/DailySchedule';
import FullCalendar from '../components/intellectual/planner/FullCalendar';
import GoalSetter from '../components/intellectual/planner/GoalSetter';

const Intellectual = () => {
    const { user, viewMode } = useAuthStore();
    
    // Internal States
    const [activeDate, setActiveDate] = useState(new Date());
    const [currentFilter, setCurrentFilter] = useState('All');
    const [activeTab, setActiveTab] = useState('priority'); 
    const [isFlipped, setIsFlipped] = useState(false);

    const { setMobileTabs } = useContext(DashboardContext);

    // Hooks
    const { habits, isLoading: habitsLoading, toggleCheck, addHabit, deleteHabit, updateHabit, reorderHabits } = useHabits();
    // usePlanner might handle its own data but we import it just in case
    const plannerData = usePlanner();

    useEffect(() => {
        setMobileTabs({ tabs, activeTab, setActiveTab });
        return () => setMobileTabs(null);
    }, [activeTab, setMobileTabs]);

    const tabs = [
        { id: 'priority', label: 'Priority', icon: 'stars' },
        { id: 'planner', label: 'Planner', icon: 'schedule' },
        { id: 'calendar', label: 'Calendar', icon: 'calendar_today' },
        { id: 'goals', label: 'Goals', icon: 'flag' },
        { id: 'tracker', label: 'Tracker', icon: 'check_circle' },
    ];

    // Derived Habits Data
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

    if (habitsLoading && habits.length === 0) return <WorkspaceSkeleton />;

    return (
        <div className="w-full max-w-[1400px] lg:pt-8 flex flex-col gap-4 md:gap-8 pb-48 md:pb-8 mx-auto">
            
            {/* Page Header - Sub-Tabs (Internal - Registered via Context) */}

            <AnimatePresence mode="wait">
                <motion.div
                    key="intellectual-main"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
                        {/* Primary Column (Left) */}
                        <div className={`lg:col-span-4 flex flex-col gap-4 md:gap-6 ${['priority', 'planner'].includes(activeTab) ? 'block' : 'hidden lg:flex'}`}>
                            
                            {/* 1. Priority Section */}
                            {(activeTab === 'priority' || !activeTab) && (
                                <div className="relative w-full lg:hidden">
                                    <DashboardPanel title="Priority Directives" subtitle="Top 3 Objectives" icon={Star} showZap>
                                        <Priority viewMode={viewMode} isReadOnly={viewMode === 'partner'} onFlip={() => {}} />
                                    </DashboardPanel>
                                </div>
                            )}

                            {/* 2. Daily Schedule */}
                            {(activeTab === 'planner') && (
                                <div className="relative w-full lg:hidden">
                                    <DashboardPanel title="Daily Schedule" subtitle="Time Blocking" icon={Clock} showZap>
                                        <DailySchedule viewMode={viewMode} isReadOnly={viewMode === 'partner'} onFlip={() => {}} />
                                    </DashboardPanel>
                                </div>
                            )}

                            {/* Desktop Combined View (Flippable cards) */}
                            <div className="relative w-full hidden lg:block" style={{ perspective: '2000px', flexShrink: 0 }}>
                                <motion.div
                                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                                    transition={{ duration: 0.7, type: 'spring', stiffness: 100, damping: 20 }}
                                    style={{ transformStyle: 'preserve-3d', position: 'relative' }}
                                >
                                    <div style={{ backfaceVisibility: 'hidden', position: isFlipped ? 'absolute' : 'relative', top: 0, left: 0, width: '100%', height: '100%' }}>
                                        <DashboardPanel title="Priority Directives" subtitle="Top 3 Objectives" icon={Star} showZap className="h-full">
                                            <Priority viewMode={viewMode} isReadOnly={viewMode === 'partner'} onFlip={() => setIsFlipped(true)} />
                                        </DashboardPanel>
                                    </div>
                                    <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', position: isFlipped ? 'relative' : 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                                        <DashboardPanel title="Daily Schedule" subtitle="Time Blocking" icon={Clock} showZap className="h-full">
                                            <DailySchedule viewMode={viewMode} isReadOnly={viewMode === 'partner'} onFlip={() => setIsFlipped(false)} />
                                        </DashboardPanel>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Secondary Column (Right) */}
                        <div className={`lg:col-span-8 flex flex-col gap-4 md:gap-6 ${['calendar', 'goals', 'tracker'].includes(activeTab) ? 'block' : 'hidden lg:flex'}`}>
                            
                            {/* 4. Habit Tracker */}
                            <div className={activeTab === 'tracker' ? 'block' : 'hidden lg:block'}>
                                <DashboardPanel title="Habit Tracker" subtitle="Daily Overview" icon={CheckCircle} pulseColor="cyan">
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
                                        isLoading={habitsLoading}
                                        toggleCheck={toggleCheck}
                                        addHabit={addHabit}
                                        deleteHabit={deleteHabit}
                                        updateHabit={updateHabit}
                                        reorderHabits={reorderHabits}
                                        myUserId={user?._id}
                                    />
                                </DashboardPanel>
                            </div>

                            {/* 5. Calendar Section */}
                            <div className={activeTab === 'calendar' ? 'block' : 'hidden lg:block'}>
                                <DashboardPanel title="Tactical Schedule" subtitle="Monthly Matrix" icon={CalendarDays} bodyClassName="p-0">
                                    <FullCalendar onDateSelect={setActiveDate} selectedDate={activeDate} viewMode={viewMode} isReadOnly={viewMode === 'partner'} />
                                </DashboardPanel>
                            </div>

                            {/* 6. Strategic Goals */}
                            <div className={activeTab === 'goals' ? 'block' : 'hidden lg:block'}>
                                <DashboardPanel title="Strategic Objectives" subtitle="Mid-Term Planning" icon={Target}>
                                    <GoalSetter viewMode={viewMode} isReadOnly={viewMode === 'partner'} />
                                </DashboardPanel>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Intellectual;
