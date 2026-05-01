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
            <div className="flex justify-end mb-6">
                {backButton}
            </div>
            
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
                                className="group relative rounded-sm bg-white/[0.03] border border-white/10 hover:border-white/30 transition-all shadow-none hover:shadow-xl hover:shadow-primary/5 cursor-pointer overflow-hidden flex min-h-[160px] w-full mb-6"
                            >
                                {/* Left Side: Image (1/4) */}
                                <div className="w-1/4 relative shrink-0 overflow-hidden bg-white/5 border-r border-white/5 opacity-80 group-hover:opacity-100 transition-opacity">
                                    <img 
                                        src="/assets/journal_default_cover.png" 
                                        alt="New Entry" 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30 pointer-events-none" />
                                </div>

                                {/* Right Side: Content (3/4) */}
                                <div className="flex-1 p-8 flex flex-col justify-between">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-sm bg-white/5 flex items-center justify-center text-white/60 group-hover:rotate-12 transition-transform border border-white/10">
                                                    <PenTool size={20} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">TIME REMAINING</span>
                                                    <span className="text-xs font-bold text-white tracking-widest">{timeLeft}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Entry Title */}
                                        <h4 className="text-xl font-black text-white uppercase tracking-tighter italic mt-4">
                                            WRITE NEW ENTRY
                                        </h4>
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">LOG YOUR THOUGHTS</span>
                                    </div>

                                    {/* Footer Decor */}
                                    <div className="flex items-center justify-end mt-2 opacity-30 group-hover:opacity-100 transition-opacity">
                                        <div className="h-[2px] w-12 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]" />
                                    </div>
                                </div>
                            </button>
                        </JournalHistory>
                    </motion.div>
                ) : (
                    <motion.div
                        key="editor"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <div className="flex flex-col gap-1 mb-8">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">{panelSubtitle}</span>
                            <h3 className="text-2xl font-black uppercase tracking-tighter italic text-white">{panelTitle}</h3>
                        </div>
                        <JournalEntry 
                            onAction={handleAction} 
                            initialEntry={editingEntry}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default JournalHub;
