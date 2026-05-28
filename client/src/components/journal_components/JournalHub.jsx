import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import JournalHistory from './JournalHistory';
import JournalEntry from './JournalEntry';
import DashboardPanel from '../ui/DashboardPanel';
import { Database, PenTool, ChevronLeft } from 'lucide-react';

const JournalHub = ({ entries = [], onAction }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isWriting, setIsWriting] = useState(() => location.state?.openWriteJournal || false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [mood, setMood] = useState('😊');
    const [timeLeft, setTimeLeft] = useState("00:00:00");

    useEffect(() => {
        if (location.state?.openWriteJournal) {
            setIsWriting(true);
        }
    }, [location.state]);

    // Countdown logic
    React.useEffect(() => {
        const updateTimer = () => {
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
        };

        updateTimer(); // Instantly calculate on initial render
        const timer = setInterval(updateTimer, 1000);
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
        navigate('/dashboard/writing/journal/new');
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
                        className={`text-lg transition-all ${mood === m ? 'scale-125 ring-2 ring-black/30 dark:ring-white/30 rounded-full p-0.5' : 'grayscale opacity-50 hover:grayscale-0 hover:opacity-100 hover:scale-110'}`}
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
            className="flex items-center gap-1 px-2 py-1 rounded bg-black/5 dark:bg-white/5 text-[10px] font-black text-slate-500 hover:text-black dark:hover:text-white transition-all uppercase tracking-widest border border-black/5 dark:border-white/5 active:scale-95"
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
            <AnimatePresence mode="wait">
                {!isWriting ? (
                    <motion.div
                        key="history"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                    >
                        <JournalHistory 
                            entries={recentEntries} 
                            onAction={onAction}
                            onSelectEntry={handleSelectEntry}
                        >
                            {/* Write Journal Card */}
                            <button
                                onClick={handleWriteNew}
                                className="group relative rounded-sm bg-white/10 dark:bg-white/[0.02] border border-black/10 dark:border-white/10 hover:border-black/40 dark:hover:border-white/40 transition-all shadow-none hover:shadow-[0_0_25px_rgba(255,255,255,0.05)] hover:bg-white/20 dark:hover:bg-white/[0.05] backdrop-blur-sm cursor-pointer overflow-hidden flex min-h-[100px] md:min-h-[160px] w-full mb-6"
                            >
                                {/* Left Side: Image (1/4) */}
                                <div className="w-1/4 relative shrink-0 overflow-hidden bg-black border-r border-black/10 dark:border-white/5 opacity-80 group-hover:opacity-100 transition-opacity">
                                    <img 
                                        src="/assets/journal_default_cover.png" 
                                        alt="New Entry" 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30 pointer-events-none" />
                                </div>

                                {/* Right Side: Content (3/4) */}
                                <div className="flex-1 p-4 md:p-8 flex flex-col justify-between text-left">
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex justify-between items-start mb-2 md:mb-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="size-8 md:size-10 rounded-sm bg-black dark:bg-white flex items-center justify-center text-white/60 dark:text-black/60 group-hover:rotate-12 transition-transform border border-black/10 dark:border-white/10 shrink-0">
                                                    <PenTool className="size-4 md:size-5" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-black/35 dark:text-white/20 truncate block">TIME REMAINING FOR TODAY</span>
                                                    <span className="text-[11px] md:text-xs font-bold text-black dark:text-white tracking-widest block">{timeLeft}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Entry Title */}
                                        <h4 className="text-base md:text-xl font-black text-black dark:text-white uppercase tracking-tighter italic mt-1 md:mt-4 truncate">
                                            JOURNAL TODAY
                                        </h4>
                                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-black/35 dark:text-white/20 truncate block">LOG YOUR THOUGHTS</span>
                                    </div>

                                    {/* Footer Decor */}
                                    <div className="flex items-center justify-end mt-1 md:mt-2 opacity-30 group-hover:opacity-100 transition-opacity">
                                        <div className="h-[2px] w-8 md:w-12 bg-black dark:bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.2)] dark:shadow-[0_0_8px_white]" />
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
                        className="space-y-4"
                    >
                        <JournalEntry 
                            onAction={handleAction} 
                            onBack={() => { setIsWriting(false); setEditingEntry(null); }}
                            initialEntry={editingEntry}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default JournalHub;
