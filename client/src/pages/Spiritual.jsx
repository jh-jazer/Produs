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
  <div className={`relative bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-all p-8 rounded-sm group overflow-hidden ${className}`}>
    <ChippedBorder opacity={0.6} />
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

const Spiritual = () => {
    const { setMobileTabs } = useContext(DashboardContext);
    const { entries, isLoading } = useJournal();
    const [activeTab, setActiveTab] = useState('journal');

    useEffect(() => {
        setMobileTabs({ tabs, activeTab, setActiveTab });
        return () => setMobileTabs(null);
    }, [activeTab, setMobileTabs]);

    const tabs = [
        { id: 'journal', label: 'Journal', icon: 'edit_note' },
    ];

    const handleAction = () => {
        // SWR handles refreshing
    };

    if (isLoading && entries.length === 0) return <WorkspaceSkeleton />;

    return (
        <div className="w-full bg-transparent text-foreground p-8 pt-0 md:p-12 font-sans overflow-x-hidden flex flex-col md:flex-row items-start gap-8 md:gap-12">
            {/* Tactical Navigation Bar - Vertical on Desktop */}
            <WorkspaceSidebar 
                tabs={tabs} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                namespace="Spiritual" 
            />

            <div className="flex-1">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col gap-8 md:gap-12"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Tab Content Division */}
                            <div className="lg:col-span-12">
                                {/* JOURNAL DIVISION */}
                                {activeTab === 'journal' && (
                                    <div className="max-w-4xl mx-auto w-full">
                                        <HUDPanel title="DAILY JOURNAL" subtitle="PERSONAL REFLECTIONS">
                                            <JournalHub entries={entries} onAction={handleAction} />
                                        </HUDPanel>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* System Metadata Footer */}
                        <div className="mt-16 pt-8 border-t border-foreground/5 flex justify-between items-center opacity-20">
                          <span className="text-[8px] font-black uppercase tracking-[0.5em]">PRODUS SPIRITUAL WORKSPACE v0.2</span>
                          <div className="flex gap-2">
                            {[1,2,3,4,5,6].map(i => <div key={i} className="size-1 bg-foreground rounded-full" />)}
                          </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

export default Spiritual;

