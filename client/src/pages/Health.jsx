import React from 'react';
import { useHealth } from '../hooks/useHealth';

import WaterTracker from '../components/health_components/WaterTracker';
import SleepTracker from '../components/health_components/SleepTracker';
import BMITracker from '../components/health_components/BMITracker';
import WeightTracker from '../components/health_components/WeightTracker';
import RecentHealthLogs from '../components/health_components/RecentHealthLogs';
import WorkoutTracker from '../components/health_components/WorkoutTracker';
import NutritionLog from '../components/health_components/NutritionLog';
import MobileTabNav from '../components/ui/MobileTabNav';
import WorkspaceSkeleton from '../components/ui/WorkspaceSkeleton';

const Health = () => {

    const {
        workouts,
        nutrition,
        metrics,
        addHealthLog,
        deleteHealthLog,
        isLoading
    } = useHealth();

    // Mobile Navigation State
    const [activeTab, setActiveTab] = React.useState('metrics');

    const tabs = [
        { id: 'metrics', label: 'Metrics', icon: 'monitor_heart' },
        { id: 'workout', label: 'Workout', icon: 'fitness_center' },
        { id: 'nutrition', label: 'Nutrition', icon: 'restaurant' },
    ];

    if (isLoading && workouts.length === 0 && metrics.length === 0 && nutrition.length === 0) return <WorkspaceSkeleton />;

    return (
        <div className="w-full max-w-[1400px] lg:pt-8 flex flex-col gap-8 pb-28 md:pb-8 mx-auto">

            {/* Mobile Navigation */}
            <MobileTabNav tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Tactical Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 md:px-0">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="size-2 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)] animate-pulse" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] font-mono">HEALTH_PROTOCOL_ACTIVE</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic font-exo">
                        Health
                    </h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] max-w-md">
                        Status Overview
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Secondary Column (Left) */}
                <div className={`lg:col-span-4 flex flex-col gap-6 ${activeTab !== 'metrics' ? 'hidden lg:flex' : ''}`}>

                    <div className={`flex flex-col gap-6 ${activeTab === 'metrics' ? 'block' : 'hidden lg:block'}`}>
                         <BMITracker
                            metrics={metrics}
                            addHealthLog={addHealthLog}
                        />
                         <WaterTracker
                            metrics={metrics}
                            addHealthLog={addHealthLog}
                        />
                         <SleepTracker
                            metrics={metrics}
                            addHealthLog={addHealthLog}
                        />
                         <RecentHealthLogs
                            metrics={metrics}
                            deleteHealthLog={deleteHealthLog}
                        />
                    </div>
                </div>

                {/* Main Column (Right) */}
                <div className={`lg:col-span-8 flex flex-col gap-6 ${activeTab !== 'workout' && activeTab !== 'nutrition' ? 'hidden lg:flex' : ''}`}>

                    <div className={activeTab === 'workout' ? 'block' : 'hidden lg:block'}>
                        <WorkoutTracker
                            workouts={workouts}
                            addHealthLog={addHealthLog}
                            deleteHealthLog={deleteHealthLog}
                        />
                    </div>

                    <div className={activeTab === 'nutrition' ? 'block' : 'hidden lg:block'}>
                        <NutritionLog
                            nutrition={nutrition}
                            addHealthLog={addHealthLog}
                            deleteHealthLog={deleteHealthLog}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Health;
