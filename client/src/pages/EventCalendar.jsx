import React, { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import FullCalendar from '../components/intellectual/planner/FullCalendar';
import GoalOverview from '../components/intellectual/planner/GoalOverview';
import WeeklyView from '../components/intellectual/planner/WeeklyView';
import MonthlyView from '../components/intellectual/planner/MonthlyView';
import YearlyView from '../components/intellectual/planner/YearlyView';
import GoalSetter from '../components/intellectual/planner/GoalSetter';
import { DashboardContext } from '../context/DashboardContext';

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

const HUDPanel = ({ title, subtitle, children, className = "" }) => (
  <div className="w-full flex flex-col">
    {title && (
      <div className="mb-6 hidden md:flex justify-between items-start px-4 md:px-0">
        <div className="flex flex-col gap-1">
          <span className="text-2xl md:text-3xl font-black uppercase tracking-[0.3em] text-foreground/95">{title}</span>
          {subtitle && <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/45">{subtitle}</span>}
        </div>
      </div>
    )}
    <div className={`relative bg-transparent dark:bg-foreground/[0.02] dark:hover:bg-foreground/[0.04] transition-all pt-4 pb-8 md:pt-4 md:pb-12 px-0 md:px-12 rounded-sm group overflow-hidden ${className}`}>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  </div>
);

const EventCalendar = () => {
    const { viewMode } = useContext(DashboardContext);
    const { setActiveSection } = useOutletContext();
    const [activeDate, setActiveDate] = useState(new Date());
    const [calendarView, setCalendarView] = useState('monthly'); // 'monthly' (calendar) | 'weekly' | 'monthly_goals' | 'yearly'

    useEffect(() => {
        const sectionMap = {
            monthly: 'calendar',
            weekly: 'weekly_calendar',
            monthly_goals: 'monthly_goals',
            yearly: 'yearly_calendar'
        };
        setActiveSection(sectionMap[calendarView]);
        return () => setActiveSection('produs');
    }, [calendarView, setActiveSection]);

    const getSubtitle = () => {
        if (calendarView === 'monthly') return "MONTHLY TIMELINE";
        if (calendarView === 'weekly') return "WEEKLY GOALS";
        if (calendarView === 'monthly_goals') return "MONTHLY GOALS";
        return "ANNUAL GOALS";
    };

    return (
        <div className="w-full bg-transparent text-foreground px-0 pt-24 pb-12 md:pt-2 md:pb-16 font-sans overflow-x-hidden flex flex-col items-center">
            <div className="w-full mt-4 md:mt-2">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                    <HUDPanel title="CALENDAR & GOALS" subtitle={getSubtitle()}>
                        <div className="flex flex-col w-full gap-14">
                            {calendarView === 'monthly' && (
                                <FullCalendar onDateSelect={setActiveDate} selectedDate={activeDate} viewMode={viewMode} isReadOnly={viewMode === 'partner'} />
                            )}
                            {calendarView === 'weekly' && (
                                <WeeklyView onBack={() => setCalendarView('monthly')} />
                            )}
                            {calendarView === 'monthly_goals' && (
                                <MonthlyView onBack={() => setCalendarView('monthly')} />
                            )}
                            {calendarView === 'yearly' && (
                                <YearlyView onBack={() => setCalendarView('monthly')} />
                            )}

                            <GoalOverview 
                                onWeekClick={() => setCalendarView('weekly')} 
                                onMonthClick={() => setCalendarView('monthly_goals')}
                                onYearClick={() => setCalendarView('yearly')}
                                onBackToCalendar={() => setCalendarView('monthly')}
                                isCalendarActive={calendarView === 'monthly'}
                                calendarView={calendarView}
                            />
                        </div>
                    </HUDPanel>
                </motion.div>
            </div>
        </div>
    );
};

export default EventCalendar;
