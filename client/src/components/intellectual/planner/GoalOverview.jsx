import React from 'react';
import { motion } from 'framer-motion';
import { useGoals } from '../../../hooks/useGoals';

const ChippedBorder = ({ opacity = 0.8 }) => (
    <div 
      className="absolute inset-[-1px] rounded-sm pointer-events-none z-0"
      style={{
        border: '2px solid currentColor',
        opacity,
        clipPath: 'polygon(0% 0%, 15% 0%, 16% 2%, 18% 0%, 42% 0%, 43% 4%, 45% 0%, 78% 0%, 79% 2%, 81% 0%, 100% 0%, 100% 20%, 98% 22%, 100% 24%, 100% 55%, 97% 58%, 100% 61%, 100% 100%, 82% 100%, 81% 97%, 79% 100%, 38% 100%, 37% 96%, 35% 100%, 0% 100%, 0% 80%, 3% 78%, 0% 76%, 0% 35%, 2% 33%, 0% 31%)'
      }}
    />
);

const GoalCard = ({ title, period, year, month, week, isActive }) => {
    const { goals } = useGoals({ period, year, month, week });
    const completedCount = goals.filter(g => g.completed).length;
    const progress = goals.length ? Math.round((completedCount / goals.length) * 100) : 0;

    return (
        <div className={`flex-1 relative py-[1vh] px-6 rounded-sm flex justify-between items-center group transition-all ${
            isActive 
            ? 'bg-white/[0.08] border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.05)]' 
            : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
        }`}>
            <ChippedBorder opacity={isActive ? 1 : 0.3} />
            <div className="flex flex-col relative z-10">
                <span className={`text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] transition-all ${
                    isActive ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-white/40 group-hover:text-white'
                }`}>{title}</span>
                <span className={`text-[8px] font-black uppercase tracking-widest mt-1 transition-opacity ${
                    isActive ? 'text-white/40' : 'text-white/20'
                }`}>{goals.length} GOALS SET</span>
            </div>
            <span className={`text-[12px] md:text-[16px] font-mono font-black relative z-10 transition-all ${
                isActive ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'text-white'
            }`}>{progress}%</span>
        </div>
    );
};

const GoalOverview = ({ onWeekClick, onMonthClick, onYearClick, onBackToCalendar, isCalendarActive, calendarView }) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Helper to get ISO week
    const getISOWeek = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const yearStart = new Date(d.getFullYear(), 0, 1);
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    };

    return (
        <div className="grid grid-cols-3 gap-3 md:gap-4 w-full">
            <div onClick={onWeekClick} className="cursor-pointer">
                <GoalCard title="WEEK" period="weekly" year={year} month={month} week={getISOWeek(now)} isActive={calendarView === 'weekly'} />
            </div>
            <div onClick={onMonthClick} className="cursor-pointer">
                <GoalCard title="MONTH" period="monthly" year={year} month={month} isActive={calendarView === 'monthly_goals'} />
            </div>
            <div onClick={onYearClick} className="cursor-pointer">
                <GoalCard title="YEAR" period="yearly" year={year} isActive={calendarView === 'yearly'} />
            </div>

            {!isCalendarActive && (
                <div className="col-span-3 pt-[11px]">
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={onBackToCalendar}
                        className="w-full py-4 rounded-sm hover:bg-white/[0.02] group transition-all"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20 group-hover:text-white transition-colors">
                            BACK TO CALENDAR
                        </span>
                    </motion.button>
                </div>
            )}
        </div>
    );
};

export default GoalOverview;
