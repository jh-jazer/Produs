import React from 'react';
import JournalEntry from '../components/journal_components/JournalEntry';
import JournalHistory from '../components/journal_components/JournalHistory';
import YearlyMoodBoard from '../components/journal_components/YearlyMoodBoard';

import useSWR from 'swr';
import MobileTabNav from '../components/ui/MobileTabNav';

function Journal() {
    const { data: entries = [], mutate } = useSWR('/journal');

    const [activeTab, setActiveTab] = React.useState('new');

    const tabs = [
        { id: 'new', label: 'New Entry', icon: 'edit_note' },
        { id: 'history', label: 'History', icon: 'history' },
        { id: 'mood', label: 'Mood Board', icon: 'mood' },
    ];

    const handleAction = () => {
        mutate();
    };

    return (
        <div className="w-full max-w-[1200px] flex flex-col gap-6 animate-in fade-in duration-700 pb-8">

            {/* Header - Hidden on Mobile */}
            <div className="hidden md:flex flex-col gap-1 px-1 pt-8 pb-6 mb-6 border-b border-slate-100 dark:border-slate-800/50">
                <h1 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-black tracking-tight">Journal</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Capture your thoughts and track your journey.</p>
            </div>

            {/* Mobile Navigation */}
            <MobileTabNav tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* 1. JournalEntry */}
                <div className={`lg:col-span-8 order-1 ${activeTab !== 'new' && 'hidden lg:block'}`}>
                    <JournalEntry onAction={handleAction} />
                </div>

                {/* 2. JournalHistory */}
                <div className={`lg:col-span-4 lg:row-span-2 order-2 ${activeTab !== 'history' && 'hidden lg:block'}`}>
                    <JournalHistory entries={entries} onAction={handleAction} />
                </div>

                {/* 3. YearlyMoodBoard */}
                <div className={`lg:col-span-8 order-3 ${activeTab !== 'mood' && 'hidden lg:block'}`}>
                    <YearlyMoodBoard entries={entries} />
                </div>
            </div>
        </div>
    );
}

export default Journal;
