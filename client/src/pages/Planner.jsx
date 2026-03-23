import React, { useState } from 'react';
import Priority from '../components/planner_components/Priority';
import DailySchedule from '../components/planner_components/DailySchedule';
import FullCalendar from '../components/planner_components/FullCalendar';
import GoalSetter from '../components/planner_components/GoalSetter';
import useAuthStore from '../store/useAuthStore';
import useConnectivityStore from '../store/useConnectivityStore';
import { useEffect } from 'react';

import { motion } from 'framer-motion';
import MobileTabNav from '../components/ui/MobileTabNav';

function Planner() {
    const { user, viewMode, setViewMode } = useAuthStore();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isFlipped, setIsFlipped] = useState(false);
    const [activeTab, setActiveTab] = useState('schedule');
    const isOnline = useConnectivityStore(state => state.isOnline);

    // Force 'me' view if offline
    useEffect(() => {
        if (!isOnline && viewMode === 'partner') {
            setViewMode('me');
        }
    }, [isOnline, viewMode, setViewMode]);


    const tabs = [
        { id: 'schedule', label: 'Schedule', icon: 'event_note' },
        { id: 'calendar', label: 'Calendar', icon: 'calendar_month' },
        { id: 'goals', label: 'Goals', icon: 'flag' },
    ];

    return (
        <div className="w-full max-w-[1200px] lg:pt-12 flex flex-col gap-2 animate-in fade-in duration-700 pb-28 md:pb-8">
            

            {/* Mobile Navigation */}
            <MobileTabNav tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Main Column */}
                <div className={`lg:col-span-4 flex flex-col gap-6 ${activeTab !== 'schedule' && activeTab !== 'calendar' && activeTab !== 'goals' ? 'hidden lg:flex' : ''}`}>
                    
                    {/* Header - Hidden on Mobile */}
                    <div className="hidden lg:flex flex-col gap-1 px-1">
                        <div className="flex items-center justify-between">
                            <h1 className="text-black dark:text-white text-3xl font-semibold tracking-[-0.02em]">
                                The Plan
                            </h1>
                        </div>
                        <p className="text-black/40 dark:text-white/40 text-[9px] font-semibold uppercase tracking-[0.4em] mt-1">
                            Daily Trajectory
                        </p>
                    </div>


                    {/* View Toggle */}
                    {user?.partner && (
                        <div className="bg-black/[0.04] dark:bg-[#050505]/60 p-1 rounded-2xl flex border border-black/[0.05] dark:border-white/5">
                            <button
                                onClick={() => setViewMode('me')}
                                className={`flex-1 py-2 text-[9px] font-semibold uppercase tracking-[0.2em] rounded-xl transition-all ${viewMode === 'me' ? 'bg-white dark:bg-[#121212] shadow-lg text-black dark:text-white border border-black/[0.05] dark:border-white/10' : 'text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60'}`}
                            >
                                Personal
                            </button>
                            <button
                                onClick={() => setViewMode('partner')}
                                className={`flex-1 py-2 text-[9px] font-semibold uppercase tracking-[0.2em] rounded-xl transition-all ${viewMode === 'partner' ? 'bg-white dark:bg-[#121212] shadow-lg text-black dark:text-white border border-black/[0.05] dark:border-white/10' : 'text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60'}`}
                            >
                                Shared
                            </button>
                        </div>
                    )}

                    {/* Mobile Only: Calendar */}
                    <div className={activeTab === 'calendar' ? 'block' : 'hidden lg:hidden'}>
                        <FullCalendar onDateSelect={setSelectedDate} selectedDate={selectedDate} viewMode={viewMode} isReadOnly={viewMode === 'partner'} />
                    </div>

                    {/* Priority / Daily Schedule (Schedule Tab) */}
                    <div className={`relative w-full ${activeTab === 'schedule' ? 'block' : 'hidden lg:block'}`} style={{ perspective: '2000px' }}>
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

                    {/* Mobile Only: Goal Setter */}
                    <div className={activeTab === 'goals' ? 'block' : 'hidden'}>
                        <GoalSetter viewMode={viewMode} isReadOnly={viewMode === 'partner'} />
                    </div>
                </div>

                {/* Right Column (Desktop Only Sidebar for Calendar/Goals) */}
                <div className="lg:col-span-8 hidden lg:flex flex-col gap-6">
                    <FullCalendar onDateSelect={setSelectedDate} selectedDate={selectedDate} viewMode={viewMode} isReadOnly={viewMode === 'partner'} />
                    <GoalSetter viewMode={viewMode} isReadOnly={viewMode === 'partner'} />
                </div>
            </div>
        </div>
    );
}

export default Planner;
