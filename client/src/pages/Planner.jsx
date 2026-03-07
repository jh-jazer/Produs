import React, { useState } from 'react';
import Priority from '../components/planner_components/Priority';
import DailySchedule from '../components/planner_components/DailySchedule';
import FullCalendar from '../components/planner_components/FullCalendar';
import GoalSetter from '../components/planner_components/GoalSetter';
import useAuthStore from '../store/useAuthStore';

function Planner() {
    const { user } = useAuthStore();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('me');

    return (
        <div className="w-full max-w-[1200px] flex flex-col gap-6">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">

                {/* Left Column: Header, Priority & Daily Schedule */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="flex flex-col gap-1 pb-2">
                        <h1 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-black tracking-tight">{viewMode === 'partner' ? `${user?.partner?.name}'s Planner` : "What's the Plan?"}</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Organize your schedule.</p>
                    </div>

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

                    <Priority selectedDate={selectedDate} viewMode={viewMode} isReadOnly={viewMode === 'partner'} />
                    <DailySchedule selectedDate={selectedDate} viewMode={viewMode} isReadOnly={viewMode === 'partner'} />
                </div>

                {/* Right Column: Calendar & Goal Setter */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <FullCalendar onDateSelect={setSelectedDate} selectedDate={selectedDate} viewMode={viewMode} isReadOnly={viewMode === 'partner'} />
                    <GoalSetter viewMode={viewMode} isReadOnly={viewMode === 'partner'} />
                </div>
            </div>
        </div>
    );
}

export default Planner;
