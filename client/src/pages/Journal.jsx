import React from 'react';
import JournalEntry from '../components/journal_components/JournalEntry';
import JournalHistory from '../components/journal_components/JournalHistory';
import YearlyMoodBoard from '../components/journal_components/YearlyMoodBoard';
import MobileTabNav from '../components/ui/MobileTabNav';
import { useJournalLocal } from '../hooks/useJournalLocal';

function Journal() {
    const { entries, isLoading } = useJournalLocal();
    const [activeTab, setActiveTab] = React.useState('new');

    const tabs = [
        { id: 'new', label: 'New Entry', icon: 'edit_note' },
        { id: 'history', label: 'History', icon: 'history' },
        { id: 'mood', label: 'Mood Board', icon: 'mood' },
    ];

    const handleAction = () => {
        // Local-first means we don't necessarily need to trigger a manual update
        // as Dexie's useLiveQuery handles it. But we keep it for potential future needs.
    };

    return (
        <div className="w-full max-w-[1200px] lg:pt-12 flex flex-col gap-2 animate-in fade-in duration-700 pb-28 md:pb-8">
            {/* Mobile Navigation */}
            <MobileTabNav tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Secondary Column (Left) */}
                <div className={`lg:col-span-4 flex flex-col gap-6 ${activeTab !== 'history' ? 'hidden lg:flex' : ''}`}>
                    {/* Header - Hidden on Mobile */}
                    <div className="hidden lg:flex flex-col gap-1 px-1">
                        <div className="flex items-center gap-3 mb-6">
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Journal</h1>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Capture your thoughts and track your journey.</p>
                    </div>

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
                <div className="fixed bottom-4 right-4 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                    Loading Local Data...
                </div>
            )}
        </div>
    );
}

export default Journal;
