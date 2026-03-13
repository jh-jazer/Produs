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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">

                {/* Left Column: Header & History */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="flex flex-col gap-1 pb-2">
                        <h1 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-black tracking-tight">Journal</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Capture your thoughts and track your journey.</p>
                    </div>
                    <JournalHistory entries={entries} onAction={handleAction} />
                </div>

                {/* Right Column: Editor & Mood Board */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <JournalEntry onAction={handleAction} />
                    <YearlyMoodBoard entries={entries} />
                </div>
            </div>
        </div>
    );
}

export default Journal;
