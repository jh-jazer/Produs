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
      border: '4px solid currentColor',
      opacity,
      clipPath: 'polygon(0% 0%, 15% 0%, 16% 2%, 18% 0%, 42% 0%, 43% 4%, 45% 0%, 78% 0%, 79% 2%, 81% 0%, 100% 0%, 100% 20%, 98% 22%, 100% 24%, 100% 55%, 97% 58%, 100% 61%, 100% 100%, 82% 100%, 81% 97%, 79% 100%, 38% 100%, 37% 96%, 35% 100%, 0% 100%, 0% 80%, 3% 78%, 0% 76%, 0% 35%, 2% 33%, 0% 31%)'
    }}
  />
);

const HUDPanel = ({ title, subtitle, children, headerExtra, className = "" }) => (
  <div className={`relative bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-all p-4 md:p-8 rounded-sm group overflow-hidden ${className}`}>
    <div className="hidden md:block">
      <ChippedBorder opacity={0.6} />
    </div>
    <div className="relative z-10">
      <div className="mb-8 flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-2xl md:text-3xl font-black uppercase tracking-[0.3em] text-foreground/95">{title}</span>
        </div>
        {headerExtra && <div className="flex gap-2">{headerExtra}</div>}
      </div>
      {children}
    </div>
  </div>
);

import WorkspaceSidebar from '../components/ui/WorkspaceSidebar';

import { useNavigate, useLocation } from 'react-router-dom';

const Physical = () => {
    const location = useLocation();
    const {
        workouts,
        nutrition,
        metrics,
        addHealthLog,
        deleteHealthLog,
        isLoading
    } = useHealth();

    const navigate = useNavigate();
    const { setMobileTabs } = useContext(DashboardContext);
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'workout');

    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location.state?.activeTab]);

    useEffect(() => {
        setMobileTabs({
            tabs: [
                { id: 'workout', label: 'Workout', icon: 'fitness_center' },
                { id: 'nutrition', label: 'Nutrition', icon: 'restaurant' },
                { id: 'bmi', label: 'BMI', icon: 'monitor_weight' },
                { id: 'water', label: 'Water', icon: 'water_drop' },
                { id: 'sleep', label: 'Sleep', icon: 'bedtime' },
            ],
            activeTab,
            setActiveTab: (tabId) => {
                setActiveTab(tabId);
                navigate(location.pathname, { replace: true, state: { ...location.state, activeTab: tabId } });
            }
        });
        return () => setMobileTabs(null);
    }, [activeTab, setMobileTabs, location.pathname, navigate, location.state]);

    // The active module is now driven by navigation state or external triggers
    const activeModule = activeTab;

    if (isLoading && workouts.length === 0 && metrics.length === 0 && nutrition.length === 0) return <WorkspaceSkeleton />;

    return (
        <div className="w-full bg-transparent text-foreground px-0 pt-24 pb-12 md:pt-2 md:pb-16 font-sans overflow-x-hidden flex flex-col items-center">
            <div className="w-full max-w-7xl mt-4 md:mt-2">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeModule}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col gap-8 md:gap-12"
                    >
                        {/* Tab Content Division */}
                        <div className="w-full">
                            {/* BMI DIVISION */}
                            {activeModule === 'bmi' && (
                                <HUDPanel title="BODY MASS" subtitle="BMI INDEX & METRICS">
                                    <BMITracker metrics={metrics} addHealthLog={addHealthLog} />
                                </HUDPanel>
                            )}

                            {/* WATER DIVISION */}
                            {activeModule === 'water' && (
                                <HUDPanel title="HYDRATION" subtitle="DAILY WATER INTAKE">
                                    <WaterTracker metrics={metrics} addHealthLog={addHealthLog} />
                                </HUDPanel>
                            )}

                            {/* SLEEP DIVISION */}
                            {activeModule === 'sleep' && (
                                <HUDPanel title="CIRCADIAN" subtitle="REST & RECOVERY CYCLES">
                                    <SleepTracker metrics={metrics} addHealthLog={addHealthLog} />
                                </HUDPanel>
                            )}

                            {/* WORKOUT DIVISION */}
                            {activeModule === 'workout' && (
                                <HUDPanel title="WORKOUT TRACKER" subtitle="FITNESS PROGRESS">
                                    <WorkoutTracker
                                        workouts={workouts}
                                        addHealthLog={addHealthLog}
                                        deleteHealthLog={deleteHealthLog}
                                    />
                                </HUDPanel>
                            )}

                            {/* NUTRITION DIVISION */}
                            {activeModule === 'nutrition' && (
                                <HUDPanel title="NUTRITION LOG" subtitle="DIETARY TRACKING">
                                    <NutritionLog
                                        nutrition={nutrition}
                                        addHealthLog={addHealthLog}
                                        deleteHealthLog={deleteHealthLog}
                                    />
                                </HUDPanel>
                            )}
                        </div>

                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Physical;
