import React, { useState } from 'react';
import Priority from '../components/planner_components/Priority';
import DailySchedule from '../components/planner_components/DailySchedule';
import FullCalendar from '../components/planner_components/FullCalendar';
import GoalSetter from '../components/planner_components/GoalSetter';
import useAuthStore from '../store/useAuthStore';
import { motion } from 'framer-motion';

function Planner() {
    const { user } = useAuthStore();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('me');
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div className="w-full max-w-[1200px] flex flex-col gap-2 animate-in fade-in duration-700 pb-8">
            
            {/* Header - Always at top */}
            <div className="flex flex-col gap-1 px-1 pt-8 pb-6 mb-6 border-b border-slate-100 dark:border-slate-800/50">
                <h1 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-black tracking-tight">
                    {viewMode === 'partner' ? `${user?.partner?.name}'s Planner` : "What's the Plan?"}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                    Organize your schedule.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Main Column (Interleaved for Mobile) */}
                <div className="lg:col-span-4 flex flex-col gap-6 order-1">
                    
                    {/* Partner Toggle */}
                    {user?.partner && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl flex">
                            <button
                                onClick={() => setViewMode('me')}
                                className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${viewMode === 'me' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
                            >
                                My Planner
                            </button>
                            <button
                                onClick={() => setViewMode('partner')}
                                className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${viewMode === 'partner' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
                            >
                                Partner View
                            </button>
                        </div>
                    )}

                    {/* Mobile Only: Calendar at top of list */}
                    <div className="lg:hidden">
                        <FullCalendar onDateSelect={setSelectedDate} selectedDate={selectedDate} viewMode={viewMode} isReadOnly={viewMode === 'partner'} />
                    </div>

                    {/* Priority / Daily Schedule (Always here) */}
                    <div className="relative w-full" style={{ perspective: '2000px' }}>
                        <motion.div
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ duration: 0.7, type: 'spring', stiffness: 100, damping: 20 }}
                            style={{ transformStyle: 'preserve-3d', position: 'relative' }}
                        >
                            {/* Front Side: Priority */}
                            <div style={{ 
                                backfaceVisibility: 'hidden',
                                position: isFlipped ? 'absolute' : 'relative',
                                top: 0,
                                left: 0,
                                width: '100%'
                            }}>
                                <Priority 
                                    viewMode={viewMode} 
                                    isReadOnly={viewMode === 'partner'} 
                                    onFlip={() => setIsFlipped(true)}
                                />
                            </div>

                            {/* Back Side: Daily Planner */}
                            <div style={{ 
                                backfaceVisibility: 'hidden', 
                                transform: 'rotateY(180deg)', 
                                position: isFlipped ? 'relative' : 'absolute', 
                                top: 0, 
                                left: 0, 
                                width: '100%'
                            }}>
                                <DailySchedule 
                                    viewMode={viewMode} 
                                    isReadOnly={viewMode === 'partner'} 
                                    onFlip={() => setIsFlipped(false)}
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* Mobile Only: Goal Setter above Consistency or bottom */}
                    <div className="lg:hidden">
                        <GoalSetter viewMode={viewMode} isReadOnly={viewMode === 'partner'} />
                    </div>
                </div>

                {/* Right Column (Desktop Only Sidebar for Calendar/Goals) */}
                <div className="lg:col-span-8 hidden lg:flex flex-col gap-6 order-2">
                    <FullCalendar onDateSelect={setSelectedDate} selectedDate={selectedDate} viewMode={viewMode} isReadOnly={viewMode === 'partner'} />
                    <GoalSetter viewMode={viewMode} isReadOnly={viewMode === 'partner'} />
                </div>
            </div>
        </div>
    );
}

export default Planner;
