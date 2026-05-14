import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import FullCalendar from '../components/intellectual/planner/FullCalendar';
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
  <div className={`relative bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-all p-4 md:p-8 rounded-sm group overflow-hidden ${className}`}>
    <div className="hidden md:block">
      <ChippedBorder opacity={0.6} />
    </div>
    <div className="relative z-10">
      {title && (
        <div className="mb-8 hidden md:flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-foreground/40">{title}</span>
            {subtitle && <span className="text-[8px] font-mono uppercase tracking-widest opacity-20">{subtitle}</span>}
          </div>
        </div>
      )}
      {children}
    </div>
  </div>
);

const TemporalSync = () => {
    const { viewMode } = useContext(DashboardContext);
    const [activeDate, setActiveDate] = useState(new Date());

    return (
        <div className="w-full bg-transparent text-foreground p-8 pt-12 md:p-12 md:pt-16 font-sans overflow-x-hidden flex flex-col items-center">
            <div className="w-full max-w-7xl mt-8 md:mt-0">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                    <HUDPanel title="CALENDAR & GOALS" subtitle="MONTHLY SCHEDULE & TARGETS">
                        <div className="flex flex-col gap-12 w-full">
                            <FullCalendar onDateSelect={setActiveDate} selectedDate={activeDate} viewMode={viewMode} isReadOnly={viewMode === 'partner'} />
                            <div className="border-t border-foreground/10 pt-8 w-full">
                                <GoalSetter viewMode={viewMode} isReadOnly={viewMode === 'partner'} />
                            </div>
                        </div>
                    </HUDPanel>
                </motion.div>
            </div>
        </div>
    );
};

export default TemporalSync;
