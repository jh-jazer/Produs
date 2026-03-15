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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Main Content: Editor & Mood Board - First on Mobile */}
                <div className="lg:col-span-8 flex flex-col gap-6 order-1 lg:order-2">
                    <JournalEntry onAction={handleAction} />
                    <YearlyMoodBoard entries={entries} />
                </div>

                {/* Sidebar: History - Second on Mobile */}
                <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
                    <JournalHistory entries={entries} onAction={handleAction} />
                </div>
            </div>
        </div>
    );
}

export default Journal;
