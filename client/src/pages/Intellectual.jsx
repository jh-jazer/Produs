import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';
import { useHabits } from '../hooks/useHabits';
import { usePlanner } from '../hooks/usePlanner';
import WorkspaceSidebar from '../components/ui/WorkspaceSidebar';

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
      border: '4px solid currentColor',
      opacity,
      clipPath: 'polygon(0% 0%, 15% 0%, 16% 2%, 18% 0%, 42% 0%, 43% 4%, 45% 0%, 78% 0%, 79% 2%, 81% 0%, 100% 0%, 100% 20%, 98% 22%, 100% 24%, 100% 55%, 97% 58%, 100% 61%, 100% 100%, 82% 100%, 81% 97%, 79% 100%, 38% 100%, 37% 96%, 35% 100%, 0% 100%, 0% 80%, 3% 78%, 0% 76%, 0% 35%, 2% 33%, 0% 31%)'
    }}
  />
);

const HUDPanel = ({ title, subtitle, children, headerExtra, className = "" }) => (
  <div className={`relative bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-all p-4 md:p-8 rounded-sm group overflow-hidden ${className}`}>
    <div className="hidden md:block">
      <ChippedBorder opacity={0.6} />
    </div>
    <div className="relative z-10">
      <div className="mb-8 flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-2xl md:text-3xl font-black uppercase tracking-[0.3em] text-foreground/95">{title}</span>
        </div>
        {headerExtra && <div className="flex gap-2">{headerExtra}</div>}
      </div>
      {children}
    </div>
  </div>
);

import { useNavigate, useLocation } from 'react-router-dom';

const Intellectual = () => {
    const { user } = useAuthStore();
    const location = useLocation();
    const { viewMode } = useContext(DashboardContext);
    const [activeDate, setActiveDate] = useState(new Date());
    const { tasks, addTask, deleteTask } = usePlanner(activeDate);
    const [currentFilter, setCurrentFilter] = useState('All');
    
    // The active module is now driven by navigation state or external triggers
    const activeModule = location.state?.activeTab || 'tracker'; 

    const { habits, isLoading: habitsLoading, toggleCheck, addHabit, deleteHabit, updateHabit, reorderHabits } = useHabits();

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
        <div className="w-full bg-transparent text-foreground px-0 pt-24 pb-12 md:pt-20 md:pb-16 font-sans overflow-x-hidden flex flex-col items-center">
            <div className="w-full max-w-7xl mt-4 md:mt-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeModule}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col gap-8 md:gap-12"
                    >
                        {/* Tab Content Division */}
                        <div className="w-full max-w-full mx-auto">
                            <div className="flex flex-col items-center justify-center py-40 opacity-40 text-center gap-6">
                                <span className="material-symbols-outlined text-6xl opacity-20">inventory_2</span>
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm font-black uppercase tracking-[0.4em]">Intellectual_Core_Relocated</span>
                                    <span className="text-[10px] font-mono opacity-40 uppercase">Primary_Modules_Active_In_Global_HUD</span>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Intellectual;
