import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import JournalHistory from './JournalHistory';
import JournalEntry from './JournalEntry';
import DashboardPanel from '../ui/DashboardPanel';
import { Database, PenTool, ChevronLeft } from 'lucide-react';

const JournalHub = ({ entries = [], onAction }) => {
    const [isWriting, setIsWriting] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [mood, setMood] = useState('😊');
    const [timeLeft, setTimeLeft] = useState("");

    // Countdown logic
    React.useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);
            const diff = midnight - now;

            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);

            setTimeLeft(
                `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
            );
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Recent entries only (top 10)
    const recentEntries = entries.slice(0, 10);

    const handleAction = () => {
        setIsWriting(false);
        setEditingEntry(null);
        if (onAction) onAction();
    };

    const handleWriteNew = () => {
        setEditingEntry(null);
        setIsWriting(true);
    };

    const handleSelectEntry = (entry) => {
        setEditingEntry(entry);
        setIsWriting(true);
    };

    const MOODS = ['😠', '🙁', '😐', '🙂', '😊'];

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

    const backButton = isWriting ? (
        <button 
            onClick={() => { setIsWriting(false); setEditingEntry(null); }}
            className="flex items-center gap-1 px-2 py-1 rounded bg-black/5 dark:bg-white/5 text-[10px] font-black text-slate-500 hover:text-primary transition-all uppercase tracking-widest border border-black/5 dark:border-white/5 active:scale-95"
        >
            <ChevronLeft size={12} />
            Back
        </button>
    ) : null;

    const getTacticalDate = (date) => {
        return new Date(date).toLocaleDateString(undefined, { 
            month: 'long', 
            day: 'numeric', 
            weekday: 'long' 
        }).toUpperCase();
    };

    const panelTitle = isWriting 
        ? getTacticalDate(editingEntry ? editingEntry.date : new Date())
        : 'JOURNAL';

    const panelSubtitle = isWriting 
        ? (editingEntry ? 'EDIT ENTRY' : 'NEW ENTRY') 
        : 'ARCHIVE';

    return (
        <div className="w-full text-left">
            <DashboardPanel 
                title={panelTitle} 
                subtitle={panelSubtitle} 
                icon={isWriting ? PenTool : Database} 
                showZap 
                headerExtra={backButton}
            >
                <AnimatePresence mode="wait">
                    {!isWriting ? (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            <JournalHistory 
                                entries={recentEntries} 
                                onAction={onAction}
                                onSelectEntry={handleSelectEntry}
                            >
                                {/* Write Journal Card */}
                                <button
                                    onClick={handleWriteNew}
                                    className="group relative rounded-3xl bg-primary/5 dark:bg-primary/5 border-2 border-dashed border-primary/30 hover:border-primary/60 transition-all shadow-none hover:shadow-xl hover:shadow-primary/5 cursor-pointer overflow-hidden flex min-h-[160px] w-full mb-6"
                                >
                                    {/* Left Side: Image (1/4) */}
                                    <div className="w-1/4 relative shrink-0 overflow-hidden bg-slate-100 dark:bg-white/5 border-r border-slate-100 dark:border-white/5 opacity-80 group-hover:opacity-100 transition-opacity">
                                        <img 
                                            src="/assets/journal_default_cover.png" 
                                            alt="New Entry" 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 dark:to-black/30 pointer-events-none" />
                                    </div>

                                    {/* Right Side: Content (3/4) */}
                                    <div className="flex-1 p-5 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:rotate-12 transition-transform">
                                                        <PenTool size={20} />
                                                    </div>
                                                    <div>
                                                        <span className="flex items-center gap-1 px-1.5 py-1 rounded bg-cyan-500/10 text-cyan-500 text-[10px] font-black uppercase tracking-widest border border-cyan-500/20">
                                                            <span className="material-symbols-outlined text-[12px] animate-pulse">timer</span>
                                                            {timeLeft} WINDOW
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Entry Title */}
                                            <h4 className="text-sm font-black text-primary dark:text-blue-400 uppercase tracking-tight mb-1">
                                                New Field Note: Today
                                            </h4>

                                            {/* Entry Content Snippet */}
                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium mt-1">
                                                The current operational window is active. Record your high-fidelity observations before the deadline.
                                            </div>
                                        </div>

                                        {/* Footer Decor */}
                                        <div className="flex items-center justify-end mt-2 opacity-30 group-hover:opacity-100 transition-opacity">
                                            <div className="h-0.5 w-12 bg-primary rounded-full animate-pulse" />
                                        </div>
                                    </div>
                                </button>
                            </JournalHistory>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="editor"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            <JournalEntry 
                                onAction={handleAction} 
                                mood={mood} 
                                setMood={setMood} 
                                initialEntry={editingEntry}
                            />
                            
                            <div className="p-4 px-4 md:px-6 rounded-[2rem] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-3 -ml-2">
                                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined">sentiment_satisfied</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Select Mood</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">How is the operator feeling?</p>
                                    </div>
                                </div>
                                {moodSelector}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DashboardPanel>
        </div>
    );
};

export default JournalHub;
