import React, { useState } from 'react';
import Priority from '../components/planner_components/Priority';
import DailySchedule from '../components/planner_components/DailySchedule';
import FullCalendar from '../components/planner_components/FullCalendar';
import GoalSetter from '../components/planner_components/GoalSetter';

function Planner() {
    const [selectedDate, setSelectedDate] = useState(new Date());

    return (
        <div className="w-full max-w-[1200px] flex flex-col gap-6">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">

                {/* Left Column: Header, Priority & Daily Schedule */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="flex flex-col gap-1 pb-2">
                        <h1 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-black tracking-tight">What's the Plan?</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Organize your schedule.</p>
                    </div>
                    <Priority selectedDate={selectedDate} />
                    <DailySchedule selectedDate={selectedDate} />
                </div>

                {/* Right Column: Calendar & Goal Setter */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <FullCalendar onDateSelect={setSelectedDate} selectedDate={selectedDate} />
                    <GoalSetter />
                </div>
            </div>
        </div>
    );
}

export default Planner;
