import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHealth } from '../hooks/useHealth';
import WorkspaceSkeleton from '../components/ui/WorkspaceSkeleton';
import { DashboardContext } from '../context/DashboardContext';

// Health Modules
import BMITracker from '../components/health_components/BMITracker';
import WaterTracker from '../components/health_components/WaterTracker';
import SleepTracker from '../components/health_components/SleepTracker';
import RecentHealthLogs from '../components/health_components/RecentHealthLogs';
import WorkoutTracker from '../components/health_components/WorkoutTracker';
import NutritionLog from '../components/health_components/NutritionLog';

const ChippedBorder = ({ opacity = 0.8 }) => (
  <div 
    className="absolute inset-[-2px] rounded-sm pointer-events-none z-0"
    style={{
      border: '4px solid white',
      opacity,
      clipPath: 'polygon(0% 0%, 15% 0%, 16% 2%, 18% 0%, 42% 0%, 43% 4%, 45% 0%, 78% 0%, 79% 2%, 81% 0%, 100% 0%, 100% 20%, 98% 22%, 100% 24%, 100% 55%, 97% 58%, 100% 61%, 100% 100%, 82% 100%, 81% 97%, 79% 100%, 38% 100%, 37% 96%, 35% 100%, 0% 100%, 0% 80%, 3% 78%, 0% 76%, 0% 35%, 2% 33%, 0% 31%)'
    }}
  />
);

const HUDPanel = ({ title, subtitle, children, headerExtra, className = "" }) => (
  <div className={`relative bg-white/[0.02] hover:bg-white/[0.04] transition-all p-8 rounded-sm group overflow-hidden ${className}`}>
    <ChippedBorder opacity={0.6} />
    <div className="relative z-10">
      <div className="mb-8 flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40">{title}</span>
          {subtitle && <span className="text-[8px] font-mono uppercase tracking-widest opacity-20">{subtitle}</span>}
        </div>
        {headerExtra && <div className="flex gap-2">{headerExtra}</div>}
      </div>
      {children}
    </div>
  </div>
);

import WorkspaceSidebar from '../components/ui/WorkspaceSidebar';

const Physical = () => {
    const {
        workouts,
        nutrition,
        metrics,
        addHealthLog,
        deleteHealthLog,
        isLoading
    } = useHealth();

    const { setMobileTabs } = useContext(DashboardContext);
    const [activeTab, setActiveTab] = useState('workout');

    useEffect(() => {
        setMobileTabs({ tabs, activeTab, setActiveTab });
        return () => setMobileTabs(null);
    }, [activeTab, setMobileTabs]);

    const tabs = [
        { id: 'workout', label: 'Workout', icon: 'fitness_center' },
        { id: 'nutrition', label: 'Nutrition', icon: 'restaurant' },
        { id: 'bmi', label: 'BMI', icon: 'monitor_weight' },
        { id: 'water', label: 'Water', icon: 'water_drop' },
        { id: 'sleep', label: 'Sleep', icon: 'bedtime' },
    ];

    const currencySymbol = '$'; // Placeholder if needed

    if (isLoading && workouts.length === 0 && metrics.length === 0 && nutrition.length === 0) return <WorkspaceSkeleton />;

    return (
        <div className="w-full bg-transparent text-white p-8 pt-0 md:p-12 font-sans overflow-x-hidden flex flex-col md:flex-row items-start gap-8 md:gap-12">
            {/* Tactical Navigation Bar - Vertical on Desktop */}
            <WorkspaceSidebar 
                tabs={tabs} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                namespace="Physical" 
            />

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1"
                >
                    <div className="flex flex-col gap-8">
                        {/* Tab Content Division */}
                        <div className="w-full">
                            {/* BMI DIVISION */}
                            {activeTab === 'bmi' && (
                                 <div className="max-w-4xl mx-auto w-full">
                                     <HUDPanel title="BODY MASS" subtitle="BMI INDEX & METRICS">
                                         <BMITracker metrics={metrics} addHealthLog={addHealthLog} />
                                     </HUDPanel>
                                 </div>
                            )}

                            {/* WATER DIVISION */}
                            {activeTab === 'water' && (
                                 <div className="max-w-4xl mx-auto w-full">
                                     <HUDPanel title="HYDRATION" subtitle="DAILY WATER INTAKE">
                                         <WaterTracker metrics={metrics} addHealthLog={addHealthLog} />
                                     </HUDPanel>
                                 </div>
                            )}

                            {/* SLEEP DIVISION */}
                            {activeTab === 'sleep' && (
                                 <div className="max-w-4xl mx-auto w-full">
                                     <HUDPanel title="CIRCADIAN" subtitle="REST & RECOVERY CYCLES">
                                         <SleepTracker metrics={metrics} addHealthLog={addHealthLog} />
                                     </HUDPanel>
                                 </div>
                            )}

                            {/* WORKOUT DIVISION */}
                            {activeTab === 'workout' && (
                                <div className="max-w-5xl mx-auto w-full">
                                    <HUDPanel title="WORKOUT TRACKER" subtitle="FITNESS PROGRESS">
                                        <WorkoutTracker
                                            workouts={workouts}
                                            addHealthLog={addHealthLog}
                                            deleteHealthLog={deleteHealthLog}
                                        />
                                    </HUDPanel>
                                </div>
                            )}

                            {/* NUTRITION DIVISION */}
                            {activeTab === 'nutrition' && (
                                <div className="max-w-5xl mx-auto w-full">
                                    <HUDPanel title="NUTRITION LOG" subtitle="DIETARY TRACKING">
                                        <NutritionLog
                                            nutrition={nutrition}
                                            addHealthLog={addHealthLog}
                                            deleteHealthLog={deleteHealthLog}
                                        />
                                    </HUDPanel>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* System Metadata Footer */}
                    <div className="mt-16 pt-8 border-t border-white/5 flex justify-between items-center opacity-20">
                      <span className="text-[8px] font-black uppercase tracking-[0.5em]">PRODUS PHYSICAL WORKSPACE v0.2</span>
                      <div className="flex gap-2">
                        {[1,2,3,4,5,6].map(i => <div key={i} className="size-1 bg-white rounded-full" />)}
                      </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Physical;
