import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export const ICON_OPTIONS = [
    { icon: 'local_drink', label: 'Water' },
    { icon: 'menu_book', label: 'Reading' },
    { icon: 'directions_run', label: 'Running' },
    { icon: 'self_improvement', label: 'Meditation' },
    { icon: 'fitness_center', label: 'Gym' },
    { icon: 'code', label: 'Coding' },
    { icon: 'bedtime', label: 'Sleep' },
    { icon: 'restaurant', label: 'Nutrition' },
    { icon: 'brush', label: 'Creative' },
    { icon: 'school', label: 'Study' },
    { icon: 'music_note', label: 'Music' },
    { icon: 'favorite', label: 'Wellness' },
];

const SYSTEM_HABITS = [
    {
        systemId: 'focus',
        name: 'Focus Today',
        icon: 'hourglass_empty',
        color: 'blue',
        description: 'Automatically tracked and marked complete when running or finishing active focus sessions.'
    },
    {
        systemId: 'planner',
        name: 'Daily Planning',
        icon: 'event_note',
        color: 'amber',
        description: 'Automatically completed when creating tasks or applying schedule templates in your Planner.'
    },
    {
        systemId: 'workout',
        name: 'Goal Setting',
        icon: 'track_changes',
        color: 'red',
        description: 'Automatically completed when creating or updating active goals inside the Planner.'
    },
    {
        systemId: 'journal',
        name: 'Journaling',
        icon: 'history_edu',
        color: 'blue',
        description: 'Automatically checked when composing or saving entries in the Journal Hub.'
    },
    {
        systemId: 'finance',
        name: 'Finance Tracking',
        icon: 'payments',
        color: 'purple',
        description: 'Automatically updated when recording financial ledger transactions.'
    }
];

const AddHabitModal = ({ isOpen, onClose, onAdd, isSystemMode = false, defaultShared = false }) => {
    const [newHabit, setNewHabit] = useState({ name: '', icon: 'local_drink', color: 'white', isShared: defaultShared });
    const [selectedSystemHabit, setSelectedSystemHabit] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setNewHabit({ name: '', icon: 'local_drink', color: 'white', isShared: defaultShared });
        }
    }, [isOpen, defaultShared]);

    if (!isOpen) return null;

    const handleAdd = async () => {
        if (!newHabit.name.trim()) return;
        await onAdd({ ...newHabit, name: newHabit.name.trim() });
        setNewHabit({ name: '', icon: 'local_drink', color: 'white', isShared: defaultShared });
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 backdrop-blur-md select-none">
            <div className="absolute inset-0 bg-black/60 dark:bg-black/80" onClick={() => { setSelectedSystemHabit(null); onClose(); }} />
            <div className="relative w-full max-w-md bg-white dark:bg-[#0a0a0a] border-2 border-black/30 dark:border-white/20 p-8 shadow-[0_0_100px_rgba(0,0,0,0.15)] dark:shadow-[0_0_100px_rgba(255,255,255,0.1)]">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-6 shrink-0">
                    <div className="flex flex-col gap-1 text-left">
                        <h3 className="text-xl font-black uppercase tracking-tighter font-mono" style={{ color: 'var(--color-fg)' }}>
                            {isSystemMode 
                                ? selectedSystemHabit ? 'SYSTEM HABIT DETAILS' : 'SYSTEM PROTOCOLS'
                                : 'CREATE CUSTOM HABIT'
                            }
                        </h3>
                        <span className="text-[8px] font-mono tracking-widest uppercase mt-0.5" style={{ color: 'var(--color-fg)', opacity: 0.4 }}>
                            {isSystemMode 
                                ? 'PRE-CONFIGURED SYSTEM ACTIONS' 
                                : 'ARCHIVE A NEW PERSONAL HABIT'
                            }
                        </span>
                    </div>
                    <button onClick={() => { setSelectedSystemHabit(null); onClose(); }} className="hover:opacity-100 transition-opacity" style={{ color: 'var(--color-fg)', opacity: 0.4 }}>
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                {isSystemMode ? (
                    /* ==================== SYSTEM HABITS SELECTOR ==================== */
                    <div className="flex flex-col gap-4 text-left">
                        {selectedSystemHabit ? (
                            /* Sub-stage: Detailed view of chosen system habit */
                            <div className="flex flex-col gap-6 py-2">
                                <div className="flex items-center gap-4 p-4 border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] rounded-sm">
                                    <div className={`size-12 shrink-0 flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-sm border border-black/10 dark:border-white/10 text-${selectedSystemHabit.color}-500`}>
                                        <span className="material-symbols-outlined text-3xl">{selectedSystemHabit.icon}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[14px] font-black uppercase tracking-wider" style={{ color: 'var(--color-fg)' }}>
                                            {selectedSystemHabit.name}
                                        </span>
                                        <span className="text-[8px] font-mono uppercase tracking-widest mt-0.5" style={{ color: 'var(--color-fg)', opacity: 0.4 }}>
                                            {selectedSystemHabit.systemId} protocol
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <span className="text-[9px] font-black tracking-widest uppercase" style={{ color: 'var(--color-fg)', opacity: 0.35 }}>
                                        INTEGRATION & TELEMETRY
                                    </span>
                                    <p className="text-xs leading-relaxed font-sans" style={{ color: 'var(--color-fg)', opacity: 0.7 }}>
                                        {selectedSystemHabit.description}
                                    </p>
                                    <p className="text-[10px] text-amber-600 dark:text-amber-500/80 font-black uppercase tracking-wider mt-4 leading-normal">
                                        ✓ THIS PROTOCOL IS ALREADY FULLY ACTIVE ON YOUR DAILY WORKSPACE.
                                    </p>
                                </div>

                                <button 
                                    onClick={() => setSelectedSystemHabit(null)} 
                                    className="mt-4 w-full py-4 bg-black text-white dark:bg-white dark:text-black font-black uppercase tracking-[0.4em] text-[9.5px] hover:opacity-90 active:scale-95 transition-all rounded-sm shrink-0"
                                >
                                    BACK TO SYSTEM LIST
                                </button>
                            </div>
                        ) : (
                            /* Sub-stage: List of 5 system habits */
                            <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
                                {SYSTEM_HABITS.map(opt => (
                                    <div 
                                        key={opt.systemId}
                                        onClick={() => setSelectedSystemHabit(opt)}
                                        className="p-3 border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 bg-black/[0.01] dark:bg-white/[0.005] hover:bg-black/[0.03] dark:hover:bg-white/[0.02] cursor-pointer rounded-sm flex items-center justify-between transition-all group"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="size-9 shrink-0 flex items-center justify-center bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-sm">
                                                <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform" style={{ color: 'var(--color-fg)', opacity: 0.6 }}>{opt.icon}</span>
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[11px] font-black uppercase tracking-wider truncate" style={{ color: 'var(--color-fg)' }}>
                                                    {opt.name}
                                                </span>
                                                <span className="text-[7.5px] font-mono uppercase tracking-widest mt-0.5" style={{ color: 'var(--color-fg)', opacity: 0.4 }}>
                                                    automated trigger
                                                </span>
                                            </div>
                                        </div>
                                        <span className="material-symbols-outlined transition-colors text-base pr-1 group-hover:opacity-100" style={{ color: 'var(--color-fg)', opacity: 0.2 }}>arrow_forward</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    /* ==================== CUSTOM HABIT CREATOR ==================== */
                    <div className="flex flex-col gap-6 text-left">
                        <div className="flex flex-col gap-2">
                            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--color-fg)', opacity: 0.3 }}>HABIT NAME</span>
                            <div className="flex gap-2">
                                <div className="size-14 shrink-0 flex items-center justify-center bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm">
                                    <span className="material-symbols-outlined text-2xl" style={{ color: 'var(--color-fg)', opacity: 0.6 }}>{newHabit.icon}</span>
                                </div>
                                <input 
                                    autoFocus
                                    value={newHabit.name}
                                    onChange={e => setNewHabit({...newHabit, name: e.target.value})}
                                    placeholder="ENTER HABIT NAME..."
                                    className="flex-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-4 text-sm font-black uppercase tracking-widest focus:border-black dark:focus:border-white transition-all outline-none rounded-sm"
                                    style={{ color: 'var(--color-fg)' }}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--color-fg)', opacity: 0.3 }}>SELECT ICON</span>
                            <div className="grid grid-cols-6 gap-2 bg-black/5 dark:bg-white/5 p-4 border border-black/10 dark:border-white/10 rounded-sm">
                                {ICON_OPTIONS.map(opt => (
                                    <button 
                                        key={opt.icon}
                                        type="button"
                                        onClick={() => setNewHabit({...newHabit, icon: opt.icon})}
                                        className={`size-10 flex items-center justify-center rounded-sm transition-all ${newHabit.icon === opt.icon ? 'bg-black text-white dark:bg-white dark:text-black font-bold' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
                                        style={newHabit.icon === opt.icon ? {} : { color: 'var(--color-fg)', opacity: 0.4 }}
                                    >
                                        <span className="material-symbols-outlined text-lg">{opt.icon}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--color-fg)' }}>
                                    SHARE WITH PARTNER
                                </span>
                                <span className="text-[7.5px] font-mono uppercase tracking-widest" style={{ color: 'var(--color-fg)', opacity: 0.4 }}>
                                    Link habit with linked workspace
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setNewHabit({ ...newHabit, isShared: !newHabit.isShared })}
                                className={`h-8 px-4 flex items-center justify-center text-[9px] font-black uppercase tracking-wider transition-all rounded-sm cursor-pointer border ${
                                    newHabit.isShared
                                        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-sm'
                                        : 'border-black/20 dark:border-white/20 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.04]'
                                }`}
                            >
                                {newHabit.isShared ? 'ACTIVE' : 'OFF'}
                            </button>
                        </div>

                        <button 
                            onClick={handleAdd} 
                            className="mt-4 w-full py-6 bg-black text-white dark:bg-white dark:text-black font-black uppercase tracking-[0.5em] text-[9.5px] hover:opacity-90 active:scale-95 transition-all rounded-sm shrink-0 shadow-lg shadow-black/5"
                        >
                            ADD CUSTOM HABIT
                        </button>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default AddHabitModal;


