import React from 'react';
import JournalEntry from '../components/journal_components/JournalEntry';
import JournalHistory from '../components/journal_components/JournalHistory';
import YearlyMoodBoard from '../components/journal_components/YearlyMoodBoard';
import MobileTabNav from '../components/ui/MobileTabNav';
import WorkspaceSkeleton from '../components/ui/WorkspaceSkeleton';
import DashboardPanel from '../components/ui/DashboardPanel';
import { PenTool, Database, LayoutGrid } from 'lucide-react';
import { useJournal } from '../hooks/useJournal';

const MOODS = ['😠', '🙁', '😐', '🙂', '😊'];

function Journal() {
    const { entries, isLoading } = useJournal();
    const [activeTab, setActiveTab] = React.useState('new');
    const [mood, setMood] = React.useState('😊');

    const tabs = [
        { id: 'new', label: 'New Entry', icon: 'edit_note' },
        { id: 'history', label: 'History', icon: 'history' },
        { id: 'mood', label: 'Mood Board', icon: 'mood' },
    ];

    const handleAction = () => {
        // SWR handles refreshing via mutate in the hook
    };

    if (isLoading && entries.length === 0) return <WorkspaceSkeleton />;

    const moodSelector = (
        <div className="flex items-center gap-3">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">Mood</p>
            <div className="flex gap-1.5">
                {MOODS.map(m => (
                    <button
                        key={m}
                        onClick={() => setMood(m)}
                        className={`text-lg transition-all ${mood === m ? 'scale-125 ring-2 ring-cyan-500/30 rounded-full p-0.5' : 'grayscale opacity-50 hover:grayscale-0 hover:opacity-100 hover:scale-110'}`}
                    >
                        {m}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-[1400px] lg:pt-8 flex flex-col gap-4 md:gap-8 pb-28 md:pb-8 mx-auto">
            {/* Mobile Navigation */}
            <MobileTabNav tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />



            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-start">
                {/* Secondary Column (Left) */}
                <div className={`lg:col-span-4 flex flex-col gap-4 md:gap-6 ${activeTab !== 'history' ? 'hidden lg:flex' : ''}`}>
                    {/* 2. JournalHistory */}
                    <DashboardPanel title="Archive Records" subtitle="Journal Entries" icon={Database} showZap>
                        <JournalHistory entries={entries} onAction={handleAction} />
                    </DashboardPanel>
                </div>

                {/* Main Column (Right) */}
                <div className={`lg:col-span-8 flex flex-col gap-4 md:gap-6 ${activeTab !== 'new' && activeTab !== 'mood' ? 'hidden lg:flex' : ''}`}>
                    {/* 1. JournalEntry */}
                    <div className={activeTab === 'new' ? 'block' : 'hidden lg:block'}>
                        <DashboardPanel title="Field Notes" subtitle="New Entry" icon={PenTool} showZap headerExtra={moodSelector}>
                            <JournalEntry onAction={handleAction} mood={mood} setMood={setMood} />
                        </DashboardPanel>
                    </div>

                    {/* 3. YearlyMoodBoard */}
                    <div className={activeTab === 'mood' ? 'block' : 'hidden lg:block'}>
                        <DashboardPanel title="Biometric Sentiments" subtitle="Yearly Mood Board" icon={LayoutGrid}>
                            <YearlyMoodBoard entries={entries} />
                        </DashboardPanel>
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

