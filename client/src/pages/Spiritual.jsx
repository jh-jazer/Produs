import React, { useEffect, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import JournalHub from '../components/journal_components/JournalHub';
import WorkspaceSkeleton from '../components/ui/WorkspaceSkeleton';
import { useJournal } from '../hooks/useJournal';
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

const HUDPanel = ({ title, subtitle, children, headerExtra, className = "" }) => (
  <div className={`relative bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-all p-4 md:p-8 rounded-sm group overflow-hidden ${className}`}>
    <div className="hidden md:block">
      <ChippedBorder opacity={0.6} />
    </div>
    <div className="relative z-10">
      <div className="mb-8 flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-foreground/40">{title}</span>
          {subtitle && <span className="text-[8px] font-mono uppercase tracking-widest opacity-20">{subtitle}</span>}
        </div>
        {headerExtra && <div className="flex gap-2">{headerExtra}</div>}
      </div>
      {children}
    </div>
  </div>
);

import WorkspaceSidebar from '../components/ui/WorkspaceSidebar';

import { useNavigate, useLocation } from 'react-router-dom';

const Spiritual = () => {
    const { setMobileTabs } = useContext(DashboardContext);
    const { entries, isLoading } = useJournal();
    const location = useLocation();
    
    // The active module is now driven by navigation state or external triggers
    const activeModule = location.state?.activeTab || 'journal';

    const handleAction = () => {
        // SWR handles refreshing
    };

    if (isLoading && entries.length === 0) return <WorkspaceSkeleton />;

    return (
        <div className="w-full bg-transparent text-foreground p-8 pt-12 md:p-12 md:pt-16 font-sans overflow-x-hidden flex flex-col items-center">
            <div className="w-full max-w-7xl mt-8 md:mt-0">
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
                            {/* JOURNAL DIVISION */}
                            {activeModule === 'journal' && (
                                <HUDPanel title="DAILY JOURNAL" subtitle="PERSONAL REFLECTIONS">
                                    <JournalHub entries={entries} onAction={handleAction} />
                                </HUDPanel>
                            )}
                        </div>

                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Spiritual;

