import React from 'react';
import JournalEntry from '../components/journal_components/JournalEntry';
import JournalHistory from '../components/journal_components/JournalHistory';
import YearlyMoodBoard from '../components/journal_components/YearlyMoodBoard';

import useSWR from 'swr';

function Journal() {
    const { data: entries = [], mutate } = useSWR('/journal');

    const handleAction = () => {
        mutate();
    };

    return (
        <div className="w-full max-w-[1200px] flex flex-col gap-6 animate-in fade-in duration-700 pb-8">

            {/* Header - Always at top */}
            <div className="flex flex-col gap-1 px-1 pt-8 pb-6 mb-6 border-b border-slate-100 dark:border-slate-800/50">
                <h1 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-black tracking-tight">Journal</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Capture your thoughts and track your journey.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* 1. JournalEntry - Top on both */}
                <div className="lg:col-span-8 order-1">
                    <JournalEntry onAction={handleAction} />
                </div>

                {/* 2. JournalHistory - Below Entry on mobile, Sidebar on desktop */}
                <div className="lg:col-span-4 lg:row-span-2 order-2">
                    <JournalHistory entries={entries} onAction={handleAction} />
                </div>

                {/* 3. YearlyMoodBoard - Bottom on mobile, Main column on desktop */}
                <div className="lg:col-span-8 order-3">
                    <YearlyMoodBoard entries={entries} />
                </div>
            </div>
        </div>
    );
}

export default Journal;
