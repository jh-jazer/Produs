import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Plus, Edit2, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../ui/ConfirmDialog';
import useAuthStore from '../../../store/useAuthStore';

import AddHabitModal, { ICON_OPTIONS } from './AddHabitModal';
import SyncErrorToast from '../../ui/SyncErrorToast';

const EMPTY_ARRAY = [];
const EMPTY_OBJECT = {};

function HabitTracker({
    activeDate = new Date(),
    onDateChange,
    onFilterChange,
    currentFilter = 'All',
    habits = EMPTY_ARRAY,
    myHabits = EMPTY_ARRAY,
    partnerHabits = EMPTY_ARRAY,
    checks = EMPTY_OBJECT,
    isLoading = false,
    isDashboard = false,
    isReadOnly = false,
    isPartnerView = false,
    partnerName = "Partner",
    toggleCheck,
    addHabit,
    deleteHabit,
    updateHabit,
    reorderHabits,
    myUserId
}) {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const isLinked = !!user?.partner;
    const [showToast, setShowToast] = useState(false);
    const [showErrorToast, setShowErrorToast] = useState(false);
    const [shakeLink, setShakeLink] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [modalStep, setModalStep] = useState('suggestions');
    const [editingHabit, setEditingHabit] = useState(null);
    const [localTeamHabits, setLocalTeamHabits] = useState([]);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [habitFilter, setHabitFilter] = useState('system'); // 'system' | 'personal'

    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    const CORE_REDIRECTS = {
        'focus': '/dashboard',
        'planner': '/dashboard/planner',
        'finance': '/dashboard/finance',
        'journal': '/dashboard/journal',
        'workout': '/dashboard/planner'
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    const { teamHabits, partnerHabitsOnly } = React.useMemo(() => {
        const CORE_ORDER = ['focus', 'planner', 'workout', 'journal', 'finance'];
        const sortHabits = (a, b) => {
            const sysA = a.myPart ? a.myPart.systemId : a.systemId;
            const sysB = b.myPart ? b.myPart.systemId : b.systemId;
            if (sysA && !sysB) return -1;
            if (!sysA && sysB) return 1;
            if (sysA && sysB) return CORE_ORDER.indexOf(sysA) - CORE_ORDER.indexOf(sysB);
            return 0;
        };

        if (!isLinked) {
            const sorted = [...habits].sort(sortHabits);
            return { teamHabits: sorted, partnerHabitsOnly: [] };
        }

        const shared = {};
        const personalMy = [];
        const personalPartner = [];

        habits.forEach(h => {
            if (h.isShared && h.sharedGroupId) {
                if (!shared[h.sharedGroupId]) shared[h.sharedGroupId] = { myPart: null, partnerPart: null };
                if (h.userId === myUserId) shared[h.sharedGroupId].myPart = h;
                else shared[h.sharedGroupId].partnerPart = h;
            } else {
                if (h.userId === myUserId) {
                    personalMy.push(h);
                } else {
                    personalPartner.push(h);
                }
            }
        });

        const groupedShared = Object.keys(shared).map(gid => ({
            ...shared[gid].myPart || shared[gid].partnerPart,
            _id: gid,
            myPart: shared[gid].myPart,
            partnerPart: shared[gid].partnerPart,
            isGrouped: true
        }));

        if (!isPartnerView) {
            const team = [...personalMy, ...groupedShared].sort(sortHabits);
            return { teamHabits: team, partnerHabitsOnly: [] };
        } else {
            const team = groupedShared.sort(sortHabits);
            const partnerOnly = personalPartner.sort(sortHabits);
            return { teamHabits: team, partnerHabitsOnly: partnerOnly };
        }
    }, [habits, isPartnerView, myUserId, isLinked]);

    useEffect(() => {
        setLocalTeamHabits(teamHabits);
    }, [teamHabits]);

    const filteredHabits = React.useMemo(() => {
        return localTeamHabits.filter(habit => {
            const isSystemHabit = !!(habit.myPart ? habit.myPart.systemId : habit.systemId);
            const isSharedHabit = !!(
                habit.isShared || 
                habit.isGrouped || 
                (habit.myPart && habit.myPart.isShared) || 
                (habit.partnerPart && habit.partnerPart.isShared)
            );

            if (habitFilter === 'system') return isSystemHabit;
            if (habitFilter === 'personal') return !isSystemHabit && !isSharedHabit;
            if (habitFilter === 'link') return isSharedHabit;
            return true;
        });
    }, [localTeamHabits, habitFilter]);

    const daysToDisplay = React.useMemo(() => {
        const days = [];
        const start = new Date(activeDate);
        start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() - 2);
        for (let i = 0; i < 3; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            days.push(d);
        }
        return days;
    }, [activeDate]);

    const handleToggle = async (habitId, date) => {
        if (isReadOnly || editMode) return;
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const result = await toggleCheck(habitId, dateStr);
        if (result?.error) {
            setShowErrorToast(true);
        }
    };

    const handleAddHabit = async (habitData) => {
        await addHabit(habitData);
    };

    const handleEditHabit = async (habitData) => {
        if (!editingHabit) return;
        await updateHabit(editingHabit._id, habitData);
        setEditingHabit(null);
    };

    const renderHabitRow = (habit) => {
        const isEditing = editingHabit?._id === (habit.isGrouped ? habit.myPart?._id : habit._id);
        const isSystemHabit = !!(habit.myPart ? habit.myPart.systemId : habit.systemId);

        return (
            <div 
                key={habit._id} 
                className={`group/row relative flex items-center gap-4 py-4 border-b border-black/5 dark:border-white/5 transition-all
                    ${editMode ? 'pl-2 cursor-grab active:cursor-grabbing' : 'px-4'}
                    hover:bg-black/5 dark:hover:bg-white/[0.02]`}
            >
                {editMode && (
                    <button 
                        onClick={() => setConfirmDelete(habit.isGrouped ? habit.myPart._id : habit._id)} 
                        className="text-red-500 hover:text-red-600 transition-colors shrink-0 flex items-center justify-center size-6 mr-1"
                        title="Delete Habit"
                    >
                        <span className="material-symbols-outlined text-base font-bold">close</span>
                    </button>
                )}
                {editMode && !isPartnerView && (
                    <span className="material-symbols-outlined text-black/20 dark:text-white/20 hover:text-black dark:hover:text-white transition-colors pr-1">drag_indicator</span>
                )}

                <div 
                    className={`flex items-center gap-3 flex-1 min-w-0 ${editMode && !isSystemHabit ? 'cursor-pointer hover:opacity-80' : ''}`}
                    onClick={() => {
                        if (editMode) {
                            if (!isSystemHabit && (!habit.userId || habit.userId === myUserId || !!habit.myPart)) {
                                setEditingHabit(habit.isGrouped ? habit.myPart : habit);
                            }
                        } else if (isSystemHabit) {
                            const sysId = habit.myPart ? habit.myPart.systemId : habit.systemId;
                            const path = CORE_REDIRECTS[sysId];
                            if (sysId === 'focus') {
                                navigate('/focustimer');
                            } else if (path) {
                                navigate(path);
                            }
                        }
                    }}
                >
                    <div className="relative shrink-0 flex items-center justify-center size-8 bg-black/5 dark:bg-white/5 rounded-sm border border-black/10 dark:border-white/10 group-hover/row:border-black/30 dark:group-hover/row:border-white/30 transition-all">
                        <span className="material-symbols-outlined text-black/60 dark:text-white/60 text-lg group-hover/row:scale-110 transition-transform">{habit.icon}</span>
                        {isSystemHabit && <div className="absolute -top-1 -right-1 size-2 bg-black dark:bg-white rounded-full animate-pulse" />}
                    </div>
                    <div className="flex items-center gap-1 min-w-0">
                        <span className="text-[15px] font-black uppercase tracking-tighter text-black/80 dark:text-white/80 group-hover/row:text-black dark:group-hover/row:text-white transition-colors truncate">{habit.name}</span>
                        {!isSystemHabit && habit.streak > 0 && (
                            <span className="text-[15px] font-black italic text-amber-500 shrink-0 ml-1 flex items-center select-none" title={`${habit.streak} day streak`}>
                                {habit.streak}🔥
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex-1 flex justify-end md:justify-between items-center max-w-[300px]">
                    {daysToDisplay.map((date, idx) => {
                        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                        
                        const isSharedHabit = habit.isGrouped || habit.isShared || (habit.myPart && habit.myPart.isShared);
                        
                        const myChecked = habit.myPart 
                            ? !!checks[habit.myPart._id]?.completed[dateStr] 
                            : !!checks[habit._id]?.completed[dateStr];
                            
                        const partnerChecked = habit.isGrouped && habit.partnerPart 
                            ? !!checks[habit.partnerPart._id]?.completed[dateStr] 
                            : false;
                        
                        const isFullyDone = isSharedHabit ? (myChecked && partnerChecked) : myChecked;
                        const isPartiallyDone = isSharedHabit && !isFullyDone && (myChecked || partnerChecked);
                        
                        const isToday = date.toDateString() === today.toDateString();
                        const isFuture = date > today;

                        return (
                            <div key={idx} className="relative flex items-center justify-center size-10">
                                <button
                                    onClick={() => handleToggle(habit.isGrouped ? habit.myPart?._id : habit._id, date)}
                                    disabled={editMode || isFuture || isReadOnly || isSystemHabit}
                                    className={`relative size-8 transition-all rounded-sm flex items-center justify-center border overflow-hidden
                                        ${isFullyDone 
                                            ? 'bg-black border-black text-white dark:bg-white dark:border-white dark:text-black shadow-md' 
                                            : isToday ? 'border-black dark:border-white hover:bg-black/10 dark:hover:bg-white/10' : 'border-black/55 dark:border-white/60 hover:border-black dark:hover:border-white'}
                                        ${isFuture ? 'opacity-10 cursor-not-allowed' : ''}
                                        ${isSystemHabit ? 'cursor-default' : 'active:scale-90'}
                                    `}
                                >
                                    {isFullyDone && <span className="material-symbols-outlined text-[14px] font-black z-10">check</span>}
                                    
                                    {!isFullyDone && isPartiallyDone && (
                                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                            {/* Water body */}
                                            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#0066FF]" />
                                            {/* Wave line */}
                                            <svg className="absolute bottom-[40%] left-0 w-[200%] h-[25%] text-[#0066FF] fill-current animate-wave" viewBox="0 0 24 10" preserveAspectRatio="none">
                                                <path d="M0 5 C 3 2, 3 8, 6 5 C 9 2, 9 8, 12 5 C 15 2, 15 8, 18 5 C 21 2, 21 8, 24 5 L 24 10 L 0 10 Z" />
                                            </svg>
                                        </div>
                                    )}

                                    {isToday && !isFullyDone && !isPartiallyDone && (
                                        <div className="size-1.5 bg-black/20 dark:bg-white/20 rounded-full animate-ping" />
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>


            </div>
        );
    };

    return (
        <>
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, x: "-50%", scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                        exit={{ opacity: 0, y: -20, x: "-50%", scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="fixed top-8 left-1/2 z-[9999] px-6 py-4 bg-black/95 dark:bg-white/95 text-white dark:text-black border border-white/10 dark:border-black/5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-3.5 backdrop-blur-md w-max max-w-[90vw]"
                    >
                        <span className="material-symbols-outlined text-lg text-rose-500 animate-pulse">lock</span>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">PROTOCOL LOCKED</span>
                            <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest mt-2 leading-none">You need to link with a partner to unlock this feature</span>
                        </div>
                    </motion.div>
                )}
                <SyncErrorToast show={showErrorToast} onDismiss={() => setShowErrorToast(false)} />
            </AnimatePresence>
            <div className="flex flex-col gap-8 font-sans relative">
            <div className="relative flex items-center justify-between gap-2 mb-4 z-20 px-4 md:px-0">
                {/* Habit type filter toggle */}
                <div className="flex items-center border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/[0.02] p-1 rounded-sm h-[36px]">
                    <button
                        onClick={() => setHabitFilter('system')}
                        className={`h-full px-6 flex items-center justify-center text-[10px] font-black uppercase tracking-wider transition-all rounded-sm cursor-pointer ${
                            habitFilter === 'system'
                                ? 'bg-black text-white dark:bg-white dark:text-black font-black shadow-sm'
                                : 'text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.04]'
                        }`}
                    >
                        System
                    </button>
                    <button
                        onClick={() => setHabitFilter('personal')}
                        className={`h-full px-6 flex items-center justify-center text-[10px] font-black uppercase tracking-wider transition-all rounded-sm cursor-pointer ${
                            habitFilter === 'personal'
                                ? 'bg-black text-white dark:bg-white dark:text-black font-black shadow-sm'
                                : 'text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.04]'
                        }`}
                    >
                        Personal
                    </button>
                    <motion.button
                        animate={{ x: shakeLink ? [-6, 6, -6, 6, -3, 3, 0] : 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        onClick={() => {
                            if (!isLinked) {
                                setShakeLink(true);
                                setShowToast(true);
                                return;
                            }
                            setHabitFilter('link');
                        }}
                        className={`h-full px-6 flex items-center gap-1.5 justify-center text-[10px] font-black uppercase tracking-wider transition-all rounded-sm cursor-pointer ${
                            habitFilter === 'link'
                                ? 'bg-black text-white dark:bg-white dark:text-black font-black shadow-sm'
                                : 'text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.04]'
                        }`}
                    >
                        {!isLinked && <span className="material-symbols-outlined text-[12px] text-rose-500 animate-pulse">lock</span>}
                        <span>Link</span>
                    </motion.button>
                </div>

                <div className="flex gap-2">
                    <button onClick={() => setAddModalOpen(true)} className="size-[36px] flex items-center justify-center border border-black/60 dark:border-white/40 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all shrink-0 rounded-sm">
                        <Plus size={14} />
                    </button>
                    <button onClick={() => setEditMode(!editMode)} className={`size-[36px] flex items-center justify-center border transition-all shrink-0 rounded-sm ${editMode ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-sm' : 'border-black/60 dark:border-white/40 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white'}`}>
                        <Edit2 size={14} />
                    </button>
                </div>
            </div>
            <ConfirmDialog
                isOpen={!!confirmDelete}
                title="DELETE HABIT"
                message="Are you sure you want to remove this habit? Historical data will be permanently deleted."
                confirmLabel="DELETE"
                onConfirm={async () => { const result = await deleteHabit(confirmDelete); setConfirmDelete(null); if (result?.error) setShowErrorToast(true); }}
                onCancel={() => setConfirmDelete(null)}
            />

            <div className="flex flex-col">
                <div className="flex items-center gap-4 px-4 py-4 border-b border-black/10 dark:border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-black/50 dark:text-white/30">
                    <div className="flex-1">HABIT LIST</div>
                    <div className="flex-1 flex justify-end md:justify-between items-center max-w-[300px]">
                        {daysToDisplay.map((d, i) => {
                            const isToday = d.toDateString() === today.toDateString();
                            return (
                                <span key={i} className={`w-10 text-center font-bold ${isToday ? 'text-black dark:text-white font-black' : 'text-black/60 dark:text-white/50'}`}>
                                    {d.getDate()}
                                </span>
                            );
                        })}
                    </div>
                </div>

                <div className="flex flex-col">
                    {isLoading ? (
                        Array(3).fill(0).map((_, i) => <div key={i} className="h-16 w-full animate-pulse bg-white/5 my-1" />)
                    ) : filteredHabits.length > 0 ? (
                        filteredHabits.map(renderHabitRow)
                    ) : habits.length === 0 ? (
                        /* Truly empty — first time */
                        <motion.button
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => setAddModalOpen(true)}
                            className="w-full flex flex-col items-center justify-center py-16 gap-5 border border-dashed border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 hover:bg-black/5 dark:hover:bg-white/[0.02] transition-all group/empty"
                        >
                            <div className="size-12 border-2 border-dashed border-black/30 dark:border-white/20 group-hover/empty:border-black/50 dark:group-hover/empty:border-white/50 flex items-center justify-center transition-all">
                                <span className="material-symbols-outlined text-black/40 dark:text-white/30 group-hover/empty:text-black/80 dark:group-hover/empty:text-white/80 transition-colors">add</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-black/60 dark:text-white/40 group-hover/empty:text-black/80 dark:group-hover/empty:text-white/80 transition-colors">Add your first habit</span>
                                <span className="text-[8px] font-mono text-black/40 dark:text-white/20 uppercase tracking-widest">Start building your daily protocol</span>
                            </div>
                        </motion.button>
                    ) : (
                        /* Has habits but none match filter */
                        <motion.button
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => setAddModalOpen(true)}
                            className="w-full flex items-center gap-4 px-4 py-4 border-b border-dashed border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 hover:bg-black/5 dark:hover:bg-white/[0.02] transition-all group/add"
                        >
                            <div className="size-8 border border-dashed border-black/30 dark:border-white/20 group-hover/add:border-black/50 dark:group-hover/add:border-white/50 flex items-center justify-center transition-all shrink-0">
                                <span className="material-symbols-outlined text-sm text-black/40 dark:text-white/30 group-hover/add:text-black/80 dark:group-hover/add:text-white/80 transition-colors">add</span>
                            </div>
                            <div className="flex flex-col items-start gap-0.5">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/50 dark:text-white/30 group-hover/add:text-black/70 dark:group-hover/add:text-white/70 transition-colors">Add a new habit</span>
                                <span className="text-[8px] font-mono text-black/40 dark:text-white/20 uppercase tracking-widest">Extend your protocol</span>
                            </div>
                        </motion.button>
                    )}
                </div>
            </div>


            {/* Add/Edit Habit Modal - Tactical */}
            <AddHabitModal 
                isOpen={addModalOpen || !!editingHabit} 
                onClose={() => { setAddModalOpen(false); setEditingHabit(null); }} 
                onAdd={editingHabit ? handleEditHabit : handleAddHabit} 
                editingHabit={editingHabit}
                isSystemMode={habitFilter === 'system'}
                defaultShared={habitFilter === 'link'}
            />
        </div>
        </>
    );
}

export default HabitTracker;
