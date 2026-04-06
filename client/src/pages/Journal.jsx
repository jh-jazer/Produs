import React from 'react';
import JournalEntry from '../components/journal_components/JournalEntry';
import JournalHistory from '../components/journal_components/JournalHistory';
import YearlyMoodBoard from '../components/journal_components/YearlyMoodBoard';
import MobileTabNav from '../components/ui/MobileTabNav';
import WorkspaceSkeleton from '../components/ui/WorkspaceSkeleton';
import { useJournal } from '../hooks/useJournal';

function Journal() {
    const { entries, isLoading } = useJournal();
    const [activeTab, setActiveTab] = React.useState('new');

    const tabs = [
        { id: 'new', label: 'New Entry', icon: 'edit_note' },
        { id: 'history', label: 'History', icon: 'history' },
        { id: 'mood', label: 'Mood Board', icon: 'mood' },
    ];

    const handleAction = () => {
        // SWR handles refreshing via mutate in the hook
    };

    if (isLoading && entries.length === 0) return <WorkspaceSkeleton />;

    return (
        <div className="w-full max-w-[1400px] lg:pt-8 flex flex-col gap-8 pb-28 md:pb-8 mx-auto px-0 md:px-0">
            {/* Mobile Navigation */}
            <MobileTabNav tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Tactical Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-0 md:px-0">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="size-2 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)] animate-pulse" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] font-mono">JOURNAL_PROTOCOL_ACTIVE</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic font-exo">
                        Journal
                    </h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] max-w-md">
                        Capture your thoughts and track your journey.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Secondary Column (Left) */}
                <div className={`lg:col-span-4 flex flex-col gap-6 ${activeTab !== 'history' ? 'hidden lg:flex' : ''}`}>
                    {/* 2. JournalHistory */}
                    <JournalHistory entries={entries} onAction={handleAction} />
                </div>

                {/* Main Column (Right) */}
                <div className={`lg:col-span-8 flex flex-col gap-6 ${activeTab !== 'new' && activeTab !== 'mood' ? 'hidden lg:flex' : ''}`}>
                    {/* 1. JournalEntry */}
                    <div className={activeTab === 'new' ? 'block' : 'hidden lg:block'}>
                        <JournalEntry onAction={handleAction} />
                    </div>

                    {/* 3. YearlyMoodBoard */}
                    <div className={activeTab === 'mood' ? 'block' : 'hidden lg:block'}>
                        <YearlyMoodBoard entries={entries} />
                    </div>
                </div>
            </div>
            {isLoading && (
                <div className="fixed bottom-4 right-4 bg-electric-blue/10 text-electric-blue px-3 py-1 rounded-full text-[9px] font-semibold uppercase tracking-[0.2em] animate-pulse border border-electric-blue/20">
                    Syncing...
                </div>
            )}
        </div>
    );
}

export default Journal;
