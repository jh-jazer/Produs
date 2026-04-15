import React, { useEffect, useContext } from 'react';
import JournalHub from '../components/journal_components/JournalHub';
import WorkspaceSkeleton from '../components/ui/WorkspaceSkeleton';
import { useJournal } from '../hooks/useJournal';
import { DashboardContext } from '../context/DashboardContext';

const Spiritual = () => {
    const { setMobileTabs } = useContext(DashboardContext);
    const { entries, isLoading } = useJournal();
    const [activeTab, setActiveTab] = React.useState('journal');

    useEffect(() => {
        setMobileTabs({ tabs, activeTab, setActiveTab });
        return () => setMobileTabs(null);
    }, [activeTab, setMobileTabs]);

    const tabs = [
        { id: 'journal', label: 'Journal', icon: 'edit_note' },
    ];

    const handleAction = () => {
        // SWR handles refreshing via mutate in the hook
    };

    if (isLoading && entries.length === 0) return <WorkspaceSkeleton />;

    return (
        <div className="w-full max-w-[1400px] lg:pt-8 flex flex-col gap-4 md:gap-8 pb-48 md:pb-8 mx-auto px-0">
            <div className="flex justify-center">
                <div className="w-full lg:max-w-4xl">
                    <JournalHub entries={entries} onAction={handleAction} />
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

export default Spiritual;

