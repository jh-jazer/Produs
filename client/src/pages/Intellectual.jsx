import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';
import { useHabits } from '../hooks/useHabits';
import { usePlanner } from '../hooks/usePlanner';

// UI Components
import WorkspaceSkeleton from '../components/ui/WorkspaceSkeleton';
import { DashboardContext } from '../context/DashboardContext';

// Intellectual Modules
import Priority from '../components/intellectual/planner/Priority';
import DailySchedule from '../components/intellectual/planner/DailySchedule';
import FullCalendar from '../components/intellectual/planner/FullCalendar';
import GoalSetter from '../components/intellectual/planner/GoalSetter';
import HabitTracker from '../components/intellectual/habits/HabitTracker';

const ChippedBorder = ({ opacity = 0.8 }) => (
  <div 
    className="absolute inset-[-2px] rounded-sm pointer-events-none z-0"
    style={{
      border: '4px solid white',
      opacity,
      clipPath: 'polygon(0% 0%, 15% 0%, 16% 2%, 18% 0%, 42% 0%, 43% 4%, 45% 0%, 78% 0%, 79% 2%, 81% 0%, 100% 0%, 100% 20%, 98% 22%, 100% 24%, 100% 55%, 97% 58%, 100% 61%, 100% 100%, 82% 100%, 81% 97%, 79% 100%, 38% 100%, 37% 96%, 35% 100%, 0% 100%, 0% 80%, 3% 78%, 0% 76%, 0% 35%, 2% 33%, 0% 31%)'
    }}
  />
);

const HUDPanel = ({ title, subtitle, children, headerExtra, className = "" }) => (
  <div className={`relative bg-white/[0.02] hover:bg-white/[0.04] transition-all p-8 rounded-sm group overflow-hidden ${className}`}>
    <ChippedBorder opacity={0.6} />
    <div className="relative z-10">
      <div className="mb-8 flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40">{title}</span>
          {subtitle && <span className="text-[8px] font-mono uppercase tracking-widest opacity-20">{subtitle}</span>}
        </div>
        {headerExtra && <div className="flex gap-2">{headerExtra}</div>}
      </div>
      {children}
    </div>
  </div>
);

const Intellectual = () => {
    const { user, viewMode } = useAuthStore();
    const [activeDate, setActiveDate] = useState(new Date());
    const [currentFilter, setCurrentFilter] = useState('All');
    const [activeTab, setActiveTab] = useState('priority'); 
    const [isFlipped, setIsFlipped] = useState(false);
    const { setMobileTabs } = useContext(DashboardContext);

    const { habits, isLoading: habitsLoading, toggleCheck, addHabit, deleteHabit, updateHabit, reorderHabits } = useHabits();
    const plannerData = usePlanner();

    const tabs = [
        { id: 'priority', label: 'Priority', icon: 'stars' },
        { id: 'planner', label: 'Planner', icon: 'schedule' },
        { id: 'calendar', label: 'Calendar', icon: 'calendar_today' },
        { id: 'goals', label: 'Goals', icon: 'flag' },
        { id: 'tracker', label: 'Tracker', icon: 'check_circle' },
    ];

    useEffect(() => {
        setMobileTabs({ tabs, activeTab, setActiveTab });
        return () => setMobileTabs(null);
    }, [activeTab, setMobileTabs]);

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
        <div className="w-full bg-transparent text-white p-8 pt-0 md:p-12 font-sans overflow-x-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key="intellectual-hud"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-8 md:gap-12 mt-4"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* Primary Column (3-Col Grid Style) */}
                        <div className={`lg:col-span-4 flex flex-col gap-8 ${['priority', 'planner'].includes(activeTab) ? 'block' : 'hidden lg:flex'}`}>
                            
                            {/* Flippable Tactical Panel */}
                            <div className="relative w-full" style={{ perspective: '2000px' }}>
                                <motion.div
                                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                                    transition={{ duration: 0.7, type: 'spring', stiffness: 100, damping: 20 }}
                                    style={{ transformStyle: 'preserve-3d' }}
                                    className="relative w-full min-h-[500px]"
                                >
                                    {/* FRONT: Priority Directives */}
                                    <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
                                        <HUDPanel title="Priority // DIRECTIVES" subtitle="Core_Objectives_Current">
                                            <Priority viewMode={viewMode} isReadOnly={viewMode === 'partner'} onFlip={() => setIsFlipped(true)} />
                                        </HUDPanel>
                                    </div>
                                    
                                    {/* BACK: Daily Schedule */}
                                    <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                                        <HUDPanel title="Timeline // ALLOCATION" subtitle="Hourly_Block_Sync">
                                            <DailySchedule viewMode={viewMode} isReadOnly={viewMode === 'partner'} onFlip={() => setIsFlipped(false)} />
                                        </HUDPanel>
                                    </div>
                                </motion.div>
                            </div>

                        </div>

                        {/* Secondary Column (Right - Expanded) */}
                        <div className={`lg:col-span-8 flex flex-col gap-8 ${['calendar', 'tracker'].includes(activeTab) ? 'block' : 'hidden lg:flex'}`}>
                            
                            {/* Central Matrix - Habit Tracker */}
                            <div className={activeTab === 'tracker' ? 'block' : 'hidden lg:block'}>
                                <HUDPanel title="Matrix // CONSISTENCY" subtitle="Neural_Habit_Loops">
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
                                </HUDPanel>
                            </div>

                            {/* Tactical Schedule - Monthly View */}
                            <div className={activeTab === 'calendar' ? 'block' : 'hidden lg:block'}>
                                <HUDPanel title="Schedule // TEMPORAL" subtitle="Long_Range_Planning">
                                    <FullCalendar onDateSelect={setActiveDate} selectedDate={activeDate} viewMode={viewMode} isReadOnly={viewMode === 'partner'} />
                                </HUDPanel>
                            </div>

                            {/* Strategic Node - Goal Setting */}
                            <div className={activeTab === 'goals' ? 'block' : 'hidden lg:block'}>
                                <HUDPanel title="Strategy // OBJECTIVES" subtitle="Mid_Term_Parameters">
                                    <GoalSetter viewMode={viewMode} isReadOnly={viewMode === 'partner'} />
                                </HUDPanel>
                            </div>
                        </div>
                    </div>

                    {/* System Metadata Footer */}
                    <div className="mt-16 pt-8 border-t border-white/5 flex justify-between items-center opacity-20">
                      <span className="text-[8px] font-black uppercase tracking-[0.5em]">Produs_Intellectual_Interface_v0.2</span>
                      <div className="flex gap-2">
                        {[1,2,3,4,5,6].map(i => <div key={i} className="size-1 bg-white rounded-full" />)}
                      </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Intellectual;
