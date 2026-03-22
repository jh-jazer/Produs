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
                            <h1 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-black tracking-tight">
                                What's the Plan?
                            </h1>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                            Organize your schedule.
                        </p>
                    </div>


                    {/* View Toggle */}
                    {user?.partner && isOnline && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl flex">

                            <button
                                onClick={() => setViewMode('me')}
                                className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${viewMode === 'me' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                My Planner
                            </button>
                            <button
                                onClick={() => setViewMode('partner')}
                                className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${viewMode === 'partner' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                Shared Planner
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
