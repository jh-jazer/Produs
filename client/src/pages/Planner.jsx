import React, { useState, useEffect } from 'react';
import Priority from '../components/planner_components/Priority';
import DailySchedule from '../components/planner_components/DailySchedule';
import FullCalendar from '../components/planner_components/FullCalendar';
import GoalSetter from '../components/planner_components/GoalSetter';
import useAuthStore from '../store/useAuthStore';
import { motion } from 'framer-motion';
import MobileTabNav from '../components/ui/MobileTabNav';
import WorkspaceSkeleton from '../components/ui/WorkspaceSkeleton';
import { usePlanner } from '../hooks/usePlanner';

const Planner = () => {
    const { user, viewMode, setViewMode } = useAuthStore();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isFlipped, setIsFlipped] = useState(false);
    const { 
        tasks = [], 
        isLoading
    } = usePlanner(selectedDate);

    const [activeTab, setActiveTab] = React.useState('priority');

    // Force 'me' view if partner not available
    useEffect(() => {
        if (viewMode === 'partner' && !user?.partner) {
            setViewMode('me');
        }
    }, [viewMode, setViewMode, user?.partner]);


    const tabs = [
        { id: 'priority', label: 'Priority', icon: 'stars' },
        { id: 'planner', label: 'Planner', icon: 'schedule' },
        { id: 'calendar', label: 'Calendar', icon: 'calendar_today' },
        { id: 'goals', label: 'Goals', icon: 'flag' },
    ];

    if (isLoading && tasks.length === 0) return <WorkspaceSkeleton />;

    return (
        <div className="w-full max-w-[1400px] lg:pt-8 flex flex-col gap-4 md:gap-8 pb-28 md:pb-8 mx-auto">
            

            {/* Mobile Navigation */}
            <MobileTabNav tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />



            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">

                {/* Main Column */}
                <div className={`lg:col-span-4 flex flex-col gap-4 md:gap-6 ${activeTab !== 'priority' && activeTab !== 'planner' && activeTab !== 'calendar' && activeTab !== 'goals' ? 'hidden lg:flex' : ''}`}>

                    {/* Mobile Only: Calendar */}
                    <div className={activeTab === 'calendar' ? 'block' : 'hidden lg:hidden'}>
                        <FullCalendar onDateSelect={setSelectedDate} selectedDate={selectedDate} viewMode={viewMode} isReadOnly={viewMode === 'partner'} />
                    </div>

                    {/* Priority (Mobile Priority Tab) */}
                    <div className={`relative w-full ${activeTab === 'priority' ? 'block' : 'hidden'} lg:hidden`}>
                        <Priority
                            viewMode={viewMode}
                            isReadOnly={viewMode === 'partner'}
                            onFlip={() => {}} // Disabled on mobile
                        />
                    </div>

                    {/* Daily Schedule (Mobile Planner Tab) */}
                    <div className={`relative w-full ${activeTab === 'planner' ? 'block' : 'hidden'} lg:hidden`}>
                        <DailySchedule
                            viewMode={viewMode}
                            isReadOnly={viewMode === 'partner'}
                            onFlip={() => {}} // Disabled on mobile
                        />
                    </div>

                    {/* Desktop Priority / Daily Schedule Flip Card */}
                    <div className={`relative w-full hidden lg:block`} style={{ perspective: '2000px' }}>
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
                <div className="lg:col-span-8 hidden lg:flex flex-col gap-4 md:gap-6">
                    <FullCalendar onDateSelect={setSelectedDate} selectedDate={selectedDate} viewMode={viewMode} isReadOnly={viewMode === 'partner'} />
                    <GoalSetter viewMode={viewMode} isReadOnly={viewMode === 'partner'} />
                </div>
            </div>
        </div>
    );
}

export default Planner;
